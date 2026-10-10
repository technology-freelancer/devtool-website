/**
 * Central analytics wrapper (PostHog). Nothing else in the app imports posthog-js.
 *
 * PRIVACY RULES (do not relax):
 *  - Only event names, tool slugs and small counters are ever sent.
 *  - NEVER send what the user pasted or what a tool produced (JSON, JWT, SQL, API responses...).
 *  - Autocapture and session replay stay OFF: they can record textarea content.
 *  - The AnalyticsProps type below has no free-text field on purpose.
 */
import type { PostHog } from "posthog-js"
import { getConsent } from "./consent"

export type AnalyticsEvent =
  | "tool_open"
  | "tool_used"
  | "tool_success"
  | "tool_error"
  | "copy_clicked"
  | "download_clicked"
  | "clear_clicked"
  | "related_tool_clicked"
  | "search_used"

/** Allowed event properties. Deliberately restrictive: no arbitrary strings from user input. */
export type AnalyticsProps = {
  tool?: string // tool slug, e.g. "json-to-java"
  to_tool?: string // slug of the related tool that was clicked
  error_type?: string // short code, e.g. "invalid_json" (never the error text of the input)
  option?: string // a setting name, e.g. "lombok"
  result_count?: number
  query_length?: number
  query?: string // ONLY for the tool-list search box, truncated
}

const key = import.meta.env.VITE_POSTHOG_KEY as string | undefined
const host = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) ?? "https://us.i.posthog.com"
const enabled =
  Boolean(key) && (import.meta.env.PROD || import.meta.env.VITE_ANALYTICS_IN_DEV === "true")

let started = false
let client: PostHog | null = null
const queue: Array<(ph: PostHog) => void> = []

/** Runs now if PostHog is loaded, otherwise once it has loaded. */
function whenReady(fn: (ph: PostHog) => void) {
  if (!enabled) return
  if (client) fn(client)
  else queue.push(fn)
}

export function initAnalytics() {
  if (!enabled || started || !key) return
  started = true
  // Lazy-load the SDK so it never blocks first render (keeps Core Web Vitals healthy).
  const load = async () => {
    const { default: posthog } = await import("posthog-js")
    posthog.init(key, {
      api_host: host,
      defaults: "2026-05-30",
      autocapture: false, // would record clicks/inputs
      capture_pageview: false, // we send page views ourselves on every route change
      capture_pageleave: true,
      capture_dead_clicks: false,
      disable_session_recording: true, // never record sessions: users paste secrets
      disable_surveys: true,
      person_profiles: "identified_only", // anonymous visitors only; no person profiles
      respect_dnt: true, // honour Do Not Track
      // Nothing is stored on the device until the visitor allows it (see ConsentBanner).
      persistence: getConsent() === "granted" ? "localStorage+cookie" : "memory",
    })
    client = posthog
    queue.splice(0).forEach((fn) => fn(posthog))
  }
  if ("requestIdleCallback" in window) window.requestIdleCallback(() => void load())
  else setTimeout(() => void load(), 1)
}

export function trackPageview(path: string) {
  whenReady((ph) => ph.capture("$pageview", { path }))
}

export function track(event: AnalyticsEvent, props: AnalyticsProps = {}) {
  whenReady((ph) => ph.capture(event, props))
}

/** Called when the visitor answers the consent banner. */
export function applyConsent(granted: boolean) {
  whenReady((ph) => {
    ph.set_config({ persistence: granted ? "localStorage+cookie" : "memory" })
    if (!granted) ph.reset()
  })
}
