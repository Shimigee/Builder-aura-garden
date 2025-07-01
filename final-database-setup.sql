-- =====================================================
-- COMPLETE PARKING PERMIT SYSTEM DATABASE SETUP
-- =====================================================
-- Run this script to set up the entire database from scratch
-- This replaces all previous scripts

-- Clean slate: Drop all existing tables and policies
DROP TABLE IF EXISTS public.vehicles CASCADE;
DROP TABLE IF EXISTS public.permits CASCADE;
DROP TABLE IF EXISTS public.lots CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- =====================================================
-- CREATE TABLES
-- =====================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')) DEFAULT 'viewer',
  assigned_lots TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lots table
CREATE TABLE public.lots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  total_spots INTEGER NOT NULL DEFAULT 0,
  available_spots INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Permits table
CREATE TABLE public.permits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  permit_number TEXT NOT NULL UNIQUE,
  lot_id UUID REFERENCES public.lots(id) ON DELETE CASCADE,
  holder_name TEXT NOT NULL,
  unit_number TEXT NOT NULL,
  permit_type TEXT NOT NULL CHECK (permit_type IN ('resident', 'retail_tenant', 'other')) DEFAULT 'resident',
  occupant_status TEXT DEFAULT 'leaseholder',
  parking_spot_number TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expiration_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '1 year'),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Vehicles table
CREATE TABLE public.vehicles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  permit_id UUID REFERENCES public.permits(id) ON DELETE CASCADE,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  color TEXT NOT NULL,
  license_plate TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CREATE SIMPLE RLS POLICIES (NO RECURSION)
-- =====================================================

-- Users: Can manage their own profile
CREATE POLICY "users_policy" ON public.users 
  FOR ALL 
  USING (auth.uid() = id) 
  WITH CHECK (auth.uid() = id);

-- Lots: All authenticated users can do everything (for testing)
CREATE POLICY "lots_policy" ON public.lots 
  FOR ALL 
  USING (auth.uid() IS NOT NULL) 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Permits: All authenticated users can do everything (for testing)  
CREATE POLICY "permits_policy" ON public.permits 
  FOR ALL 
  USING (auth.uid() IS NOT NULL) 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Vehicles: All authenticated users can do everything (for testing)
CREATE POLICY "vehicles_policy" ON public.vehicles 
  FOR ALL 
  USING (auth.uid() IS NOT NULL) 
  WITH CHECK (auth.uid() IS NOT NULL);

-- =====================================================
-- CREATE UPDATE TRIGGERS
-- =====================================================

-- Function to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON public.users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lots_updated_at 
  BEFORE UPDATE ON public.lots 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_permits_updated_at 
  BEFORE UPDATE ON public.permits 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at 
  BEFORE UPDATE ON public.vehicles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INSERT DEMO DATA
-- =====================================================

-- Insert demo lots
INSERT INTO public.lots (name, description, total_spots, available_spots) VALUES
  ('Building A - Main Lot', 'Primary parking area for Building A residents', 50, 50),
  ('Building B - North Lot', 'North side parking for Building B', 30, 30),
  ('Retail Plaza', 'Shopping center parking area', 75, 75),
  ('Building C - South Lot', 'South parking area for Building C residents', 40, 40);

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Show created tables
SELECT 
  table_name, 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'lots', 'permits', 'vehicles')
ORDER BY table_name, ordinal_position;

-- Show demo lots
SELECT id, name, total_spots, available_spots FROM public.lots;

-- Show RLS status
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'lots', 'permits', 'vehicles');

-- Success message
SELECT 'Database setup completed successfully! 🎉' as status;
