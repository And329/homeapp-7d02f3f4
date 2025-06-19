
import { supabase } from "@/integrations/supabase/client";
import { Property } from '@/types/property';
import { transformDatabaseProperty } from '@/utils/propertyTransform';

export const getProperties = async (): Promise<Property[]> => {
  console.log('API: Fetching properties from Supabase...');
  
  const { data, error } = await supabase
    .from('properties')
    .select('*, owner_id');

  if (error) {
    console.error('API: Error fetching properties:', error);
    return [];
  }

  console.log('API: Raw properties data:', data);

  if (!data || data.length === 0) {
    console.log('API: No properties found in database');
    return [];
  }

  // Transform database data to match our Property interface
  const transformedProperties: Property[] = data.map(transformDatabaseProperty);

  console.log('API: Transformed properties:', transformedProperties);
  return transformedProperties;
};

export const getPropertyById = async (id: string): Promise<Property | undefined> => {
  console.log('API: Fetching property by ID:', id);
  
  const { data, error } = await supabase
    .from('properties')
    .select('*, owner_id')
    .eq('id', parseInt(id))
    .maybeSingle();

  if (error) {
    console.error('API: Error fetching property:', error);
    return undefined;
  }

  if (!data) {
    console.log('API: No property found with ID:', id);
    return undefined;
  }

  console.log('API: Found property:', data);
  return transformDatabaseProperty(data);
};

export const getPropertiesByType = async (type: 'rent' | 'sale'): Promise<Property[]> => {
  console.log('API: Fetching properties by type:', type);
  
  const { data, error } = await supabase
    .from('properties')
    .select('*, owner_id')
    .eq('type', type);

  if (error) {
    console.error('API: Error fetching properties by type:', error);
    return [];
  }

  if (!data) {
    return [];
  }

  return data.map(transformDatabaseProperty);
};

export const getHotDeals = async (): Promise<Property[]> => {
  console.log('API: Fetching hot deals...');
  
  const { data, error } = await supabase
    .from('properties')
    .select('*, owner_id')
    .eq('is_hot_deal', true)
    .limit(3);

  if (error) {
    console.error('API: Error fetching hot deals:', error);
    // Fallback: get first 3 properties
    const properties = await getProperties();
    return properties.slice(0, 3).map(property => ({ ...property, isHotDeal: true }));
  }

  if (!data || data.length === 0) {
    console.log('API: No hot deals found, getting first 3 properties as fallback');
    const properties = await getProperties();
    return properties.slice(0, 3).map(property => ({ ...property, isHotDeal: true }));
  }

  return data.map(transformDatabaseProperty);
};

export const createProperty = async (propertyData: any): Promise<Property> => {
  console.log('API: Creating property with data:', propertyData);
  
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    console.error('API: Error getting user for property creation:', userError);
    throw new Error('User must be authenticated to create property');
  }
  
  console.log('API: Current user for property creation:', user);
  
  // Ensure owner_id is set to current user
  const propertyWithOwner = {
    ...propertyData,
    owner_id: user.id
  };
  
  console.log('API: Property data with owner_id:', propertyWithOwner);
  
  const { data, error } = await supabase
    .from('properties')
    .insert([propertyWithOwner])
    .select('*, owner_id')
    .single();

  if (error) {
    console.error('API: Error creating property:', error);
    throw error;
  }

  console.log('API: Property created successfully:', data);
  return transformDatabaseProperty(data);
};

export const deleteProperty = async (id: number): Promise<void> => {
  console.log('API: Deleting property with ID:', id);
  
  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('API: Error deleting property:', error);
    throw error;
  }

  console.log('API: Property deleted successfully');
};
