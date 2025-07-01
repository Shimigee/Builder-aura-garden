-- Essential policies for basic CRUD operations

-- Allow anyone to insert/update/delete lots (for testing - make more restrictive later)
CREATE POLICY "Allow lot operations" ON public.lots FOR ALL USING (true) WITH CHECK (true);

-- Allow anyone to insert/update/delete permits (for testing)
CREATE POLICY "Allow permit operations" ON public.permits FOR ALL USING (true) WITH CHECK (true);

-- Allow anyone to insert/update/delete vehicles (for testing)
CREATE POLICY "Allow vehicle operations" ON public.vehicles FOR ALL USING (true) WITH CHECK (true);

-- Allow users to manage their own profiles
CREATE POLICY "Allow user profile operations" ON public.users FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
