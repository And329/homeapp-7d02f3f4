
-- Fix the database structure properly without breaking identity constraints

-- Step 1: Create a new properties table with UUID id
CREATE TABLE IF NOT EXISTS public.properties_new (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text,
  description text,
  price bigint,
  location text,
  latitude double precision,
  longitude double precision,
  bedrooms integer,
  bathrooms integer,
  type character varying,
  amenities json,
  images json,
  is_hot_deal boolean DEFAULT false,
  is_approved boolean NOT NULL DEFAULT false,
  owner_id uuid,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Step 2: Copy data from old table to new table
INSERT INTO public.properties_new (
  title, description, price, location, latitude, longitude,
  bedrooms, bathrooms, type, amenities, images, is_hot_deal,
  is_approved, owner_id, created_by, created_at
)
SELECT 
  title, description, price, location, latitude, longitude,
  bedrooms, bathrooms, type, amenities, images, is_hot_deal,
  is_approved, owner_id, created_by, created_at
FROM public.properties;

-- Step 3: Drop the old table and rename the new one
DROP TABLE public.properties CASCADE;
ALTER TABLE public.properties_new RENAME TO properties;

-- Step 4: Update conversations table to use UUID for property_id
ALTER TABLE public.conversations ALTER COLUMN property_id TYPE uuid USING NULL;

-- Step 5: Recreate the foreign key constraint
ALTER TABLE public.conversations ADD CONSTRAINT conversations_property_id_fkey 
  FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;

-- Step 6: Update the approve_property_request function to return UUID
CREATE OR REPLACE FUNCTION public.approve_property_request(request_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  request_record RECORD;
  new_property_id UUID;
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

  -- Insert into properties table with the ORIGINAL REQUESTER as owner
  INSERT INTO public.properties (
    title, description, price, location, latitude, longitude,
    bedrooms, bathrooms, type, amenities, images, owner_id, is_approved, created_at
  ) VALUES (
    request_record.title, request_record.description, request_record.price,
    request_record.location, request_record.latitude, request_record.longitude,
    request_record.bedrooms, request_record.bathrooms, request_record.type,
    request_record.amenities, request_record.images, 
    request_record.user_id, -- Set owner to original requester
    true, -- Approve the property immediately
    now()
  ) RETURNING id INTO new_property_id;

  -- Update request status
  UPDATE public.property_requests 
  SET status = 'approved', approved_by = auth.uid(), approved_at = now()
  WHERE id = request_id;

  RETURN new_property_id;
END;
$function$;

-- Step 7: Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_properties_owner_id ON public.properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(is_approved);
CREATE INDEX IF NOT EXISTS idx_property_requests_user_id ON public.property_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_property_requests_status ON public.property_requests(status);

-- Step 8: Enable RLS on the new properties table
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
