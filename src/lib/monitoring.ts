/**
 * Error monitoring (Sentry). Nothing else in the app imports @sentry/react.
 *
 * PRIVACY RULES (do not relax):
 *  - No session replay, no PII, no request bodies, no console/input breadcrumbs.
 *  - Exception messages are always replaced because parsers can quote pasted data.
 *  - Spans contain only tool slugs and coarse input-size buckets, never data.
 */
import type * as SentryType from "@sentry/react"
import type { TransactionEvent } from "@sentry/core"

// Sentry DSNs are public browser identifiers; this fallback keeps tracing configured when build-time env injection is missing.
const dsn = (import.meta.env.VITE_SENTRY_DSN as string | undefined)
  || "https://764e9df4f4dc7278f81a94d39ffff597@o4512227911401472.ingest.us.sentry.io/4512227917299712"
const monitoringInDev = (import.meta.env.VITE_MONITORING_IN_DEV as string | undefined) ?? "true"
const enabled =
  Boolean(dsn) && (import.meta.env.PROD || monitoringInDev === "true")

export function parseTraceSampleRate(value: string | undefined) {
  if (value === undefined || value.trim() === "") return 0.1
  const parsed = Number(value)
  return Number.isFinite(parsed) ? Math.min(1, Math.max(0, parsed)) : 0.1
}

const tracesSampleRate = parseTraceSampleRate(
  (import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE as string | undefined) ?? "0.1",
)
let sentry: typeof SentryType | null = null
let started = false
const queue: Array<(s: typeof SentryType) => void> = []

function whenReady(fn: (s: typeof SentryType) => void) {
  if (!enabled) return
  if (sentry) fn(sentry)
  else queue.push(fn)
}

