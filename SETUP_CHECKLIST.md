# Setup Checklist for Admin Access

Follow these steps to ensure your admin access is working:

## 1. Run Database Migrations

You need to run both migrations in your Supabase project:

### Migration 1: Create user_roles table
```sql
-- Go to Supabase Dashboard → SQL Editor
-- Copy and paste from: supabase/migrations/001_create_user_roles.sql
-- Click "Run"
```

### Migration 2: Add admin invite support
```sql
-- Go to Supabase Dashboard → SQL Editor
-- Copy and paste from: supabase/migrations/002_add_admin_invite_support.sql
-- Click "Run"
```

## 2. Set Up Admin Invite Token

Add to your `.env.local`:
```bash
ADMIN_INVITE_TOKEN=your-secure-random-token
```

Generate a secure token:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Restart your dev server after adding this.

## 3. Create Your First Admin User

### Option A: Sign up with invite link (Recommended)
1. Copy your admin invite link:
   ```
   http://localhost:3000/auth/sign-up?invite=YOUR_TOKEN_HERE
   ```
2. Open in browser (incognito recommended)
3. Sign up with your email
4. Check email for confirmation (if email confirmation is enabled)
5. Log in at `/auth/login`
6. You should be redirected to `/admin`

### Option B: Manually promote existing user
1. Go to Supabase Dashboard → Table Editor → `user_roles`
2. Find your user
3. Change `role` from "client" to "admin"
4. Log out and log back in
5. You should be redirected to `/admin`

## 4. Verify Admin Access

After logging in as admin:

1. **Check you're redirected to `/admin`** (not `/`)
2. **You should see:**
   - Vertical sidebar on the left with: Clients, Admins, Calendar
   - "Admin Dashboard" heading
   - User statistics cards
   - User list table

3. **If you see the landing page instead:**
   - You're at `/` not `/admin`
   - Manually navigate to `http://localhost:3000/admin`
   - Or click "Admin" in the top nav

## 5. Troubleshooting

### "I'm seeing the landing page after login"
- Check the browser URL - are you at `/admin` or `/`?
- Open browser DevTools → Network tab
- Log in again and check the redirect
- Look for any errors in the console

### "I get redirected to /client instead of /admin"
- Your user doesn't have admin role
- Check Supabase → Table Editor → `user_roles`
- Verify your user's role is "admin" not "client"

### "Table user_roles doesn't exist"
- You haven't run the migrations
- Go to Supabase SQL Editor and run migration 001

### "Invalid invite token error"
- Check `ADMIN_INVITE_TOKEN` is set in `.env.local`
- Verify the token in the URL matches exactly
- Restart your dev server

### "Can't access /admin page"
- Check browser console for errors
- Verify you're logged in (check for auth cookie)
- Try logging out and back in

## 6. Quick Test Commands

### Check if migrations ran:
Go to Supabase → SQL Editor and run:
```sql
SELECT * FROM user_roles;
```
Should return a table (even if empty).

### Check your user's role:
```sql
SELECT ur.role, au.email 
FROM user_roles ur
JOIN auth.users au ON ur.user_id = au.id
WHERE au.email = 'your-email@example.com';
```

### Manually set admin role:
```sql
UPDATE user_roles 
SET role = 'admin' 
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'your-email@example.com'
);
```

## 7. Expected Behavior

### As Admin:
- Login → Redirected to `/admin`
- See sidebar with Clients, Admins, Calendar
- Can access `/admin/clients`, `/admin/admins`, `/admin/calendar`
- Cannot access `/client` (redirected to `/admin`)

### As Client:
- Login → Redirected to `/client`
- See client dashboard
- Cannot access `/admin` (redirected to `/client`)

## Need Help?

If you're still having issues:
1. Check the browser console for errors
2. Check the terminal for server errors
3. Verify all migrations ran successfully
4. Confirm your user has the correct role in the database
