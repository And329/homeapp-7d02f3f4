
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Snowflake, 
  Home, 
  Shirt, 
  Thermometer, 
  Car, 
  Dumbbell, 
  ChefHat, 
  WashingMachine, 
  BedDouble, 
  Waves, 
  Shield, 
  Archive, 
  BookOpen, 
  Closet 
} from 'lucide-react';

interface PropertyAmenitiesProps {
  selectedAmenities: string[];
  onAmenitiesChange: (amenities: string[]) => void;
}

const AMENITIES_LIST = [
  { name: 'Air Conditioning', icon: Snowflake },
  { name: 'Balcony', icon: Home },
  { name: 'Built-in Wardrobes', icon: Shirt },
  { name: 'Central Heating', icon: Thermometer },
  { name: 'Covered Parking', icon: Car },
  { name: 'Gym', icon: Dumbbell },
  { name: 'Kitchen Appliances', icon: ChefHat },
  { name: 'Laundry Room', icon: WashingMachine },
  { name: 'Maid Room', icon: BedDouble },
  { name: 'Pool', icon: Waves },
  { name: 'Security', icon: Shield },
  { name: 'Storage Room', icon: Archive },
  { name: 'Study Room', icon: BookOpen },
  { name: 'Walk-in Closet', icon: Closet },
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
        {AMENITIES_LIST.map((amenity) => {
          const IconComponent = amenity.icon;
          return (
            <div key={amenity.name} className="flex items-center space-x-2">
              <Checkbox
                id={amenity.name}
                checked={selectedAmenities.includes(amenity.name)}
                onCheckedChange={(checked) => handleAmenityChange(amenity.name, !!checked)}
              />
              <IconComponent className="h-4 w-4 text-gray-500" />
              <label
                htmlFor={amenity.name}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {amenity.name}
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PropertyAmenities;
