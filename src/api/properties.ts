
import { supabase } from "@/integrations/supabase/client";
import { Property } from '@/types/property';
import { transformDatabaseProperty } from '@/utils/propertyTransform';

export const getProperties = async (): Promise<Property[]> => {
  console.log('API: Fetching properties from Supabase...');
  
  const { data, error } = await supabase
    .from('properties')
    .select(`
      id,
      title,
      price,
      location,
      emirate,
      latitude,
      longitude,
      bedrooms,
      bathrooms,
      area,
      property_type,
      year_built,
      parking,
      type,
      description,
      is_hot_deal,
      amenities,
      images,
      qr_code,
      owner_id,
      is_approved,
      created_at,
      contact_name,
      contact_email,
      contact_phone
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

  const transformedProperties: Property[] = data.map(transformDatabaseProperty);
  console.log('API: Transformed properties:', transformedProperties);
  return transformedProperties;
};

export const getPropertyById = async (id: string): Promise<Property | undefined> => {
  console.log('API: Fetching property by ID:', id);
  
  const { data, error } = await supabase
    .from('properties')
    .select(`
      id,
      title,
      price,
      location,
      emirate,
      latitude,
      longitude,
      bedrooms,
      bathrooms,
      area,
      property_type,
      year_built,
      parking,
      type,
      description,
      is_hot_deal,
      amenities,
      images,
      qr_code,
      owner_id,
      is_approved,
      created_at,
      contact_name,
      contact_email,
      contact_phone
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
  return transformDatabaseProperty(data);
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
    area: propertyData.area,
    property_type: propertyData.property_type,
    year_built: propertyData.year_built,
    parking: propertyData.parking,
    type: propertyData.type,
    amenities: propertyData.amenities,
    images: propertyData.images,
    qr_code: propertyData.qr_code,
    is_hot_deal: propertyData.is_hot_deal || false,
    contact_name: propertyData.contact_name,
    contact_email: propertyData.contact_email,
    contact_phone: propertyData.contact_phone,
    admin_notes: propertyData.admin_notes,
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
