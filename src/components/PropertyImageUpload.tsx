
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import PropertyMainImageDisplay from '@/components/PropertyMainImageDisplay';
import PropertyImageThumbnails from '@/components/PropertyImageThumbnails';
import PropertyImageUploadArea from '@/components/PropertyImageUploadArea';

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

  const handleIndexChange = (newIndex: number) => {
    setSelectedImageIndex(newIndex);
  };

  console.log('PropertyImageUpload render - Current images:', images.length);

  return (
    <div className="space-y-8">      
      {/* Main Image Display */}
      <PropertyMainImageDisplay
        images={images}
        selectedIndex={selectedImageIndex}
        onIndexChange={handleIndexChange}
        onRemoveImage={removeImage}
      />
      
      {/* Thumbnails */}
      <PropertyImageThumbnails
        images={images}
        selectedIndex={selectedImageIndex}
        onIndexChange={handleIndexChange}
        onRemoveImage={removeImage}
      />
      
      {/* Upload Area */}
      <PropertyImageUploadArea
        onFileUpload={handleFileUpload}
        uploading={uploading}
      />
    </div>
  );
};

export default PropertyImageUpload;
