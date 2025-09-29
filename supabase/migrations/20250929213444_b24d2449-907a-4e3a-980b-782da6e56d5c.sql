-- Insert sample landing page for DWTN Residences
INSERT INTO public.landing_pages (
  slug,
  title,
  subtitle,
  developer,
  location,
  starting_price,
  bedrooms,
  bathrooms,
  area_from,
  area_to,
  completion_date,
  description,
  features,
  amenities,
  payment_plan,
  budget_options,
  hero_image,
  video_url,
  gallery_images,
  meta_title,
  meta_description,
  is_active
) VALUES (
  'dwtn-residences',
  'DWTN Residences',
  'at Business Bay, Dubai',
  'Deyaar',
  'Business Bay, Dubai',
  1860000,
  '1-3',
  '1-2',
  '650',
  '1500',
  'Q4 2025',
  'Experience luxury living in the heart of Dubai''s vibrant Business Bay. DWTN Residences offers contemporary design, world-class amenities, and stunning views of the Dubai skyline. This exclusive development by Deyaar combines modern architecture with premium finishes to create an unparalleled living experience.

Located in one of Dubai''s most sought-after neighborhoods, DWTN Residences provides easy access to major business districts, shopping destinations, and entertainment venues. With its strategic location and exceptional design, this project represents an outstanding investment opportunity.',
  '["Prime Business Bay Location", "Contemporary Architecture", "High-quality Finishes", "Smart Home Technology", "Floor-to-ceiling Windows", "Spacious Balconies", "Premium Kitchen Appliances", "Built-in Wardrobes"]',
  '["Swimming Pool", "State-of-the-art Gym", "Children''s Play Area", "Landscaped Gardens", "24/7 Security", "Concierge Services", "Covered Parking", "Retail Outlets", "BBQ Areas", "Jogging Track"]',
  '20% Down Payment
40% During Construction
40% On Completion

Flexible payment terms available to make your investment journey seamless and stress-free.',
  '["AED 1M - AED 2M", "AED 2M - AED 3M", "AED 3M - AED 4M", "AED 4M+"]',
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1920&q=80',
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  '["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80"]',
  'DWTN Residences - Luxury Living in Business Bay, Dubai',
  'Discover DWTN Residences by Deyaar in Business Bay. Contemporary 1-3 bedroom apartments starting from AED 1.86M. Flexible payment plan available.',
  true
);