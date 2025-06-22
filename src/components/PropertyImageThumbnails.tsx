
import React from 'react';
import { X, Camera } from 'lucide-react';

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-gray-800 flex items-center">
          <Camera className="h-5 w-5 mr-2 text-primary" />
          Images ({images.length})
        </h4>
      </div>
      
      <div className="flex gap-3 overflow-x-auto pb-2">
        {images.map((image, index) => (
          <div
            key={index}
            className={`relative group flex-shrink-0 cursor-pointer transition-all duration-300 ${
              selectedIndex === index
                ? 'ring-3 ring-primary ring-offset-2 scale-105'
                : 'hover:scale-105 hover:shadow-lg'
            }`}
            onClick={() => onIndexChange(index)}
          >
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100">
              <img
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                onError={() => onRemoveImage(index)}
              />
            </div>
            
            {/* Selection Overlay */}
            {selectedIndex === index && (
              <div className="absolute inset-0 bg-primary/20 rounded-xl flex items-center justify-center">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              </div>
            )}
            
            {/* Remove Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveImage(index);
              }}
              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg transform hover:scale-110"
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
