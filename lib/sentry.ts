/**
 * Lightweight Sentry wrapper.
 * Import captureException from here instead of @sentry/nextjs directly
 * so we can safely no-op when SENTRY_DSN is not set.
 */

export function captureException(err: unknown, context?: Record<string, unknown>) {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return;

  // Dynamic import so Sentry bundle is only loaded when DSN is configured
  import("@sentry/nextjs").then(({ captureException: sentryCapture, withScope }) => {
    if (context) {
      withScope((scope) => {
        Object.entries(context).forEach(([k, v]) => scope.setExtra(k, v));
        sentryCapture(err);
      });
    } else {
      sentryCapture(err);
    }
  }).catch(() => {});
}
