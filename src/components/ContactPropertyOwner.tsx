
import React, { useState } from 'react';
import { MessageCircle, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import UnifiedChat from './UnifiedChat';

interface ContactPropertyOwnerProps {
  propertyId?: string;
  propertyRequestId?: string;
  ownerId: string;
  propertyTitle: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string | null;
  ownerProfilePicture?: string | null;
}

const ContactPropertyOwner: React.FC<ContactPropertyOwnerProps> = ({
  propertyId,
  propertyRequestId,
  ownerId,
  propertyTitle,
  contactName,
  ownerProfilePicture
}) => {
  const [showChat, setShowChat] = useState(false);

  if (showChat) {
    return (
      <div className="sticky top-24">
        <UnifiedChat
          propertyId={propertyId}
          propertyRequestId={propertyRequestId}
          otherUserId={ownerId}
          propertyTitle={propertyTitle}
          onClose={() => setShowChat(false)}
          className="h-[600px]"
        />
      </div>
    );
  }

  return (
    <Card className="sticky top-24 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-3">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center overflow-hidden shadow-sm">
            {ownerProfilePicture ? (
              <img 
                src={ownerProfilePicture} 
                alt={contactName} 
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-6 w-6 text-blue-600" />
            )}
          </div>
          <div className="flex-1">
            <span className="text-lg font-semibold">Contact Owner</span>
            <p className="text-sm font-normal text-gray-600 mt-0.5">{contactName}</p>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4 pt-0">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-700 text-sm leading-relaxed">
            Interested in <span className="font-medium">"{propertyTitle}"</span>? 
            Start a conversation with the property owner to ask questions, 
            schedule a viewing, or discuss details.
          </p>
        </div>

        <Button
          onClick={() => setShowChat(true)}
          className="w-full flex items-center justify-center space-x-2 h-11 text-base font-medium"
          size="lg"
        >
          <MessageCircle className="h-5 w-5" />
          <span>Start Conversation</span>
        </Button>
        
        <p className="text-xs text-gray-500 text-center">
          Your messages are secure and private
        </p>
      </CardContent>
    </Card>
  );
};

export default ContactPropertyOwner;
