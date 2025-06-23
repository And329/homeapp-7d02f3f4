
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
      <div className={`bg-gray-50 p-6 rounded-lg text-center ${className}`}>
        <div className="text-gray-400 mb-2">
          <QrCode className="h-16 w-16 mx-auto" />
        </div>
        <p className="text-sm text-gray-600">
          No QR code available for this property
        </p>
        <p className="text-xs text-gray-500 mt-1">
          QR codes are generated when properties are officially approved
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
    <div className={`bg-gray-50 p-6 rounded-lg ${className}`}>
      <div className="text-center">
        <img
          src={qrCode}
          alt={`QR Code for ${propertyTitle}`}
          className="w-48 h-48 object-contain mx-auto border rounded-lg bg-white shadow-sm"
          onError={handleImageError}
        />
        <div className="hidden text-center">
          <div className="text-gray-400 mb-2">
            <QrCode className="h-16 w-16 mx-auto" />
          </div>
          <p className="text-sm text-gray-600">
            QR code could not be loaded
          </p>
        </div>
        <p className="text-sm text-gray-600 mt-3">
          Scan this QR code for legal property information and documentation
        </p>
      </div>
    </div>
  );
};

export default PropertyQRCode;
