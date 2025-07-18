-- Fix the type mismatch for videos column
-- Convert property_requests.videos from ARRAY to json to match properties table
ALTER TABLE public.property_requests 
ALTER COLUMN videos TYPE json USING 
  CASE 
    WHEN videos IS NULL THEN NULL
    ELSE to_json(videos)
  END;

-- Also ensure images column is consistent (convert to json if it's not already)
ALTER TABLE public.property_requests 
ALTER COLUMN images TYPE json USING 
  CASE 
    WHEN images IS NULL THEN NULL
    ELSE to_json(images)
  END;