export interface LandingPage {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  starting_price?: number;
  developer?: string;
  location?: string;
  hero_image?: string;
  video_url?: string;
  description?: string;
  features?: string[];
  amenities?: string[];
  gallery_images?: string[];
  floor_plans?: string[];
  qr_code?: string;
  bedrooms?: string;
  bathrooms?: string;
  area_from?: string;
  area_to?: string;
  payment_plan?: string;
  completion_date?: string;
  budget_options?: string[];
  meta_title?: string;
  meta_description?: string;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface LandingPageLead {
  id: string;
  landing_page_id: string;
  name: string;
  email: string;
  whatsapp?: string;
  budget?: string;
  created_at: string;
}
