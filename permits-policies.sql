-- Add missing policies for permits and vehicles tables

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "permits_policy" ON public.permits;
DROP POLICY IF EXISTS "vehicles_policy" ON public.vehicles;

-- Create simple policies for permits table
CREATE POLICY "permits_policy" ON public.permits 
  FOR ALL 
  USING (auth.uid() IS NOT NULL) 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Create simple policies for vehicles table  
CREATE POLICY "vehicles_policy" ON public.vehicles 
  FOR ALL 
  USING (auth.uid() IS NOT NULL) 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Also ensure the tables have proper UUID generation
-- Check if permits table uses UUID correctly
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'permits' AND column_name = 'id';

-- If needed, we can also check the vehicles table
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'vehicles' AND column_name = 'id';
