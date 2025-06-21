
import React from 'react';

interface UnifiedChatProps {
  otherUserId?: string;
  propertyTitle?: string;
  propertyId?: string;
  propertyRequestId?: string;
  onClose?: () => void;
  className?: string;
}

// This component is deprecated in the new simplified system
const UnifiedChat: React.FC<UnifiedChatProps> = ({
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-center h-full ${className}`}>
      <div className="text-center p-8">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Direct Contact Available</h3>
        <p className="text-gray-500">
          In our simplified system, you can contact property owners directly using their contact information, 
          or admins may reach out to you regarding your property requests.
        </p>
      </div>
    </div>
  );
};

export default UnifiedChat;
