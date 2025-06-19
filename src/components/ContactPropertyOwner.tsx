
import React, { useState } from 'react';
import { MessageCircle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import UnifiedChat from './UnifiedChat';

interface ContactPropertyOwnerProps {
  propertyId?: number;
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
      <UnifiedChat
        propertyId={propertyId}
        propertyRequestId={propertyRequestId}
        otherUserId={ownerId}
        propertyTitle={propertyTitle}
        onClose={() => setShowChat(false)}
        className="sticky top-24"
      />
    );
  }

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
            {ownerProfilePicture ? (
              <img 
                src={ownerProfilePicture} 
                alt={contactName} 
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-5 w-5 text-blue-600" />
            )}
          </div>
          <div>
            <span>Contact Property Owner</span>
            <p className="text-sm font-normal text-gray-600">{contactName}</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Interested in this property? Start a conversation with the owner.
          </p>
        </div>

        <Button
          onClick={() => setShowChat(true)}
          className="w-full flex items-center justify-center space-x-2"
          size="lg"
        >
          <MessageCircle className="h-5 w-5" />
          <span>Send Message</span>
        </Button>
      </CardContent>
    </Card>
  );
};

export default ContactPropertyOwner;
