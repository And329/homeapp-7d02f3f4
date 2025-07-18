import React, { useState } from 'react';
import { Upload, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useDirectUpload } from '@/hooks/useDirectUpload';

interface ProfilePictureUploadProps {
  currentImage?: string | null;
  onImageChange: (imageUrl: string) => void;
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({ currentImage, onImageChange }) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const { uploadFile } = useDirectUpload();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Upload to Supabase storage
      const uploadResult = await uploadFile(file, {
        maxSize: 10 * 1024 * 1024, // 10MB for profile pictures
        allowedTypes: ['image/'],
        bucket: 'property-media'
      });

      if (!uploadResult) {
        throw new Error('Upload failed');
      }

      onImageChange(uploadResult.url);
      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been updated successfully.",
      });
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    onImageChange('');
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
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
            {currentImage ? (
              <img
                src={currentImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="h-8 w-8 text-gray-400" />
              </div>
            )}
          </div>
          {currentImage && (
            <button
              type="button"
              onClick={removeImage}
              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
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
              <span className="flex items-center space-x-2">
                <Upload className="h-4 w-4" />
                <span>{uploading ? 'Uploading...' : 'Upload Picture'}</span>
              </span>
            </Button>
          </label>
          <p className="text-xs text-gray-500">
            JPG, PNG or WebP. Max size: 10MB
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePictureUpload;