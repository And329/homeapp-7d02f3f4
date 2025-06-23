
import React from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFavorites } from '@/hooks/useFavorites';
import PropertyCard from './PropertyCard';
import { useNavigate } from 'react-router-dom';
import { transformDatabaseProperty } from '@/utils/propertyTransform';

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
              
              // Use the transform utility to convert database property to our Property interface
              const property = transformDatabaseProperty(favorite.properties);
              
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
