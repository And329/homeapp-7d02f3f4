
-- Create table for property listing requests (pending approval)
CREATE TABLE public.property_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price BIGINT NOT NULL,
  location TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  bedrooms INTEGER,
  bathrooms INTEGER,
  type CHARACTER VARYING NOT NULL CHECK (type IN ('rent', 'sale')),
  property_type TEXT DEFAULT 'Apartment',
  amenities JSON,
  images JSON,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE
);

-- Create table for blog posts
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image TEXT,
  author_id UUID REFERENCES auth.users(id) NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  tags TEXT[],
  meta_description TEXT
);

-- Create table for news articles
CREATE TABLE public.news_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image TEXT,
  author_id UUID REFERENCES auth.users(id) NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  tags TEXT[],
  meta_description TEXT,
  source TEXT
);

-- Enable Row Level Security
ALTER TABLE public.property_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for property_requests
CREATE POLICY "Users can view their own property requests" 
  ON public.property_requests 
  FOR SELECT 
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Users can create property requests" 
  ON public.property_requests 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update property requests" 
  ON public.property_requests 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- RLS Policies for blog_posts
CREATE POLICY "Anyone can view published blog posts" 
  ON public.blog_posts 
  FOR SELECT 
  USING (status = 'published' OR auth.uid() = author_id OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admins can manage blog posts" 
  ON public.blog_posts 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- RLS Policies for news_articles
CREATE POLICY "Anyone can view published news articles" 
  ON public.news_articles 
  FOR SELECT 
  USING (status = 'published' OR auth.uid() = author_id OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admins can manage news articles" 
  ON public.news_articles 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Add function to automatically approve property request and create property
CREATE OR REPLACE FUNCTION public.approve_property_request(request_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  request_record RECORD;
  new_property_id BIGINT;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Only admins can approve property requests';
  END IF;

  -- Get the request details
  SELECT * INTO request_record FROM public.property_requests WHERE id = request_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Property request not found or already processed';
  END IF;

  -- Insert into properties table
  INSERT INTO public.properties (
    title, description, price, location, latitude, longitude,
    bedrooms, bathrooms, type, amenities, images, created_at
  ) VALUES (
    request_record.title, request_record.description, request_record.price,
    request_record.location, request_record.latitude, request_record.longitude,
    request_record.bedrooms, request_record.bathrooms, request_record.type,
    request_record.amenities, request_record.images, now()
  ) RETURNING id INTO new_property_id;

  -- Update request status
  UPDATE public.property_requests 
  SET status = 'approved', approved_by = auth.uid(), approved_at = now()
  WHERE id = request_id;

  RETURN new_property_id::UUID;
END;
$$;
