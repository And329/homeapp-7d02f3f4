
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
  type: 'rent' | 'sale';
  property_type: string | null;
  amenities: string[] | null;
  images: string[] | null;
  videos: string[] | null;
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
