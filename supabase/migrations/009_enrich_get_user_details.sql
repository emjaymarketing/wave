-- Update get_user_details to also return last_sign_in_at and created_at from auth.users
DROP FUNCTION IF EXISTS public.get_user_details(UUID[]);
CREATE OR REPLACE FUNCTION public.get_user_details(user_ids UUID[])
RETURNS TABLE (id UUID, email TEXT, full_name TEXT, avatar_url TEXT, last_sign_in_at TIMESTAMPTZ, created_at TIMESTAMPTZ)
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
    up.avatar_url,
    au.last_sign_in_at,
    au.created_at
  FROM auth.users au
  LEFT JOIN public.user_profiles up ON au.id = up.user_id
  WHERE au.id = ANY(user_ids);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_details(UUID[]) TO authenticated;
