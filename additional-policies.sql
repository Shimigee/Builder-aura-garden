-- Add INSERT and UPDATE policies for users table
CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Add INSERT, UPDATE, DELETE policies for lots table (admin only)
CREATE POLICY "Admins can insert lots" ON public.lots
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update lots" ON public.lots
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete lots" ON public.lots
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add INSERT, UPDATE, DELETE policies for permits table
CREATE POLICY "Editors and admins can insert permits" ON public.permits
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR (role = 'editor' AND lot_id = ANY(assigned_lots)))
    )
  );

CREATE POLICY "Editors and admins can update permits" ON public.permits
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR (role = 'editor' AND lot_id = ANY(assigned_lots)))
    )
  );

CREATE POLICY "Editors and admins can delete permits" ON public.permits
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR (role = 'editor' AND lot_id = ANY(assigned_lots)))
    )
  );

-- Add INSERT, UPDATE, DELETE policies for vehicles table
CREATE POLICY "Users can insert vehicles for accessible permits" ON public.vehicles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.permits p
      JOIN public.users u ON (u.id = auth.uid())
      WHERE p.id = permit_id 
      AND (u.role = 'admin' OR (u.role = 'editor' AND p.lot_id = ANY(u.assigned_lots)))
    )
  );

CREATE POLICY "Users can update vehicles for accessible permits" ON public.vehicles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.permits p
      JOIN public.users u ON (u.id = auth.uid())
      WHERE p.id = permit_id 
      AND (u.role = 'admin' OR (u.role = 'editor' AND p.lot_id = ANY(u.assigned_lots)))
    )
  );

CREATE POLICY "Users can delete vehicles for accessible permits" ON public.vehicles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.permits p
      JOIN public.users u ON (u.id = auth.uid())
      WHERE p.id = permit_id 
      AND (u.role = 'admin' OR (u.role = 'editor' AND p.lot_id = ANY(u.assigned_lots)))
    )
  );
