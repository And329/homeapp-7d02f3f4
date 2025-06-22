
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
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
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
    
    // Adjust selected index if needed
    if (selectedImageIndex >= newImages.length && newImages.length > 0) {
      setSelectedImageIndex(newImages.length - 1);
    } else if (newImages.length === 0) {
      setSelectedImageIndex(0);
    }
  };

  console.log('PropertyImageUpload render - Current images:', images.length);

  return (
    <div className="space-y-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Property Images
      </label>
      
      {/* Main Large Image Display */}
      {images.length > 0 && (
        <div className="w-full">
          <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shadow-sm">
            <img
              src={images[selectedImageIndex]}
              alt={`Property ${selectedImageIndex + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error('Image failed to load at index:', selectedImageIndex);
                removeImage(selectedImageIndex);
              }}
            />
            <button
              type="button"
              onClick={() => removeImage(selectedImageIndex)}
              className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg hover:scale-110 transition-all duration-200"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="absolute bottom-3 left-3 bg-black bg-opacity-70 text-white text-sm px-3 py-1 rounded">
              {selectedImageIndex + 1} of {images.length}
            </div>
          </div>
        </div>
      )}
      
      {/* All Images Thumbnails Grid - Show all images as thumbnails */}
      {images.length > 0 && (
        <div className="w-full">
          <h4 className="text-sm font-medium text-gray-700 mb-3">All Images ({images.length})</h4>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {images.map((image, index) => (
              <div 
                key={index} 
                className={`relative group aspect-square cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                  selectedImageIndex === index 
                    ? 'border-blue-500 ring-2 ring-blue-200' 
                    : 'border-gray-200 hover:border-gray-400'
                }`}
                onClick={() => setSelectedImageIndex(index)}
              >
                <img
                  src={image}
                  alt={`Property ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error('Thumbnail failed to load at index:', index);
                    removeImage(index);
                  }}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(index);
                  }}
                  className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg hover:scale-110"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
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
