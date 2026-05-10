/**
 * Lightweight Sentry wrapper.
 * Import captureException from here instead of @sentry/nextjs directly
 * so we can safely no-op when SENTRY_DSN is not set.
 */

export function captureException(err: unknown, context?: Record<string, unknown>) {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return;

  // Keep Sentry optional: clean builds should not require @sentry/nextjs.
  const loadSentry = new Function(
    "specifier",
    "return import(specifier)"
  ) as (specifier: string) => Promise<{
    captureException: (error: unknown) => void;
    withScope: (callback: (scope: { setExtra: (key: string, value: unknown) => void }) => void) => void;
  }>;

  loadSentry("@sentry/nextjs")
    .then(({ captureException: sentryCapture, withScope }) => {
      if (context) {
        withScope((scope) => {
          Object.entries(context).forEach(([key, value]) => scope.setExtra(key, value));
          sentryCapture(err);
        });
      } else {
        sentryCapture(err);
      }
    })
    .catch(() => {});
}
