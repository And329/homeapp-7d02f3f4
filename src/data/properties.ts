import { supabase } from "@/integrations/supabase/client";

export interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  image: string;
  images: string[];
  type: 'rent' | 'sale';
  isHotDeal?: boolean;
  description: string;
  amenities: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
  propertyType: string;
  yearBuilt?: number;
  parking?: number;
}

export const getProperties = async (): Promise<Property[]> => {
  console.log('Fetching properties from Supabase...');
  
  const { data, error } = await supabase
    .from('properties')
    .select('*');

  if (error) {
    console.error('Error fetching properties:', error);
    return [];
  }

  console.log('Raw properties data:', data);

  if (!data || data.length === 0) {
    console.log('No properties found in database');
    return [];
  }

  // Transform database data to match our Property interface
  const transformedProperties: Property[] = data.map((property: any) => {
    console.log('Processing property:', property);

    // Parse location coordinates if it's a JSON string
    let coordinates = { lat: 25.0772, lng: 55.1395 }; // Default Dubai coordinates
    if (property.location) {
      try {
        const locationData = typeof property.location === 'string' 
          ? JSON.parse(property.location) 
          : property.location;
        if (locationData.lat && locationData.lng) {
          coordinates = { lat: locationData.lat, lng: locationData.lng };
        }
      } catch (e) {
        console.log('Could not parse location for property', property.id);
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
      location: typeof property.location === 'string' && property.location.startsWith('{') 
        ? `${coordinates.lat}, ${coordinates.lng}` 
        : property.location || 'Location not specified',
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
  });

  console.log('Transformed properties:', transformedProperties);
  return transformedProperties;
};

export const getPropertyById = async (id: string): Promise<Property | undefined> => {
  console.log('Fetching property by ID:', id);
  
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', parseInt(id))
    .maybeSingle();

  if (error) {
    console.error('Error fetching property:', error);
    return undefined;
  }

  if (!data) {
    console.log('No property found with ID:', id);
    return undefined;
  }

  console.log('Found property:', data);

  // Parse location coordinates - check all possible sources
  let coordinates = { lat: 25.0772, lng: 55.1395 }; // Default Dubai coordinates
  
  // First, check if we have separate latitude/longitude fields in the database
  if (data.latitude && data.longitude) {
    coordinates = { lat: data.latitude, lng: data.longitude };
    console.log('Using database lat/lng fields:', coordinates);
  }
  // Then check if location is a JSON object with coordinates
  else if (data.location && typeof data.location === 'object' && data.location.lat && data.location.lng) {
    coordinates = { lat: data.location.lat, lng: data.location.lng };
    console.log('Using location object coordinates:', coordinates);
  }
  // Finally, try to parse location as JSON string
  else if (data.location && typeof data.location === 'string') {
    try {
      const locationData = JSON.parse(data.location);
      if (locationData.lat && locationData.lng) {
        coordinates = { lat: locationData.lat, lng: locationData.lng };
        console.log('Parsed coordinates from location JSON:', coordinates);
      }
    } catch (e) {
      console.log('Could not parse location as JSON for property', data.id);
    }
  }

  // Handle images array
  let images = [
    'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1492321936769-b49830bc1d1e?w=800&h=600&fit=crop'
  ];
  
  if (data.images && Array.isArray(data.images)) {
    const validImages = data.images.filter((img): img is string => 
      typeof img === 'string' && img.length > 0
    );
    if (validImages.length > 0) {
      images = validImages;
    }
  }

  // Parse amenities
  let amenities = ['Swimming Pool', 'Gym', 'Parking', '24/7 Security'];
  if (data.amenities && typeof data.amenities === 'object') {
    if (Array.isArray(data.amenities)) {
      amenities = data.amenities.filter((amenity): amenity is string => 
        typeof amenity === 'string'
      );
    } else {
      amenities = Object.keys(data.amenities).filter(key => data.amenities[key]);
    }
  }

  return {
    id: data.id.toString(),
    title: data.title || 'Untitled Property',
    price: data.price || 0,
    location: typeof data.location === 'string' && !data.location.startsWith('{') 
      ? data.location 
      : `${coordinates.lat}, ${coordinates.lng}`,
    bedrooms: data.bedrooms || 0,
    bathrooms: data.bathrooms || 0,
    area: 1000, // Default area
    image: images[0],
    images: images,
    type: data.type === 'rent' ? 'rent' : 'sale' as 'rent' | 'sale',
    isHotDeal: data.is_hot_deal || false,
    description: data.description || 'No description available',
    amenities: amenities,
    coordinates: coordinates,
    propertyType: 'Apartment',
    yearBuilt: 2020,
    parking: 1
  };
};

export const getPropertiesByType = async (type: 'rent' | 'sale'): Promise<Property[]> => {
  console.log('Fetching properties by type:', type);
  
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('type', type);

  if (error) {
    console.error('Error fetching properties by type:', error);
    return [];
  }

  if (!data) {
    return [];
  }

  return data.map((property: any) => {
    // Parse location coordinates
    let coordinates = { lat: 25.0772, lng: 55.1395 };
    if (property.location) {
      try {
        const locationData = typeof property.location === 'string' 
          ? JSON.parse(property.location) 
          : property.location;
        if (locationData.lat && locationData.lng) {
          coordinates = { lat: locationData.lat, lng: locationData.lng };
        }
      } catch (e) {
        console.log('Could not parse location for property', property.id);
      }
    }

    // Handle images array
    let images = [
      'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1492321936769-b49830bc1d1e?w=800&h=600&fit=crop'
    ];
    
    if (property.images && Array.isArray(property.images)) {
      const validImages = property.images.filter((img): img is string => 
        typeof img === 'string' && img.length > 0
      );
      if (validImages.length > 0) {
        images = validImages;
      }
    }

    // Parse amenities
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
      location: typeof property.location === 'string' && property.location.startsWith('{') 
        ? `${coordinates.lat}, ${coordinates.lng}` 
        : property.location || 'Location not specified',
      bedrooms: property.bedrooms || 0,
      bathrooms: property.bathrooms || 0,
      area: 1000, // Default area
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
  });
};

export const getHotDeals = async (): Promise<Property[]> => {
  // Get all properties and return first 3 as hot deals
  const properties = await getProperties();
  return properties.slice(0, 3);
};
