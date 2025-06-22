
import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Upload, X, Paperclip, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface DragDropFileUploadProps {
  onFileUploaded: (fileData: {
    url: string;
    name: string;
    type: string;
    size: number;
  }) => void;
  acceptedTypes?: string;
  maxSize?: number; // in bytes
  uploadType: 'image' | 'file';
}

const DragDropFileUpload: React.FC<DragDropFileUploadProps> = ({
  onFileUploaded,
  acceptedTypes = '*/*',
  maxSize = 10 * 1024 * 1024, // 10MB default
  uploadType
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: `File must be smaller than ${Math.round(maxSize / 1024 / 1024)}MB.`,
        variant: "destructive",
      });
      return false;
    }

    if (uploadType === 'image' && !file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const uploadFile = async (file: File) => {
    if (!user || !validateFile(file)) return;

    setIsUploading(true);
    console.log('DragDropFileUpload: Starting upload:', file.name, file.type, file.size);

    try {
      const fileExt = file.name.split('.').pop() || 'file';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from('chat-attachments')
        .upload(filePath, file);

      if (uploadError) {
        console.error('DragDropFileUpload: Upload error:', uploadError);
        toast({
          title: "Upload failed",
          description: `Failed to upload file: ${uploadError.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log('DragDropFileUpload: File uploaded successfully:', data);

      onFileUploaded({
        url: filePath,
        name: file.name,
        type: file.type,
        size: file.size
      });

      toast({
        title: "File uploaded",
        description: "File uploaded successfully.",
      });

    } catch (error) {
      console.error('DragDropFileUpload: Error uploading file:', error);
      toast({
        title: "Error",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      uploadFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadFile(files[0]);
    }
    // Reset input
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={`
        relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
        ${isDragOver 
          ? 'border-primary bg-primary/5' 
          : 'border-gray-300 hover:border-gray-400'
        }
        ${isUploading ? 'opacity-50 pointer-events-none' : ''}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes}
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />
      
      {isUploading ? (
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
          <p className="text-sm text-gray-600">Uploading...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          {uploadType === 'image' ? (
            <ImageIcon className="h-8 w-8 text-gray-400 mb-3" />
          ) : (
            <Paperclip className="h-8 w-8 text-gray-400 mb-3" />
          )}
          <p className="text-sm font-medium text-gray-700 mb-1">
            Drag and drop {uploadType === 'image' ? 'an image' : 'a file'} here
          </p>
          <p className="text-xs text-gray-500 mb-3">
            or click to browse files
          </p>
          <Button variant="outline" size="sm" type="button">
            <Upload className="h-4 w-4 mr-2" />
            Choose {uploadType === 'image' ? 'Image' : 'File'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default DragDropFileUpload;
