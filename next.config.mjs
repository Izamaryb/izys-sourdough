import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // Upload source maps for readable stack traces (requires SENTRY_AUTH_TOKEN)
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Route Sentry requests through your server to avoid ad-blockers
  tunnelRoute: '/monitoring',
});
