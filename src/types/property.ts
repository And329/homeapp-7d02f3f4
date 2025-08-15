
export interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  emirate: string;
  latitude: number | null;
  longitude: number | null;
  bedrooms: number;
  bathrooms: number;
  area: number | null;
  property_type: string;
  year_built: number | null;
  parking: number | null;
  type: 'rent' | 'sale';
  description: string;
  is_hot_deal: boolean;
  amenities: string[];
  images: string[];
  
  qr_code: string;
  owner_id?: string;
  is_approved?: boolean;
  is_archived?: boolean;
  created_at?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  admin_notes?: string;
}

export interface DatabaseProperty {
  id: string;
  title: string | null;
  price: number | null;
  location: string | null;
  emirate: string | null;
  latitude: number | null;
  longitude: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number | null;
  property_type: string | null;
  year_built: number | null;
  parking: number | null;
  type: string | null;
  description: string | null;
  is_hot_deal: boolean | null;
  amenities: any;
  images: any;
  
  qr_code: string | null;
  owner_id: string | null;
  is_approved: boolean | null;
  is_archived: boolean | null;
  created_at: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  admin_notes: string | null;
}
