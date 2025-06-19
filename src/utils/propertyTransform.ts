
import { Property } from '@/types/property';

export const transformDatabaseProperty = (dbProperty: any): Property => {
  // Handle coordinates - they might be stored as JSON string or object
  let coordinates = { lat: 0, lng: 0 };
  
  if (dbProperty.latitude && dbProperty.longitude) {
    coordinates = {
      lat: dbProperty.latitude,
      lng: dbProperty.longitude
    };
  }

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
    bedrooms: dbProperty.bedrooms || 0,
    bathrooms: dbProperty.bathrooms || 0,
    area: dbProperty.area || 0,
    image: images[0] || '/placeholder.svg',
    images: images.length > 0 ? images : ['/placeholder.svg'],
    type: dbProperty.type as 'rent' | 'sale',
    isHotDeal: dbProperty.is_hot_deal || false,
    description: dbProperty.description || '',
    amenities,
    coordinates,
    propertyType: dbProperty.property_type || 'Apartment',
    yearBuilt: dbProperty.year_built,
    parking: dbProperty.parking,
    owner_id: dbProperty.owner_id
  };
};
