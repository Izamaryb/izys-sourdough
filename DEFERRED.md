# Deferred / Hold-off Features

This file tracks features that are wired into the codebase but intentionally paused or not yet configured. Re-enable them before launch when you have the required accounts/credentials.

## 1. SMS Notifications (Twilio)

**Status:** Wired but not configured — `lib/sms.ts` no-ops and logs the prepared message to the console.

**What works:**
- Customer order confirmation SMS
- Customer "ready for pickup" status SMS
- Admin new-order SMS alert (if implemented in future)

**Required to activate:**
1. Create a free [Twilio](https://www.twilio.com/try-twilio) account.
2. Purchase a Twilio phone number.
3. Add to `.env.local` / hosting secrets:
   ```
   TWILIO_ACCOUNT_SID=your-account-sid
   TWILIO_AUTH_TOKEN=your-auth-token
   TWILIO_FROM_NUMBER=+15555550123
   ```
4. Test with a real phone number. SMS will start sending automatically.

**Why held off:** Small operation; email is enough for now. SMS also has a per-message cost.

## 2. Error Tracking (Sentry)

**Status:** Wired but not configured — SDK is installed and initialized but has no DSN, so it silently no-ops.

**What works:**
- API route errors are captured via `lib/logger.ts` → `Sentry.captureException`
- Uncaught client/server errors are captured
- Source map upload and ad-blocker tunneling are configured

**Required to activate:**
1. Sign up at [sentry.io/signup](https://sentry.io/signup).
2. Create a project with platform **Next.js**.
3. Copy the DSN and add to `.env.local` / hosting secrets:
   ```
   NEXT_PUBLIC_SENTRY_DSN=https://...@o0.ingest.sentry.io/0
   SENTRY_DSN=https://...@o0.ingest.sentry.io/0
   ```
4. (Optional, for readable production stack traces) Add:
   ```
   SENTRY_ORG=your-org-slug
   SENTRY_PROJECT=your-project-slug
   SENTRY_AUTH_TOKEN=your-auth-token
   ```

**Why held off:** DSN requires a separate Sentry account.

## 3. Admin New-Order Alert

**Status:** Fully wired and ready. Sends a plain-text order summary to `ADMIN_NOTIFICATION_EMAIL` via existing SMTP.

**Required to activate:**
- Ensure `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD`, `EMAIL_FROM` are set.
- Add to `.env.local` / hosting secrets:
  ```
  ADMIN_NOTIFICATION_EMAIL=your-personal-email@example.com
  ```

This one is **not** technically held off — it is ready as soon as the env var is set.
