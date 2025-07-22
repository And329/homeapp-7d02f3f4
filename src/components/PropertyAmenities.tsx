
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';

interface PropertyAmenitiesProps {
  selectedAmenities: string[];
  onAmenitiesChange: (amenities: string[]) => void;
}

const AMENITIES_LIST = [
  'Air Conditioning',
  'Balcony',
  'Built-in Wardrobes',
  'Central Heating',
  'Covered Parking',
  'Gym',
  'Kitchen Appliances',
  'Laundry Room',
  'Maid Room',
  'Pool',
  'Security',
  'Storage Room',
  'Study Room',
  'Walk-in Closet',
  'Fully furnished',
  'Part furnished',
  'BBQ area',
  'Private swimming pool',
  'Private garden',
  'Pets allowed',
  'Children\'s play area',
  'Fitness Center',
  'View of gardens',
  'View of golf course',
  'View of parkland',
  'View of the city',
  'View of sea/water',
  'Near Public park',
  'Near Restaurants',
  'Near School',
  'Near Shopping mall',
  'Near Shops',
];

const PropertyAmenities: React.FC<PropertyAmenitiesProps> = ({
  selectedAmenities,
  onAmenitiesChange,
}) => {
  const handleAmenityChange = (amenity: string, checked: boolean) => {
    if (checked) {
      onAmenitiesChange([...selectedAmenities, amenity]);
    } else {
      onAmenitiesChange(selectedAmenities.filter(a => a !== amenity));
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Amenities
      </label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
        {AMENITIES_LIST.map((amenity) => (
          <div key={amenity} className="flex items-center space-x-2">
            <Checkbox
              id={amenity}
              checked={selectedAmenities.includes(amenity)}
              onCheckedChange={(checked) => handleAmenityChange(amenity, !!checked)}
            />
            <label
              htmlFor={amenity}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {amenity}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PropertyAmenities;
