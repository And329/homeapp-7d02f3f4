
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
  const { data, error } = await supabase
    .from('properties')
    .select('*');

  if (error) {
    console.error('Error fetching properties:', error);
    return [];
  }

  // Transform database data to match our Property interface
  return data.map((property: any) => ({
    id: property.id.toString(),
    title: property.name || 'Untitled Property',
    price: property.price || 0,
    location: property.location || 'Location not specified',
    bedrooms: property.bedrooms || 0,
    bathrooms: property.bathrooms || 0,
    area: property.area || 0,
    image: 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=800&h=600&fit=crop', // Default image
    images: [
      'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1492321936769-b49830bc1d1e?w=800&h=600&fit=crop'
    ],
    type: property.is_rental ? 'rent' : 'sale',
    isHotDeal: false, // You can add this field to your database later
    description: property.description || 'No description available',
    amenities: ['Swimming Pool', 'Gym', 'Parking', '24/7 Security'], // Default amenities, you can add this to database
    coordinates: { lat: 25.0772, lng: 55.1395 }, // Default coordinates for Dubai
    propertyType: 'Apartment', // Default type, you can add this to database
    yearBuilt: 2020,
    parking: 1
  }));
};

export const getPropertyById = async (id: string): Promise<Property | undefined> => {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', parseInt(id))
    .single();

  if (error || !data) {
    console.error('Error fetching property:', error);
    return undefined;
  }

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
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('is_rental', type === 'rent');

  if (error) {
    console.error('Error fetching properties by type:', error);
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
  // For now, get all properties and filter later
  // You can add a hot_deal column to your database later
  const properties = await getProperties();
  return properties.slice(0, 3); // Return first 3 as hot deals
};
