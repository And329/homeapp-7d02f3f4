
-- Check current property ownership and user profiles
SELECT 
  p.id,
  p.title,
  p.owner_id,
  pr.email as owner_email,
  pr.full_name as owner_name
FROM properties p
LEFT JOIN profiles pr ON p.owner_id = pr.id
ORDER BY p.created_at DESC;

-- Also check all user profiles to see the available users
SELECT id, email, full_name, role, created_at FROM profiles ORDER BY created_at;
