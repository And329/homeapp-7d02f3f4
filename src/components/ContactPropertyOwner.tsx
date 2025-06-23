
import React from 'react';
import { User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
  propertyTitle,
  contactName,
  contactEmail,
  contactPhone,
  ownerProfilePicture
}) => {
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
          <p className="text-gray-700 text-sm leading-relaxed mb-3">
            Interested in <span className="font-medium">"{propertyTitle}"</span>?
          </p>
          <div className="space-y-2">
            <div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</span>
              <p className="text-sm text-gray-700">{contactEmail}</p>
            </div>
            {contactPhone && (
              <div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone</span>
                <p className="text-sm text-gray-700">{contactPhone}</p>
              </div>
            )}
          </div>
        </div>
        
        <p className="text-xs text-gray-500 text-center">
          Contact the property owner directly using the information above
        </p>
      </CardContent>
    </Card>
  );
};

export default ContactPropertyOwner;
