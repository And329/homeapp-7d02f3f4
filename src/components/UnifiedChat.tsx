
import React from 'react';
import ChatWindow from './messaging/ChatWindow';

interface UnifiedChatProps {
  otherUserId?: string;
  propertyTitle?: string;
  propertyId?: string;
  propertyRequestId?: string;
  onClose?: () => void;
  className?: string;
}

// This is a legacy wrapper component - new code should use MessagingInterface or ChatWindow directly
const UnifiedChat: React.FC<UnifiedChatProps> = ({
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-center h-full ${className}`}>
      <p className="text-gray-500">Please use the new messaging interface</p>
    </div>
  );
};

export default UnifiedChat;
