# Email Verification Setup Guide

This project now requires email verification for all new user sign-ups. This document explains how to set up and configure email verification.

## Overview

When users sign up, they will:
1. Fill out the registration form
2. Receive a verification email
3. Click the verification link in the email
4. Be redirected to sign in

## Setup Instructions

### 1. Get a Resend API Key

1. Go to [https://resend.com](https://resend.com)
2. Sign up for a free account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the API key

### 2. Configure Environment Variables

Update your `.env` file with the following variables:

```env
# Email Configuration
RESEND_API_KEY="re_your_actual_api_key_here"
EMAIL_FROM="noreply@yourdomain.com"
```

**Important Notes:**
- Replace `re_your_actual_api_key_here` with your actual Resend API key
- For development, you can use `onboarding@resend.dev` as the `EMAIL_FROM` address
- For production, you must verify your domain in Resend and use an email from that domain

### 3. Verify Your Domain (Production Only)

For production use:

1. Log in to your Resend dashboard
2. Go to Domains section
3. Add your domain (e.g., `yourdomain.com`)
4. Add the DNS records provided by Resend to your domain's DNS settings
5. Wait for verification (usually takes a few minutes)
6. Update `EMAIL_FROM` in your `.env` to use your verified domain

### 4. Test the Email Verification Flow

1. Start your development server:
   ```bash
   pnpm dev
   ```

2. Navigate to the sign-up page: `http://localhost:3000/auth/sign-up`

3. Fill out the registration form and submit

4. You should be redirected to `/auth/verify-email` page

5. Check your email inbox for the verification email

6. Click the verification link in the email

7. You should be redirected to `/auth/email-verified` page

8. Click "Continue to Sign In" and log in with your credentials

## Email Template

The verification email includes:
- A personalized greeting (if name is provided)
- A prominent "Verify Email Address" button
- A fallback text link (in case the button doesn't work)
- Professional styling with gradient colors
- Clear instructions

## Routes

### New Routes Added

- `/auth/verify-email` - Page shown after sign-up, prompting users to check their email
- `/auth/email-verified` - Success page shown after clicking the verification link

### Modified Routes

- `/auth/sign-up` - Now redirects to `/auth/verify-email` after successful registration
- `/supplier/register` - Now redirects to `/auth/verify-email` after successful registration

## Configuration Details

### Better Auth Configuration

The email verification is configured in `src/lib/auth.ts`:

```typescript
emailAndPassword: {
  enabled: true,
  requireEmailVerification: true,
  sendVerificationEmail: async ({ user, url }) => {
    // Custom email sending logic using Resend
  },
}
```

### Database Schema

The `verification` table in the database stores verification tokens:
- `id` - Unique identifier
- `identifier` - User email
- `value` - Verification token
- `expiresAt` - Token expiration timestamp
- `createdAt` - Token creation timestamp

## Troubleshooting

### Email Not Received

1. Check spam/junk folder
2. Verify `RESEND_API_KEY` is correct in `.env`
3. Check Resend dashboard for delivery logs
4. Ensure `EMAIL_FROM` is properly configured

### Verification Link Not Working

1. Check that the link hasn't expired
2. Verify `BETTER_AUTH_URL` is set correctly in `.env`
3. Check browser console for errors

### Development Testing

For development, you can use Resend's test mode:
- Use `onboarding@resend.dev` as the sender
- Emails will be delivered to your registered email
- No domain verification required

## Security Considerations

- Verification tokens expire after a set period (configured by Better Auth)
- Tokens are single-use only
- Email verification is required before users can sign in
- Unverified users cannot access protected routes

## Support

If you encounter issues:
1. Check the Resend dashboard for email delivery status
2. Review server logs for error messages
3. Ensure all environment variables are properly set
4. Verify database migrations are up to date

