
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      try {
        console.log('PropertyMap: Loading token from Supabase');
        const { data, error } = await supabase
          .rpc('get_setting', { setting_key: 'mapbox_token' });

        if (error) {
          console.error('PropertyMap: Error loading token:', error);
          setIsLoading(false);
          return;
        }

        if (data) {
          console.log('PropertyMap: Token loaded successfully');
          setToken(data);
        } else {
          console.log('PropertyMap: No token found');
        }
      } catch (error) {
        console.error('PropertyMap: Error loading token:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadToken();
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !token) {
      console.log('PropertyMap: Missing requirements - container:', !!mapContainer.current, 'token:', !!token);
      return;
    }

    console.log('PropertyMap: Initializing map with token');

    // Initialize map
    mapboxgl.accessToken = token;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [55.2708, 25.2048], // Dubai coordinates
      zoom: 10,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl(),
      'top-right'
    );

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [token]);

  useEffect(() => {
    if (!map.current || !properties) {
      console.log('PropertyMap: Cannot add markers - map:', !!map.current, 'properties:', !!properties);
      return;
    }

    console.log('PropertyMap: Adding markers for', properties.length, 'properties');

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add markers for properties with coordinates
    properties.forEach(property => {
      if (property.latitude && property.longitude) {
        const el = document.createElement('div');
        el.className = 'property-marker';
        el.style.cssText = `
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background-color: ${property.type === 'rent' ? '#3b82f6' : '#10b981'};
          border: 2px solid white;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12px;
          font-weight: bold;
          ${selectedPropertyId === property.id ? 'transform: scale(1.2); z-index: 10;' : ''}
        `;
        el.innerHTML = '•';

        const marker = new mapboxgl.Marker(el)
          .setLngLat([property.longitude, property.latitude])
          .addTo(map.current!);

        // Add popup
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <div class="p-2">
              <h3 class="font-semibold text-sm">${property.title}</h3>
              <p class="text-xs text-gray-600">${property.location}</p>
              <p class="text-sm font-bold text-primary">
                AED ${property.price.toLocaleString()}${property.type === 'rent' ? '/month' : ''}
              </p>
            </div>
          `);

        marker.setPopup(popup);

        // Add click handler
        el.addEventListener('click', () => {
          if (onPropertySelect) {
            onPropertySelect(property.id);
          }
        });

        markers.current.push(marker);
      }
    });

    // Fit map to show all markers if there are any
    if (markers.current.length > 0) {
      const coordinates = properties
        .filter(p => p.latitude && p.longitude)
        .map(p => [p.longitude!, p.latitude!]);

      if (coordinates.length > 1) {
        const bounds = new mapboxgl.LngLatBounds();
        coordinates.forEach(coord => bounds.extend(coord as [number, number]));
        map.current.fitBounds(bounds, { padding: 50 });
      }
    }

    console.log('PropertyMap: Added', markers.current.length, 'markers');
  }, [properties, selectedPropertyId, onPropertySelect]);

  if (isLoading) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center`} style={{ height }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-gray-600 font-medium">Loading map...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center`} style={{ height }}>
        <div className="text-center">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 font-medium">Map Unavailable</p>
          <p className="text-sm text-gray-500">Configure Mapbox token in admin settings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div ref={mapContainer} style={{ height }} className="rounded-lg" />
      <div className="absolute bottom-2 left-2 bg-white px-2 py-1 rounded text-xs text-gray-600 shadow">
        {properties.filter(p => p.latitude && p.longitude).length} properties shown
      </div>
    </div>
  );
};

export default PropertyMap;
