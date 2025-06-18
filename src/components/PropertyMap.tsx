
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
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

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

  // Initialize Mapbox map
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
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Fit to bounds if we have properties
    map.current.on('load', () => {
      if (bounds && validProperties.length > 1) {
        map.current!.fitBounds(bounds, {
          padding: 50,
          maxZoom: 15
        });
      }
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [mapboxToken, validProperties.length]);

  // Add markers for properties
  useEffect(() => {
    if (!map.current || !mapboxToken) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    validProperties.forEach((property) => {
      if (!property.latitude || !property.longitude) return;

      // Create custom marker element
      const markerEl = document.createElement('div');
      markerEl.className = `relative cursor-pointer transform transition-transform hover:scale-110 ${
        selectedPropertyId === property.id ? 'scale-125' : ''
      }`;
      
      markerEl.innerHTML = `
        <div class="bg-primary text-white px-3 py-2 rounded-lg shadow-lg text-sm font-semibold whitespace-nowrap">
          AED ${property.price.toLocaleString()}${property.type === 'rent' ? '/mo' : ''}
        </div>
        <div class="absolute left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-primary"></div>
      `;

      // Create marker
      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat([property.longitude, property.latitude])
        .addTo(map.current!);

      // Add click event
      markerEl.addEventListener('click', () => {
        if (onPropertySelect) {
          onPropertySelect(property.id);
        }
      });

      // Create popup
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="p-2">
          <h3 class="font-semibold text-sm mb-1">${property.title}</h3>
          <p class="text-xs text-gray-600 mb-1">${property.location}</p>
          <p class="text-sm font-bold text-primary">
            AED ${property.price.toLocaleString()}${property.type === 'rent' ? '/month' : ''}
          </p>
        </div>
      `);

      marker.setPopup(popup);
      markersRef.current.push(marker);
    });
  }, [validProperties, selectedPropertyId, onPropertySelect, mapboxToken]);

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
      </div>
    </div>
  );
};

export default PropertyMap;
