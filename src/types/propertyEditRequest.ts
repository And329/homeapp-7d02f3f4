export interface PropertyEditRequest {
  id: string;
  property_id: string;
  user_id: string;
  
  // Editable fields
  title?: string;
  description?: string;
  price?: number;
  location?: string;
  latitude?: number;
  longitude?: number;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  emirate?: string;
  year_built?: number;
  parking?: number;
  property_type?: string;
  amenities?: any;
  images?: any;
  qr_code?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  
  status: 'pending' | 'approved' | 'rejected';
  user_message?: string;
  admin_notes?: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at?: string;
}
