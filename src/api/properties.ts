
import { supabase } from "@/integrations/supabase/client";
import { Property } from '@/types/property';
import { transformDatabaseProperty } from '@/utils/propertyTransform';

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
  const transformedProperties: Property[] = data.map(transformDatabaseProperty);

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
  return transformDatabaseProperty(data);
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

  return data.map(transformDatabaseProperty);
};

export const getHotDeals = async (): Promise<Property[]> => {
  // Get all properties and return first 3 as hot deals
  const properties = await getProperties();
  return properties.slice(0, 3);
};
