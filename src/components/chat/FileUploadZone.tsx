import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Paperclip, Image as ImageIcon } from 'lucide-react';

interface FileUploadZoneProps {
  type: 'image' | 'document';
  onFileSelected: (file: File) => void;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  type,
  onFileSelected,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedTypes = type === 'image' ? 'image/*' : '*/*';
  const title = type === 'image' ? 'Image' : 'File';
  const Icon = type === 'image' ? ImageIcon : Paperclip;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelected(files[0]);
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
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes}
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <Button 
        variant="outline" 
        size="sm" 
        type="button" 
        onClick={handleClick}
        className="h-8 px-3 text-xs w-full"
      >
        <Icon className="h-3 w-3 mr-2" />
        {title}
      </Button>
    </div>
  );
};