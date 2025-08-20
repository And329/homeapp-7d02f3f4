export interface DeletionRequest {
  id: string;
  property_request_id: string | null;
  property_id: string | null;
  user_id: string;
  reason: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  approved_by: string | null;
  approved_at: string | null;
}

export interface DeletionRequestWithProperty extends DeletionRequest {
  property_requests?: {
    id: string;
    title: string;
    description: string | null;
    price: number;
    location: string | null;
    type: string;
    property_type: string | null;
    contact_name: string;
    contact_email: string;
    contact_phone: string | null;
    emirate: string | null;
    bedrooms: number | null;
    bathrooms: number | null;
    area: number | null;
    images: any | null;
    user_id: string;
    created_at: string;
  } | null;
  properties?: {
    id: string;
    title: string;
    description: string | null;
    price: number;
    location: string | null;
    type: string;
    property_type: string | null;
    contact_name: string;
    contact_email: string;
    contact_phone: string | null;
    emirate: string | null;
    bedrooms: number | null;
    bathrooms: number | null;
    area: number | null;
    images: any | null;
    owner_id: string;
    created_at: string;
  } | null;
  profiles?: {
    full_name: string | null;
    email: string | null;
  } | null;
}