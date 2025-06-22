
import React, { useState } from 'react';
import { Camera, Play } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MediaItem {
  type: 'image' | 'video';
  src: string;
}

interface PropertyMediaGalleryProps {
  title: string;
  media: MediaItem[];
}

const PropertyMediaGallery: React.FC<PropertyMediaGalleryProps> = ({ title, media }) => {
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);

  if (!media || media.length === 0) {
    return (
      <div className="aspect-video rounded-lg bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No media available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      {/* Main Media Display */}
      <div className="lg:col-span-3">
        <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
          {media[selectedMediaIndex]?.type === 'image' ? (
            <img
              src={media[selectedMediaIndex].src}
              alt={`${title} - Main`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <video
              src={media[selectedMediaIndex]?.src}
              className="w-full h-full object-cover"
              controls
              preload="metadata"
            />
          )}
        </div>
      </div>

      {/* Thumbnails */}
      <div className="lg:col-span-1">
        <ScrollArea className="h-full">
          <div className="grid grid-cols-4 lg:grid-cols-1 gap-2 lg:h-[28rem]">
            {media.map((mediaItem, index) => (
              <div
                key={index}
                className={`aspect-video rounded-lg cursor-pointer overflow-hidden transition-all duration-200 bg-gray-100 ${
                  selectedMediaIndex === index 
                    ? 'ring-2 ring-primary shadow-md' 
                    : 'hover:opacity-80 hover:ring-1 hover:ring-gray-300'
                }`}
                onClick={() => setSelectedMediaIndex(index)}
              >
                {mediaItem.type === 'image' ? (
                  <img
                    src={mediaItem.src}
                    alt={`${title} - ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="relative w-full h-full">
                    <video
                      src={mediaItem.src}
                      className="w-full h-full object-cover"
                      muted
                      preload="metadata"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center transition-opacity hover:bg-opacity-30">
                      <div className="bg-white bg-opacity-90 rounded-full p-2">
                        <Play className="w-4 h-4 text-gray-800" fill="currentColor" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default PropertyMediaGallery;
