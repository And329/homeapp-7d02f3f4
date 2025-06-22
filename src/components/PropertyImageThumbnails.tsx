
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
    <div className="flex gap-2 overflow-x-auto pb-2">
      {images.map((image, index) => (
        <div
          key={index}
          className={`relative group flex-shrink-0 cursor-pointer ${
            selectedIndex === index
              ? 'ring-2 ring-blue-500'
              : 'hover:ring-2 hover:ring-gray-300'
          }`}
          onClick={() => onIndexChange(index)}
        >
          <div className="w-16 h-16 bg-gray-100 border border-gray-300 rounded overflow-hidden">
            <img
              src={image}
              alt={`Thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
              onError={() => onRemoveImage(index)}
            />
          </div>
          
          {/* Remove Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemoveImage(index);
            }}
            className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default PropertyImageThumbnails;
