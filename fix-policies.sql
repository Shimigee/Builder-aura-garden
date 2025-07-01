-- First, drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Users can view lots they have access to" ON public.lots;
DROP POLICY IF EXISTS "Users can view permits for their assigned lots" ON public.permits;
DROP POLICY IF EXISTS "Users can view vehicles for accessible permits" ON public.vehicles;
DROP POLICY IF EXISTS "Allow lot operations" ON public.lots;
DROP POLICY IF EXISTS "Allow permit operations" ON public.permits;
DROP POLICY IF EXISTS "Allow vehicle operations" ON public.vehicles;
DROP POLICY IF EXISTS "Allow user profile operations" ON public.users;

-- Create simple, non-recursive policies for testing
-- Users table - allow users to manage their own records
CREATE POLICY "users_policy" ON public.users 
  FOR ALL 
  USING (auth.uid() = id) 
  WITH CHECK (auth.uid() = id);

-- Lots table - allow all authenticated users to do everything (for testing)
CREATE POLICY "lots_policy" ON public.lots 
  FOR ALL 
  USING (auth.uid() IS NOT NULL) 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Permits table - allow all authenticated users to do everything (for testing)  
CREATE POLICY "permits_policy" ON public.permits 
  FOR ALL 
  USING (auth.uid() IS NOT NULL) 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Vehicles table - allow all authenticated users to do everything (for testing)
CREATE POLICY "vehicles_policy" ON public.vehicles 
  FOR ALL 
  USING (auth.uid() IS NOT NULL) 
  WITH CHECK (auth.uid() IS NOT NULL);
