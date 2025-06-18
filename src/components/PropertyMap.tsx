
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different property types
const createCustomIcon = (type: 'rent' | 'sale', isSelected: boolean = false) => {
  const color = type === 'rent' ? '#3b82f6' : '#10b981';
  const size = isSelected ? 35 : 25;
  
  return L.divIcon({
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background-color: ${color};
        border: 2px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 12px;
        font-weight: bold;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        ${isSelected ? 'transform: scale(1.1); z-index: 1000;' : ''}
      ">
        •
      </div>
    `,
    className: 'custom-div-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

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
  // Filter properties with valid coordinates
  const validProperties = properties.filter(
    p => p.latitude && p.longitude && 
    !isNaN(p.latitude) && !isNaN(p.longitude) &&
    p.latitude >= -90 && p.latitude <= 90 &&
    p.longitude >= -180 && p.longitude <= 180
  );

  console.log('PropertyMap: Rendering with', validProperties.length, 'valid properties');

  // Default center (Dubai coordinates)
  const defaultCenter: [number, number] = [25.2048, 55.2708];
  
  // Calculate bounds if we have properties
  const getMapCenter = (): [number, number] => {
    if (validProperties.length === 0) return defaultCenter;
    
    if (validProperties.length === 1) {
      return [validProperties[0].latitude!, validProperties[0].longitude!];
    }
    
    const avgLat = validProperties.reduce((sum, p) => sum + p.latitude!, 0) / validProperties.length;
    const avgLng = validProperties.reduce((sum, p) => sum + p.longitude!, 0) / validProperties.length;
    
    return [avgLat, avgLng];
  };

  const getMapZoom = (): number => {
    if (validProperties.length === 0) return 10;
    if (validProperties.length === 1) return 15;
    return 12;
  };

  if (validProperties.length === 0) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center`} style={{ height }}>
        <div className="text-center">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 font-medium">No Properties to Show</p>
          <p className="text-sm text-gray-500">Properties need valid coordinates to appear on map</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <MapContainer
        center={getMapCenter()}
        zoom={getMapZoom()}
        style={{ height, borderRadius: '8px' }}
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
            icon={createCustomIcon(property.type, selectedPropertyId === property.id)}
            eventHandlers={{
              click: () => {
                if (onPropertySelect) {
                  onPropertySelect(property.id);
                }
              },
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-sm">{property.title}</h3>
                <p className="text-xs text-gray-600">{property.location}</p>
                <p className="text-sm font-bold text-blue-600">
                  AED {property.price.toLocaleString()}{property.type === 'rent' ? '/month' : ''}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      <div className="absolute bottom-2 left-2 bg-white px-2 py-1 rounded text-xs text-gray-600 shadow z-10">
        {validProperties.length} properties shown
      </div>
    </div>
  );
};

export default PropertyMap;
