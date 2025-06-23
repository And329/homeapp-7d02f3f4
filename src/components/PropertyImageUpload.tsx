
import React, { useState } from 'react';
import { X, Plus, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface PropertyImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
}

const PropertyImageUpload: React.FC<PropertyImageUploadProps> = ({
  images,
  onImagesChange,
}) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    console.log('Starting file upload, files count:', files.length);

    try {
      const newImages: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log('Processing file:', file.name, 'Type:', file.type, 'Size:', file.size);
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          console.log('Skipping non-image file:', file.name);
          toast({
            title: "Invalid file type",
            description: `${file.name} is not an image file.`,
            variant: "destructive",
          });
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          console.log('Skipping large file:', file.name);
          toast({
            title: "File too large",
            description: `${file.name} is larger than 5MB.`,
            variant: "destructive",
          });
          continue;
        }

        // Convert to base64
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result as string;
            console.log('File converted to base64:', file.name);
            resolve(result);
          };
          reader.onerror = () => {
            console.error('Error reading file:', file.name);
            reject(new Error(`Failed to read ${file.name}`));
          };
          reader.readAsDataURL(file);
        });

        newImages.push(base64);
      }

      console.log('Successfully processed images:', newImages.length);
      console.log('Current images count:', images.length);
      console.log('Total images after addition:', images.length + newImages.length);

      // Only add the new images to existing ones
      const updatedImages = [...images, ...newImages];
      onImagesChange(updatedImages);
      
      if (newImages.length > 0) {
        toast({
          title: "Images uploaded",
          description: `${newImages.length} image(s) uploaded successfully.`,
        });
      }

      // Clear the input
      event.target.value = '';
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    console.log('Removing image at index:', index);
    const newImages = images.filter((_, i) => i !== index);
    console.log('Images after removal:', newImages.length);
    onImagesChange(newImages);
  };

  console.log('PropertyImageUpload render - Current images:', images.length);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Property Images
      </label>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
        {images.map((image, index) => (
          <div key={index} className="relative group">
            <img
              src={image}
              alt={`Property ${index + 1}`}
              className="w-full h-32 object-cover rounded-lg border border-gray-200"
              onError={(e) => {
                console.error('Image failed to load at index:', index);
                // Remove the broken image
                removeImage(index);
              }}
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        
        <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />
          {uploading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          ) : (
            <>
              <Plus className="h-6 w-6 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">Add Images</span>
            </>
          )}
        </label>
      </div>
      
      <p className="text-xs text-gray-500">
        Upload up to 10 images. Max file size: 5MB per image. Supported formats: JPG, PNG, WebP.
      </p>
    </div>
  );
};

export default PropertyImageUpload;
