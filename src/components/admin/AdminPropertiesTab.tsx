
import React from 'react';
import { Plus, Map, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PropertyCard from '@/components/PropertyCard';
import PropertyMap from '@/components/PropertyMap';

interface Property {
  id: number;
  title: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  type: 'rent' | 'sale';
  is_hot_deal: boolean;
  description: string;
  created_at: string;
  latitude: number | null;
  longitude: number | null;
  amenities: string[] | null;
  images: string[] | null;
}

interface AdminPropertiesTabProps {
  properties: Property[];
  propertiesLoading: boolean;
  showMap: boolean;
  setShowMap: (show: boolean) => void;
  onAddProperty: () => void;
  onEditProperty: (property: Property) => void;
  onDeleteProperty: (id: number) => void;
}

const AdminPropertiesTab: React.FC<AdminPropertiesTabProps> = ({
  properties,
  propertiesLoading,
  showMap,
  setShowMap,
  onAddProperty,
  onEditProperty,
  onDeleteProperty,
}) => {
  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <Button
          onClick={onAddProperty}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add New Property
        </Button>

        <Button
          onClick={() => setShowMap(!showMap)}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Map className="h-4 w-4" />
          {showMap ? 'Hide Map' : 'Show Map'}
        </Button>
      </div>

      {showMap && (
        <div className="mb-6">
          <PropertyMap
            properties={properties.map(p => ({
              id: p.id,
              title: p.title,
              location: p.location,
              price: p.price,
              type: p.type,
              latitude: p.latitude,
              longitude: p.longitude,
            }))}
            height="500px"
          />
        </div>
      )}

      {propertiesLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading properties...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {properties.map((property) => {
            const transformedProperty = {
              id: property.id.toString(),
              title: property.title || 'Untitled Property',
              price: property.price || 0,
              location: property.location || 'Unknown Location',
              bedrooms: property.bedrooms || 0,
              bathrooms: property.bathrooms || 0,
              area: 1000,
              image: Array.isArray(property.images) && property.images.length > 0 
                ? property.images[0] 
                : '/placeholder.svg',
              images: Array.isArray(property.images) ? property.images : ['/placeholder.svg'],
              type: (property.type === 'rent' || property.type === 'sale') ? property.type : 'rent' as 'rent' | 'sale',
              isHotDeal: property.is_hot_deal || false,
              description: property.description || '',
              amenities: Array.isArray(property.amenities) ? property.amenities : [],
              coordinates: {
                lat: property.latitude || 0,
                lng: property.longitude || 0
              },
              propertyType: 'Apartment'
            };

            return (
              <div key={property.id} className="relative">
                <PropertyCard property={transformedProperty} />
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditProperty(property)}
                    className="bg-white/90 backdrop-blur-sm"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeleteProperty(property.id)}
                    className="text-red-600 hover:text-red-800 bg-white/90 backdrop-blur-sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}

          {properties.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No properties found. Add your first property!</p>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default AdminPropertiesTab;
