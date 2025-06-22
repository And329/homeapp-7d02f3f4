
import React from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
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
      <div className={`relative h-96 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center border border-gray-200 ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <ZoomIn className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg font-medium">No images uploaded</p>
          <p className="text-gray-400 text-sm">Upload images to see them here</p>
        </div>
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
    <div className={`relative h-96 bg-black rounded-2xl overflow-hidden shadow-2xl ${className}`}>
      <img
        src={images[selectedIndex]}
        alt={`Property ${selectedIndex + 1}`}
        className="w-full h-full object-cover"
        onError={() => onRemoveImage(selectedIndex)}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20" />
      
      {/* Navigation Controls */}
      {images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm h-12 w-12 rounded-full"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm h-12 w-12 rounded-full"
            onClick={goToNext}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}

      {/* Remove Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 bg-red-500/80 hover:bg-red-600/90 text-white border-0 backdrop-blur-sm h-10 w-10 rounded-full"
        onClick={() => onRemoveImage(selectedIndex)}
      >
        <X className="h-5 w-5" />
      </Button>

      {/* Image Counter Badge */}
      <div className="absolute bottom-4 left-4 bg-black/60 text-white text-sm px-3 py-1.5 rounded-full backdrop-blur-sm font-medium">
        {selectedIndex + 1} of {images.length}
      </div>

      {/* Dots Indicator for smaller screens */}
      {images.length > 1 && images.length <= 5 && (
        <div className="absolute bottom-4 right-4 flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => onIndexChange(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                selectedIndex === index 
                  ? 'bg-white' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertyMainImageDisplay;
