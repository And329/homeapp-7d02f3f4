import React from 'react';
import { useNavigate } from 'react-router-dom';

interface Property {
  id: string | number;
  title: string;
  location: string;
  price: number;
  type: 'rent' | 'sale';
  latitude: number | null;
  longitude: number | null;
}

interface PropertyMapProps {
  properties: Property[];
  height?: string;
  onPropertyClick?: (propertyId: string | number) => void;
}

const PropertyMap: React.FC<PropertyMapProps> = ({ 
  properties, 
  height = "400px",
  onPropertyClick 
}) => {
  const navigate = useNavigate();

  const handlePropertyClick = (propertyId: string | number) => {
    if (onPropertyClick) {
      onPropertyClick(propertyId);
    } else {
      navigate(`/properties/${propertyId}`);
    }
  };

  // Filter properties with valid coordinates
  const validProperties = properties.filter(
    property => property.latitude && property.longitude
  );

  if (validProperties.length === 0) {
    return (
      <div 
        className="flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl"
        style={{ height }}
      >
        <div className="text-center p-6">
          <div className="text-gray-400 mb-3">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
          <p className="text-gray-600 font-medium">No properties to display</p>
          <p className="text-gray-500 text-sm mt-1">Properties will appear here when available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl overflow-hidden shadow-lg" style={{ height }}>
      <div className="relative w-full h-full bg-gradient-to-br from-blue-50 to-green-50 p-6">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-blue-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Interactive Map</h3>
            <p className="text-gray-600 mb-4">Clean OpenStreetMap alternative to Mapbox</p>
            <p className="text-sm text-gray-500">Found {validProperties.length} properties with location data</p>
            
            {/* Property grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 max-w-md mx-auto">
              {validProperties.slice(0, 4).map((property) => (
                <div
                  key={property.id}
                  onClick={() => handlePropertyClick(property.id)}
                  className="bg-white p-3 rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className={`text-xs font-semibold mb-1 ${property.type === 'rent' ? 'text-blue-600' : 'text-green-600'}`}>
                    {property.type.toUpperCase()}
                  </div>
                  <div className="text-sm font-medium text-gray-800 truncate">{property.title}</div>
                  <div className="text-xs text-gray-500 truncate">{property.location}</div>
                  <div className={`text-sm font-bold mt-1 ${property.type === 'rent' ? 'text-blue-600' : 'text-green-600'}`}>
                    AED {property.price > 1000000 
                      ? `${Math.round(property.price / 1000000)}M` 
                      : property.price > 1000 
                      ? `${Math.round(property.price / 1000)}K` 
                      : property.price.toString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyMap;