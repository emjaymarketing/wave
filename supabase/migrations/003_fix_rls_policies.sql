-- Fix infinite recursion in RLS policies for user_roles table
-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

-- Create new policies without recursion

-- Policy 1: Users can read their own role
CREATE POLICY "Users can read own role"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy 2: Service role can do everything (for server-side operations)
CREATE POLICY "Service role full access"
  ON public.user_roles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy 3: Allow inserts for new users (for trigger)
CREATE POLICY "Allow insert for new users"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy 4: Allow updates for authenticated users on their own record
CREATE POLICY "Allow update own role"
  ON public.user_roles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
