
import { Property } from '@/types/property';

export const transformDatabaseProperty = (dbProperty: any): Property => {
  // Handle images - they might be stored as JSON string or array
  let images: string[] = [];
  if (dbProperty.images) {
    if (typeof dbProperty.images === 'string') {
      try {
        images = JSON.parse(dbProperty.images);
      } catch {
        images = [dbProperty.images];
      }
    } else if (Array.isArray(dbProperty.images)) {
      images = dbProperty.images;
    }
  }

  // Handle videos - they might be stored as JSON string or array
  let videos: string[] = [];
  if (dbProperty.videos) {
    if (typeof dbProperty.videos === 'string') {
      try {
        videos = JSON.parse(dbProperty.videos);
      } catch {
        videos = [dbProperty.videos];
      }
    } else if (Array.isArray(dbProperty.videos)) {
      videos = dbProperty.videos;
    }
  }

  // Handle amenities - they might be stored as JSON string or array
  let amenities: string[] = [];
  if (dbProperty.amenities) {
    if (typeof dbProperty.amenities === 'string') {
      try {
        amenities = JSON.parse(dbProperty.amenities);
      } catch {
        amenities = [dbProperty.amenities];
      }
    } else if (Array.isArray(dbProperty.amenities)) {
      amenities = dbProperty.amenities;
    }
  }

  return {
    id: dbProperty.id?.toString() || '',
    title: dbProperty.title || '',
    price: dbProperty.price || 0,
    location: dbProperty.location || '',
    emirate: dbProperty.emirate || '',
    latitude: dbProperty.latitude,
    longitude: dbProperty.longitude,
    bedrooms: dbProperty.bedrooms || 0,
    bathrooms: dbProperty.bathrooms || 0,
    area: dbProperty.area,
    property_type: dbProperty.property_type || 'Apartment',
    year_built: dbProperty.year_built,
    parking: dbProperty.parking,
    type: dbProperty.type as 'rent' | 'sale',
    description: dbProperty.description || '',
    is_hot_deal: dbProperty.is_hot_deal || false,
    amenities,
    images: images.length > 0 ? images : ['/placeholder.svg'],
    
    qr_code: dbProperty.qr_code || '',
    owner_id: dbProperty.owner_id,
    is_approved: dbProperty.is_approved,
    created_at: dbProperty.created_at,
    contact_name: dbProperty.contact_name,
    contact_email: dbProperty.contact_email,
    contact_phone: dbProperty.contact_phone,
  };
};
