
import React from 'react';
import { QrCode } from 'lucide-react';

interface PropertyQRCodeProps {
  qrCode?: string;
  propertyTitle: string;
  className?: string;
}

const PropertyQRCode: React.FC<PropertyQRCodeProps> = ({
  qrCode,
  propertyTitle,
  className = "",
}) => {
  if (!qrCode) {
    return (
      <div className={`text-center ${className}`}>
        <div className="text-gray-400 mb-1">
          <QrCode className="h-8 w-8 mx-auto" />
        </div>
        <p className="text-xs text-gray-500">
          No QR code available
        </p>
      </div>
    );
  }

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error('QR code image failed to load:', qrCode);
    e.currentTarget.style.display = 'none';
    const fallbackDiv = e.currentTarget.nextElementSibling as HTMLElement;
    if (fallbackDiv) {
      fallbackDiv.style.display = 'block';
    }
  };

  return (
    <div className={`text-center ${className}`}>
      <img
        src={qrCode}
        alt={`QR Code for ${propertyTitle}`}
        className="w-16 h-16 object-contain mx-auto border rounded bg-white shadow-sm"
        onError={handleImageError}
      />
      <div className="hidden text-center">
        <div className="text-gray-400 mb-1">
          <QrCode className="h-8 w-8 mx-auto" />
        </div>
        <p className="text-xs text-gray-500">
          QR code could not be loaded
        </p>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        Property documentation
      </p>
    </div>
  );
};

export default PropertyQRCode;
