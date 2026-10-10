/**
 * Error monitoring (Sentry). Nothing else in the app imports @sentry/react.
 *
 * PRIVACY RULES (do not relax):
 *  - No session replay, no PII, no request bodies, no console/input breadcrumbs.
 *  - JSON.parse/SyntaxError messages can quote the user's pasted text, so
 *    exception messages are redacted before leaving the browser.
 *  - Report error TYPES and the tool name, never the data being processed.
 */
import type * as SentryType from "@sentry/react"

const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined
const enabled =
  Boolean(dsn) && (import.meta.env.PROD || import.meta.env.VITE_MONITORING_IN_DEV === "true")

let sentry: typeof SentryType | null = null
const queue: Array<(s: typeof SentryType) => void> = []

function whenReady(fn: (s: typeof SentryType) => void) {
  if (!enabled) return
  if (sentry) fn(sentry)
  else queue.push(fn)
}

/** Messages that may contain pasted content are replaced with a safe constant. */
function redact(message: string | undefined, type: string | undefined) {
  if (!message) return message
  const risky =
    type === "SyntaxError" ||
    /JSON|Unexpected token|Unexpected end|is not valid|Invalid regular expression|atob|base64/i.test(message)
  return risky ? `${type ?? "Error"}: [message redacted]` : message.slice(0, 200)
}

export function initMonitoring() {
  if (!enabled || !dsn) return
  const load = async () => {
    const Sentry = await import("@sentry/react")
    Sentry.init({
      dsn,
      environment: import.meta.env.MODE,
      tracesSampleRate: 0, // performance is covered by PostHog web vitals
      maxValueLength: 200,
      ignoreErrors: [
        "ResizeObserver loop limit exceeded",
        "ResizeObserver loop completed with undelivered notifications",
        "Non-Error promise rejection captured",
      ],
      denyUrls: [/extensions\//i, /^chrome:\/\//i, /^moz-extension:\/\//i, /^safari-extension:\/\//i],
      beforeBreadcrumb(crumb) {
        // console logs and input/click breadcrumbs can contain what the user typed
        if (crumb.category === "console" || crumb.category?.startsWith("ui.")) return null
        return crumb
      },
      beforeSend(event) {
        delete event.user
        delete event.request?.data
        delete event.request?.cookies
        delete event.extra
        event.exception?.values?.forEach((v) => {
          v.value = redact(v.value, v.type)
        })
        if (event.message) event.message = redact(event.message, undefined)
        return event
      },
    })
    sentry = Sentry
    queue.splice(0).forEach((fn) => fn(Sentry))
  }
  if ("requestIdleCallback" in window) window.requestIdleCallback(() => void load())
  else setTimeout(() => void load(), 1)
}

/** Report a caught error. Pass the tool slug and a stage label only. */
export function captureError(error: unknown, context: { tool?: string; stage?: string } = {}) {
  whenReady((s) => s.captureException(error, { tags: context }))
}
