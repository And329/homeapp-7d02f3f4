
import { Property } from '@/types/property';

export const transformDatabaseProperty = (property: any): Property => {
  console.log('Processing property:', property);

  // Parse location coordinates if it's a JSON string
  let coordinates = { lat: 25.0772, lng: 55.1395 }; // Default Dubai coordinates
  
  // First, check if we have separate latitude/longitude fields in the database
  if (property.latitude && property.longitude) {
    coordinates = { lat: property.latitude, lng: property.longitude };
    console.log('Using database lat/lng fields:', coordinates);
  }
  // Then check if location is a JSON object with coordinates
  else if (property.location && typeof property.location === 'object' && property.location !== null && property.location.lat && property.location.lng) {
    coordinates = { lat: property.location.lat, lng: property.location.lng };
    console.log('Using location object coordinates:', coordinates);
  }
  // Finally, try to parse location as JSON string
  else if (property.location && typeof property.location === 'string') {
    const locationStr = property.location.trim();
    if (locationStr !== '') {
      try {
        const locationData = JSON.parse(locationStr);
        if (locationData && locationData.lat && locationData.lng) {
          coordinates = { lat: locationData.lat, lng: locationData.lng };
          console.log('Parsed coordinates from location JSON:', coordinates);
        }
      } catch (e) {
        console.log('Could not parse location as JSON for property', property.id);
      }
    }
  }

  // Handle images array - ensure it's always a string array
  let images = [
    'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1492321936769-b49830bc1d1e?w=800&h=600&fit=crop'
  ];
  
  if (property.images && Array.isArray(property.images)) {
    // Filter out non-string values and ensure we have valid URLs
    const validImages = property.images.filter((img): img is string => 
      typeof img === 'string' && img.length > 0
    );
    if (validImages.length > 0) {
      images = validImages;
    }
  }

  // Parse amenities if it's an object
  let amenities = ['Swimming Pool', 'Gym', 'Parking', '24/7 Security'];
  if (property.amenities && typeof property.amenities === 'object') {
    if (Array.isArray(property.amenities)) {
      amenities = property.amenities.filter((amenity): amenity is string => 
        typeof amenity === 'string'
      );
    } else {
      amenities = Object.keys(property.amenities).filter(key => property.amenities[key]);
    }
  }

  return {
    id: property.id.toString(),
    title: property.title || 'Untitled Property',
    price: property.price || 0,
    location: (property.location && typeof property.location === 'string' && !property.location.startsWith('{'))
      ? property.location 
      : `${coordinates.lat}, ${coordinates.lng}`,
    bedrooms: property.bedrooms || 0,
    bathrooms: property.bathrooms || 0,
    area: 1000, // Default area since it's not in the database
    image: images[0],
    images: images,
    type: property.type === 'rent' ? 'rent' : 'sale' as 'rent' | 'sale',
    isHotDeal: property.is_hot_deal || false,
    description: property.description || 'No description available',
    amenities: amenities,
    coordinates: coordinates,
    propertyType: 'Apartment',
    yearBuilt: 2020,
    parking: 1
  };
};

// Export the alias for backward compatibility
export const transformProperty = transformDatabaseProperty;
