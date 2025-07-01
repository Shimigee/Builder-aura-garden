-- Get the current authenticated user ID and create a profile
-- Run this AFTER you've logged into the app (so Supabase has your auth record)

-- First, check what auth users exist:
SELECT id, email FROM auth.users;

-- Then insert a profile for your user (replace the UUID with your actual user ID from above)
-- You can see the user ID in your browser console when it tries to fetch the profile

-- Example insert (you'll need to update the ID):
-- INSERT INTO public.users (id, email, name, role, assigned_lots) 
-- VALUES (
--   'YOUR_USER_ID_HERE',
--   'your-email@example.com', 
--   'Your Name',
--   'admin',
--   ARRAY['lot-1', 'lot-2', 'lot-3', 'lot-4']
-- );

-- Or if you want to create a profile for ALL existing auth users:
INSERT INTO public.users (id, email, name, role, assigned_lots)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)) as name,
  'admin' as role,
  ARRAY['lot-1', 'lot-2', 'lot-3', 'lot-4'] as assigned_lots
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users);
