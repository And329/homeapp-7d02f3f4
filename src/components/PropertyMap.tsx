
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
          const validProperties = properties.filter(
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

          // Add cluster layers
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

          // Add individual property layers
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

          // Create popup with improved styling
          const popup = new mapboxgl.default.Popup({
            closeButton: true,
            closeOnClick: false,
            maxWidth: '190px',
            className: 'property-popup',
            anchor: 'bottom'
          });

          // Click event for individual properties
          newMap.on('click', 'unclustered-point', (e) => {
            const coordinates = ((e.features![0].geometry as any) as { coordinates: [number, number] }).coordinates.slice() as [number, number];
            const properties = e.features![0].properties;

            // Ensure that if the map is zoomed out such that multiple
            // copies of the feature are visible, the popup appears
            // over the copy being pointed to.
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
              coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            const popupContent = `
              <div style="
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: white;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
                border: 1px solid #e5e7eb;
                position: relative;
                max-width: 160px;
                width: 160px;
                padding: 12px;
              ">
                <!-- Status Badge -->
                <div style="
                  background: ${properties.type === 'rent' ? '#3b82f6' : '#10b981'};
                  color: white;
                  padding: 4px 8px;
                  border-radius: 8px;
                  font-size: 10px;
                  font-weight: 600;
                  text-transform: uppercase;
                  letter-spacing: 0.2px;
                  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
                  backdrop-filter: blur(4px);
                  margin-bottom: 8px;
                  text-align: center;
                ">
                  For ${properties.type}
                </div>
                
                <h3 style="
                  margin: 0 0 4px 0; 
                  font-size: 12px; 
                  font-weight: 700; 
                  color: #111827; 
                  line-height: 1.2;
                  letter-spacing: -0.02em;
                ">
                  ${properties.title}
                </h3>
                
                <div style="
                  display: flex; 
                  align-items: center; 
                  margin-bottom: 8px; 
                  color: #6b7280; 
                  font-size: 9px;
                  font-weight: 500;
                ">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 4px; flex-shrink: 0;">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  <span style="line-height: 1.3;">${properties.location}</span>
                </div>
                
                <div style="
                  display: flex; 
                  justify-content: space-between; 
                  align-items: center;
                  margin-bottom: ${onPropertyClick ? '10px' : '0'};
                ">
                  <div>
                    <div style="
                      font-size: 13px; 
                      font-weight: 800; 
                      color: ${properties.type === 'rent' ? '#3b82f6' : '#10b981'};
                      line-height: 1.1;
                      margin-bottom: 2px;
                    ">
                      AED ${parseInt(properties.price).toLocaleString()}
                    </div>
                    ${properties.type === 'rent' ? `
                      <div style="
                        font-size: 8px; 
                        color: #6b7280; 
                        font-weight: 500;
                      ">
                        per month
                      </div>
                    ` : ''}
                  </div>
                </div>
                
                ${onPropertyClick ? `
                  <button 
                    onclick="window.handlePropertyClick(${properties.id})" 
                    style="
                      width: 100%;
                      padding: 8px 10px;
                      background: ${properties.type === 'rent' ? '#3b82f6' : '#10b981'};
                      color: white;
                      border: none;
                      border-radius: 6px;
                      font-weight: 600;
                      font-size: 10px;
                      cursor: pointer;
                      transition: all 0.2s ease;
                      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
                    "
                    onmouseover="this.style.opacity='0.9'; this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 10px rgba(0, 0, 0, 0.15)';"
                    onmouseout="this.style.opacity='1'; this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 6px rgba(0, 0, 0, 0.1)';"
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
            const source = newMap.getSource('properties') as any;
            (source as any).getClusterExpansionZoom(
              clusterId,
              (err: any, zoom: number) => {
                if (err) return;

                const coordinates = ((features[0].geometry as any) as { coordinates: [number, number] }).coordinates;
                newMap.easeTo({
                  center: coordinates,
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
    if (properties.length > 0) {
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

  if (properties.length === 0) {
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
