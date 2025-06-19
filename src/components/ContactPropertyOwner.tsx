
import React, { useState } from 'react';
import { MessageCircle, Phone, Mail, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import UserChat from './UserChat';

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
  contactEmail,
  contactPhone,
  ownerProfilePicture
}) => {
  const [showChat, setShowChat] = useState(false);

  console.log('ContactPropertyOwner props:', {
    propertyId,
    propertyRequestId,
    ownerId,
    propertyTitle,
    contactName,
    contactEmail,
    contactPhone
  });

  if (showChat) {
    return (
      <UserChat
        propertyId={propertyId}
        propertyRequestId={propertyRequestId}
        ownerId={ownerId}
        propertyTitle={propertyTitle}
        onClose={() => setShowChat(false)}
      />
    );
  }

  return (
    <Card>
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
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Mail className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{contactEmail}</span>
          </div>
          
          {contactPhone && (
            <div className="flex items-center space-x-3">
              <Phone className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{contactPhone}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col space-y-2">
          <Button
            onClick={() => {
              console.log('Starting chat with owner:', ownerId);
              setShowChat(true);
            }}
            className="w-full flex items-center justify-center space-x-2"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Start Chat</span>
          </Button>
          
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={() => window.location.href = `mailto:${contactEmail}`}
              className="flex items-center justify-center space-x-2"
            >
              <Mail className="h-4 w-4" />
              <span>Email</span>
            </Button>
            
            {contactPhone && (
              <Button
                variant="outline"
                onClick={() => window.location.href = `tel:${contactPhone}`}
                className="flex items-center justify-center space-x-2"
              >
                <Phone className="h-4 w-4" />
                <span>Call</span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContactPropertyOwner;
