-- Simple fix: just fix the lots table to auto-generate IDs

-- Drop and recreate only the lots table  
DROP TABLE IF EXISTS public.lots CASCADE;

-- Recreate lots table with proper UUID auto-generation
CREATE TABLE public.lots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  total_spots INTEGER NOT NULL DEFAULT 0,
  available_spots INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_spots CHECK (available_spots <= total_spots AND available_spots >= 0)
);

-- Enable RLS
ALTER TABLE public.lots ENABLE ROW LEVEL SECURITY;

-- Add simple policy
CREATE POLICY "lots_policy" ON public.lots 
  FOR ALL 
  USING (auth.uid() IS NOT NULL) 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Insert demo data
INSERT INTO public.lots (name, description, total_spots, available_spots) VALUES
  ('Building A - Main Lot', 'Primary parking area for Building A residents', 50, 38),
  ('Building B - North Lot', 'North side parking for Building B', 30, 27),
  ('Retail Plaza', 'Shopping center parking area', 75, 74),
  ('Building C - South Lot', 'South parking area for Building C residents', 40, 39);
