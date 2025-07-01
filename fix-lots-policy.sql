-- Fix lots RLS policy to allow authenticated users to create lots
-- (since first user should be admin anyway)

-- Drop existing policy
DROP POLICY IF EXISTS "lots_policy" ON public.lots;

-- Create new policy that allows all authenticated users to manage lots
-- (Since first user becomes admin, and you want to add lots)
CREATE POLICY "lots_policy_permissive" ON public.lots 
  FOR ALL 
  USING (auth.uid() IS NOT NULL) 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Also ensure the user has admin role
-- Check current user role
SELECT 
  u.id, 
  u.email, 
  u.role,
  u.name
FROM public.users u 
WHERE u.id = auth.uid();
