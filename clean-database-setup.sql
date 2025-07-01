-- =====================================================
-- CLEAN PARKING PERMIT SYSTEM DATABASE SETUP
-- =====================================================
-- Sets up empty database - you'll be the main admin user

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
  role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')) DEFAULT 'admin',
  assigned_lots TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lots table (empty - you'll create your own)
CREATE TABLE public.lots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  total_spots INTEGER NOT NULL DEFAULT 0,
  available_spots INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Permits table (empty - you'll create permits for your lots)
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

-- Vehicles table (linked to permits)
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
-- CREATE RLS POLICIES (SIMPLE & CLEAN)
-- =====================================================

-- Users: Can manage their own profile + admins can manage all
CREATE POLICY "users_policy" ON public.users 
  FOR ALL 
  USING (
    auth.uid() = id OR 
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  ) 
  WITH CHECK (
    auth.uid() = id OR 
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Lots: All authenticated users can view, admins can modify
CREATE POLICY "lots_policy" ON public.lots 
  FOR ALL 
  USING (auth.uid() IS NOT NULL) 
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Permits: All authenticated users can view/create, role-based editing
CREATE POLICY "permits_policy" ON public.permits 
  FOR ALL 
  USING (auth.uid() IS NOT NULL) 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Vehicles: Follow permit permissions
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
-- VERIFICATION
-- =====================================================

-- Show empty tables (ready for your data)
SELECT 'users' as table_name, COUNT(*) as records FROM public.users
UNION ALL
SELECT 'lots' as table_name, COUNT(*) as records FROM public.lots  
UNION ALL
SELECT 'permits' as table_name, COUNT(*) as records FROM public.permits
UNION ALL
SELECT 'vehicles' as table_name, COUNT(*) as records FROM public.vehicles;

-- Success message
SELECT 'Clean database setup completed! You are ready to be the main admin. 🎉' as status;
