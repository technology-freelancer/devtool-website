/**
 * ui_click is the sanitized raw interaction layer and intentionally overlaps existing semantic funnel events.
 * Semantic events such as copy_clicked and tool_used remain unchanged for funnel reporting.
 */
import { currentToolSlug, track } from "./analytics"
import { addClickBreadcrumb } from "./monitoring"

const interactiveSelector = 'button, a[href], [role="button"], [role="tab"], [role="menuitem"], summary, label:has(input[type="checkbox"]), input[type="checkbox"], input[type="radio"], select'
const ignoredSelector = 'textarea, input:not([type]), input[type="text"], input[type="password"], input[type="search"], input[type="number"], input[type="email"], input[type="tel"], [contenteditable]:not([contenteditable="false"]), [data-track-ignore]'
const forbiddenTextSelector = 'textarea, input, pre, code, [data-sensitive], .code-area'
const emailPattern = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i
const urlPattern = /\b(?:https?:\/\/|www\.)\S+|\b(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/\S*)?/i
const longTokenPattern = /[\p{L}\p{N}]{16,}/u

type Area = "header" | "footer" | "main" | "consent-banner" | "tool-workspace" | "tool-guide" | "other"
type ElementKind = "button" | "link" | "tab" | "toggle" | "select" | "summary" | "other"
type Burst = { lastClick: number; count: number; fired: boolean; timer: ReturnType<typeof setTimeout> }

function safeCandidate(value: string) {
  const collapsed = value.replace(/\s+/g, " ").trim()
  if (!collapsed || emailPattern.test(collapsed) || urlPattern.test(collapsed) || longTokenPattern.test(collapsed)) return "unlabeled"
  if (collapsed.split(" ").filter(Boolean).length > 6) return "unlabeled"
  return collapsed.slice(0, 40)
}

/** Return a short, static label without ever reading a form value or code/input content. */
export function safeLabel(el: Element): string {
  const tracked = el.getAttribute("data-track")
  if (tracked) {
    const label = tracked.replace(/\s+/g, " ").trim()
    return emailPattern.test(label) || longTokenPattern.test(label) ? "unlabeled" : label.slice(0, 40)
  }
  for (const attr of ["aria-label", "title"]) {
    const value = el.getAttribute(attr)
    if (value) return safeCandidate(value)
  }

  if (el.tagName === "SELECT" || el.matches(forbiddenTextSelector) || el.closest(forbiddenTextSelector) || el.querySelector(forbiddenTextSelector)) {
    return "unlabeled"
  }
  return safeCandidate(el.textContent ?? "")
}

function elementKind(el: Element): ElementKind {
  if (el.matches('[role="tab"]')) return "tab"
  if (el.matches('input[type="checkbox"], input[type="radio"]')) return "toggle"
  if (el.matches("select")) return "select"
  if (el.matches("summary")) return "summary"
  if (el.matches("a[href]")) return "link"
  if (el.matches('button, [role="button"], [role="menuitem"]')) return "button"
  return "other"
}

function areaFor(el: Element): Area {
  const landmark = el.closest("[data-track-area], header, footer, main")
  const tagged = landmark?.getAttribute("data-track-area")
  if (tagged === "consent-banner" || tagged === "tool-workspace" || tagged === "tool-guide") return tagged
  if (landmark?.tagName === "HEADER") return "header"
  if (landmark?.tagName === "FOOTER") return "footer"
  if (landmark?.tagName === "MAIN") return "main"
  return "other"
}

function linkTarget(el: Element) {
  if (!el.matches("a[href]")) return undefined
  try {
    const url = new URL((el as HTMLAnchorElement).href, location.href)
    if (url.protocol !== "http:" && url.protocol !== "https:") return undefined
    return url.origin === location.origin ? url.pathname : url.hostname
  } catch {
    return undefined
  }
}

function countBurst(el: Element, now: number, bursts: WeakMap<Element, Burst>) {
  let burst = bursts.get(el)
  if (!burst || now - burst.lastClick > 1000) {
    if (burst) clearTimeout(burst.timer)
    burst = { lastClick: now, count: 0, fired: false, timer: setTimeout(() => bursts.delete(el), 1000) }
    bursts.set(el, burst)
  }
  burst.lastClick = now
  burst.count += 1
  clearTimeout(burst.timer)
  burst.timer = setTimeout(() => bursts.delete(el), 1000)
  return burst
}

let disposeCurrent: (() => void) | undefined

/** Install one delegated click listener. Returns a cleanup function for isolated tests. */
export function initClickTracking() {
  if (disposeCurrent) return disposeCurrent
  const bursts = new WeakMap<Element, Burst>()
  const handler = (event: MouseEvent) => {
    const target = event.target
    if (!(target instanceof Element) || target.closest(ignoredSelector)) return
    const interactive = target.closest(interactiveSelector)
    if (!interactive) return

    const label = safeLabel(interactive)
    const area = areaFor(interactive)
    const page = location.pathname
    const tool = currentToolSlug(page)
    const targetPathOrHost = linkTarget(interactive)
    const props = {
      element: elementKind(interactive),
      label,
      area,
      page,
      ...(tool ? { tool } : {}),
      ...(targetPathOrHost ? { target: targetPathOrHost } : {}),
    }
    track("ui_click", props)
    addClickBreadcrumb(label, area)

    if (interactive.matches("a[href]")) {
      try {
        const url = new URL((interactive as HTMLAnchorElement).href, location.href)
        if ((url.protocol === "http:" || url.protocol === "https:") && url.origin !== location.origin) {
          track("outbound_click", { host: url.hostname, area, page })
        }
      } catch { /* ignore invalid link targets */ }
    }

    const burst = countBurst(interactive, Date.now(), bursts)
    if (burst.count >= 3 && !burst.fired) {
      burst.fired = true
      track("rage_click", { element: props.element, label, page })
    }
  }

  document.addEventListener("click", handler, { capture: true })
  disposeCurrent = () => {
    document.removeEventListener("click", handler, { capture: true })
    disposeCurrent = undefined
  }
  return disposeCurrent
}