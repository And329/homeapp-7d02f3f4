
import React from 'react';
import { Plus, Upload, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PropertyImageUploadAreaProps {
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  uploading: boolean;
}

const PropertyImageUploadArea: React.FC<PropertyImageUploadAreaProps> = ({
  onFileUpload,
  uploading
}) => {
  return (
    <div className="relative">
      <div className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-8 text-center hover:border-primary/50 hover:from-primary/10 hover:to-primary/15 transition-all duration-300">
        <label className="cursor-pointer block">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={onFileUpload}
            className="hidden"
            disabled={uploading}
          />
          {uploading ? (
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <div className="animate-spin rounded-full h-12 w-12 border-3 border-primary/30 border-t-primary"></div>
                <Upload className="h-6 w-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <span className="text-base font-medium text-primary">Uploading images...</span>
              <span className="text-sm text-gray-500 mt-1">Please wait</span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="bg-primary/10 rounded-2xl p-4 mb-4 group-hover:bg-primary/15 transition-colors">
                <Camera className="h-10 w-10 text-primary" />
              </div>
              <span className="text-xl font-semibold text-gray-800 mb-2">Add Property Images</span>
              <span className="text-sm text-gray-600 mb-4 max-w-xs">
                Drag and drop your images here, or click to browse your files
              </span>
              <Button 
                type="button" 
                variant="outline" 
                size="lg"
                className="bg-white hover:bg-primary hover:text-white border-primary/30 hover:border-primary transition-all duration-300"
              >
                <Plus className="h-5 w-5 mr-2" />
                Choose Images
              </Button>
            </div>
          )}
        </label>
      </div>
      
      {/* Upload Guidelines */}
      <div className="mt-4 bg-gray-50 rounded-xl p-4">
        <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Up to 10 images
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Max 5MB each
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            JPG, PNG, WebP
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            High quality preferred
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyImageUploadArea;
