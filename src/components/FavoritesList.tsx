
import React from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFavorites } from '@/hooks/useFavorites';
import PropertyCard from './PropertyCard';
import { useNavigate } from 'react-router-dom';

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
        <CardTitle className="flex items-center space-x-2">
          <Heart className="h-5 w-5 text-red-500" />
          <span>My Favorites ({favorites.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {favorites.length === 0 ? (
          <div className="text-center py-8">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium mb-2">No favorites yet</p>
            <p className="text-gray-400 mb-4">Start exploring properties and add them to your favorites!</p>
            <button
              onClick={() => navigate('/properties')}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Properties
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite) => {
              if (!favorite.properties) return null;
              
              // Handle images conversion from Json to string array
              const imagesArray = Array.isArray(favorite.properties.images) 
                ? favorite.properties.images 
                : ['/placeholder.svg'];
              
              const firstImage = imagesArray.length > 0 ? imagesArray[0] : '/placeholder.svg';
              
              // Handle amenities conversion from Json[] to string[]
              const amenitiesArray = Array.isArray(favorite.properties.amenities) 
                ? favorite.properties.amenities
                    .filter(item => typeof item === 'string')
                    .map(item => item as string)
                : [];
              
              const property = {
                id: favorite.properties.id,
                title: favorite.properties.title,
                price: favorite.properties.price,
                location: favorite.properties.location,
                bedrooms: favorite.properties.bedrooms,
                bathrooms: favorite.properties.bathrooms,
                area: 1000,
                image: typeof firstImage === 'string' ? firstImage : '/placeholder.svg',
                images: imagesArray.map(img => typeof img === 'string' ? img : '/placeholder.svg'),
                type: favorite.properties.type as 'rent' | 'sale',
                isHotDeal: false,
                description: favorite.properties.description || '',
                amenities: amenitiesArray,
                coordinates: { 
                  lat: favorite.properties.latitude || 0, 
                  lng: favorite.properties.longitude || 0 
                },
                propertyType: 'Apartment',
                owner_id: favorite.properties.owner_id
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
