-- Create team_members table
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  description TEXT,
  email TEXT,
  phone TEXT,
  linkedin TEXT,
  profile_picture TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Create policies for team_members
CREATE POLICY "Anyone can view active team members" 
ON public.team_members 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage team members" 
ON public.team_members 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_team_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_team_members_updated_at
BEFORE UPDATE ON public.team_members
FOR EACH ROW
EXECUTE FUNCTION public.update_team_members_updated_at();

-- Insert default team members
INSERT INTO public.team_members (name, position, description, email, phone, linkedin, display_order) VALUES
(
  'Ahmed Al-Rashid',
  'CEO & Founder',
  '15+ years in UAE real estate market with deep expertise in luxury properties and investment opportunities.',
  'ahmed@homeapp.ae',
  '+971 50 123 4567',
  '#',
  1
),
(
  'Sarah Johnson',
  'Head of Sales',
  'International real estate expert specializing in helping expatriates find their perfect home in Dubai.',
  'sarah@homeapp.ae',
  '+971 50 234 5678',
  '#',
  2
),
(
  'Omar Hassan',
  'Property Consultant',
  'Local market specialist with extensive knowledge of emerging neighborhoods and investment trends.',
  'omar@homeapp.ae',
  '+971 50 345 6789',
  '#',
  3
),
(
  'Maria Rodriguez',
  'Client Relations Manager',
  'Dedicated to ensuring exceptional customer service and smooth property transactions for all clients.',
  'maria@homeapp.ae',
  '+971 50 456 7890',
  '#',
  4
);