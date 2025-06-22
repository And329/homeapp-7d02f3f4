
import React, { useState } from 'react';
import { X, Upload, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface QRCodeUploadProps {
  qrCode: string;
  onQRCodeChange: (qrCode: string) => void;
}

const QRCodeUpload: React.FC<QRCodeUploadProps> = ({
  qrCode,
  onQRCodeChange,
}) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('QRCodeUpload: Processing file:', file.name, 'Type:', file.type, 'Size:', file.size);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file for the QR code.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 2MB for QR codes)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "QR code image must be smaller than 2MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Convert to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          console.log('QRCodeUpload: File converted to base64');
          resolve(result);
        };
        reader.onerror = () => {
          console.error('QRCodeUpload: Error reading file');
          reject(new Error('Failed to read file'));
        };
        reader.readAsDataURL(file);
      });

      onQRCodeChange(base64);
      
      toast({
        title: "QR code uploaded",
        description: "QR code image uploaded successfully.",
      });

      // Clear the input
      event.target.value = '';
    } catch (error) {
      console.error('QRCodeUpload: Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload QR code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeQRCode = () => {
    console.log('QRCodeUpload: Removing QR code');
    onQRCodeChange('');
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        QR Code (Required by Law)
      </label>
      
      {qrCode ? (
        <div className="relative group mb-4">
          <img
            src={qrCode}
            alt="QR Code"
            className="w-32 h-32 object-cover rounded-lg border border-gray-200"
          />
          <button
            type="button"
            onClick={removeQRCode}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center h-32 w-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors mb-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />
          {uploading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          ) : (
            <>
              <QrCode className="h-6 w-6 text-gray-400 mb-2" />
              <span className="text-xs text-gray-500 text-center">Upload QR Code</span>
            </>
          )}
        </label>
      )}
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Or enter QR code text/URL
        </label>
        <input
          type="text"
          value={qrCode && !qrCode.startsWith('data:') ? qrCode : ''}
          onChange={(e) => onQRCodeChange(e.target.value)}
          placeholder="Enter QR code text or URL"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>
      
      <p className="text-xs text-gray-500">
        Upload a QR code image or enter text/URL. Required by UAE property law for legal compliance.
      </p>
    </div>
  );
};

export default QRCodeUpload;
