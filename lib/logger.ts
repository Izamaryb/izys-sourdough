import * as Sentry from '@sentry/nextjs';

/**
 * Centralized error logging. Logs to the console (always) and reports to
 * Sentry when SENTRY_DSN is configured (see instrumentation.ts /
 * sentry.server.config.ts). Safe to call with any caught error.
 */
export function logError(message: string, error: unknown): void {
  console.error(message, error);

  Sentry.captureException(error, {
    extra: { message },
  });
}
