import React, { useState } from 'react';
import { Upload, X, Image, Video, AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useFileUpload } from '@/hooks/useFileUpload';
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
  const { toast } = useToast();
  const { uploadFile } = useFileUpload();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const newImages: string[] = [];
      const newVideos: string[] = [];

      for (const file of Array.from(files)) {
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');

        if (!isImage && !isVideo) {
          toast({
            title: "Invalid file type",
            description: `${file.name} is not a supported image or video file.`,
            variant: "destructive",
          });
          continue;
        }

        console.log('Starting upload for file:', file.name, 'Type:', file.type, 'Size:', file.size);

        // Upload file to Supabase storage
        const uploadResult = await uploadFile(file, {
          maxSize: isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024, // 100MB for videos, 10MB for images
          allowedTypes: isImage ? ['image/'] : ['video/'],
          bucket: 'property-media'
        });

        console.log('Upload result:', uploadResult);
        
        if (!uploadResult) {
          console.error('Upload failed: uploadResult is null');
          continue;
        }

        if (uploadResult) {
          // Get the public URL for the uploaded file
          const { data } = await supabase.storage
            .from('property-media')
            .getPublicUrl(uploadResult.url);

          console.log('Public URL data:', data);

          if (isImage) {
            newImages.push(data.publicUrl);
          } else {
            newVideos.push(data.publicUrl);
          }
        }
      }

      // Update state with new files
      if (newImages.length > 0) {
        onImagesChange([...images, ...newImages]);
      }
      if (newVideos.length > 0) {
        onVideosChange([...videos, ...newVideos]);
      }

      if (newImages.length > 0 || newVideos.length > 0) {
        toast({
          title: "Upload successful",
          description: `${newImages.length + newVideos.length} file(s) uploaded successfully.`,
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
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
        </div>
      </div>

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
            {uploading ? 'Uploading...' : 'Click to upload photos & videos'}
          </div>
          <div className="text-xs text-gray-500">
            Images: JPG, PNG, WebP (max 10MB) • Videos: MP4, WebM, MOV (max 100MB)
          </div>
        </label>
      </div>

      {/* File size warning */}
      <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-amber-800">
          <strong>Note:</strong> Large video files may take time to upload and process. 
          Consider compressing videos before upload for better performance.
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