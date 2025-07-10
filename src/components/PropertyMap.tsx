import React, { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch Mapbox token
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
      } finally {
        setIsLoading(false);
      }
    };

    getMapboxToken();
  }, []);

  // Handle property click
  const handlePropertyClick = useCallback((propertyId: string | number) => {
    if (onPropertyClick) {
      onPropertyClick(propertyId);
    } else {
      navigate(`/properties/${propertyId}`);
    }
  }, [onPropertyClick, navigate]);

  // Create popup content
  const createPopupContent = useCallback((property: any) => {
    const priceFormatted = parseInt(property.price).toLocaleString();
    const typeColor = property.type === 'rent' ? '#3b82f6' : '#10b981';
    
    return `
      <div class="property-popup-content" style="
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: white;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
        border: none;
        max-width: 220px;
        width: 220px;
        position: relative;
      ">
        <!-- Header with type badge -->
        <div style="
          background: linear-gradient(135deg, ${typeColor}, ${property.type === 'rent' ? '#60a5fa' : '#34d399'});
          padding: 12px;
          position: relative;
          overflow: hidden;
        ">
          <div style="
            background: rgba(255, 255, 255, 0.2);
            color: white;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            display: inline-block;
            backdrop-filter: blur(10px);
          ">
            For ${property.type}
          </div>
        </div>

        <!-- Content -->
        <div style="padding: 14px;">
          <h3 style="
            margin: 0 0 8px 0; 
            font-size: 14px; 
            font-weight: 700; 
            color: #111827; 
            line-height: 1.3;
            letter-spacing: -0.02em;
          ">
            ${property.title}
          </h3>
          
          <div style="
            display: flex; 
            align-items: center; 
            margin-bottom: 12px; 
            color: #6b7280; 
            font-size: 11px;
            font-weight: 500;
          ">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 4px; flex-shrink: 0;">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <span style="line-height: 1.3;">${property.location}</span>
          </div>
          
          <!-- Price Section -->
          <div style="
            background: #f8fafc;
            padding: 10px;
            border-radius: 6px;
            margin-bottom: 12px;
          ">
            <div style="
              font-size: 16px; 
              font-weight: 800; 
              color: ${typeColor};
              line-height: 1.2;
              margin-bottom: 2px;
            ">
              AED ${priceFormatted}
            </div>
            ${property.type === 'rent' ? `
              <div style="
                font-size: 10px; 
                color: #64748b; 
                font-weight: 500;
              ">
                per month
              </div>
            ` : ''}
          </div>
          
          <!-- View Details Button -->
          <button 
            class="view-details-btn"
            data-property-id="${property.id}"
            style="
              width: 100%;
              padding: 8px 12px;
              background: linear-gradient(135deg, ${typeColor}, ${property.type === 'rent' ? '#60a5fa' : '#34d399'});
              color: white;
              border: none;
              outline: none;
              border-radius: 6px;
              font-weight: 600;
              font-size: 12px;
              cursor: pointer;
              transition: all 0.2s ease;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
              position: relative;
              overflow: hidden;
            "
          >
            <span style="position: relative; z-index: 2;">View Details</span>
          </button>
        </div>
      </div>
    `;
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || properties.length === 0) return;

    const initializeMap = async () => {
      try {
        const mapboxgl = await import('mapbox-gl');
        
        mapboxgl.default.accessToken = mapboxToken;
        
        const newMap = new mapboxgl.default.Map({
          container: mapContainer.current!,
          style: 'mapbox://styles/mapbox/light-v11',
          center: [55.2708, 25.2048], // Dubai coordinates
          zoom: 10,
          attributionControl: false
        });

        // Add navigation controls
        newMap.addControl(new mapboxgl.default.NavigationControl(), 'top-right');

        // Wait for the map to load
        newMap.on('load', () => {
          // Filter properties with valid coordinates
          const validProperties = properties.filter(
            property => property.latitude && property.longitude
          );

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

          // Add cluster layers with improved styling
          newMap.addLayer({
            id: 'clusters',
            type: 'circle',
            source: 'properties',
            filter: ['has', 'point_count'],
            paint: {
              'circle-color': [
                'step',
                ['get', 'point_count'],
                '#3b82f6',
                10,
                '#8b5cf6',
                30,
                '#ec4899'
              ],
              'circle-radius': [
                'step',
                ['get', 'point_count'],
                20,
                10,
                28,
                30,
                35
              ],
              'circle-stroke-width': 2,
              'circle-stroke-color': '#ffffff',
              'circle-opacity': 0.9
            }
          });

          newMap.addLayer({
            id: 'cluster-count',
            type: 'symbol',
            source: 'properties',
            filter: ['has', 'point_count'],
            layout: {
              'text-field': '{point_count_abbreviated}',
              'text-font': ['DIN Offc Pro Bold', 'Arial Unicode MS Bold'],
              'text-size': 12
            },
            paint: {
              'text-color': '#ffffff',
              'text-halo-color': 'rgba(0, 0, 0, 0.3)',
              'text-halo-width': 1
            }
          });

          // Add individual property layers with enhanced styling
          // Shadow layer for depth effect
          newMap.addLayer({
            id: 'property-shadow',
            type: 'circle',
            source: 'properties',
            filter: ['!', ['has', 'point_count']],
            paint: {
              'circle-color': 'rgba(0, 0, 0, 0.15)',
              'circle-radius': 22,
              'circle-blur': 1.5,
              'circle-translate': [1, 1]
            }
          });

          // Outer glow layer
          newMap.addLayer({
            id: 'property-glow',
            type: 'circle',
            source: 'properties',
            filter: ['!', ['has', 'point_count']],
            paint: {
              'circle-color': [
                'case',
                ['==', ['get', 'type'], 'rent'],
                'rgba(59, 130, 246, 0.3)',
                'rgba(16, 185, 129, 0.3)'
              ],
              'circle-radius': 24,
              'circle-blur': 2
            }
          });

          // Main property point
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
              'circle-radius': 18,
              'circle-stroke-width': 2,
              'circle-stroke-color': '#ffffff',
              'circle-stroke-opacity': 0.9,
              'circle-opacity': 0.95
            }
          });

          // Inner highlight for 3D effect
          newMap.addLayer({
            id: 'property-highlight',
            type: 'circle',
            source: 'properties',
            filter: ['!', ['has', 'point_count']],
            paint: {
              'circle-color': 'rgba(255, 255, 255, 0.3)',
              'circle-radius': 14,
              'circle-translate': [-1, -1]
            }
          });

          // Price label
          newMap.addLayer({
            id: 'unclustered-point-label',
            type: 'symbol',
            source: 'properties',
            filter: ['!', ['has', 'point_count']],
            layout: {
              'text-field': ['get', 'priceText'],
              'text-font': ['DIN Offc Pro Bold', 'Arial Unicode MS Bold'],
              'text-size': 12,
              'text-anchor': 'center'
            },
            paint: {
              'text-color': '#ffffff',
              'text-halo-color': 'rgba(0, 0, 0, 0.4)',
              'text-halo-width': 1.5
            }
          });

          // Create popup
          const popup = new mapboxgl.default.Popup({
            closeButton: true,
            closeOnClick: false,
            maxWidth: '300px',
            className: 'property-popup',
            anchor: 'bottom'
          });

          // Click event for individual properties
          newMap.on('click', 'unclustered-point', (e) => {
            const coordinates = (e.features![0].geometry as any).coordinates.slice() as [number, number];
            const properties = e.features![0].properties;

            // Ensure popup appears over the correct copy of the feature
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
              coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            const popupContent = createPopupContent(properties);
            popup.setLngLat(coordinates).setHTML(popupContent).addTo(newMap);

            // Add event listener for the view details button after popup is added
            setTimeout(() => {
              const viewDetailsBtn = document.querySelector('.view-details-btn') as HTMLElement;
              if (viewDetailsBtn) {
                viewDetailsBtn.addEventListener('click', (event) => {
                  const propertyId = (event.target as HTMLElement).closest('.view-details-btn')?.getAttribute('data-property-id');
                  if (propertyId) {
                    popup.remove();
                    handlePropertyClick(propertyId);
                  }
                });

                // Add hover effects
                viewDetailsBtn.addEventListener('mouseenter', () => {
                  viewDetailsBtn.style.transform = 'translateY(-2px)';
                  viewDetailsBtn.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.2)';
                  const shimmer = viewDetailsBtn.querySelector('div') as HTMLElement;
                  if (shimmer) {
                    shimmer.style.left = '100%';
                  }
                });

                viewDetailsBtn.addEventListener('mouseleave', () => {
                  viewDetailsBtn.style.transform = 'translateY(0)';
                  viewDetailsBtn.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                  const shimmer = viewDetailsBtn.querySelector('div') as HTMLElement;
                  if (shimmer) {
                    shimmer.style.left = '-100%';
                  }
                });
              }
            }, 100);
          });

          // Cluster click event
          newMap.on('click', 'clusters', (e) => {
            const features = newMap.queryRenderedFeatures(e.point, {
              layers: ['clusters']
            });
            const clusterId = features[0].properties.cluster_id;
            const source = newMap.getSource('properties') as any;
            source.getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
              if (err) return;
              const coordinates = (features[0].geometry as any).coordinates;
              newMap.easeTo({
                center: coordinates,
                zoom: zoom
              });
            });
          });

          // Hover effects
          ['clusters', 'unclustered-point'].forEach(layer => {
            newMap.on('mouseenter', layer, () => {
              newMap.getCanvas().style.cursor = 'pointer';
            });
            newMap.on('mouseleave', layer, () => {
              newMap.getCanvas().style.cursor = '';
            });
          });

          // Fit bounds to show all properties
          if (validProperties.length > 1) {
            const bounds = new mapboxgl.default.LngLatBounds();
            validProperties.forEach(property => {
              if (property.latitude && property.longitude) {
                bounds.extend([property.longitude, property.latitude]);
              }
            });
            newMap.fitBounds(bounds, { padding: 60 });
          } else if (validProperties.length === 1) {
            const property = validProperties[0];
            if (property.latitude && property.longitude) {
              newMap.setCenter([property.longitude, property.latitude]);
              newMap.setZoom(15);
            }
          }
        });

        map.current = newMap;
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    initializeMap();

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxToken, properties, createPopupContent, handlePropertyClick]);

  if (isLoading) {
    return (
      <div 
        className="flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl"
        style={{ height }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
          <p className="text-gray-600 font-medium">Loading map...</p>
        </div>
      </div>
    );
  }

  if (!mapboxToken) {
    return (
      <div 
        className="flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 rounded-xl"
        style={{ height }}
      >
        <div className="text-center p-6">
          <p className="text-gray-700 font-medium">Map service not configured</p>
          <p className="text-gray-500 text-sm mt-2">Please contact the administrator to set up the map service.</p>
        </div>
      </div>
    );
  }

  if (properties.length === 0) {
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
    <div 
      ref={mapContainer} 
      className="w-full rounded-xl overflow-hidden shadow-lg"
      style={{ height }}
    />
  );
};

export default PropertyMap;