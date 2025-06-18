
import React from 'react';
import { MapPin } from 'lucide-react';

interface PropertyMapProps {
  properties: Array<{
    id: number;
    title: string;
    location: string;
    price: number;
    type: 'rent' | 'sale';
    latitude?: number;
    longitude?: number;
  }>;
  selectedPropertyId?: number;
  onPropertySelect?: (propertyId: number) => void;
  height?: string;
}

const PropertyMap: React.FC<PropertyMapProps> = ({
  properties,
  selectedPropertyId,
  onPropertySelect,
  height = '400px'
}) => {
  console.log('PropertyMap: Rendering static map placeholder with', properties.length, 'properties');

  // Filter properties with valid coordinates
  const validProperties = properties.filter(
    p => p.latitude && p.longitude && 
    !isNaN(p.latitude) && !isNaN(p.longitude) &&
    p.latitude >= -90 && p.latitude <= 90 &&
    p.longitude >= -180 && p.longitude <= 180
  );

  return (
    <div className="relative">
      <div 
        className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex flex-col items-center justify-center border border-blue-200" 
        style={{ height }}
      >
        <div className="text-center p-6">
          <MapPin className="h-16 w-16 text-blue-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Interactive Map Temporarily Disabled</h3>
          <p className="text-gray-600 mb-4">
            We're working on improving the map experience. For now, you can view property locations in the listings.
          </p>
          {validProperties.length > 0 && (
            <div className="bg-white rounded-lg p-4 max-w-md mx-auto">
              <h4 className="font-medium text-gray-800 mb-3">Properties in this area:</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {validProperties.slice(0, 5).map((property) => (
                  <div 
                    key={property.id}
                    className={`text-sm p-2 rounded cursor-pointer transition-colors ${
                      selectedPropertyId === property.id 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => onPropertySelect && onPropertySelect(property.id)}
                  >
                    <div className="font-medium">{property.title}</div>
                    <div className="text-gray-600">{property.location}</div>
                    <div className="text-blue-600 font-semibold">
                      AED {property.price.toLocaleString()}{property.type === 'rent' ? '/month' : ''}
                    </div>
                  </div>
                ))}
                {validProperties.length > 5 && (
                  <div className="text-xs text-gray-500 text-center pt-1">
                    +{validProperties.length - 5} more properties
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="absolute bottom-2 left-2 bg-white px-2 py-1 rounded text-xs text-gray-600 shadow z-10">
        {validProperties.length} properties in area
      </div>
    </div>
  );
};

export default PropertyMap;
