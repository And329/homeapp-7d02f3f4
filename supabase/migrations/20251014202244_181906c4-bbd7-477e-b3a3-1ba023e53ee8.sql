-- Insert a test project with sample data
INSERT INTO landing_pages (
  title,
  slug,
  subtitle,
  developer,
  location,
  starting_price,
  completion_date,
  bedrooms,
  bathrooms,
  area_from,
  area_to,
  description,
  payment_plan,
  features,
  amenities,
  budget_options,
  is_active,
  meta_title,
  meta_description
) VALUES (
  'Marina Heights Residences',
  'marina-heights',
  'Premium Waterfront Living in Dubai Marina',
  'Emaar Properties',
  'Dubai Marina, Dubai',
  1850000,
  'Q4 2026',
  '1-3',
  '1-3',
  '680',
  '1850',
  'Experience luxury waterfront living at Marina Heights Residences. This stunning development offers contemporary design, world-class amenities, and breathtaking views of the Arabian Gulf. Located in the heart of Dubai Marina, residents enjoy easy access to dining, shopping, and entertainment options.',
  '20% Down Payment
30% During Construction  
50% On Completion',
  '["High-speed elevators", "Smart home technology", "Floor-to-ceiling windows", "Premium finishes", "Covered parking"]'::jsonb,
  '["Infinity pool", "State-of-the-art gym", "Kids play area", "BBQ area", "24/7 security", "Concierge service", "Steam and sauna"]'::jsonb,
  '["AED 1.5M - AED 2M", "AED 2M - AED 3M", "AED 3M - AED 4M", "AED 4M+"]'::jsonb,
  true,
  'Marina Heights Residences - Luxury Apartments in Dubai Marina',
  'Discover premium waterfront living at Marina Heights. 1-3 bedroom luxury apartments starting from AED 1.85M. Q4 2026 completion.'
);