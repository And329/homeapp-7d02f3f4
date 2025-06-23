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
          console.log('Map loaded, adding properties to map');
          
          // Filter properties with valid coordinates
          const validProperties = propertiesWithImages.filter(
            property => property.latitude && property.longitude
          );

          console.log('Valid properties with coordinates:', validProperties.length);

          if (validProperties.length === 0) {
            console.log('No properties with valid coordinates to display');
            return;
          }

          // Create GeoJSON data source
          const geojsonData = {
            type: 'FeatureCollection' as const,
            features: validProperties.map((property) => ({
              type: 'Feature' as const,
              geometry: {
                type: 'Point' as const,
                coordinates: [property.longitude, property.latitude]
              },
              properties: {
                id: property.id,
                title: property.title,
                location: property.location,
                price: property.price,
                type: property.type,
                image: property.image,
                priceText: property.price > 1000000 
                  ? `${Math.round(property.price / 1000000)}M` 
                  : property.price > 1000 
                  ? `${Math.round(property.price / 1000)}K` 
                  : property.price.toString()
              }
            }))
          };

          // Add data source
          newMap.addSource('properties', {
            type: 'geojson',
            data: geojsonData,
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: 50
          });

          // Add cluster circles
          newMap.addLayer({
            id: 'clusters',
            type: 'circle',
            source: 'properties',
            filter: ['has', 'point_count'],
            paint: {
              'circle-color': [
                'step',
                ['get', 'point_count'],
                '#51bbd6',
                10,
                '#f1f075',
                30,
                '#f28cb1'
              ],
              'circle-radius': [
                'step',
                ['get', 'point_count'],
                20,
                10,
                30,
                30,
                40
              ]
            }
          });

          // Add cluster count labels
          newMap.addLayer({
            id: 'cluster-count',
            type: 'symbol',
            source: 'properties',
            filter: ['has', 'point_count'],
            layout: {
              'text-field': '{point_count_abbreviated}',
              'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
              'text-size': 12
            },
            paint: {
              'text-color': '#ffffff'
            }
          });

          // Add individual property markers
          newMap.addLayer({
            id: 'unclustered-point',
            type: 'circle',
            source: 'properties',
            filter: ['!', ['has', 'point_count']],
            paint: {
              'circle-color': [
                'case',
                ['==', ['get', 'type'], 'rent'],
                '#3b82f6',
                '#10b981'
              ],
              'circle-radius': 20,
              'circle-stroke-width': 3,
              'circle-stroke-color': '#ffffff'
            }
          });

          // Add price labels for individual properties
          newMap.addLayer({
            id: 'unclustered-point-label',
            type: 'symbol',
            source: 'properties',
            filter: ['!', ['has', 'point_count']],
            layout: {
              'text-field': ['get', 'priceText'],
              'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
              'text-size': 11,
              'text-anchor': 'center'
            },
            paint: {
              'text-color': '#ffffff'
            }
          });

          // Create popup
          const popup = new mapboxgl.default.Popup({
            closeButton: true,
            closeOnClick: false,
            maxWidth: '320px'
          });

          // Click event for individual properties
          newMap.on('click', 'unclustered-point', (e) => {
            const coordinates = e.features![0].geometry.coordinates.slice();
            const properties = e.features![0].properties;

            // Ensure that if the map is zoomed out such that multiple
            // copies of the feature are visible, the popup appears
            // over the copy being pointed to.
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
              coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            const popupContent = `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                <img 
                  src="${properties.image}" 
                  alt="${properties.title}"
                  style="width: 100%; height: 120px; object-fit: cover; border-radius: 6px; margin-bottom: 8px;"
                  onerror="this.src='/placeholder.svg'"
                />
                <h3 style="margin: 0 0 6px 0; font-size: 16px; font-weight: 600; color: #1f2937; line-height: 1.3;">
                  ${properties.title}
                </h3>
                <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280; display: flex; align-items: center;">
                  📍 ${properties.location}
                </p>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <span style="font-size: 18px; font-weight: 700; color: ${properties.type === 'rent' ? '#3b82f6' : '#10b981'};">
                      AED ${parseInt(properties.price).toLocaleString()}
                    </span>
                    <span style="font-size: 12px; color: #6b7280;">
                      ${properties.type === 'rent' ? '/month' : ''}
                    </span>
                  </div>
                  <span style="
                    background: ${properties.type === 'rent' ? '#3b82f6' : '#10b981'};
                    color: white;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 11px;
                    font-weight: 500;
                    text-transform: uppercase;
                  ">
                    For ${properties.type}
                  </span>
                </div>
                ${onPropertyClick ? `
                  <button 
                    onclick="window.handlePropertyClick(${properties.id})" 
                    style="
                      width: 100%;
                      margin-top: 12px;
                      padding: 8px 16px;
                      background: ${properties.type === 'rent' ? '#3b82f6' : '#10b981'};
                      color: white;
                      border: none;
                      border-radius: 6px;
                      font-weight: 500;
                      cursor: pointer;
                      transition: opacity 0.2s;
                    "
                    onmouseover="this.style.opacity='0.9'"
                    onmouseout="this.style.opacity='1'"
                  >
                    View Details
                  </button>
                ` : ''}
              </div>
            `;

            popup.setLngLat(coordinates).setHTML(popupContent).addTo(newMap);
          });

          // Click event for clusters
          newMap.on('click', 'clusters', (e) => {
            const features = newMap.queryRenderedFeatures(e.point, {
              layers: ['clusters']
            });
            const clusterId = features[0].properties.cluster_id;
            newMap.getSource('properties').getClusterExpansionZoom(
              clusterId,
              (err: any, zoom: number) => {
                if (err) return;

                newMap.easeTo({
                  center: features[0].geometry.coordinates,
                  zoom: zoom
                });
              }
            );
          });

          // Change cursor on hover
          newMap.on('mouseenter', 'clusters', () => {
            newMap.getCanvas().style.cursor = 'pointer';
          });
          newMap.on('mouseleave', 'clusters', () => {
            newMap.getCanvas().style.cursor = '';
          });

          newMap.on('mouseenter', 'unclustered-point', () => {
            newMap.getCanvas().style.cursor = 'pointer';
          });
          newMap.on('mouseleave', 'unclustered-point', () => {
            newMap.getCanvas().style.cursor = '';
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

          console.log(`Added ${validProperties.length} properties to map`);
        });

        // Add global click handler for property navigation
        if (onPropertyClick) {
          (window as any).handlePropertyClick = (propertyId: number) => {
            onPropertyClick(propertyId);
          };
        }

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
      // Clean up global handler
      if ((window as any).handlePropertyClick) {
        delete (window as any).handlePropertyClick;
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
