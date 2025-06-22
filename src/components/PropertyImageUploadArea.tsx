
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
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
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
            <div className="relative mb-3">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-500"></div>
              <Upload className="h-4 w-4 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <span className="text-sm font-medium text-blue-600">Uploading...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Camera className="h-8 w-8 text-gray-400 mb-2" />
            <span className="text-sm font-medium text-gray-700 mb-1">Add Images</span>
            <span className="text-xs text-gray-500 mb-3">Drag & drop or click to browse</span>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              className="text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Choose Files
            </Button>
          </div>
        )}
      </label>
    </div>
  );
};

export default PropertyImageUploadArea;
