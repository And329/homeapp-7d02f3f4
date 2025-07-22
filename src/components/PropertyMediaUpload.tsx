
import React, { useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Upload, X, Image as ImageIcon, Loader2, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useDirectUpload } from '@/hooks/useDirectUpload';

interface PropertyMediaUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
}

const PropertyMediaUpload: React.FC<PropertyMediaUploadProps> = ({
  images,
  onImagesChange,
}) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const { uploadFile, uploadProgress } = useDirectUpload();

  // Compress image before upload
  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = document.createElement('img') as HTMLImageElement;
      
      img.onload = () => {
        // Calculate new dimensions (max 1920px width/height)
        const maxSize = 1920;
        let { width, height } = img;
        
        if (width > height && width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        } else if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        }, 'image/jpeg', 0.8);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const filesArray = Array.from(files);
      console.log(`Starting upload of ${filesArray.length} files`);
      
      const results = [];
      
      // Process files with concurrency limit
      const concurrencyLimit = 2;
      
      for (let i = 0; i < filesArray.length; i += concurrencyLimit) {
        const batch = filesArray.slice(i, i + concurrencyLimit);
        
        const batchPromises = batch.map(async (file) => {
          const isImage = file.type.startsWith('image/');

          if (!isImage) {
            console.warn(`Skipping unsupported file: ${file.name}`);
            return { success: false, error: `${file.name} is not a supported image file.` };
          }

          console.log('Starting upload for file:', file.name, 'Type:', file.type, 'Size:', Math.round(file.size / 1024 / 1024) + 'MB');

          try {
            // Compress image if it's large
            let fileToUpload = file;
            if (file.size > 2 * 1024 * 1024) { // Compress files larger than 2MB
              console.log('Compressing large image:', file.name);
              fileToUpload = await compressImage(file);
              console.log('Compressed size:', Math.round(fileToUpload.size / 1024 / 1024) + 'MB');
            }

            const uploadResult = await uploadFile(fileToUpload, {
              maxSize: 20 * 1024 * 1024, // 20MB max
              allowedTypes: ['image/'],
              bucket: 'property-media'
            });

            if (!uploadResult) {
              console.error('Upload failed: uploadResult is null for', file.name);
              return { success: false, error: `Failed to upload ${file.name}` };
            }

            return {
              success: true,
              url: uploadResult.url,
              isImage,
              fileName: file.name
            };
          } catch (error) {
            console.error('Error uploading file:', file.name, error);
            return { success: false, error: `Failed to upload ${file.name}: ${error.message}` };
          }
        });

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      }
      
      // Process results
      const newImages: string[] = [];
      const errors: string[] = [];

      results.forEach(result => {
        if (result.success) {
          if (result.isImage) {
            newImages.push(result.url);
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

      const successCount = newImages.length;
      if (successCount > 0) {
        toast({
          title: "Upload successful",
          description: `${successCount} image(s) uploaded successfully.`,
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
      event.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    onImagesChange(updatedImages);
  };

  const totalFiles = images.length;
  const hasActiveUploads = Object.keys(uploadProgress).length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Photos
        </label>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Badge variant="outline" className="text-xs">
            {images.length} Photos
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
          accept="image/*"
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
            {uploading ? 'Uploading images...' : 'Click to upload photos'}
          </div>
          <div className="text-xs text-gray-500">
            Images: JPG, PNG, WebP (max 20MB each)
          </div>
        </label>
      </div>

      {/* Media Grid */}
      {totalFiles > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                  <ImageIcon className="h-3 w-3" />
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
        </div>
      )}

      {totalFiles === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="flex items-center justify-center gap-4 mb-2">
            <ImageIcon className="h-6 w-6" />
          </div>
          <p className="text-sm">No photos uploaded yet</p>
        </div>
      )}
    </div>
  );
};

export default PropertyMediaUpload;
