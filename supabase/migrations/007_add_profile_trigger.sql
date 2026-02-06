-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to get user details including profile
CREATE OR REPLACE FUNCTION public.get_user_details(user_ids UUID[])
RETURNS TABLE (id UUID, email TEXT, full_name TEXT, avatar_url TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id, 
    au.email::TEXT,
    COALESCE(up.full_name, 'Unknown User') as full_name,
    up.avatar_url
  FROM auth.users au
  LEFT JOIN public.user_profiles up ON au.id = up.user_id
  WHERE au.id = ANY(user_ids);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_details(UUID[]) TO authenticated;

-- Backfill: create profiles for any existing users who don't have one yet
INSERT INTO public.user_profiles (user_id, full_name)
SELECT au.id, COALESCE(au.raw_user_meta_data->>'full_name', 'User')
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.user_id
WHERE up.id IS NULL;
