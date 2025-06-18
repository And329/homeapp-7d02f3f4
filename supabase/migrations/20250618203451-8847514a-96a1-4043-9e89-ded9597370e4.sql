
-- Create table for admin-created blog posts (separate from user submissions)
CREATE TABLE public.admin_blog_posts (
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

-- Create table for admin-created news articles
CREATE TABLE public.admin_news_articles (
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
ALTER TABLE public.admin_blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_news_articles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_blog_posts
CREATE POLICY "Anyone can view published admin blog posts" 
  ON public.admin_blog_posts 
  FOR SELECT 
  USING (status = 'published' OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admins can manage admin blog posts" 
  ON public.admin_blog_posts 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- RLS Policies for admin_news_articles
CREATE POLICY "Anyone can view published admin news articles" 
  ON public.admin_news_articles 
  FOR SELECT 
  USING (status = 'published' OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admins can manage admin news articles" 
  ON public.admin_news_articles 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));
