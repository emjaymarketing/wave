# Admin Invite Signup Fix

## What Was Fixed

The admin invite signup flow now has a **dual-layer approach** to ensure users who sign up with the invite token are correctly assigned the admin role:

### Layer 1: Database Trigger (Primary)
- When a user signs up, the trigger function checks `raw_user_meta_data->>'admin_invite'`
- If it's `'true'`, assigns admin role
- This happens automatically in the database

### Layer 2: API Fallback (Backup)
- After successful signup with invite token, the app calls `/api/setup-admin`
- This explicitly sets the user's role to admin in the `user_roles` table
- Ensures admin role is set even if the trigger doesn't work

## Files Changed

1. **`app/api/setup-admin/route.ts`** (NEW)
   - API endpoint that sets a user's role to admin
   - Called after signup with invite token

2. **`components/sign-up-form.tsx`** (UPDATED)
   - Now calls `/api/setup-admin` after successful signup with invite token
   - Ensures admin role is set immediately

3. **`supabase/migrations/002_add_admin_invite_support.sql`** (EXISTING)
   - Database trigger that checks metadata and assigns role
   - Should be run in Supabase SQL Editor

## How It Works Now

### Admin Signup Flow:
1. User visits: `http://localhost:3000/auth/sign-up?invite=YOUR_TOKEN`
2. Form detects invite token
3. User fills out email/password
4. On submit:
   - Validates token via `/api/validate-invite`
   - Creates user with `admin_invite: "true"` metadata
   - **Database trigger** assigns admin role (Layer 1)
   - **API call** to `/api/setup-admin` ensures admin role (Layer 2)
5. User gets confirmation email
6. After email confirmation and login → Redirected to `/admin`

### Client Signup Flow:
1. User visits: `http://localhost:3000/auth/sign-up` (no token)
2. User fills out email/password
3. On submit:
   - Creates user with `admin_invite: "false"` metadata
   - Database trigger assigns client role
4. User gets confirmation email
5. After email confirmation and login → Redirected to `/client`

## Testing the Fix

### Test Admin Signup:
1. Make sure `ADMIN_INVITE_TOKEN` is set in `.env.local`
2. Visit: `http://localhost:3000/auth/sign-up?invite=YOUR_TOKEN`
3. Sign up with a new email
4. Check Supabase → Table Editor → `user_roles`
5. Your new user should have `role = 'admin'`
6. Log in → Should redirect to `/admin`

### Test Client Signup:
1. Visit: `http://localhost:3000/auth/sign-up` (no invite parameter)
2. Sign up with a different email
3. Check Supabase → Table Editor → `user_roles`
4. Your new user should have `role = 'client'`
5. Log in → Should redirect to `/client`

## For Existing Users

If you signed up before this fix and are stuck as a client:

```sql
-- Run in Supabase SQL Editor
UPDATE user_roles 
SET role = 'admin', updated_at = NOW()
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'your-email@example.com'
);
```

Then:
1. Log out
2. Clear browser cookies
3. Log back in
4. Should redirect to `/admin`

## Why This Approach?

**Redundancy = Reliability**

- If the database trigger fails or wasn't run, the API call ensures the role is set
- If the API call fails, the trigger should have already set it
- Both methods work independently, providing a safety net

## Troubleshooting

### "Still being assigned client role"
1. Check if migration 002 was run in Supabase
2. Verify `ADMIN_INVITE_TOKEN` is set correctly
3. Check browser console for API errors
4. Manually update role using SQL above

### "API call failing"
- Check server logs for errors
- Verify `/api/setup-admin` endpoint exists
- Check Supabase permissions

### "Trigger not working"
- Verify migration 002 was run
- Check trigger exists:
  ```sql
  SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
  ```
- Manually run the trigger function update from migration 002

## Migration Checklist

Make sure you've run both migrations in Supabase SQL Editor:

- [ ] `supabase/migrations/001_create_user_roles.sql`
- [ ] `supabase/migrations/002_add_admin_invite_support.sql`

After running migrations, restart your dev server.
