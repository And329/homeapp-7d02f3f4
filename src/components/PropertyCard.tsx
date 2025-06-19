
import React from 'react';
import { MapPin, Bed, Bath, Square, MessageCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useConversations } from '@/hooks/useConversations';
import { useToast } from '@/hooks/use-toast';
import { Property } from '@/types/property';

interface PropertyCardProps {
  property: Property;
  onClick?: () => void;
  showContactButton?: boolean;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ 
  property, 
  onClick, 
  showContactButton = true 
}) => {
  const { user } = useAuth();
  const { createConversationAsync } = useConversations();
  const { toast } = useToast();

  const handleContactOwner = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to contact the property owner.",
        variant: "destructive",
      });
      return;
    }

    if (!property.owner_id) {
      toast({
        title: "Contact not available",
        description: "Owner contact information is not available for this property.",
        variant: "destructive",
      });
      return;
    }

    if (property.owner_id === user.id) {
      toast({
        title: "Cannot contact yourself",
        description: "You cannot start a conversation with yourself.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createConversationAsync({
        otherUserId: property.owner_id,
        propertyId: typeof property.id === 'number' ? property.id : parseInt(property.id),
        subject: `Inquiry about: ${property.title}`
      });
      
      toast({
        title: "Conversation started",
        description: "You can now chat with the property owner.",
      });
    } catch (error) {
      console.error('Failed to start conversation:', error);
      toast({
        title: "Error",
        description: "Failed to start conversation. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group">
      <div className="relative" onClick={onClick}>
        <img
          src={property.images && property.images.length > 0 ? property.images[0] : '/placeholder.svg'}
          alt={property.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {property.isHotDeal && (
          <Badge className="absolute top-2 left-2 bg-red-500 text-white">
            Hot Deal
          </Badge>
        )}
        <Badge className="absolute top-2 right-2 bg-blue-500 text-white capitalize">
          For {property.type}
        </Badge>
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{property.title}</h3>
        
        <div className="flex items-center text-gray-600 mb-2">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm">{property.location}</span>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center">
            <Bed className="h-4 w-4 mr-1" />
            <span>{property.bedrooms} bed</span>
          </div>
          <div className="flex items-center">
            <Bath className="h-4 w-4 mr-1" />
            <span>{property.bathrooms} bath</span>
          </div>
          <div className="flex items-center">
            <Square className="h-4 w-4 mr-1" />
            <span>{property.area} m²</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <p className="text-xl font-bold text-primary">
            ${property.price.toLocaleString()}
            <span className="text-sm font-normal text-gray-600">
              {property.type === 'rent' ? '/month' : ''}
            </span>
          </p>
          
          {showContactButton && property.owner_id && user && property.owner_id !== user.id && (
            <Button
              onClick={handleContactOwner}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Contact
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
