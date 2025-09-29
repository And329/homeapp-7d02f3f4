-- Create landing_pages table
CREATE TABLE public.landing_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  starting_price BIGINT,
  developer TEXT,
  location TEXT,
  hero_image TEXT,
  video_url TEXT,
  description TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  amenities JSONB DEFAULT '[]'::jsonb,
  gallery_images JSONB DEFAULT '[]'::jsonb,
  bedrooms TEXT,
  bathrooms TEXT,
  area_from TEXT,
  area_to TEXT,
  payment_plan TEXT,
  completion_date TEXT,
  budget_options JSONB DEFAULT '["AED 1M - AED 2M", "AED 2M - AED 3M", "AED 3M - AED 4M", "AED 4M+"]'::jsonb,
  meta_title TEXT,
  meta_description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create landing_page_leads table
CREATE TABLE public.landing_page_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  landing_page_id UUID REFERENCES public.landing_pages(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT,
  budget TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.landing_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_page_leads ENABLE ROW LEVEL SECURITY;

-- RLS policies for landing_pages
CREATE POLICY "Anyone can view active landing pages"
  ON public.landing_pages FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage landing pages"
  ON public.landing_pages FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- RLS policies for landing_page_leads
CREATE POLICY "Anyone can create leads"
  ON public.landing_page_leads FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all leads"
  ON public.landing_page_leads FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));