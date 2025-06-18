
import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface PropertyLocationPickerProps {
  location: string;
  latitude?: number;
  longitude?: number;
  onLocationChange: (location: string, lat?: number, lng?: number) => void;
}

// Mock geocoding function - in production, you'd use Mapbox Geocoding API
const mockGeocode = async (address: string): Promise<{ lat: number; lng: number } | null> => {
  // Simplified mock coordinates for UAE locations
  const mockLocations: Record<string, { lat: number; lng: number }> = {
    'dubai': { lat: 25.2048, lng: 55.2708 },
    'abu dhabi': { lat: 24.4539, lng: 54.3773 },
    'sharjah': { lat: 25.3463, lng: 55.4209 },
    'ajman': { lat: 25.4052, lng: 55.5136 },
    'downtown dubai': { lat: 25.1972, lng: 55.2744 },
    'marina': { lat: 25.0757, lng: 55.1395 },
    'jbr': { lat: 25.0746, lng: 55.1376 },
    'business bay': { lat: 25.1875, lng: 55.2639 },
    'jumeirah': { lat: 25.2321, lng: 55.2687 },
  };

  const searchKey = address.toLowerCase();
  for (const [key, coords] of Object.entries(mockLocations)) {
    if (searchKey.includes(key)) {
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
  const [isGeocoding, setIsGeocoding] = useState(false);

  const handleLocationChange = (newLocation: string) => {
    onLocationChange(newLocation, latitude, longitude);
  };

  const handleGeocode = async () => {
    if (!location.trim()) return;

    setIsGeocoding(true);
    try {
      const coords = await mockGeocode(location);
      if (coords) {
        onLocationChange(location, coords.lat, coords.lng);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    } finally {
      setIsGeocoding(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Location *
      </label>
      <div className="flex gap-2">
        <Input
          type="text"
          value={location}
          onChange={(e) => handleLocationChange(e.target.value)}
          placeholder="Enter property location..."
          className="flex-1"
          required
        />
        <Button
          type="button"
          onClick={handleGeocode}
          disabled={!location.trim() || isGeocoding}
          variant="outline"
          size="sm"
        >
          {isGeocoding ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          ) : (
            <MapPin className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      {latitude && longitude && (
        <p className="text-xs text-green-600">
          ✓ Coordinates: {latitude.toFixed(4)}, {longitude.toFixed(4)}
        </p>
      )}
      
      <p className="text-xs text-gray-500">
        Click the map pin to get coordinates for this location
      </p>
    </div>
  );
};

export default PropertyLocationPicker;
