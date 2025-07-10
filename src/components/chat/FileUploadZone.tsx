import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Paperclip, Image as ImageIcon } from 'lucide-react';

interface FileUploadZoneProps {
  type: 'image' | 'document';
  onFileSelected: (file: File) => void;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  type,
  onFileSelected,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedTypes = type === 'image' ? 'image/*' : '*/*';
  const title = type === 'image' ? 'Images' : 'Files';
  const Icon = type === 'image' ? ImageIcon : Paperclip;

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
      onFileSelected(files[0]);
    }
  };

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
    <div
      className={`
        relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
        ${isDragOver 
          ? 'border-primary bg-primary/5' 
          : 'border-gray-300 hover:border-gray-400'
        }
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
      />
      
      <div className="flex flex-col items-center">
        <Icon className="h-6 w-6 text-gray-400 mb-2" />
        <p className="text-sm font-medium text-gray-700 mb-1">
          Drop {title.toLowerCase()} here
        </p>
        <Button variant="outline" size="sm" type="button">
          <Upload className="h-4 w-4 mr-2" />
          Choose {title}
        </Button>
      </div>
    </div>
  );
};