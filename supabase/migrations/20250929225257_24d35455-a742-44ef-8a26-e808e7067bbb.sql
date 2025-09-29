-- Insert a test property request to test Telegram notifications
-- This will trigger the webhook and send a notification to Telegram

INSERT INTO public.property_requests (
  user_id,
  title,
  description,
  price,
  location,
  latitude,
  longitude,
  bedrooms,
  bathrooms,
  area,
  emirate,
  type,
  property_type,
  contact_name,
  contact_email,
  contact_phone,
  submitter_type,
  status,
  amenities,
  user_message
) VALUES (
  'b8f20b8b-d80d-4ff6-a19f-46ea6c9da714', -- Admin user ID (replace with actual user if needed)
  'Test Property - Telegram Notification',
  'This is a test property listing to verify Telegram notifications are working correctly. It includes all the standard details that would be included in a real property request.',
  1500000,
  'Business Bay, Dubai',
  25.1872,
  55.2699,
  2,
  2,
  950.5,
  'Dubai',
  'sale',
  'Apartment',
  'Test User',
  'test@homeapp.ae',
  '+971 50 123 4567',
  'owner',
  'pending',
  '["Pool", "Gym", "Parking", "Security"]'::jsonb,
  'This is a test submission to verify the Telegram notification system is working.'
);