
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  enableNavigation?: boolean;
}

const PropertyMap: React.FC<PropertyMapProps> = ({
  properties,
  selectedPropertyId,
  onPropertySelect,
  height = '400px',
  enableNavigation = false
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Load Mapbox token from Supabase Edge Function
  useEffect(() => {
    const loadMapboxToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');

        if (error) {
          console.error('Error loading mapbox token:', error);
          setIsLoading(false);
          return;
        }

        if (data?.token) {
          setMapboxToken(data.token);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading mapbox token:', error);
        setIsLoading(false);
      }
    };

    loadMapboxToken();
  }, []);

  // Filter properties with valid coordinates
  const validProperties = properties.filter(
    p => p.latitude && p.longitude && 
    !isNaN(p.latitude) && !isNaN(p.longitude) &&
    p.latitude >= -90 && p.latitude <= 90 &&
    p.longitude >= -180 && p.longitude <= 180
  );

  console.log('PropertyMap: Valid properties for map display:', validProperties);

  // Initialize Mapbox map and add embedded markers
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || map.current) return;

    console.log('PropertyMap: Initializing Mapbox with', validProperties.length, 'properties');

    mapboxgl.accessToken = mapboxToken;
    
    // Calculate bounds for all properties
    let bounds: mapboxgl.LngLatBounds | null = null;
    if (validProperties.length > 0) {
      bounds = new mapboxgl.LngLatBounds();
      validProperties.forEach(property => {
        if (property.latitude && property.longitude) {
          bounds!.extend([property.longitude, property.latitude]);
        }
      });
    }

    // Default center (Dubai)
    const defaultCenter: [number, number] = [55.2708, 25.2048];
    const defaultZoom = validProperties.length === 1 ? 14 : 10;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: bounds ? bounds.getCenter() : defaultCenter,
      zoom: defaultZoom,
      antialias: true,
    });

    // Add navigation controls if enabled
    if (enableNavigation) {
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    }

    map.current.on('load', () => {
      if (!map.current) return;

      console.log('PropertyMap: Map loaded, adding', validProperties.length, 'properties to source');

      // Add property data as a source
      map.current.addSource('properties', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: validProperties.map(property => {
            console.log('PropertyMap: Adding property to map:', property.id, property.title, property.price);
            return {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [property.longitude!, property.latitude!]
              },
              properties: {
                id: property.id,
                title: property.title,
                location: property.location,
                price: property.price,
                type: property.type,
                isSelected: selectedPropertyId === property.id
              }
            };
          })
        },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50
      });

      // Add cluster layer
      map.current.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'properties',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#51bbd6',
            100,
            '#f1f075',
            750,
            '#f28cb1'
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            20,
            100,
            30,
            750,
            40
          ]
        }
      });

      // Add cluster count layer
      map.current.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'properties',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12
        }
      });

      // Add individual property markers
      map.current.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'properties',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': [
            'case',
            ['get', 'isSelected'],
            '#dc2626',
            '#1e40af'
          ],
          'circle-radius': 8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff'
        }
      });

      // Add property labels with enhanced background
      map.current.addLayer({
        id: 'property-labels',
        type: 'symbol',
        source: 'properties',
        filter: ['!', ['has', 'point_count']],
        layout: {
          'text-field': [
            'format',
            'AED ',
            { 'font-scale': 0.9 },
            ['case',
              ['>=', ['get', 'price'], 1000000],
              ['concat', ['number-format', ['/', ['get', 'price'], 1000000], { 'max-fraction-digits': 1 }], 'M'],
              ['>=', ['get', 'price'], 1000],
              ['concat', ['number-format', ['/', ['get', 'price'], 1000], { 'max-fraction-digits': 0 }], 'K'],
              ['number-format', ['get', 'price'], {}]
            ],
            { 'font-scale': 1.1 },
            ['case', ['==', ['get', 'type'], 'rent'], '/mo', '']
          ],
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 11,
          'text-offset': [0, -2.2],
          'text-anchor': 'bottom',
          'text-allow-overlap': false,
          'text-ignore-placement': false
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': [
            'case',
            ['get', 'isSelected'],
            '#dc2626',
            '#1e40af'
          ],
          'text-halo-width': 3,
          'text-halo-blur': 1,
          'text-opacity': 1
        }
      });

      // Click handlers for clusters
      map.current.on('click', 'clusters', (e) => {
        if (!map.current) return;
        const features = map.current.queryRenderedFeatures(e.point, {
          layers: ['clusters']
        });

        const clusterId = features[0].properties!.cluster_id;
        (map.current.getSource('properties') as mapboxgl.GeoJSONSource).getClusterExpansionZoom(
          clusterId,
          (err, zoom) => {
            if (err || !map.current) return;

            map.current.easeTo({
              center: (features[0].geometry as any).coordinates,
              zoom: zoom
            });
          }
        );
      });

      // Click handlers for individual properties
      map.current.on('click', 'unclustered-point', (e) => {
        if (!e.features || !e.features[0]) return;
        
        const properties = e.features[0].properties!;
        const propertyId = properties.id;
        
        console.log('PropertyMap: Marker clicked for property', propertyId);
        
        if (enableNavigation) {
          navigate(`/properties/${propertyId}`);
        } else if (onPropertySelect) {
          onPropertySelect(propertyId);
        }
      });

      // Add popup on hover
      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
      });

      map.current.on('mouseenter', 'unclustered-point', (e) => {
        if (!map.current || !e.features || !e.features[0]) return;
        
        map.current.getCanvas().style.cursor = 'pointer';
        
        const properties = e.features[0].properties!;
        const coordinates = (e.features[0].geometry as any).coordinates.slice();
        
        const popupContent = enableNavigation ? `
          <div style="padding: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 200px;">
            <h3 style="font-weight: 600; font-size: 14px; margin: 0 0 6px 0; color: #1f2937;">${properties.title}</h3>
            <p style="font-size: 12px; color: #6b7280; margin: 0 0 8px 0;">${properties.location}</p>
            <p style="font-size: 14px; font-weight: 700; color: #1e40af; margin: 0 0 8px 0;">
              AED ${properties.price.toLocaleString()}${properties.type === 'rent' ? '/month' : ''}
            </p>
            <p style="font-size: 11px; color: #9ca3af; margin: 0; font-style: italic;">Click to view details</p>
          </div>
        ` : `
          <div style="padding: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 200px;">
            <h3 style="font-weight: 600; font-size: 14px; margin: 0 0 6px 0; color: #1f2937;">${properties.title}</h3>
            <p style="font-size: 12px; color: #6b7280; margin: 0 0 8px 0;">${properties.location}</p>
            <p style="font-size: 14px; font-weight: 700; color: #1e40af; margin: 0;">
              AED ${properties.price.toLocaleString()}${properties.type === 'rent' ? '/month' : ''}
            </p>
          </div>
        `;

        popup.setLngLat(coordinates).setHTML(popupContent).addTo(map.current);
      });

      map.current.on('mouseleave', 'unclustered-point', () => {
        if (!map.current) return;
        map.current.getCanvas().style.cursor = '';
        popup.remove();
      });

      // Change cursor on hover
      map.current.on('mouseenter', 'clusters', () => {
        if (!map.current) return;
        map.current.getCanvas().style.cursor = 'pointer';
      });

      map.current.on('mouseleave', 'clusters', () => {
        if (!map.current) return;
        map.current.getCanvas().style.cursor = '';
      });

      // Fit to bounds if we have properties
      if (bounds && validProperties.length > 1) {
        map.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: 15
        });
      }
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [mapboxToken, validProperties, selectedPropertyId, onPropertySelect, enableNavigation, navigate]);

  // Update selected property styling
  useEffect(() => {
    if (!map.current || !map.current.getSource('properties')) return;

    console.log('PropertyMap: Updating property data with', validProperties.length, 'properties');

    const updatedData = {
      type: 'FeatureCollection' as const,
      features: validProperties.map(property => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [property.longitude!, property.latitude!]
        },
        properties: {
          id: property.id,
          title: property.title,
          location: property.location,
          price: property.price,
          type: property.type,
          isSelected: selectedPropertyId === property.id
        }
      }))
    };

    (map.current.getSource('properties') as mapboxgl.GeoJSONSource).setData(updatedData);
  }, [selectedPropertyId, validProperties]);

  if (isLoading) {
    return (
      <div 
        className="bg-gray-100 rounded-lg flex items-center justify-center" 
        style={{ height }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  if (!mapboxToken) {
    return (
      <div 
        className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg flex flex-col items-center justify-center border border-orange-200" 
        style={{ height }}
      >
        <div className="text-center p-6">
          <MapPin className="h-16 w-16 text-orange-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Mapbox Token Required</h3>
          <p className="text-gray-600 mb-4">
            To display interactive maps, please configure your Mapbox token in the admin settings.
          </p>
          {validProperties.length > 0 && (
            <div className="bg-white rounded-lg p-4 max-w-md mx-auto">
              <h4 className="font-medium text-gray-800 mb-3">Properties in this area:</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {validProperties.slice(0, 5).map((property) => (
                  <div 
                    key={property.id}
                    className={`text-sm p-2 rounded cursor-pointer transition-colors ${
                      selectedPropertyId === property.id 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => onPropertySelect && onPropertySelect(property.id)}
                  >
                    <div className="font-medium">{property.title}</div>
                    <div className="text-gray-600">{property.location}</div>
                    <div className="text-blue-600 font-semibold">
                      AED {property.price.toLocaleString()}{property.type === 'rent' ? '/month' : ''}
                    </div>
                  </div>
                ))}
                {validProperties.length > 5 && (
                  <div className="text-xs text-gray-500 text-center pt-1">
                    +{validProperties.length - 5} more properties
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div 
        ref={mapContainer}
        className="w-full rounded-lg"
        style={{ height }}
      />
      
      <div className="absolute bottom-2 left-2 bg-white px-2 py-1 rounded text-xs text-gray-600 shadow z-10">
        {validProperties.length} properties displayed
        {enableNavigation && (
          <span className="block text-blue-600">Click markers to view details</span>
        )}
      </div>
    </div>
  );
};

export default PropertyMap;
