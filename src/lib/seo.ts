import { SITE, SITE_IMAGE } from "@/config/site"

export type SeoMeta = {
  title: string
  description: string
  path: string
  noindex?: boolean
  jsonLd?: object[]
  image?: string
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
const ld = (o: object) => JSON.stringify(o).replace(/</g, "\\u003c")
export const canonicalUrl = (path: string) => (path === "/" ? SITE.url + "/" : SITE.url + path)

/* ---------- server side: collected during pre-render ---------- */
let serverHead: SeoMeta | null = null
export const setServerHead = (m: SeoMeta) => { serverHead = m }
export const takeServerHead = () => { const h = serverHead; serverHead = null; return h }

/** HTML for <head> (used by the pre-render script). */
export function headHtml(m: SeoMeta): string {
  const url = canonicalUrl(m.path)
  const tags = [
    `<title>${esc(m.title)}</title>`,
    `<meta name="description" content="${esc(m.description)}" />`,
    m.noindex ? `<meta name="robots" content="noindex" />` : `<link rel="canonical" href="${esc(url)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:locale" content="en_US" />`,
    `<meta property="og:site_name" content="${esc(SITE.name)}" />`,
    `<meta property="og:title" content="${esc(m.title)}" />`,
    `<meta property="og:description" content="${esc(m.description)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    `<meta property="og:image" content="${esc(m.image ?? SITE_IMAGE)}" />`,
    `<meta property="og:image:alt" content="${esc(SITE.imageAlt)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(m.title)}" />`,
    `<meta name="twitter:description" content="${esc(m.description)}" />`,
    `<meta name="twitter:image" content="${esc(m.image ?? SITE_IMAGE)}" />`,
    ...(m.jsonLd ?? []).map((o) => `<script type="application/ld+json" data-seo>${ld(o)}</script>`),
  ]
  return tags.join("\n    ")
}

/* ---------- client side: keep head in sync on route changes ---------- */
function upsert(selector: string, create: () => HTMLElement, set: (el: HTMLElement) => void) {
  let el = document.head.querySelector<HTMLElement>(selector)
  if (!el) { el = create(); document.head.appendChild(el) }
  set(el)
}
const meta = (attr: "name" | "property", key: string, content: string) =>
  upsert(`meta[${attr}="${key}"]`, () => { const m = document.createElement("meta"); m.setAttribute(attr, key); return m }, (el) => el.setAttribute("content", content))

export function applyHead(m: SeoMeta) {
  const url = canonicalUrl(m.path)
  document.title = m.title
  meta("name", "description", m.description)
  meta("property", "og:type", "website")
  meta("property", "og:site_name", SITE.name)
  meta("property", "og:title", m.title)
  meta("property", "og:description", m.description)
  meta("property", "og:url", url)
  meta("property", "og:locale", "en_US")
  meta("property", "og:image", m.image ?? SITE_IMAGE)
  meta("property", "og:image:alt", SITE.imageAlt)
  meta("name", "twitter:card", "summary_large_image")
  meta("name", "twitter:title", m.title)
  meta("name", "twitter:description", m.description)
  meta("name", "twitter:image", m.image ?? SITE_IMAGE)
  const robots = document.head.querySelector('meta[name="robots"]')
  if (m.noindex) meta("name", "robots", "noindex")
  else robots?.remove()
  const canonical = document.head.querySelector('link[rel="canonical"]')
  if (m.noindex) canonical?.remove()
  else upsert('link[rel="canonical"]', () => { const l = document.createElement("link"); l.rel = "canonical"; return l }, (el) => el.setAttribute("href", url))
  document.head.querySelectorAll("script[data-seo]").forEach((s) => s.remove())
  for (const o of m.jsonLd ?? []) {
    const s = document.createElement("script")
    s.type = "application/ld+json"
    s.setAttribute("data-seo", "")
    s.textContent = JSON.stringify(o)
    document.head.appendChild(s)
  }
}
