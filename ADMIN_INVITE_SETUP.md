# Admin Invite Link Setup

This guide explains how to use the admin invite system to allow specific people to sign up as admins.

## Overview

By default, all new signups are assigned the **"client"** role. To create admin accounts, you need to share a special signup link with a secret invite token.

## Setup Steps

### 1. Add Admin Invite Token to Environment

Add this to your `.env.local` file:

```bash
ADMIN_INVITE_TOKEN=your-secure-random-token-here
```

**Important:** Use a long, random, secure string. You can generate one with:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or using OpenSSL
openssl rand -hex 32
```

### 2. Run the New Database Migration

Execute the second migration in your Supabase project:

```bash
# Via Supabase CLI
supabase db push

# Or manually in Supabase SQL Editor
# Copy and paste contents of: supabase/migrations/002_add_admin_invite_support.sql
```

This updates the trigger to check for the `admin_invite` metadata during signup.

### 3. Restart Your Development Server

After adding the environment variable:

```bash
npm run dev
```

## How to Create Admin Accounts

### Share the Admin Invite Link

Give this URL to people you want to make admins:

```
https://yourapp.com/auth/sign-up?invite=your-secure-random-token-here
```

Replace:
- `yourapp.com` with your actual domain
- `your-secure-random-token-here` with the value from your `ADMIN_INVITE_TOKEN` environment variable

### Example

If your `ADMIN_INVITE_TOKEN` is `abc123xyz789`, share:

```
https://yourapp.com/auth/sign-up?invite=abc123xyz789
```

When someone signs up using this link:
1. The system validates the token
2. If valid, they're assigned the **"admin"** role
3. After login, they're redirected to `/admin`

### Regular Client Signups

Anyone who signs up without the invite token (or with an invalid token) will be assigned the **"client"** role:

```
https://yourapp.com/auth/sign-up
```

## How It Works

### Token Validation Flow

1. User visits signup page with `?invite=TOKEN` parameter
2. Form detects the invite token
3. On submit, validates token via `/api/validate-invite`
4. If valid, includes `admin_invite: "true"` in user metadata
5. Database trigger reads metadata and assigns appropriate role

### Security Features

- Token is validated server-side via API route
- Token is never exposed in client code
- Invalid tokens result in signup failure
- Token is stored securely in environment variables

## Testing

### Test Admin Signup

1. Copy your admin invite link with the correct token
2. Open in incognito/private browser window
3. Sign up with a test email
4. Verify you're redirected to `/admin` after login
5. Check Supabase `user_roles` table - role should be "admin"

### Test Client Signup

1. Visit `/auth/sign-up` without any parameters
2. Sign up with a different email
3. Verify you're redirected to `/client` after login
4. Check Supabase `user_roles` table - role should be "client"

## Changing the Token

To rotate your admin invite token:

1. Update `ADMIN_INVITE_TOKEN` in `.env.local`
2. Restart your server
3. Share the new invite link with the updated token
4. Old invite links will stop working immediately

## Production Deployment

### Environment Variables

Make sure to set `ADMIN_INVITE_TOKEN` in your production environment:

**Vercel:**
```bash
vercel env add ADMIN_INVITE_TOKEN
```

**Netlify:**
Add in Site Settings → Environment Variables

**Other platforms:**
Add via your hosting provider's environment variable settings

### Security Best Practices

1. **Use a strong token**: At least 32 characters, random
2. **Rotate regularly**: Change the token periodically
3. **Limit sharing**: Only share with trusted individuals
4. **Monitor signups**: Check your admin list regularly
5. **Revoke access**: If token is compromised, change it immediately

## Troubleshooting

### "Invalid invite token" error

- Verify `ADMIN_INVITE_TOKEN` is set in `.env.local`
- Check that the token in the URL matches exactly
- Restart your dev server after adding the env variable

### User created as client instead of admin

- Verify the invite token was in the URL during signup
- Check the database migration ran successfully
- Look at user metadata in Supabase Auth → Users

### API route not found

- Ensure `app/api/validate-invite/route.ts` exists
- Restart your dev server
- Check for any build errors

## Files Created

- `supabase/migrations/002_add_admin_invite_support.sql` - Database trigger update
- `app/api/validate-invite/route.ts` - Token validation API
- `components/sign-up-form.tsx` - Updated to handle invite tokens
- `.env.example` - Example environment variables

## Example Invite Email

When sharing the admin invite link, you might send:

```
Subject: Admin Access to Wave

Hi [Name],

You've been invited to create an admin account for Wave.

Click this link to sign up:
https://wave.example.com/auth/sign-up?invite=abc123xyz789

This link is private - please don't share it with others.

After signing up, you'll have full admin access to the platform.

Thanks!
```

## Next Steps

- Share admin invite links with your team
- Test both admin and client signup flows
- Customize admin dashboard with your features
- Set up email notifications for new admin signups (optional)
