
import React, { useState, useEffect, useRef } from 'react';
import { Navigation, Map } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';

interface PropertyLocationPickerProps {
  location: string;
  latitude?: number;
  longitude?: number;
  onLocationChange: (location: string, lat?: number, lng?: number) => void;
}

// UAE boundary coordinates
const UAE_BOUNDS = {
  north: 26.0841,
  south: 22.6333,
  east: 56.3968,
  west: 51.5795
};

// Check if coordinates are within UAE
const isWithinUAE = (lat: number, lng: number): boolean => {
  return lat >= UAE_BOUNDS.south && 
         lat <= UAE_BOUNDS.north && 
         lng >= UAE_BOUNDS.west && 
         lng <= UAE_BOUNDS.east;
};

// Enhanced mock geocoding with more UAE locations
const mockGeocode = async (address: string): Promise<{ lat: number; lng: number } | null> => {
  const mockLocations: Record<string, { lat: number; lng: number }> = {
    // Dubai areas
    'dubai': { lat: 25.2048, lng: 55.2708 },
    'downtown dubai': { lat: 25.1972, lng: 55.2744 },
    'marina': { lat: 25.0757, lng: 55.1395 },
    'dubai marina': { lat: 25.0757, lng: 55.1395 },
    'jbr': { lat: 25.0746, lng: 55.1376 },
    'jumeirah beach residence': { lat: 25.0746, lng: 55.1376 },
    'business bay': { lat: 25.1875, lng: 55.2639 },
    'jumeirah': { lat: 25.2321, lng: 55.2687 },
    'palm jumeirah': { lat: 25.1124, lng: 55.1390 },
    'jlt': { lat: 25.0657, lng: 55.1441 },
    'jumeirah lake towers': { lat: 25.0657, lng: 55.1441 },
    'difc': { lat: 25.2138, lng: 55.2794 },
    'dubai international financial centre': { lat: 25.2138, lng: 55.2794 },
    'sheikh zayed road': { lat: 25.2285, lng: 55.2845 },
    'bur dubai': { lat: 25.2631, lng: 55.2972 },
    'deira': { lat: 25.2697, lng: 55.3094 },
    'dubai hills': { lat: 25.1030, lng: 55.2440 },
    'motor city': { lat: 25.0550, lng: 55.2260 },
    'sports city': { lat: 25.0400, lng: 55.2100 },
    'arabian ranches': { lat: 25.0520, lng: 55.2650 },
    'the springs': { lat: 25.0580, lng: 55.2580 },
    'the meadows': { lat: 25.0620, lng: 55.2520 },
    
    // Abu Dhabi areas
    'abu dhabi': { lat: 24.4539, lng: 54.3773 },
    'corniche': { lat: 24.4795, lng: 54.3703 },
    'khalifa city': { lat: 24.4169, lng: 54.5975 },
    'al reem island': { lat: 24.4972, lng: 54.4003 },
    'yas island': { lat: 24.4881, lng: 54.6036 },
    'saadiyat island': { lat: 24.5394, lng: 54.4370 },
    
    // Other Emirates
    'sharjah': { lat: 25.3463, lng: 55.4209 },
    'ajman': { lat: 25.4052, lng: 55.5136 },
    'ras al khaimah': { lat: 25.7889, lng: 55.9758 },
    'fujairah': { lat: 25.1164, lng: 56.3450 },
    'umm al quwain': { lat: 25.5641, lng: 55.5553 },
    'al ain': { lat: 24.2075, lng: 55.7454 },
  };

  const searchKey = address.toLowerCase().trim();
  
  // Direct match
  if (mockLocations[searchKey]) {
    return mockLocations[searchKey];
  }
  
  // Fuzzy match - check if any key contains the search term or vice versa
  for (const [key, coords] of Object.entries(mockLocations)) {
    if (searchKey.includes(key) || key.includes(searchKey)) {
      return coords;
    }
  }
  
  // Multi-word match
  const searchWords = searchKey.split(' ');
  for (const [key, coords] of Object.entries(mockLocations)) {
    const keyWords = key.split(' ');
    if (searchWords.some(word => keyWords.some(keyWord => keyWord.includes(word) || word.includes(keyWord)))) {
      return coords;
    }
  }
  
  return null;
};

