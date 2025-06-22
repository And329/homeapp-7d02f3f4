
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
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Property Images
      </label>
      
      {/* Images Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
          {images.map((image, index) => (
            <div key={index} className="relative group aspect-square">
              <img
                src={image}
                alt={`Property ${index + 1}`}
                className="w-full h-full object-cover rounded-lg border border-gray-200 shadow-sm group-hover:shadow-md transition-shadow"
                onError={(e) => {
                  console.error('Image failed to load at index:', index);
                  // Remove the broken image
                  removeImage(index);
                }}
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg hover:scale-110"
              >
                <X className="h-3 w-3" />
              </button>
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                Image {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
        <label className="cursor-pointer">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />
          {uploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
              <span className="text-sm text-gray-600">Uploading images...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="bg-gray-100 rounded-full p-4 mb-3">
                <Image className="h-8 w-8 text-gray-400" />
              </div>
              <span className="text-lg font-medium text-gray-700 mb-1">Add Property Images</span>
              <span className="text-sm text-gray-500 mb-3">
                Drag and drop images here, or click to browse
              </span>
              <Button type="button" variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Choose Files
              </Button>
            </div>
          )}
        </label>
      </div>
      
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Upload up to 10 high-quality images</p>
        <p>• Maximum file size: 5MB per image</p>
        <p>• Supported formats: JPG, PNG, WebP</p>
        <p>• First image will be used as the main property photo</p>
      </div>
    </div>
  );
};

export default PropertyImageUpload;
