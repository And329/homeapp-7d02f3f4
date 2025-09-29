-- Update sample landing page with QR code, floor plans, and better details
UPDATE public.landing_pages 
SET 
  qr_code = 'https://images.unsplash.com/photo-1635514569146-9a9607ecf303?auto=format&fit=crop&w=400&q=80',
  floor_plans = '["https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80"]'::jsonb,
  description = 'Experience unparalleled luxury living in the heart of Dubai''s prestigious Business Bay district. DWTN Residences by Deyaar represents the pinnacle of contemporary architecture and sophisticated urban living. This landmark development features meticulously designed 1, 2, and 3-bedroom apartments with premium finishes and breathtaking views of the iconic Dubai skyline.

Each residence showcases floor-to-ceiling windows that flood the interiors with natural light, spacious layouts optimized for modern living, and private balconies offering stunning panoramic vistas. The development''s strategic location provides seamless connectivity to Dubai''s major business hubs, premium shopping destinations, and world-class entertainment venues.

DWTN Residences is more than just a home; it''s an investment in a lifestyle of elegance and convenience. With completion scheduled for Q4 2025, this presents an exceptional opportunity for both end-users and savvy investors looking to capitalize on Dubai''s thriving real estate market.',
  features = '["Prime Business Bay Location - Heart of Dubai", "Contemporary Architecture by Award-winning Designers", "High-quality Italian Finishes Throughout", "Smart Home Technology Integration", "Floor-to-ceiling Triple-glazed Windows", "Spacious Private Balconies with Skyline Views", "Premium Miele Kitchen Appliances", "Built-in Wardrobes with Custom Storage", "High-speed Fiber Optic Internet", "Energy-efficient Climate Control Systems"]'::jsonb,
  amenities = '["Temperature-controlled Infinity Pool", "State-of-the-art Fitness Center with Technogym Equipment", "Dedicated Children''s Play Area", "Professionally Landscaped Gardens", "24/7 Security with CCTV Surveillance", "Premium Concierge Services", "Multi-level Covered Parking", "High-end Retail Outlets", "Outdoor BBQ and Entertainment Areas", "Dedicated Jogging and Cycling Track", "Co-working Spaces with High-speed WiFi", "Kids Swimming Pool and Splash Area"]'::jsonb,
  gallery_images = '["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1920&q=80", "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80"]'::jsonb,
  payment_plan = '💰 Flexible Payment Structure

20% - Down Payment (On Booking)
40% - During Construction (Milestone-based)
40% - On Completion (Handover)

✨ Special Benefits:
• Zero Registration Fees
• Flexible Payment Schedule
• Post-handover Payment Plans Available
• Competitive ROI - Estimated 8-10% Annual Returns
• Developer-backed Quality Guarantee

Contact us today to discuss customized payment options tailored to your investment needs.'
WHERE slug = 'dwtn-residences';