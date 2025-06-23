
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
        
        if (propertyIds.length === 0) {
          setPropertiesWithImages([]);
          return;
        }

        const { data, error } = await supabase
          .from('properties')
          .select('id, images')
          .in('id', propertyIds);

        if (error) {
          console.error('Error fetching property images:', error);
          setPropertiesWithImages(properties.map(p => ({ ...p, image: '/placeholder.svg' })));
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
    } else {
      setPropertiesWithImages([]);
    }
  }, [properties]);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    const initializeMap = async () => {
      try {
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
          console.log('Map loaded, adding markers for properties:', propertiesWithImages.length);
          
          // Filter properties with valid coordinates
          const validProperties = propertiesWithImages.filter(
            property => property.latitude && property.longitude
          );

          console.log('Valid properties with coordinates:', validProperties.length);

          if (validProperties.length === 0) {
            console.log('No properties with valid coordinates to display');
            return;
          }

          // Add markers for each property
          validProperties.forEach((property) => {
            try {
              // Create a simple marker element
              const markerEl = document.createElement('div');
              markerEl.style.cssText = `
                width: 200px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                overflow: hidden;
                border: 2px solid ${property.type === 'rent' ? '#3b82f6' : '#10b981'};
                cursor: pointer;
                transform: translate(-50%, -100%);
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              `;

              // Create image element
              const imageEl = document.createElement('img');
              imageEl.src = property.image;
              imageEl.style.cssText = `
                width: 100%;
                height: 80px;
                object-fit: cover;
                display: block;
              `;
              
              // Handle image load errors
              imageEl.onerror = () => {
                imageEl.src = '/placeholder.svg';
              };

              // Create info container
              const infoEl = document.createElement('div');
              infoEl.style.cssText = `
                padding: 8px;
                background: white;
              `;

              // Create title
              const titleEl = document.createElement('div');
              titleEl.textContent = property.title.length > 30 ? property.title.substring(0, 30) + '...' : property.title;
              titleEl.style.cssText = `
                font-size: 12px;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 4px;
                line-height: 1.2;
              `;

              // Create price
              const priceEl = document.createElement('div');
              priceEl.textContent = `AED ${property.price.toLocaleString()}${property.type === 'rent' ? '/mo' : ''}`;
              priceEl.style.cssText = `
                font-size: 11px;
                font-weight: 700;
                color: ${property.type === 'rent' ? '#3b82f6' : '#10b981'};
                margin-bottom: 4px;
              `;

              // Create type badge
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

              // Assemble the marker
              infoEl.appendChild(titleEl);
              infoEl.appendChild(priceEl);
              infoEl.appendChild(typeEl);
              markerEl.appendChild(imageEl);
              markerEl.appendChild(infoEl);

              // Add hover effects
              markerEl.addEventListener('mouseenter', () => {
                markerEl.style.transform = 'translate(-50%, -100%) scale(1.05)';
                markerEl.style.zIndex = '1000';
              });

              markerEl.addEventListener('mouseleave', () => {
                markerEl.style.transform = 'translate(-50%, -100%) scale(1)';
                markerEl.style.zIndex = 'auto';
              });

              // Create marker
              const marker = new mapboxgl.default.Marker(markerEl)
                .setLngLat([property.longitude, property.latitude])
                .addTo(newMap);

              // Add click handler
              if (onPropertyClick) {
                markerEl.addEventListener('click', (e) => {
                  e.stopPropagation();
                  onPropertyClick(property.id);
                });
              }

              console.log(`Added marker for property: ${property.title}`);
            } catch (error) {
              console.error(`Error creating marker for property ${property.id}:`, error);
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

        newMap.on('error', (e) => {
          console.error('Mapbox error:', e);
        });

        map.current = newMap;
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    // Only initialize if we have properties to show
    if (propertiesWithImages.length > 0) {
      initializeMap();
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
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

  if (propertiesWithImages.length === 0) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-100 rounded-lg"
        style={{ height }}
      >
        <div className="text-center">
          <p className="text-gray-600">No properties to display on map</p>
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
