
import React from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFavorites } from '@/hooks/useFavorites';
import PropertyCard from './PropertyCard';
import { useNavigate } from 'react-router-dom';
import { Property } from '@/types/property';

const FavoritesList = () => {
  const { favorites, isLoading } = useFavorites();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Heart className="h-5 w-5 text-red-500" />
            <span>My Favorites</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
          <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
          <span>My Favorites ({favorites.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        {favorites.length === 0 ? (
          <div className="text-center py-6 sm:py-8">
            <Heart className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
            <p className="text-gray-500 text-base sm:text-lg font-medium mb-2">No favorites yet</p>
            <p className="text-gray-400 text-sm sm:text-base mb-4">Start exploring properties and add them to your favorites!</p>
            <button
              onClick={() => navigate('/properties')}
              className="bg-primary text-white px-4 py-2 sm:px-6 sm:py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              Browse Properties
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {favorites.map((favorite) => {
              if (!favorite.properties) return null;
              
              // Handle images conversion from Json to string array
              const imagesArray = Array.isArray(favorite.properties.images) 
                ? favorite.properties.images 
                : ['/placeholder.svg'];
              
              // Handle amenities conversion from Json[] to string[]
              const amenitiesArray = Array.isArray(favorite.properties.amenities) 
                ? favorite.properties.amenities
                    .filter(item => typeof item === 'string')
                    .map(item => item as string)
                : [];
              
              const property: Property = {
                id: favorite.properties.id,
                title: favorite.properties.title,
                price: favorite.properties.price,
                location: favorite.properties.location,
                emirate: favorite.properties.emirate || '',
                latitude: favorite.properties.latitude,
                longitude: favorite.properties.longitude,
                bedrooms: favorite.properties.bedrooms,
                bathrooms: favorite.properties.bathrooms,
                area: favorite.properties.area,
                property_type: favorite.properties.property_type || 'Apartment',
                year_built: favorite.properties.year_built,
                parking: favorite.properties.parking,
                type: favorite.properties.type as 'rent' | 'sale',
                description: favorite.properties.description || '',
                is_hot_deal: favorite.properties.is_hot_deal || false,
                amenities: amenitiesArray,
                images: imagesArray.map(img => typeof img === 'string' ? img : '/placeholder.svg'),
                videos: Array.isArray(favorite.properties.videos) ? favorite.properties.videos : [],
                qr_code: favorite.properties.qr_code || '',
                owner_id: favorite.properties.owner_id,
                is_approved: favorite.properties.is_approved,
                created_at: favorite.properties.created_at,
              };
              
              return (
                <PropertyCard
                  key={favorite.id}
                  property={property}
                  onClick={() => navigate(`/properties/${property.id}`)}
                  showContactButton={true}
                />
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FavoritesList;
