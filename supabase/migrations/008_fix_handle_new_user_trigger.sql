-- Fix handle_new_user() to create BOTH user_profiles and user_roles rows.
-- Migration 007 accidentally overwrote the version from 002 that handled roles.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Determine role from invite metadata
  IF NEW.raw_user_meta_data->>'admin_invite' = 'true' THEN
    user_role := 'admin';
  ELSE
    user_role := 'client';
  END IF;

  -- Create user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role);

  -- Create user profile
  INSERT INTO public.user_profiles (user_id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.raw_user_meta_data->>'avatar_url'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Backfill: add 'client' role for any users who have a profile but no role
INSERT INTO public.user_roles (user_id, role)
SELECT up.user_id, 'client'
FROM public.user_profiles up
LEFT JOIN public.user_roles ur ON up.user_id = ur.user_id
WHERE ur.user_id IS NULL;
