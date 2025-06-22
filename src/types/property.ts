
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
  videos?: string[];
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
  owner_id?: string;
  is_approved?: boolean;
  created_at?: string;
  emirate?: string;
  qr_code?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  owner_profile_picture?: string;
}
