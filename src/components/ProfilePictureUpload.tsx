
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProfilePictureUploadProps {
  onImageChange: (imageUrl: string | null) => void;
  currentImage?: string | null;
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({ onImageChange, currentImage }) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Convert file to base64 for storage
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        onImageChange(base64String);
        toast({
          title: "Profile picture updated",
          description: "Your profile picture has been updated successfully.",
        });
        setUploading(false);
      };
      reader.onerror = () => {
        toast({
          title: "Upload failed",
          description: "Failed to upload image. Please try again.",
          variant: "destructive",
        });
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
      setUploading(false);
    }
  };

  const removeImage = () => {
    onImageChange(null);
    toast({
      title: "Profile picture removed",
      description: "Your profile picture has been removed.",
    });
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Profile Picture
      </label>
      
      <div className="flex items-center space-x-4">
        <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
          {currentImage ? (
            <img 
              src={currentImage} 
              alt="Profile" 
              className="h-full w-full object-cover"
            />
          ) : (
            <User className="h-8 w-8 text-gray-400" />
          )}
        </div>
        
        <div className="flex flex-col space-y-2">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            id="profile-picture-upload"
            disabled={uploading}
          />
          <label htmlFor="profile-picture-upload">
            <Button
              type="button"
              variant="outline"
              disabled={uploading}
              className="cursor-pointer"
              asChild
            >
              <span>
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? 'Uploading...' : 'Upload Photo'}
              </span>
            </Button>
          </label>
          
          {currentImage && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={removeImage}
              className="text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4 mr-2" />
              Remove
            </Button>
          )}
        </div>
      </div>
      
      <p className="text-xs text-gray-500">
        Recommended: Square image, max 5MB
      </p>
    </div>
  );
};

export default ProfilePictureUpload;
