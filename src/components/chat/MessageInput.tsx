import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFileUpload } from '@/hooks/useFileUpload';
import { FileUploadZone } from './FileUploadZone';

interface MessageInputProps {
  onSendMessage: (content: string, fileData?: any) => Promise<any>;
  isSending: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  isSending,
}) => {
  const [message, setMessage] = useState('');
  const { uploadImage, uploadDocument } = useFileUpload();

  const handleSendMessage = async () => {
    if (message.trim()) {
      try {
        await onSendMessage(message.trim());
        setMessage('');
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = async (file: File, type: 'image' | 'document') => {
    const fileData = type === 'image' 
      ? await uploadImage(file)
      : await uploadDocument(file);

    if (fileData) {
      const content = type === 'image' ? `📷 ${file.name}` : `📎 ${file.name}`;
      await onSendMessage(content, fileData);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* File upload zones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FileUploadZone
          type="image"
          onFileSelected={(file) => handleFileUpload(file, 'image')}
        />
        <FileUploadZone
          type="document"
          onFileSelected={(file) => handleFileUpload(file, 'document')}
        />
      </div>
      
      {/* Message input */}
      <div className="flex gap-3 items-end">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          onKeyPress={handleKeyPress}
          disabled={isSending}
          className="flex-1 text-base py-3"
        />
        <Button
          onClick={handleSendMessage}
          disabled={!message.trim() || isSending}
          size="default"
          className="px-6 py-3"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};