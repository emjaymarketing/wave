# Diagnose Role Issue

You're being redirected to `/client` even though you should be an admin. Let's fix this.

## Step 1: Check Your User ID

Go to Supabase Dashboard → Authentication → Users

Find your user and copy the **User ID** (it's a UUID like `123e4567-e89b-12d3-a456-426614174000`)

## Step 2: Check the user_roles Table

Go to Supabase Dashboard → SQL Editor and run:

```sql
-- Check what role is assigned to your user
SELECT ur.*, au.email 
FROM user_roles ur
JOIN auth.users au ON ur.user_id = au.id
WHERE au.email = 'YOUR_EMAIL_HERE';
```

Replace `YOUR_EMAIL_HERE` with your actual email.

### Expected Result:
You should see a row with:
- `user_id`: Your user UUID
- `role`: Should be `"admin"`
- `email`: Your email

### If the role is "client" instead of "admin":
This is the problem! Continue to Step 3.

### If no row is returned:
The user_roles table doesn't have an entry for you. Continue to Step 3.

## Step 3: Fix Your Role

Run this SQL in Supabase SQL Editor:

```sql
-- Update your role to admin
UPDATE user_roles 
SET role = 'admin', updated_at = NOW()
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'YOUR_EMAIL_HERE'
);
```

Replace `YOUR_EMAIL_HERE` with your actual email.

### If that doesn't work (no rows updated):
You need to insert a new row:

```sql
-- Insert admin role for your user
INSERT INTO user_roles (user_id, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'YOUR_EMAIL_HERE'),
  'admin'
)
ON CONFLICT (user_id) 
DO UPDATE SET role = 'admin', updated_at = NOW();
```

## Step 4: Clear Your Session and Login Again

1. **Log out** from your app
2. **Clear browser cookies** (or use incognito mode)
3. **Log in again** at `/auth/login`
4. You should now be redirected to `/admin`

## Step 5: Verify It Worked

After logging in:
- Check the URL - should be `/admin`
- You should see the sidebar with: Clients, Admins, Calendar
- You should see "Admin Dashboard" heading

## Common Issues

### "I updated the role but still going to /client"
- Clear your browser cookies/cache
- Log out completely
- Try incognito mode
- Restart your dev server

### "The SQL query returns nothing"
- Make sure you ran migration 001_create_user_roles.sql
- Check if the user_roles table exists:
  ```sql
  SELECT * FROM user_roles;
  ```

### "I signed up with the invite link but still a client"
- Check if migration 002_add_admin_invite_support.sql was run
- The trigger might not be working
- Manually update your role using Step 3

## Quick Fix SQL (All-in-One)

If you just want to fix it quickly, run this:

```sql
-- Replace YOUR_EMAIL_HERE with your actual email
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get user ID
  SELECT id INTO v_user_id 
  FROM auth.users 
  WHERE email = 'YOUR_EMAIL_HERE';
  
  -- Insert or update role to admin
  INSERT INTO user_roles (user_id, role)
  VALUES (v_user_id, 'admin')
  ON CONFLICT (user_id) 
  DO UPDATE SET role = 'admin', updated_at = NOW();
  
  RAISE NOTICE 'User role updated to admin for user_id: %', v_user_id;
END $$;
```

After running this:
1. Log out
2. Clear cookies
3. Log back in
4. Should go to `/admin`

## Still Not Working?

Check the browser console for errors:
1. Open DevTools (F12)
2. Go to Console tab
3. Log in again
4. Look for any errors
5. Share the errors if you need help
