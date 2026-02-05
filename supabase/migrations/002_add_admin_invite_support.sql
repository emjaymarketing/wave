-- Update the trigger function to support admin role assignment via metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Check if user has admin_invite metadata
  IF NEW.raw_user_meta_data->>'admin_invite' = 'true' THEN
    user_role := 'admin';
  ELSE
    user_role := 'client';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
