
import React from 'react';
import { Plus, Image } from 'lucide-react';
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
      <label className="cursor-pointer">
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
  );
};

export default PropertyImageUploadArea;
