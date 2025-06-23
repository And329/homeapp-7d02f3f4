
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
  const [propertiesWithImages, setPropertiesWithImages] = useState<any[]>([]);

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

  // Fetch property images
  useEffect(() => {
    const fetchPropertyImages = async () => {
      try {
        const propertyIds = properties.map(p => p.id.toString());
        
        const { data, error } = await supabase
          .from('properties')
          .select('id, images')
          .in('id', propertyIds);

        if (error) {
          console.error('Error fetching property images:', error);
          return;
        }

        const propertiesWithImageData = properties.map(property => {
          const imageData = data?.find(d => parseInt(d.id) === property.id);
          const images = imageData?.images as string[] || [];
          return {
            ...property,
            image: images.length > 0 ? images[0] : '/placeholder.svg'
          };
        });

        setPropertiesWithImages(propertiesWithImageData);
      } catch (error) {
        console.error('Error fetching property images:', error);
        setPropertiesWithImages(properties.map(p => ({ ...p, image: '/placeholder.svg' })));
      }
    };

    if (properties.length > 0) {
      fetchPropertyImages();
    }
  }, [properties]);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || propertiesWithImages.length === 0) return;

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
        const validProperties = propertiesWithImages.filter(
          property => property.latitude && property.longitude
        );

        if (validProperties.length === 0) return;

        // Add markers for each property
        validProperties.forEach((property) => {
          if (!property.latitude || !property.longitude) return;

          // Create a custom marker element with image and price
          const markerEl = document.createElement('div');
          markerEl.className = 'property-marker-container';
          markerEl.style.cssText = `
            position: relative;
            cursor: pointer;
            transform: translate(-50%, -100%);
          `;

          // Create the main marker card
          const markerCard = document.createElement('div');
          markerCard.style.cssText = `
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            overflow: hidden;
            width: 180px;
            border: 2px solid ${property.type === 'rent' ? '#3b82f6' : '#10b981'};
            transition: all 0.2s ease;
          `;

          // Property image
          const imageEl = document.createElement('img');
          imageEl.src = property.image;
          imageEl.style.cssText = `
            width: 100%;
            height: 80px;
            object-fit: cover;
            display: block;
          `;

          // Property info container
          const infoEl = document.createElement('div');
          infoEl.style.cssText = `
            padding: 8px 10px;
            background: white;
          `;

          // Property title
          const titleEl = document.createElement('div');
          titleEl.textContent = property.title.length > 25 ? property.title.substring(0, 25) + '...' : property.title;
          titleEl.style.cssText = `
            font-size: 12px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 4px;
            line-height: 1.2;
          `;

          // Property price
          const priceEl = document.createElement('div');
          priceEl.textContent = `AED ${property.price.toLocaleString()}${property.type === 'rent' ? '/mo' : ''}`;
          priceEl.style.cssText = `
            font-size: 11px;
            font-weight: 700;
            color: ${property.type === 'rent' ? '#3b82f6' : '#10b981'};
            margin-bottom: 2px;
          `;

          // Property type badge
          const typeEl = document.createElement('div');
          typeEl.textContent = property.type === 'rent' ? 'For Rent' : 'For Sale';
          typeEl.style.cssText = `
            font-size: 9px;
            font-weight: 500;
            color: white;
            background: ${property.type === 'rent' ? '#3b82f6' : '#10b981'};
            padding: 2px 6px;
            border-radius: 4px;
            display: inline-block;
          `;

          // Pointer arrow
          const arrowEl = document.createElement('div');
          arrowEl.style.cssText = `
            position: absolute;
            bottom: -8px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 8px solid transparent;
            border-right: 8px solid transparent;
            border-top: 8px solid ${property.type === 'rent' ? '#3b82f6' : '#10b981'};
          `;

          // Assemble the marker
          infoEl.appendChild(titleEl);
          infoEl.appendChild(priceEl);
          infoEl.appendChild(typeEl);
          markerCard.appendChild(imageEl);
          markerCard.appendChild(infoEl);
          markerEl.appendChild(markerCard);
          markerEl.appendChild(arrowEl);

          // Add hover effects
          markerCard.addEventListener('mouseenter', () => {
            markerCard.style.transform = 'scale(1.05)';
            markerCard.style.zIndex = '1000';
          });

          markerCard.addEventListener('mouseleave', () => {
            markerCard.style.transform = 'scale(1)';
            markerCard.style.zIndex = 'auto';
          });

          // Create marker
          const marker = new mapboxgl.default.Marker(markerEl)
            .setLngLat([property.longitude, property.latitude])
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
          newMap.fitBounds(bounds, { padding: 80 });
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
  }, [mapboxToken, propertiesWithImages, onPropertyClick]);

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
