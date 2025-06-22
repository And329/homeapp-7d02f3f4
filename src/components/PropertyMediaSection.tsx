
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
    <div className="space-y-12">
      {/* Images Section */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Property Images</h3>
          <p className="text-gray-600">Showcase your property with stunning high-quality images</p>
        </div>
        <PropertyImageUpload
          images={formData.images}
          onImagesChange={onImagesChange}
        />
      </div>

      {/* Videos Section */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Property Videos</h3>
          <p className="text-gray-600">Bring your property to life with engaging video content</p>
        </div>
        <PropertyVideoUpload
          videos={formData.videos}
          onVideosChange={onVideosChange}
        />
      </div>

      {/* QR Code Section */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">QR Code</h3>
          <p className="text-gray-600">Add a QR code for easy property sharing and access</p>
        </div>
        <QRCodeUpload
          qrCode={formData.qr_code}
          onQRCodeChange={onQRCodeChange}
          required
        />
      </div>

      {/* Amenities Section */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Amenities & Features</h3>
          <p className="text-gray-600">Highlight the key features and amenities of your property</p>
        </div>
        <PropertyAmenities
          selectedAmenities={formData.amenities}
          onAmenitiesChange={onAmenitiesChange}
        />
      </div>
    </div>
  );
};

export default PropertyMediaSection;
