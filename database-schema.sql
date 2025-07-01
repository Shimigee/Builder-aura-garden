-- Enable Row Level Security
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- Create users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
  assigned_lots TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lots table
CREATE TABLE public.lots (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  total_spots INTEGER NOT NULL DEFAULT 0,
  available_spots INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_spots CHECK (available_spots <= total_spots AND available_spots >= 0)
);

-- Create permits table
CREATE TABLE public.permits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  permit_number TEXT NOT NULL UNIQUE,
  lot_id TEXT REFERENCES public.lots(id) ON DELETE CASCADE,
  holder_name TEXT NOT NULL,
  unit_number TEXT NOT NULL,
  permit_type TEXT NOT NULL CHECK (permit_type IN ('resident', 'retail_tenant', 'other')),
  occupant_status TEXT DEFAULT 'leaseholder',
  parking_spot_number TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  issue_date DATE NOT NULL,
  expiration_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create vehicles table
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

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for lots table
CREATE POLICY "Users can view lots they have access to" ON public.lots
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND (role = 'admin' OR lots.id = ANY(assigned_lots))
    )
  );

-- RLS Policies for permits table
CREATE POLICY "Users can view permits for their assigned lots" ON public.permits
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND (role = 'admin' OR lot_id = ANY(assigned_lots))
    )
  );

-- RLS Policies for vehicles table
CREATE POLICY "Users can view vehicles for accessible permits" ON public.vehicles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.permits p
      JOIN public.users u ON (u.id = auth.uid())
      WHERE p.id = permit_id
      AND (u.role = 'admin' OR p.lot_id = ANY(u.assigned_lots))
    )
  );

-- Insert demo data
INSERT INTO public.lots (id, name, description, total_spots, available_spots) VALUES
  ('lot-1', 'Building A - Main Lot', 'Primary parking area for Building A residents', 50, 38),
  ('lot-2', 'Building B - North Lot', 'North side parking for Building B', 30, 27),
  ('lot-3', 'Retail Plaza', 'Shopping center parking area', 75, 74),
  ('lot-4', 'Building C - South Lot', 'South parking area for Building C residents', 40, 39);

-- Function to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lots_updated_at BEFORE UPDATE ON public.lots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_permits_updated_at BEFORE UPDATE ON public.permits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON public.vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
