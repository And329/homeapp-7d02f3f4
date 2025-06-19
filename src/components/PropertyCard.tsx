
import React from 'react';
import { MapPin, Bed, Bath, Square, MessageCircle, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useConversations } from '@/hooks/useConversations';
import { useFavorites } from '@/hooks/useFavorites';
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
  const { isFavorite, toggleFavorite, isToggling } = useFavorites();
  const { toast } = useToast();

  const handleContactOwner = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    console.log('PropertyCard: Contact owner clicked for property:', property.id);
    console.log('PropertyCard: Current user:', user);
    console.log('PropertyCard: Property owner_id:', property.owner_id);
    
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
      console.log('PropertyCard: Creating conversation...');
      await createConversationAsync({
        otherUserId: property.owner_id,
        propertyId: property.id,
        subject: `Inquiry about: ${property.title}`
      });
      
      toast({
        title: "Conversation started",
        description: "You can now chat with the property owner.",
      });
    } catch (error) {
      console.error('PropertyCard: Failed to start conversation:', error);
      toast({
        title: "Error",
        description: "Failed to start conversation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(property.id);
  };

  const isPropertyFavorited = isFavorite(property.id);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group">
      <div className="relative" onClick={onClick}>
        <img
          src={property.images && property.images.length > 0 ? property.images[0] : '/placeholder.svg'}
          alt={property.title}
          className="w-full h-36 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {property.isHotDeal && (
          <Badge className="absolute top-2 left-2 bg-red-500 text-white text-xs">
            Hot Deal
          </Badge>
        )}
        <Badge className="absolute top-2 right-8 sm:right-2 bg-blue-500 text-white capitalize text-xs">
          For {property.type}
        </Badge>
        
        {/* Favorite Button */}
        <Button
          onClick={handleFavoriteClick}
          variant="ghost"
          size="sm"
          className={`absolute bottom-2 right-2 h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-full bg-white/90 hover:bg-white ${
            isPropertyFavorited ? 'text-red-500' : 'text-gray-600'
          }`}
          disabled={isToggling}
        >
          <Heart 
            className={`h-3 w-3 sm:h-4 sm:w-4 ${isPropertyFavorited ? 'fill-current' : ''}`} 
          />
        </Button>
      </div>
      
      <CardContent className="p-3 sm:p-4">
        <h3 className="font-semibold text-base sm:text-lg mb-2 line-clamp-2">{property.title}</h3>
        
        <div className="flex items-center text-gray-600 mb-2">
          <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
          <span className="text-xs sm:text-sm truncate">{property.location}</span>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-3">
          <div className="flex items-center">
            <Bed className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            <span>{property.bedrooms} bed</span>
          </div>
          <div className="flex items-center">
            <Bath className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            <span>{property.bathrooms} bath</span>
          </div>
          <div className="flex items-center">
            <Square className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            <span>{property.area} m²</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-lg sm:text-xl font-bold text-primary truncate">
              AED {property.price.toLocaleString()}
              <span className="text-xs sm:text-sm font-normal text-gray-600 block sm:inline">
                {property.type === 'rent' ? '/month' : ''}
              </span>
            </p>
          </div>
          
          {showContactButton && property.owner_id && user && property.owner_id !== user.id && (
            <Button
              onClick={handleContactOwner}
              variant="outline"
              size="sm"
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
            >
              <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Contact</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
