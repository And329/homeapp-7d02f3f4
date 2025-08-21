
import React from 'react';
import { MapPin, Bed, Bath, Square, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useUnits } from '@/contexts/UnitsContext';
import { useFavorites } from '@/hooks/useFavorites';
import { Property } from '@/types/property';
import { convertArea, convertPrice, formatArea, formatPrice } from '@/utils/unitConversion';
import { useTranslation } from 'react-i18next';

interface PropertyCardProps {
  property: Property;
  onClick?: () => void;
  showContactButton?: boolean;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ 
  property, 
  onClick, 
  showContactButton = false
}) => {
  const { user } = useAuth();
  const { unitSystem, currency } = useUnits();
  const { isFavorite, toggleFavorite, isToggling } = useFavorites();
  const { t } = useTranslation();

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(property.id);
  };

  const isPropertyFavorited = isFavorite(property.id);

  // Convert units based on user preferences
  const displayArea = property.area ? convertArea(property.area, 'metric', unitSystem) : null;
  const displayPrice = convertPrice(property.price, 'AED', currency);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group">
      <div className="relative" onClick={onClick}>
        <img
          src={property.images && property.images.length > 0 ? property.images[0] : '/placeholder.svg'}
          alt={property.title}
          className="w-full h-36 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {property.is_hot_deal && (
          <Badge className="absolute top-2 left-2 bg-red-500 text-white text-xs">
            {t('listProperty.hotDeal')}
          </Badge>
        )}
        <Badge className="absolute top-2 right-2 bg-blue-500 text-white capitalize text-xs">
          {property.type === 'sale' ? t('propertyCard.forSale') : t('propertyCard.forRent')}
        </Badge>
        
        {/* Favorite Button with red color when favorited */}
        <Button
          onClick={handleFavoriteClick}
          variant="ghost"
          size="sm"
          className={`absolute bottom-2 right-2 h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-full bg-white/90 hover:bg-white transition-colors ${
            isPropertyFavorited ? 'text-red-500 hover:text-red-600' : 'text-gray-600 hover:text-gray-800'
          }`}
          disabled={isToggling}
        >
          <Heart 
            className={`h-3 w-3 sm:h-4 sm:w-4 transition-all ${
              isPropertyFavorited ? 'fill-red-500 text-red-500' : ''
            }`} 
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
            <span>{property.bedrooms} {t('listProperty.bed')}</span>
          </div>
          <div className="flex items-center">
            <Bath className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            <span>{property.bathrooms} {t('listProperty.bath')}</span>
          </div>
          <div className="flex items-center">
            <Square className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            <span>{displayArea ? formatArea(displayArea, unitSystem) : 'N/A'}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-lg sm:text-xl font-bold text-primary truncate">
              {formatPrice(displayPrice, currency, property.type)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
