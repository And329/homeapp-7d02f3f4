
  -- Change area columns to double precision to allow decimals
ALTER TABLE public.properties
  ALTER COLUMN area TYPE double precision
  USING area::double precision;

ALTER TABLE public.property_requests
  ALTER COLUMN area TYPE double precision
  USING area::double precision;
  