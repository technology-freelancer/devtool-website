/**
 * Central analytics wrapper (PostHog). Nothing else in the app imports posthog-js.
 *
 * PRIVACY RULES (do not relax):
 *  - Only event names, tool slugs and small counters are ever sent.
 *  - NEVER send what the user pasted or what a tool produced (JSON, JWT, SQL, API responses...).
 *  - Autocapture and session replay stay OFF: they can record textarea content.
 *  - The AnalyticsProps type below has no free-text field on purpose.
 */
import type { CaptureResult, PostHog } from "posthog-js"
import { getConsent } from "./consent"
import { tools } from "@/tools/registry"

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
  | "ui_click"
  | "outbound_click"
  | "rage_click"
  | "consent_choice"
  | "tool_option_changed"

/** Allowed event properties. Deliberately restrictive: no arbitrary strings from user input. */
export type AnalyticsProps = {
  tool?: string // tool slug, e.g. "json-to-java"
  to_tool?: string // slug of the related tool that was clicked
  error_type?: string // short code, e.g. "invalid_json" (never the error text of the input)
  option?: string // static setting name; never free text
  choice?: string // enumerated option values only, or "on"/"off" for toggles
  result_count?: number
  query_length?: number // count only; the search text itself is never sent
  element?: "button" | "link" | "tab" | "toggle" | "select" | "summary" | "other"
  label?: string // static/sanitized UI label, never input or output text
  area?: "header" | "footer" | "main" | "consent-banner" | "tool-workspace" | "tool-guide" | "other"
  target?: string // internal pathname or external hostname, without query/hash
  host?: string // external hostname only
  page?: string // pathname only, without query/hash
}

const safeEventNames = new Set([
  "$pageview", "$pageleave", "tool_open", "tool_used", "tool_success", "tool_error", "copy_clicked", "download_clicked",
  "clear_clicked", "related_tool_clicked", "search_used", "ui_click", "outbound_click", "rage_click",
  "consent_choice", "tool_option_changed",
])
const safePropertyNames = new Set([
  "distinct_id", "$current_url", "$initial_current_url", "$pathname", "tool", "to_tool", "error_type",
  "option", "choice", "result_count", "query_length", "element", "label", "area", "target", "host", "page", "path",
])

/** Return a tool slug only when the pathname exactly matches a registered tool route. */
export function currentToolSlug(pathname = typeof location === "undefined" ? "/" : location.pathname) {
  const slug = pathname.split(/[?#]/, 1)[0].replace(/^\/+|\/+$/g, "")
  return tools.some((tool) => tool.slug === slug) ? slug : undefined
}

/** Final PostHog safeguard for SDK-enriched properties, before any event is sent. */
export function scrubAnalyticsEvent(event: CaptureResult | null): CaptureResult | null {
  if (!event || !safeEventNames.has(event.event)) return null
  const properties = event.properties as Record<string, unknown>
  for (const key of Object.keys(properties)) {
    if (!safePropertyNames.has(key)) delete properties[key]
    else if (["$current_url", "$initial_current_url", "$pathname", "page", "path"].includes(key) && typeof properties[key] === "string") {
      properties[key] = (properties[key] as string).split(/[?#]/, 1)[0]
    } else if ((key === "tool" || key === "to_tool") && typeof properties[key] === "string") {
      if (!tools.some((tool) => tool.slug === properties[key])) delete properties[key]
    } else if (key === "target" && typeof properties[key] === "string") {
      const target = properties[key] as string
      if (target.startsWith("/")) properties[key] = target.split(/[?#]/, 1)[0]
      else if (/^https?:\/\//i.test(target)) {
        try { properties[key] = new URL(target).hostname } catch { delete properties[key] }
      }
      else properties[key] = target.split(/[/?#]/, 1)[0]
    } else if (key === "host" && typeof properties[key] === "string") {
      const hostName = properties[key] as string
      if (/^https?:\/\//i.test(hostName)) {
        try { properties[key] = new URL(hostName).hostname } catch { delete properties[key] }
      } else properties[key] = hostName.split(/[/?#]/, 1)[0]
    }
  }
  delete event.$set
  delete event.$set_once
  delete event.$unset
  return event
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
      get_current_url: () => location.pathname, // never let SDK super-properties add query strings or hashes
      before_send: scrubAnalyticsEvent,
      autocapture: false, // would record clicks/inputs
      capture_pageview: false, // we send page views ourselves on every route change
      capture_pageleave: true, // before_send below reduces its URL metadata to the pathname
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
  whenReady((ph) => ph.capture("$pageview", { path: path.split(/[?#]/, 1)[0] }))
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
