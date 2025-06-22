
import React from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PropertyMainImageDisplayProps {
  images: string[];
  selectedIndex: number;
  onIndexChange: (index: number) => void;
  onRemoveImage: (index: number) => void;
  className?: string;
}

const PropertyMainImageDisplay: React.FC<PropertyMainImageDisplayProps> = ({
  images,
  selectedIndex,
  onIndexChange,
  onRemoveImage,
  className = ''
}) => {
  if (!images || images.length === 0) {
    return (
      <div className={`aspect-[4/3] bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <p className="text-gray-500">No images uploaded</p>
      </div>
    );
  }

  const goToPrevious = () => {
    onIndexChange(selectedIndex > 0 ? selectedIndex - 1 : images.length - 1);
  };

  const goToNext = () => {
    onIndexChange(selectedIndex < images.length - 1 ? selectedIndex + 1 : 0);
  };

  return (
    <div className={`relative aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden ${className}`}>
      <img
        src={images[selectedIndex]}
        alt={`Property ${selectedIndex + 1}`}
        className="w-full h-full object-cover"
        onError={() => onRemoveImage(selectedIndex)}
      />
      
      {/* Navigation Controls */}
      {images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white border-0"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white border-0"
            onClick={goToNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}

      {/* Remove Button */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-600 text-white border-0"
        onClick={() => onRemoveImage(selectedIndex)}
      >
        <X className="h-4 w-4" />
      </Button>

      {/* Image Counter */}
      <div className="absolute bottom-2 left-2 bg-black/60 text-white text-sm px-2 py-1 rounded">
        {selectedIndex + 1} of {images.length}
      </div>
    </div>
  );
};

export default PropertyMainImageDisplay;
