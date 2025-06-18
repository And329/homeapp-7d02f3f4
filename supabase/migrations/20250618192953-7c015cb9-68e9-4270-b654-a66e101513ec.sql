
-- Create a settings table to store global configuration
CREATE TABLE public.settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Allow anyone to read settings (for global configuration like Mapbox token)
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Create policy that allows anyone to read settings
CREATE POLICY "Anyone can read settings" 
  ON public.settings 
  FOR SELECT 
  USING (true);

-- Create policy that only authenticated users can modify settings (admin functionality)
CREATE POLICY "Authenticated users can modify settings" 
  ON public.settings 
  FOR ALL
  USING (auth.role() = 'authenticated');
