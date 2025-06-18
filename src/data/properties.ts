
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
  const transformedProperties = data.map((property: any) => ({
    id: property.id.toString(),
    title: property.name || 'Untitled Property',
    price: property.price || 0,
    location: property.location || 'Location not specified',
    bedrooms: property.bedrooms || 0,
    bathrooms: property.bathrooms || 0,
    area: property.area || 0,
    image: 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1492321936769-b49830bc1d1e?w=800&h=600&fit=crop'
    ],
    type: property.is_rental ? 'rent' : 'sale',
    isHotDeal: false,
    description: property.description || 'No description available',
    amenities: ['Swimming Pool', 'Gym', 'Parking', '24/7 Security'],
    coordinates: { lat: 25.0772, lng: 55.1395 },
    propertyType: 'Apartment',
    yearBuilt: 2020,
    parking: 1
  }));

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

  return {
    id: data.id.toString(),
    title: data.name || 'Untitled Property',
    price: data.price || 0,
    location: data.location || 'Location not specified',
    bedrooms: data.bedrooms || 0,
    bathrooms: data.bathrooms || 0,
    area: data.area || 0,
    image: 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1492321936769-b49830bc1d1e?w=800&h=600&fit=crop'
    ],
    type: data.is_rental ? 'rent' : 'sale',
    isHotDeal: false,
    description: data.description || 'No description available',
    amenities: ['Swimming Pool', 'Gym', 'Parking', '24/7 Security'],
    coordinates: { lat: 25.0772, lng: 55.1395 },
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
    .eq('is_rental', type === 'rent');

  if (error) {
    console.error('Error fetching properties by type:', error);
    return [];
  }

  if (!data) {
    return [];
  }

  return data.map((property: any) => ({
    id: property.id.toString(),
    title: property.name || 'Untitled Property',
    price: property.price || 0,
    location: property.location || 'Location not specified',
    bedrooms: property.bedrooms || 0,
    bathrooms: property.bathrooms || 0,
    area: property.area || 0,
    image: 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1492321936769-b49830bc1d1e?w=800&h=600&fit=crop'
    ],
    type: property.is_rental ? 'rent' : 'sale',
    isHotDeal: false,
    description: property.description || 'No description available',
    amenities: ['Swimming Pool', 'Gym', 'Parking', '24/7 Security'],
    coordinates: { lat: 25.0772, lng: 55.1395 },
    propertyType: 'Apartment',
    yearBuilt: 2020,
    parking: 1
  }));
};

export const getHotDeals = async (): Promise<Property[]> => {
  // Get all properties and return first 3 as hot deals
  const properties = await getProperties();
  return properties.slice(0, 3);
};
