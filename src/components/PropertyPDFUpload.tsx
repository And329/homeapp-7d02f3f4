
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PropertyPDFUploadProps {
  onPDFChange: (pdfUrl: string | null) => void;
  currentPDF?: string | null;
}

const PropertyPDFUpload: React.FC<PropertyPDFUploadProps> = ({ onPDFChange, currentPDF }) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "File too large",
        description: "Please upload a PDF file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Convert file to base64 for storage
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        onPDFChange(base64String);
        toast({
          title: "PDF uploaded",
          description: "Your PDF has been uploaded successfully.",
        });
        setUploading(false);
      };
      reader.onerror = () => {
        toast({
          title: "Upload failed",
          description: "Failed to upload PDF. Please try again.",
          variant: "destructive",
        });
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading PDF:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload PDF. Please try again.",
        variant: "destructive",
      });
      setUploading(false);
    }
  };

  const removePDF = () => {
    onPDFChange(null);
    toast({
      title: "PDF removed",
      description: "The PDF attachment has been removed.",
    });
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        PDF Attachment (Optional)
      </label>
      
      {currentPDF ? (
        <div className="flex items-center justify-between p-4 border border-gray-300 rounded-lg bg-gray-50">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-red-600" />
            <span className="text-sm text-gray-700">PDF attached</span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={removePDF}
            className="text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <div className="text-center">
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">Upload PDF document</p>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
              id="pdf-upload"
              disabled={uploading}
            />
            <label htmlFor="pdf-upload">
              <Button
                type="button"
                variant="outline"
                disabled={uploading}
                className="cursor-pointer"
                asChild
              >
                <span>
                  {uploading ? 'Uploading...' : 'Choose PDF File'}
                </span>
              </Button>
            </label>
            <p className="text-xs text-gray-500 mt-1">Max file size: 10MB</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyPDFUpload;
