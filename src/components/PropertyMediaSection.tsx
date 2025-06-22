
import React from 'react';
import PropertyImageUpload from '@/components/PropertyImageUpload';
import PropertyVideoUpload from '@/components/PropertyVideoUpload';
import PropertyAmenities from '@/components/PropertyAmenities';
import QRCodeUpload from '@/components/QRCodeUpload';

interface PropertyMediaSectionProps {
  formData: {
    images: string[];
    videos: string[];
    qr_code: string;
    amenities: string[];
  };
  onImagesChange: (images: string[]) => void;
  onVideosChange: (videos: string[]) => void;
  onQRCodeChange: (qrCode: string) => void;
  onAmenitiesChange: (amenities: string[]) => void;
}

const PropertyMediaSection: React.FC<PropertyMediaSectionProps> = ({
  formData,
  onImagesChange,
  onVideosChange,
  onQRCodeChange,
  onAmenitiesChange,
}) => {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PropertyImageUpload
          images={formData.images}
          onImagesChange={onImagesChange}
        />

        <PropertyVideoUpload
          videos={formData.videos}
          onVideosChange={onVideosChange}
        />
      </div>

      <QRCodeUpload
        qrCode={formData.qr_code}
        onQRCodeChange={onQRCodeChange}
        required
      />

      <PropertyAmenities
        selectedAmenities={formData.amenities}
        onAmenitiesChange={onAmenitiesChange}
      />
    </>
  );
};

export default PropertyMediaSection;