function stripQueryAndHash(value: string) {
  const cut = value.search(/[?#]/)
  const withoutQuery = cut < 0 ? value : value.slice(0, cut)
  return withoutQuery.replace(/(https?:\/\/)[^/@\s]+@/gi, "$1")
}

function isPostHogUrl(value: string) {
  const match = /https?:\/\/[^\s"'<>]+/i.exec(value)
  if (!match) return false
  try {
    const host = new URL(match[0]).hostname.toLowerCase()
    return host === "posthog.com" || host.endsWith(".posthog.com") || host.endsWith(".posthog.dev")
  } catch {
    return false
  }
}

/** Scrub every user-controlled URL/PII field from a transaction before it leaves the browser. */
export function scrubTransaction(event: TransactionEvent) {
  const scrubbed: TransactionEvent = {
    ...event,
    contexts: event.contexts ? { ...event.contexts } : undefined,
    request: event.request ? { ...event.request } : undefined,
    spans: event.spans?.map((span) => ({ ...span, data: { ...span.data } })),
  }
  if (scrubbed.transaction) scrubbed.transaction = stripQueryAndHash(scrubbed.transaction)
  delete scrubbed.user
  delete scrubbed.contexts?.user
  delete scrubbed.contexts?.request
  if (scrubbed.request) {
    delete scrubbed.request.headers
    delete scrubbed.request.cookies
    delete scrubbed.request.data
    delete (scrubbed.request as unknown as Record<string, unknown>).ip_address
    delete scrubbed.request.query_string
    delete (scrubbed.request as unknown as Record<string, unknown>).fragment
    if (scrubbed.request.url) scrubbed.request.url = stripQueryAndHash(scrubbed.request.url)
  }
  if (scrubbed.spans) {
    scrubbed.spans = scrubbed.spans
      .filter((span) => {
        if (span.description && isPostHogUrl(span.description)) return false
        return !Object.entries(span.data ?? {}).some(([key, value]) =>
          /url|uri|href|target/i.test(key) && typeof value === "string" && isPostHogUrl(value),
        )
      })
      .map((span) => {
        if (span.description) span.description = stripQueryAndHash(span.description)
        if (span.data) {
          for (const [key, value] of Object.entries(span.data)) {
            if (/user|ip|cookie|authorization|token|secret|password|input|output|body|header/i.test(key)) {
              delete span.data[key]
            } else if (/url|uri|href|target/i.test(key) && typeof value === "string") {
              span.data[key] = stripQueryAndHash(value)
            }
          }
        }
        return span
      })
  }
  return scrubbed
}

/** Messages can quote the visitor's pasted text, so ship only the exception type. */
function redact(_message: string | undefined, type: string | undefined) {
  return _message ? `${type ?? "Error"}: [message redacted]` : _message
}

export function initMonitoring() {
  if (!enabled || !dsn || started) return
  started = true
  const load = async () => {
    const Sentry = await import("@sentry/react")
    Sentry.init({
      dsn,
      environment: import.meta.env.MODE,
      tracesSampleRate,
      tracePropagationTargets: [],
      // Sentry's default streamed lifecycle skips beforeSendTransaction; static mode is required for our scrubber.
      traceLifecycle: "static",
      integrations: [Sentry.browserTracingIntegration({
        ignoreResourceSpans: ["resource.img", "resource.css", "resource.font", "resource.other"],
      })],
      maxValueLength: 200,
      ignoreErrors: [
        "ResizeObserver loop limit exceeded",
        "ResizeObserver loop completed with undelivered notifications",
        "Non-Error promise rejection captured",
      ],
      denyUrls: [/extensions\//i, /^chrome:\/\//i, /^moz-extension:\/\//i, /^safari-extension:\/\//i],
      beforeBreadcrumb(crumb) {
        // Drop Sentry's DOM-derived ui.* breadcrumbs; our own app.click crumbs are static and scrubbed.
        if (crumb.category === "console" || crumb.category?.startsWith("ui.")) return null
        if (crumb.category !== "app.click") {
          delete crumb.data
          if (crumb.message) crumb.message = crumb.category ?? "breadcrumb"
        }
        return crumb
      },
      beforeSend(event) {
        delete event.user
        delete event.contexts?.user
        delete event.contexts?.request
        delete event.request?.data
        delete event.request?.cookies
        delete event.request?.headers
        if (event.request) {
          const request = event.request as unknown as Record<string, unknown>
          delete request.ip_address
          delete request.query_string
          delete request.fragment
          if (event.request.url) event.request.url = stripQueryAndHash(event.request.url)
        }
        delete event.extra
        if (event.transaction) event.transaction = stripQueryAndHash(event.transaction)
        event.exception?.values?.forEach((value) => {
          value.value = redact(value.value, value.type)
        })
        if (event.message) event.message = redact(event.message, undefined)
        return event
      },
      beforeSendTransaction: scrubTransaction,
    })
    sentry = Sentry
    queue.splice(0).forEach((fn) => fn(Sentry))
  }

  // Import now so the page-load transaction is not missed; this trades a little early CPU for tracing coverage.
  void load().catch(() => { started = false })
}

/** Report a caught error. Pass the tool slug and a stage label only. */
export function captureError(error: unknown, context: { tool?: string; stage?: string } = {}) {
  whenReady((s) => s.captureException(error, { tags: context }))
}

/** Set (or clear) the current registered tool tag after the lazy Sentry SDK is ready. */
export function setMonitoringTool(slug: string | null) {
  whenReady((s) => s.setTag("tool", slug ?? undefined))
}

/** Add a low-cardinality breadcrumb produced by our privacy-filtered delegated click handler. */
export function addClickBreadcrumb(label: string, area: string) {
  whenReady((s) => s.addBreadcrumb({
    category: "app.click",
    message: label,
    level: "info",
    data: { page: typeof location === "undefined" ? "/" : location.pathname, area },
  }))
}

function inputSizeBucket(sizeBytes: number): "<1KB" | "1-10KB" | "10-100KB" | ">100KB" {
  if (sizeBytes < 1024) return "<1KB"
  if (sizeBytes <= 10 * 1024) return "1-10KB"
  if (sizeBytes <= 100 * 1024) return "10-100KB"
  return ">100KB"
}

/** Run a tool operation in a span with only its slug and a coarse input-size bucket. */
export async function traceToolRun<T>(slug: string, sizeBytes: number, fn: () => Promise<T> | T): Promise<T> {
  if (!enabled || !sentry) return fn()
  let failure: unknown
  let failed = false
  const result = await sentry.startSpan({
    name: "tool.run",
    op: "tool",
    attributes: { tool: slug, input_size_bucket: inputSizeBucket(sizeBytes) },
  }, async (span) => {
    try {
      return await fn()
    } catch (error) {
      span?.setStatus({ code: 2, message: "internal_error" })
      // Do not rethrow inside Sentry's active span: SDK exception enrichment may include the input error text.
      failure = error
      failed = true
      return undefined as T
    }
  })
  if (failed) throw failure
  return result
}