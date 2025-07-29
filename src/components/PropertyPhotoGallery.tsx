import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, Download, Image as ImageIcon, Grid3X3, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface PropertyPhotoGalleryProps {
  images: string[];
  title: string;
}

const PropertyPhotoGallery: React.FC<PropertyPhotoGalleryProps> = ({ images, title }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Reset zoom and rotation when changing images
  useEffect(() => {
    setZoomLevel(1);
    setRotation(0);
  }, [selectedImageIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      
      switch (e.key) {
        case 'Escape':
          setIsLightboxOpen(false);
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
        case 'r':
        case 'R':
          handleRotate();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, selectedImageIndex, images.length]);

  const goToNext = () => {
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrevious = () => {
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.5, 0.5));
  };

  const handleRotate = () => {
    setRotation((prev) => prev + 90);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(images[selectedImageIndex]);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title}-photo-${selectedImageIndex + 1}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download image:', error);
    }
  };

  const openLightbox = (index: number) => {
    setSelectedImageIndex(index);
    setIsLightboxOpen(true);
  };

  if (!images || images.length === 0) {
    return (
      <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-muted to-muted/60 flex items-center justify-center text-muted-foreground border border-border/50">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-muted-foreground/10 flex items-center justify-center mx-auto">
            <ImageIcon className="h-8 w-8 text-muted-foreground/60" />
          </div>
          <div>
            <p className="font-medium text-foreground/80">No photos available</p>
            <p className="text-sm text-muted-foreground">Property photos will appear here</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Main Gallery - Compact Right Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
        {/* Left Side - Main Display */}
        <div className="lg:col-span-4">
          <div className="relative group">
            <div className="aspect-[4/3] rounded-xl overflow-hidden bg-card border border-border/50 shadow-lg cursor-pointer transition-all duration-300 hover:shadow-xl hover:border-border"
                 onClick={() => openLightbox(selectedImageIndex)}>
              <img
                src={images[selectedImageIndex]}
                alt={`${title} - Photo ${selectedImageIndex + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
              
              {/* Enhanced overlay with gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button 
                    variant="secondary" 
                    size="lg"
                    className="bg-white/95 backdrop-blur-sm hover:bg-white text-foreground shadow-lg transform scale-90 group-hover:scale-100 transition-all duration-300"
                  >
                    <Maximize2 className="h-5 w-5 mr-2" />
                    <span className="font-medium">View Full Size</span>
                  </Button>
                </div>
              </div>

              {/* Enhanced photo counter */}
              <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg">
                <ImageIcon className="h-4 w-4" />
                <span>{selectedImageIndex + 1} of {images.length}</span>
              </div>

              {/* Enhanced navigation arrows */}
              {images.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white border-white/20 shadow-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                    onClick={(e) => {
                      e.stopPropagation();
                      goToPrevious();
                    }}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white border-white/20 shadow-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                    onClick={(e) => {
                      e.stopPropagation();
                      goToNext();
                    }}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Compact Thumbnails Panel */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-xl border border-border/50 shadow-sm p-4 h-full">
            <div className="space-y-4 h-full flex flex-col">
              {/* Enhanced gallery header */}
              <div className="flex items-center justify-between pb-4 border-b border-border/50">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-foreground">
                    <Grid3X3 className="h-5 w-5 text-primary" />
                    <span className="font-semibold text-lg">Gallery</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {images.length} {images.length === 1 ? 'photo' : 'photos'} available
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => openLightbox(selectedImageIndex)}
                  className="hover:bg-primary hover:text-primary-foreground transition-colors font-medium"
                >
                  <ZoomIn className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </div>

              {/* Enhanced thumbnail grid - Vertical Layout */}
              <div className="flex-1 min-h-0">
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                  {images.map((image, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`w-full aspect-[4/3] rounded-lg overflow-hidden border-2 cursor-pointer transition-all duration-200 relative group ${
                        selectedImageIndex === index 
                          ? 'border-primary ring-2 ring-primary/20 shadow-md' 
                          : 'border-border/50 hover:border-primary/60 hover:shadow-sm'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${title} thumbnail ${index + 1}`}
                        className="w-full h-full object-cover transition-opacity duration-200 group-hover:opacity-90"
                      />
                      
                      {/* Elegant selected indicator */}
                      {selectedImageIndex === index && (
                        <div className="absolute inset-0 bg-primary/15 flex items-center justify-center">
                          <div className="bg-primary text-primary-foreground rounded-full p-1.5 shadow-sm">
                            <ImageIcon className="h-3 w-3" />
                          </div>
                        </div>
                      )}
                      
                      {/* Subtle image number overlay */}
                      <div className="absolute top-1.5 left-1.5 bg-black/70 backdrop-blur-sm text-white text-xs px-1.5 py-0.5 rounded font-medium">
                        {index + 1}
                      </div>

                      {/* Subtle hover overlay */}
                      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Lightbox Modal */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-[98vw] max-h-[98vh] w-auto h-auto p-0 bg-black/95 border-none overflow-hidden">
          <div className="relative w-full h-full flex items-center justify-center min-h-[70vh] p-4">
            {/* Enhanced close button */}
            <Button
              variant="outline"
              size="icon"
              className="absolute top-6 right-6 z-50 bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm"
              onClick={() => setIsLightboxOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>

            {/* Enhanced controls */}
            <div className="absolute top-6 left-6 z-50 flex items-center gap-3">
              <Badge variant="secondary" className="bg-black/60 text-white border-white/20 backdrop-blur-sm px-3 py-1">
                <span className="font-medium">{selectedImageIndex + 1} of {images.length}</span>
              </Badge>
              
              <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-lg p-1 border border-white/20">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 0.5}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-white text-sm px-3 font-medium min-w-[4rem] text-center">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 3}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <div className="w-px h-6 bg-white/20 mx-1" />
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                  onClick={handleRotate}
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Fixed main image container to prevent cropping */}
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
              <div 
                className="max-w-full max-h-full flex items-center justify-center"
                style={{
                  width: 'calc(100vw - 8rem)',
                  height: 'calc(100vh - 16rem)',
                }}
              >
                <img
                  src={images[selectedImageIndex]}
                  alt={`${title} - Photo ${selectedImageIndex + 1}`}
                  className="max-w-full max-h-full object-contain transition-transform duration-300"
                  style={{
                    transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                  }}
                  draggable={false}
                />
              </div>
            </div>

            {/* Enhanced navigation */}
            {images.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-6 top-1/2 -translate-y-1/2 z-50 bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm h-12 w-12"
                  onClick={goToPrevious}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-6 top-1/2 -translate-y-1/2 z-50 bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm h-12 w-12"
                  onClick={goToNext}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}

            {/* Enhanced bottom thumbnail strip */}
            {images.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50">
                <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm p-3 rounded-xl border border-white/20 max-w-[80vw] overflow-x-auto">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-14 h-14 rounded-lg border-2 overflow-hidden transition-all duration-200 hover:scale-110 ${
                        selectedImageIndex === index 
                          ? 'border-primary ring-2 ring-primary/50' 
                          : 'border-white/30 hover:border-white/60'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PropertyPhotoGallery;