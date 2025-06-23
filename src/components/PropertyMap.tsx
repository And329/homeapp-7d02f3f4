
import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PropertyMapProps {
  properties: Array<{
    id: number;
    title: string;
    location: string;
    price: number;
    type: 'rent' | 'sale';
    latitude: number | null;
    longitude: number | null;
  }>;
  height?: string;
  onPropertyClick?: (propertyId: number) => void;
}

const PropertyMap: React.FC<PropertyMapProps> = ({ 
  properties, 
  height = "400px",
  onPropertyClick 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);

  useEffect(() => {
    const getMapboxToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        if (error) {
          console.error('Error fetching Mapbox token:', error);
          return;
        }
        setMapboxToken(data.token);
      } catch (error) {
        console.error('Error fetching Mapbox token:', error);
      }
    };

    getMapboxToken();
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    const initializeMap = async () => {
      const mapboxgl = await import('mapbox-gl');
      
      mapboxgl.default.accessToken = mapboxToken;
      
      const newMap = new mapboxgl.default.Map({
        container: mapContainer.current!,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [55.2708, 25.2048], // Dubai coordinates
        zoom: 10,
      });

      // Add navigation controls
      newMap.addControl(new mapboxgl.default.NavigationControl());

      // Wait for the map to load
      newMap.on('load', () => {
        // Filter properties with valid coordinates
        const validProperties = properties.filter(
          property => property.latitude && property.longitude
        );

        if (validProperties.length === 0) return;

        // Add markers for each property
        validProperties.forEach((property) => {
          if (!property.latitude || !property.longitude) return;

          // Create a marker element
          const markerEl = document.createElement('div');
          markerEl.className = 'property-marker';
          markerEl.style.cssText = `
            background-color: #3b82f6;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 10px;
            font-weight: bold;
          `;
          
          // Add property type indicator
          markerEl.textContent = property.type === 'rent' ? 'R' : 'S';

          // Create popup
          const popup = new mapboxgl.default.Popup({
            offset: 25,
            closeButton: false,
            className: 'property-popup'
          }).setHTML(`
            <div style="padding: 10px; min-width: 200px;">
              <h3 style="margin: 0 0 5px 0; font-size: 14px; font-weight: bold;">${property.title}</h3>
              <p style="margin: 0 0 5px 0; font-size: 12px; color: #666;">${property.location}</p>
              <p style="margin: 0; font-size: 14px; font-weight: bold; color: #3b82f6;">
                AED ${property.price.toLocaleString()}${property.type === 'rent' ? '/month' : ''}
              </p>
              <p style="margin: 5px 0 0 0; font-size: 11px; color: #888;">
                Click to view details
              </p>
            </div>
          `);

          // Create marker
          const marker = new mapboxgl.default.Marker(markerEl)
            .setLngLat([property.longitude, property.latitude])
            .setPopup(popup)
            .addTo(newMap);

          // Add click handler
          if (onPropertyClick) {
            markerEl.addEventListener('click', () => {
              onPropertyClick(property.id);
            });
          }
        });

        // Fit map to show all markers
        if (validProperties.length > 1) {
          const bounds = new mapboxgl.default.LngLatBounds();
          validProperties.forEach(property => {
            if (property.latitude && property.longitude) {
              bounds.extend([property.longitude, property.latitude]);
            }
          });
          newMap.fitBounds(bounds, { padding: 50 });
        } else if (validProperties.length === 1) {
          const property = validProperties[0];
          if (property.latitude && property.longitude) {
            newMap.setCenter([property.longitude, property.latitude]);
            newMap.setZoom(14);
          }
        }
      });

      map.current = newMap;
    };

    initializeMap();

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [mapboxToken, properties, onPropertyClick]);

  if (!mapboxToken) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-100 rounded-lg"
        style={{ height }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapContainer} 
      className="w-full rounded-lg"
      style={{ height }}
    />
  );
};

export default PropertyMap;
