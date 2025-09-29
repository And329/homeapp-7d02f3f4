import React, { useState } from 'react';
import { X, QrCode, Upload, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useDirectUpload } from '@/hooks/useDirectUpload';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface QRCodeUploadProps {
  qrCode: string;
  onQRCodeChange: (qrCode: string) => void;
  required?: boolean;
}

const QRCodeUpload: React.FC<QRCodeUploadProps> = ({
  qrCode,
  onQRCodeChange,
  required = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const { uploadFile } = useDirectUpload();

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

    // Validate file size (max 5MB for QR codes)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "QR code image must be smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Upload to Supabase storage
      const uploadResult = await uploadFile(file, {
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/'],
        bucket: 'property-media'
      });

      if (!uploadResult) {
        throw new Error('Upload failed');
      }

      onQRCodeChange(uploadResult.url);
      
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
      <div className="flex items-center gap-2 mb-2">
        <label className="block text-sm font-medium text-gray-700">
          QR Code Image {required && '*'}
        </label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-xs">
                QR codes are required for UAE legal compliance (RERA/DLD regulations). 
                The QR code should link to the official property listing or verification page.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <p className="text-xs text-gray-500 mb-3">
        Upload a QR code image for property legal compliance as required by UAE law.
      </p>
      
      {qrCode ? (
        <div className="relative group mb-4">
          <img
            src={qrCode}
            alt="QR Code"
            className="w-32 h-32 object-contain rounded-lg border border-gray-200 bg-white shadow-sm"
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
    </div>
  );
};

export default QRCodeUpload;