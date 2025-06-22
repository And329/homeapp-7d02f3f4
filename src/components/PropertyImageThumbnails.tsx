
import React from 'react';
import { X } from 'lucide-react';

interface PropertyImageThumbnailsProps {
  images: string[];
  selectedIndex: number;
  onIndexChange: (index: number) => void;
  onRemoveImage: (index: number) => void;
}

const PropertyImageThumbnails: React.FC<PropertyImageThumbnailsProps> = ({
  images,
  selectedIndex,
  onIndexChange,
  onRemoveImage
}) => {
  if (!images || images.length === 0) return null;

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-700">
        All Images ({images.length})
      </h4>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
        {images.map((image, index) => (
          <div
            key={index}
            className={`relative group aspect-square cursor-pointer rounded-md overflow-hidden border-2 transition-all duration-200 ${
              selectedIndex === index
                ? 'border-blue-500 ring-2 ring-blue-200'
                : 'border-gray-200 hover:border-gray-400'
            }`}
            onClick={() => onIndexChange(index)}
          >
            <img
              src={image}
              alt={`Thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
              onError={() => onRemoveImage(index)}
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveImage(index);
              }}
              className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PropertyImageThumbnails;
