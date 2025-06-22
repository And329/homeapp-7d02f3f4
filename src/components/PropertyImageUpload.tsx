
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

    try {
      const newImages: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Invalid file type",
            description: `${file.name} is not an image file.`,
            variant: "destructive",
          });
          continue;
        }

        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: `${file.name} is larger than 5MB.`,
            variant: "destructive",
          });
          continue;
        }

        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
          reader.readAsDataURL(file);
        });

        newImages.push(base64);
      }

      const updatedImages = [...images, ...newImages];
      onImagesChange(updatedImages);
      
      if (newImages.length > 0) {
        toast({
          title: "Images uploaded",
          description: `${newImages.length} image(s) uploaded successfully.`,
        });
      }

      event.target.value = '';
    } catch (error) {
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
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
    
    if (selectedImageIndex >= newImages.length && newImages.length > 0) {
      setSelectedImageIndex(newImages.length - 1);
    } else if (newImages.length === 0) {
      setSelectedImageIndex(0);
    }
  };

  const handleIndexChange = (newIndex: number) => {
    setSelectedImageIndex(newIndex);
  };

  return (
    <div className="space-y-4">
      {/* Main Image Display */}
      <PropertyMainImageDisplay
        images={images}
        selectedIndex={selectedImageIndex}
        onIndexChange={handleIndexChange}
        onRemoveImage={removeImage}
      />
      
      {/* Thumbnails Row */}
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
