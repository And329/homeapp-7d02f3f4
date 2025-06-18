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
  const markersRef = useRef<mapboxgl.Marker[]>([]);
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

    // Add navigation controls if enabled
    if (enableNavigation) {
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    }

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
  }, [mapboxToken, validProperties.length, enableNavigation]);

  // Add markers for properties
  useEffect(() => {
    if (!map.current || !mapboxToken) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    validProperties.forEach((property) => {
      if (!property.latitude || !property.longitude) return;

      // Format price for display
      const formatPrice = (price: number) => {
        if (price >= 1000000) {
          return `${(price / 1000000).toFixed(1)}M`;
        } else if (price >= 1000) {
          return `${(price / 1000).toFixed(0)}K`;
        }
        return price.toLocaleString();
      };

      // Create custom marker element
      const markerEl = document.createElement('div');
      markerEl.className = `cursor-pointer transition-all duration-200 hover:scale-105 ${
        selectedPropertyId === property.id ? 'scale-110 z-10' : ''
      } ${enableNavigation ? 'hover:brightness-110' : ''}`;
      
      markerEl.innerHTML = `
        <div class="relative">
          <div class="bg-blue-600 text-white px-3 py-1.5 rounded-lg shadow-lg text-sm font-medium whitespace-nowrap border border-blue-700 ${
            enableNavigation ? 'hover:bg-blue-700 hover:border-blue-800' : ''
          }">
            AED ${formatPrice(property.price)}${property.type === 'rent' ? '/mo' : ''}
          </div>
          <div class="absolute left-1/2 top-full transform -translate-x-1/2 -mt-[1px] w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-transparent border-t-blue-600"></div>
        </div>
      `;

      // Create marker
      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat([property.longitude, property.latitude])
        .addTo(map.current!);

      // Add click event
      markerEl.addEventListener('click', () => {
        if (enableNavigation) {
          // Navigate to property details page
          navigate(`/properties/${property.id}`);
        } else if (onPropertySelect) {
          onPropertySelect(property.id);
        }
      });

      // Create popup with enhanced content for navigation-enabled maps
      const popupContent = enableNavigation ? `
        <div class="p-3">
          <h3 class="font-semibold text-sm mb-1">${property.title}</h3>
          <p class="text-xs text-gray-600 mb-2">${property.location}</p>
          <p class="text-sm font-bold text-blue-600 mb-2">
            AED ${property.price.toLocaleString()}${property.type === 'rent' ? '/month' : ''}
          </p>
          <p class="text-xs text-gray-500 italic">Click to view details</p>
        </div>
      ` : `
        <div class="p-3">
          <h3 class="font-semibold text-sm mb-1">${property.title}</h3>
          <p class="text-xs text-gray-600 mb-2">${property.location}</p>
          <p class="text-sm font-bold text-blue-600">
            AED ${property.price.toLocaleString()}${property.type === 'rent' ? '/month' : ''}
          </p>
        </div>
      `;

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(popupContent);

      marker.setPopup(popup);
      markersRef.current.push(marker);
    });
  }, [validProperties, selectedPropertyId, onPropertySelect, mapboxToken, enableNavigation, navigate]);

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
