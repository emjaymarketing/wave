# Role-Based Authentication Setup Guide

This guide explains how to set up and use the role-based authentication system in your Wave application.

## Overview

Your app now supports two types of users:
- **Admin**: Full access to admin dashboard with user management capabilities
- **Client**: Access to client dashboard with personalized information

## Database Setup

### 1. Run the Migration

Execute the SQL migration in your Supabase project:

```bash
# Go to your Supabase project dashboard
# Navigate to SQL Editor
# Copy and paste the contents of: supabase/migrations/001_create_user_roles.sql
# Run the migration
```

Or use the Supabase CLI:

```bash
supabase db push
```

### 2. What the Migration Does

- Creates a `user_roles` table with Row Level Security (RLS)
- Sets up policies so users can read their own role
- Creates a trigger that automatically assigns new users the "client" role
- Admins can manage all roles

## Creating Your First Admin User

After running the migration, all new signups will be assigned the "client" role by default. To create an admin:

### Option 1: Via Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Table Editor** → **user_roles**
3. Find the user you want to make an admin
4. Change their `role` from "client" to "admin"

### Option 2: Via SQL

```sql
UPDATE user_roles 
SET role = 'admin' 
WHERE user_id = 'USER_ID_HERE';
```

## How It Works

### Authentication Flow

1. **User logs in** → `components/login-form.tsx`
2. **System checks role** → Queries `user_roles` table
3. **Redirects based on role**:
   - Admin → `/admin`
   - Client → `/client`

### Route Protection

The middleware (`middleware.ts`) automatically:
- Redirects unauthenticated users to `/auth/login`
- Prevents clients from accessing `/admin` routes
- Prevents admins from accessing `/client` routes (redirects to `/admin`)

### Pages Structure

```
/admin          → Admin dashboard (user stats, user list)
/client         → Client dashboard (account info, activity)
/protected      → Generic protected page (legacy)
/               → Public landing page with auth buttons
```

## Key Files

### Types & Utilities
- `lib/types/roles.ts` - UserRole enum and types
- `lib/auth/roles.ts` - Server-side role checking functions
- `lib/auth/client-roles.ts` - Client-side role checking functions

### Pages
- `app/admin/page.tsx` - Admin dashboard
- `app/client/page.tsx` - Client dashboard
- `app/admin/layout.tsx` - Admin layout with navigation
- `app/client/layout.tsx` - Client layout with navigation

### Components
- `components/login-form.tsx` - Login with role-based redirect
- `components/auth-button.tsx` - Shows login/logout based on auth state

### Security
- `middleware.ts` - Route protection and role-based redirects
- `supabase/migrations/001_create_user_roles.sql` - Database schema with RLS

## Customizing Dashboards

### Admin Dashboard
Edit `app/admin/page.tsx` to add:
- Custom analytics
- User management features
- System settings
- Reports

### Client Dashboard
Edit `app/client/page.tsx` to add:
- Client-specific data
- Personal settings
- Activity feeds
- Custom features

## Adding More Roles

To add additional roles (e.g., "manager", "guest"):

1. Update the enum in `lib/types/roles.ts`:
```typescript
export enum UserRole {
  ADMIN = "admin",
  CLIENT = "client",
  MANAGER = "manager",
}
```

2. Update the database constraint:
```sql
ALTER TABLE user_roles 
DROP CONSTRAINT user_roles_role_check;

ALTER TABLE user_roles 
ADD CONSTRAINT user_roles_role_check 
CHECK (role IN ('admin', 'client', 'manager'));
```

3. Create new route folders and update middleware logic

## Testing

1. **Create a test user**: Sign up at `/auth/sign-up`
2. **Verify client access**: Should redirect to `/client` after login
3. **Promote to admin**: Change role in database
4. **Verify admin access**: Login again, should redirect to `/admin`
5. **Test protection**: Try accessing `/admin` as client (should redirect)

## Security Notes

- All routes are protected by middleware
- RLS policies prevent unauthorized role changes
- Only admins can modify user roles
- Users can only read their own role
- Sessions are managed by Supabase Auth

## Troubleshooting

### "Cannot read role" error
- Ensure migration ran successfully
- Check that `user_roles` table exists
- Verify user has a role assigned

### Redirect loop
- Clear browser cookies
- Check middleware configuration
- Verify Supabase environment variables

### User stuck on wrong dashboard
- Check user's role in `user_roles` table
- Clear Next.js cache: `rm -rf .next`
- Restart dev server

## Next Steps

- Customize admin dashboard with your business logic
- Add client-specific features to client dashboard
- Implement role-based API endpoints
- Add email notifications for role changes
- Create admin tools for user management
