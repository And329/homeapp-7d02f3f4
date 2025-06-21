
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Download, FileText, Image as ImageIcon, Video, Music, Archive } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface FileAttachmentProps {
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
}

const FileAttachment: React.FC<FileAttachmentProps> = ({
  fileName,
  fileUrl,
  fileType,
  fileSize
}) => {
  const { t } = useTranslation();

  const getFileIcon = () => {
    if (fileType.startsWith('image/')) return <ImageIcon className="h-5 w-5" />;
    if (fileType.startsWith('video/')) return <Video className="h-5 w-5" />;
    if (fileType.startsWith('audio/')) return <Music className="h-5 w-5" />;
    if (fileType.includes('zip') || fileType.includes('rar')) return <Archive className="h-5 w-5" />;
    return <FileText className="h-5 w-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('chat-attachments')
        .download(fileUrl);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border max-w-xs">
      <div className="text-gray-600">
        {getFileIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {fileName}
        </p>
        <p className="text-xs text-gray-500">
          {formatFileSize(fileSize)}
        </p>
      </div>
      <Button
        onClick={handleDownload}
        variant="ghost"
        size="sm"
        className="p-1 h-8 w-8"
      >
        <Download className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default FileAttachment;
