import { supabase } from "@/integrations/supabase/client";
import { Property } from '@/types/property';
import { transformDatabaseProperty } from '@/utils/propertyTransform';

export const getProperties = async (): Promise<Property[]> => {
  console.log('API: Fetching properties from Supabase...');
  
  const { data, error } = await supabase
    .from('properties')
    .select(`
      *, 
      owner_id,
      profiles!properties_owner_id_fkey (
        full_name,
        email,
        profile_picture
      )
    `)
    .eq('is_approved', true);

  if (error) {
    console.error('API: Error fetching properties:', error);
    return [];
  }

  if (!data || data.length === 0) {
    console.log('API: No properties found in database');
    return [];
  }

  const transformedProperties: Property[] = data.map(prop => {
    const transformed = transformDatabaseProperty(prop);
    // Add owner profile data if available
    if (prop.profiles) {
      transformed.contact_name = prop.profiles.full_name || 'Property Owner';
      transformed.contact_email = prop.profiles.email || '';
      transformed.owner_profile_picture = prop.profiles.profile_picture || '';
    }
    return transformed;
  });
  
  console.log('API: Transformed properties:', transformedProperties);
  return transformedProperties;
};

export const getPropertyById = async (id: string): Promise<Property | undefined> => {
  console.log('API: Fetching property by ID:', id);
  
  const { data, error } = await supabase
    .from('properties')
    .select(`
      *, 
      owner_id,
      profiles!properties_owner_id_fkey (
        full_name,
        email,
        profile_picture
      )
    `)
    .eq('id', id)
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
  const transformed = transformDatabaseProperty(data);
  
  // Add owner profile data if available
  if (data.profiles) {
    transformed.contact_name = data.profiles.full_name || 'Property Owner';
    transformed.contact_email = data.profiles.email || '';
    transformed.owner_profile_picture = data.profiles.profile_picture || '';
  }
  
  return transformed;
};

export const getPropertiesByType = async (type: 'rent' | 'sale'): Promise<Property[]> => {
  console.log('API: Fetching properties by type:', type);
  
  const { data, error } = await supabase
    .from('properties')
    .select('*, owner_id')
    .eq('type', type)
    .eq('is_approved', true);

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
    .eq('is_approved', true)
    .limit(3);

  if (error) {
    console.error('API: Error fetching hot deals:', error);
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
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    console.error('API: Error getting user for property creation:', userError);
    throw new Error('User must be authenticated to create property');
  }
  
  const propertyWithOwner = {
    title: propertyData.title,
    description: propertyData.description,
    price: propertyData.price,
    location: propertyData.location,
    emirate: propertyData.emirate,
    latitude: propertyData.latitude,
    longitude: propertyData.longitude,
    bedrooms: propertyData.bedrooms,
    bathrooms: propertyData.bathrooms,
    type: propertyData.type,
    amenities: propertyData.amenities,
    images: propertyData.images,
    qr_code: propertyData.qr_code,
    is_hot_deal: propertyData.is_hot_deal || false,
    owner_id: user.id,
    is_approved: false,
    created_by: user.id
  };
  
  console.log('API: Property data with owner_id and approval status:', propertyWithOwner);
  
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

export const updatePropertyOwner = async (propertyId: string, ownerId: string): Promise<void> => {
  console.log('API: Updating property owner:', { propertyId, ownerId });
  
  const { error } = await supabase
    .from('properties')
    .update({ owner_id: ownerId })
    .eq('id', propertyId);

  if (error) {
    console.error('API: Error updating property owner:', error);
    throw error;
  }

  console.log('API: Property owner updated successfully');
};

export const deleteProperty = async (id: string): Promise<void> => {
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

export const getAllPropertiesForAdmin = async (): Promise<Property[]> => {
  console.log('API: Fetching ALL properties for admin...');
  
  const { data, error } = await supabase
    .from('properties')
    .select('*, owner_id')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('API: Error fetching properties:', error);
    return [];
  }

  if (!data || data.length === 0) {
    console.log('API: No properties found in database');
    return [];
  }

  const transformedProperties: Property[] = data.map(transformDatabaseProperty);
  console.log('API: All properties for admin:', transformedProperties);
  return transformedProperties;
};

export const approveProperty = async (propertyId: string): Promise<void> => {
  console.log('API: Approving property:', propertyId);
  
  const { error } = await supabase
    .from('properties')
    .update({ is_approved: true })
    .eq('id', propertyId);

  if (error) {
    console.error('API: Error approving property:', error);
    throw error;
  }

  console.log('API: Property approved successfully');
};
