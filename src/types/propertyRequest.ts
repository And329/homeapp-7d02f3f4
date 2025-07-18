
export interface PropertyRequest {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  price: number;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number | null;
  emirate: string | null;
  type: 'rent' | 'sale';
  property_type: string | null;
  amenities: any | null; // Json type from Supabase
  images: any | null; // Json type from Supabase  
  
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'deletion_requested';
  submitter_type: 'owner' | 'broker' | 'referral';
  created_at: string;
  updated_at: string | null;
  approved_by: string | null;
  approved_at: string | null;
  qr_code: string | null;
}