const PropertyLocationPicker: React.FC<PropertyLocationPickerProps> = ({
  location,
  latitude,
  longitude,
  onLocationChange,
}) => {
  const [showMap, setShowMap] = useState(true); // Show map by default
  const [tempLat, setTempLat] = useState(latitude?.toString() || '');
  const [tempLng, setTempLng] = useState(longitude?.toString() || '');
  const [coordinateError, setCoordinateError] = useState('');
  const [mapToken, setMapToken] = useState<string | null>(null);
  const [manualToken, setManualToken] = useState('');
  const [useManualToken, setUseManualToken] = useState(false);
  
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);

  // Load Mapbox token
  useEffect(() => {
    const loadToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        if (error) throw error;
        if (data?.token) setMapToken(data.token);
      } catch (error) {
        console.error('Error loading Mapbox token:', error);
      }
    };
    loadToken();
  }, []);

  // Update temp coordinates when props change
  useEffect(() => {
    setTempLat(latitude?.toString() || '');
    setTempLng(longitude?.toString() || '');
  }, [latitude, longitude]);

  // Initialize map when shown
  useEffect(() => {
    const tokenToUse = useManualToken ? manualToken : mapToken;
    if (!showMap || !mapContainer.current || !tokenToUse) return;

    mapboxgl.accessToken = tokenToUse;
    
    const centerLat = latitude || 25.2048; // Default to Dubai
    const centerLng = longitude || 55.2708;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [centerLng, centerLat],
      zoom: 12,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add click handler
    map.current.on('click', (e) => {
      const { lat, lng } = e.lngLat;
      
      // Check if coordinates are within UAE
      if (!isWithinUAE(lat, lng)) {
        setCoordinateError('Location must be within UAE boundaries');
        return;
      }
      
      setCoordinateError('');
      setTempLat(lat.toFixed(6));
      setTempLng(lng.toFixed(6));
      onLocationChange(location, lat, lng);
      
      // Update marker
      if (marker.current) {
        marker.current.remove();
      }
      marker.current = new mapboxgl.Marker()
        .setLngLat([lng, lat])
        .addTo(map.current!);
    });

    // Add existing marker if coordinates exist
    if (latitude && longitude) {
      marker.current = new mapboxgl.Marker()
        .setLngLat([longitude, latitude])
        .addTo(map.current);
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [showMap, mapToken, manualToken, useManualToken]);

  // Update map center and marker when coordinates change
  useEffect(() => {
    if (!map.current || !latitude || !longitude) return;

    // Update map center
    map.current.setCenter([longitude, latitude]);
    
    // Update marker
    if (marker.current) {
      marker.current.remove();
    }
    marker.current = new mapboxgl.Marker()
      .setLngLat([longitude, latitude])
      .addTo(map.current);
  }, [latitude, longitude]);

  const handleLocationChange = (newLocation: string) => {
    onLocationChange(newLocation, latitude, longitude);
  };

  const handleGeocode = async () => {
    if (!location.trim()) return;

    try {
      const coords = await mockGeocode(location);
      if (coords) {
        setTempLat(coords.lat.toString());
        setTempLng(coords.lng.toString());
        setCoordinateError('');
        onLocationChange(location, coords.lat, coords.lng);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        // Check if current location is within UAE
        if (!isWithinUAE(lat, lng)) {
          setCoordinateError('Current location is not within UAE boundaries');
          return;
        }
        
        setCoordinateError('');
        setTempLat(lat.toString());
        setTempLng(lng.toString());
        onLocationChange(location, lat, lng);
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Unable to get your location');
      }
    );
  };

  const validateAndSetCoordinates = (lat: number, lng: number) => {
    if (!isWithinUAE(lat, lng)) {
      setCoordinateError('Coordinates must be within UAE boundaries');
      return false;
    }
    
    setCoordinateError('');
    onLocationChange(location, lat, lng);
    return true;
  };

  const handleLatChange = (value: string) => {
    setTempLat(value);
    const lat = parseFloat(value);
    const lng = parseFloat(tempLng);
    
    if (!isNaN(lat) && !isNaN(lng)) {
      validateAndSetCoordinates(lat, lng);
    }
  };

  const handleLngChange = (value: string) => {
    setTempLng(value);
    const lat = parseFloat(tempLat);
    const lng = parseFloat(value);
    
    if (!isNaN(lat) && !isNaN(lng)) {
      validateAndSetCoordinates(lat, lng);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Location *
        </label>
        <Input
          type="text"
          value={location}
          onChange={(e) => handleLocationChange(e.target.value)}
          onBlur={handleGeocode}
          placeholder="Enter property location..."
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Enter a location name and use the map below to set precise coordinates
        </p>
      </div>

      {/* Manual Token Input */}
      {!mapToken && (
        <div className="border border-yellow-300 bg-yellow-50 p-3 rounded-lg">
          <p className="text-sm text-yellow-800 mb-2">
            Map service not configured. Enter your Mapbox token to use the interactive map:
          </p>
          <div className="flex gap-2">
            <Input
              type="text"
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              placeholder="Enter Mapbox public token"
              className="text-sm"
            />
            <Button
              type="button"
              onClick={() => setUseManualToken(true)}
              variant="outline"
              size="sm"
              disabled={!manualToken.trim()}
            >
              Use Token
            </Button>
          </div>
        </div>
      )}

      {/* Coordinate Input Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Latitude *
          </label>
          <Input
            type="number"
            step="any"
            value={tempLat}
            onChange={(e) => handleLatChange(e.target.value)}
            placeholder="25.2048"
            className="text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Longitude *
          </label>
          <Input
            type="number"
            step="any"
            value={tempLng}
            onChange={(e) => handleLngChange(e.target.value)}
            placeholder="55.2708"
            className="text-sm"
          />
        </div>
      </div>

      {/* Error Display */}
      {coordinateError && (
        <p className="text-xs text-red-600 bg-red-50 p-2 rounded">
          {coordinateError}
        </p>
      )}

      {/* Map Toggle and Current Location */}
      <div className="flex gap-2">
        {(mapToken || useManualToken) && (
          <Button
            type="button"
            onClick={() => setShowMap(!showMap)}
            variant="outline"
            size="sm"
          >
            <Map className="h-4 w-4 mr-2" />
            {showMap ? 'Hide Map' : 'Show Map Picker'}
          </Button>
        )}
        <Button
          type="button"
          onClick={getCurrentLocation}
          variant="outline"
          size="sm"
        >
          <Navigation className="h-4 w-4 mr-2" />
          Use Current Location
        </Button>
      </div>

      {/* Interactive Map */}
      {showMap && (mapToken || useManualToken) && (
        <div className="border rounded-lg overflow-hidden bg-white shadow-lg">
          <div ref={mapContainer} className="h-80 w-full" />
          <div className="p-3 bg-gray-50 text-sm text-gray-700 border-t">
            <strong>Instructions:</strong> Click anywhere on the map to set the exact property location (must be within UAE boundaries)
          </div>
        </div>
      )}
      
      {/* Map Token Missing Message */}
      {showMap && !mapToken && !useManualToken && (
        <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-800">
            Interactive map requires a Mapbox token. Please enter your token above or contact the administrator.
          </p>
        </div>
      )}
      
      {/* Status Display */}
      {latitude && longitude && !coordinateError && (
        <p className="text-xs text-green-600">
          ✓ Valid UAE coordinates: {latitude.toFixed(6)}, {longitude.toFixed(6)}
        </p>
      )}
      
      <p className="text-xs text-gray-500">
        Coordinates must be within UAE boundaries to be valid
      </p>
    </div>
  );
};

export default PropertyLocationPicker;
