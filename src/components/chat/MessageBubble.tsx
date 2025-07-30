import React from 'react';
import { Message } from '@/hooks/useChat';
import FileAttachment from '../FileAttachment';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MessageBubbleProps {
  message: Message;
  senderName: string;
  isOwnMessage: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  senderName,
  isOwnMessage,
}) => {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isImage = (fileType?: string) => {
    console.log('Checking file type:', fileType);
    return fileType?.startsWith('image/') || false;
  };

  const handleDownload = async () => {
    if (!message.file_url) return;
    
    try {
      const response = await fetch(message.file_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = message.file_name || 'download';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[70%] px-3 py-2 rounded-lg text-sm ${
          isOwnMessage
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground'
        }`}
      >
        <div className="font-medium text-xs mb-1 opacity-75">
          {senderName}
        </div>
        
        {/* Display file attachment if present */}
        {message.file_url && message.file_name ? (
          <div className="mb-2">
            {isImage(message.file_type) ? (
              <div className="space-y-2">
                <img 
                  src={message.file_url} 
                  alt={message.file_name}
                  className="max-w-full max-h-64 rounded-md object-contain"
                />
                <div className="flex items-center justify-between text-xs opacity-75">
                  <span>{message.file_name}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleDownload}
                    className="h-6 px-2"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ) : (
              <FileAttachment
                fileName={message.file_name}
                fileUrl={message.file_url}
                fileType={message.file_type || 'application/octet-stream'}
                fileSize={message.file_size || 0}
              />
            )}
          </div>
        ) : null}
        
        {/* Only display content if it exists and it's not just the file name */}
        {message.content && message.content.trim() !== message.file_name?.trim() && message.content.trim() !== '' && (
          <div className="leading-relaxed break-words">{message.content}</div>
        )}
        
        <div className="text-xs mt-1 opacity-60">
          {formatTime(message.created_at)}
        </div>
      </div>
    </div>
  );
};