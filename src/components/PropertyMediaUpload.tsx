
import React, { useState } from 'react';
import { Upload, X, Image, Video, AlertTriangle, Loader2, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useDirectUpload } from '@/hooks/useDirectUpload';
import { supabase } from '@/integrations/supabase/client';

interface PropertyMediaUploadProps {
  images: string[];
  videos: string[];
  onImagesChange: (images: string[]) => void;
  onVideosChange: (videos: string[]) => void;
}

const PropertyMediaUpload: React.FC<PropertyMediaUploadProps> = ({
  images,
  videos,
  onImagesChange,
  onVideosChange,
}) => {
  const [uploading, setUploading] = useState(false);
  const [fileProgress, setFileProgress] = useState<Record<string, number>>({});
  const { toast } = useToast();
  const { uploadFile, uploadProgress } = useDirectUpload();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setFileProgress({});

    try {
      const filesArray = Array.from(files);
      console.log(`Starting optimized parallel upload of ${filesArray.length} files`);
      
      // Process files with concurrency limit to prevent overwhelming the browser
      const concurrencyLimit = 3;
      const results = [];
      
      for (let i = 0; i < filesArray.length; i += concurrencyLimit) {
        const batch = filesArray.slice(i, i + concurrencyLimit);
        
        const batchPromises = batch.map(async (file, batchIndex) => {
          const globalIndex = i + batchIndex;
          const isImage = file.type.startsWith('image/');
          const isVideo = file.type.startsWith('video/');

          if (!isImage && !isVideo) {
            console.warn(`Skipping unsupported file: ${file.name}`);
            return { success: false, error: `${file.name} is not a supported image or video file.` };
          }

          console.log('Starting optimized upload for file:', file.name, 'Type:', file.type, 'Size:', Math.round(file.size / 1024 / 1024) + 'MB');

          // Show compression warning for very large files
          if (file.size > 50 * 1024 * 1024) {
            toast({
              title: "Large file detected",
              description: `${file.name} is ${Math.round(file.size / 1024 / 1024)}MB. Upload may take a moment.`,
            });
          }

          try {
            // Use direct upload for better performance
            const uploadResult = await uploadFile(file, {
              maxSize: isVideo ? 100 * 1024 * 1024 : 20 * 1024 * 1024, // 100MB for videos, 20MB for images
              allowedTypes: isImage ? ['image/'] : ['video/'],
              bucket: 'property-media'
            });

            console.log('Optimized upload result for', file.name, ':', uploadResult);
            
            if (!uploadResult) {
              console.error('Upload failed: uploadResult is null for', file.name);
              return { success: false, error: `Failed to upload ${file.name}` };
            }

            return {
              success: true,
              url: uploadResult.url, // This is already the full public URL
              isImage,
              fileName: file.name
            };
          } catch (error) {
            console.error('Error in optimized upload for file:', file.name, error);
            return { success: false, error: `Failed to upload ${file.name}: ${error.message}` };
          }
        });

        // Wait for this batch to complete before starting the next
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      }
      
      // Process results
      const newImages: string[] = [];
      const newVideos: string[] = [];
      const errors: string[] = [];

      results.forEach(result => {
        if (result.success) {
          if (result.isImage) {
            newImages.push(result.url);
          } else {
            newVideos.push(result.url);
          }
        } else {
          errors.push(result.error);
        }
      });

      // Show errors if any
      if (errors.length > 0) {
        errors.forEach(error => {
          toast({
            title: "Upload error",
            description: error,
            variant: "destructive",
          });
        });
      }

      // Update state with new files
      if (newImages.length > 0) {
        console.log('PropertyMediaUpload: Updating images:', newImages);
        onImagesChange([...images, ...newImages]);
      }
      if (newVideos.length > 0) {
        console.log('PropertyMediaUpload: Updating videos:', newVideos);
        console.log('PropertyMediaUpload: Current videos:', videos);
        console.log('PropertyMediaUpload: New combined videos:', [...videos, ...newVideos]);
        onVideosChange([...videos, ...newVideos]);
      }

      const successCount = newImages.length + newVideos.length;
      if (successCount > 0) {
        toast({
          title: "Upload successful",
          description: `${successCount} file(s) uploaded successfully using optimized method.`,
        });
      }
    } catch (error) {
      console.error('Optimized upload error:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setFileProgress({});
      // Clear the input value to allow re-uploading the same file
      event.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    onImagesChange(updatedImages);
  };

  const removeVideo = (index: number) => {
    const updatedVideos = videos.filter((_, i) => i !== index);
    onVideosChange(updatedVideos);
  };

  const totalFiles = images.length + videos.length;
  const hasActiveUploads = Object.keys(uploadProgress).length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Photos & Videos
        </label>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Badge variant="outline" className="text-xs">
            {images.length} Photos
          </Badge>
          <Badge variant="outline" className="text-xs">
            {videos.length} Videos
          </Badge>
          {hasActiveUploads && (
            <Badge variant="secondary" className="text-xs flex items-center gap-1">
              <BarChart3 className="h-3 w-3" />
              Uploading
            </Badge>
          )}
        </div>
      </div>

      {/* Upload Progress */}
      {hasActiveUploads && (
        <div className="space-y-2">
          {Object.entries(uploadProgress).map(([fileId, progress]) => (
            <div key={fileId} className="space-y-1">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Uploading...</span>
                <span>{progress.percentage}%</span>
              </div>
              <Progress value={progress.percentage} className="h-2" />
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleFileUpload}
          className="hidden"
          id="media-upload"
          disabled={uploading}
        />
        <label
          htmlFor="media-upload"
          className="cursor-pointer flex flex-col items-center space-y-2"
        >
          {uploading ? (
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          ) : (
            <Upload className="h-8 w-8 text-gray-400" />
          )}
          <div className="text-sm font-medium text-gray-900">
            {uploading ? 'Uploading with optimized method...' : 'Click to upload photos & videos'}
          </div>
          <div className="text-xs text-gray-500">
            Images: JPG, PNG, WebP (max 20MB) • Videos: MP4, WebM, MOV (max 100MB)
          </div>
          <div className="text-xs text-blue-600 font-medium">
            ⚡ Using direct upload for faster speeds
          </div>
        </label>
      </div>

      {/* File size and performance info */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-blue-800">
          <strong>Optimized Upload:</strong> Using direct HTTP upload for faster performance. 
          Large files are automatically chunked for reliable transfer. Videos over 50MB will show a progress indicator.
        </div>
      </div>

      {/* Media Grid */}
      {totalFiles > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Images */}
          {images.map((image, index) => (
            <div key={`image-${index}`} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                <img
                  src={image}
                  alt={`Property ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute top-2 left-2">
                <Badge variant="secondary" className="text-xs flex items-center gap-1">
                  <Image className="h-3 w-3" />
                  Photo
                </Badge>
              </div>
              <Button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 h-6 w-6 p-0 bg-red-500 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                variant="destructive"
                size="sm"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}

          {/* Videos */}
          {videos.map((video, index) => (
            <div key={`video-${index}`} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                <video
                  src={video}
                  className="w-full h-full object-cover"
                  preload="metadata"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Video className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="absolute top-2 left-2">
                <Badge variant="secondary" className="text-xs flex items-center gap-1">
                  <Video className="h-3 w-3" />
                  Video
                </Badge>
              </div>
              <Button
                type="button"
                onClick={() => removeVideo(index)}
                className="absolute top-2 right-2 h-6 w-6 p-0 bg-red-500 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                variant="destructive"
                size="sm"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {totalFiles === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="flex items-center justify-center gap-4 mb-2">
            <Image className="h-6 w-6" />
            <Video className="h-6 w-6" />
          </div>
          <p className="text-sm">No photos or videos uploaded yet</p>
        </div>
      )}
    </div>
  );
};

export default PropertyMediaUpload;
