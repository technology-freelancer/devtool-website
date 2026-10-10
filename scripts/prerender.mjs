// Pre-renders every route to static HTML so search engines (and AdSense) see real content.
// Run by `npm run build` after the client and SSR builds.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from "node:fs"
import { join } from "node:path"
import { pathToFileURL } from "node:url"

const dist = "dist"
const mod = await import(pathToFileURL(join(process.cwd(), "dist-ssr", "entry-server.js")).href)
const { render, routes, SITE } = mod

let template = readFileSync(join(dist, "index.html"), "utf8")
template = template.replace(/<title>[\s\S]*?<\/title>/, "").replace(/<meta name="description"[^>]*>/, "")

// Preload the main font so text renders without a swap flash (better LCP).
const assets = existsSync(join(dist, "assets")) ? readdirSync(join(dist, "assets")) : []
const font = assets.find((f) => /^manrope-latin-wght-normal.*\.woff2$/.test(f))
const preload = font ? `<link rel="preload" href="/assets/${font}" as="font" type="font/woff2" crossorigin />\n    ` : ""

function page(url, noindexFallback = false) {
  const { html, head } = render(url)
  const route = url.length > 1 ? url.replace(/\/+$/, "") : url
  const headBlock = head || (noindexFallback ? '<meta name="robots" content="noindex" />' : "")
  return template
    .replace("<!--seo-head-->", `${preload}${headBlock}`)
    .replace('<div id="root"></div>', `<div id="root" data-route="${route}">${html}</div>`)
}

for (const url of routes) {
  const file = url === "/" ? join(dist, "index.html") : join(dist, `${url.slice(1)}.html`)
  mkdirSync(join(file, ".."), { recursive: true })
  writeFileSync(file, page(url))
}

// Real 404 page (Cloudflare Pages, Netlify and Vercel serve /404.html for unknown URLs)
writeFileSync(join(dist, "404.html"), page("/page-not-found", true))

// sitemap.xml + robots.txt
const today = new Date().toISOString().slice(0, 10)
const urls = routes
  .map((u) => `  <url><loc>${SITE.url}${u === "/" ? "/" : u}</loc><lastmod>${today}</lastmod></url>`)
  .join("\n")
writeFileSync(join(dist, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`)
writeFileSync(join(dist, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE.url}/sitemap.xml\n`)

console.log(`Pre-rendered ${routes.length} pages + 404.html, sitemap.xml, robots.txt`)
if (SITE.url.includes("example.com")) {
  console.warn("\n⚠  VITE_SITE_URL is not set. Canonical URLs and the sitemap use a placeholder domain.\n   Set it in .env before deploying (see DEPLOYMENT.md).\n")
}
if (SITE.email.includes("example.com")) {
  console.warn("⚠  VITE_CONTACT_EMAIL is not set. The legal pages show a placeholder email.\n")
}
