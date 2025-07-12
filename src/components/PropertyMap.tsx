
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

// Custom marker icons
const createCustomIcon = (type: 'rent' | 'sale') => {
  const color = type === 'rent' ? '#3b82f6' : '#10b981';
  return L.divIcon({
    html: `
      <div style="
        background: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          font-weight: bold;
          font-size: 12px;
        ">${type === 'rent' ? 'R' : 'S'}</div>
      </div>
    `,
    className: 'custom-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
  });
};

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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

  // Calculate center of all properties
  const center: [number, number] = [
    validProperties.reduce((sum, prop) => sum + (prop.latitude || 0), 0) / validProperties.length,
    validProperties.reduce((sum, prop) => sum + (prop.longitude || 0), 0) / validProperties.length
  ];

  return (
    <div className="w-full rounded-xl overflow-hidden shadow-lg" style={{ height }}>
      <MapContainer
        center={center}
        zoom={11}
        style={{ width: '100%', height: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {validProperties.map((property) => (
          <Marker
            key={property.id}
            position={[property.latitude!, property.longitude!]}
            icon={createCustomIcon(property.type)}
            eventHandlers={{
              click: () => handlePropertyClick(property.id)
            }}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <div className={`text-xs font-semibold mb-1 ${property.type === 'rent' ? 'text-blue-600' : 'text-green-600'}`}>
                  {property.type.toUpperCase()}
                </div>
                <div className="font-medium text-gray-800 mb-1">{property.title}</div>
                <div className="text-sm text-gray-500 mb-2">{property.location}</div>
                <div className={`font-bold ${property.type === 'rent' ? 'text-blue-600' : 'text-green-600'}`}>
                  AED {property.price > 1000000 
                    ? `${Math.round(property.price / 1000000)}M` 
                    : property.price > 1000 
                    ? `${Math.round(property.price / 1000)}K` 
                    : property.price.toString()}
                </div>
                <button
                  onClick={() => handlePropertyClick(property.id)}
                  className="mt-2 w-full bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                >
                  View Details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default PropertyMap;
