import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { JSDOM } from "jsdom"
import { describe, expect, it } from "vitest"
import { routes } from "../src/app/routes"

const baseUrl = "https://devtools-co.vercel.app"
const sitemap = readFileSync(resolve(process.cwd(), "public/sitemap.xml"), "utf8")
const robots = readFileSync(resolve(process.cwd(), "public/robots.txt"), "utf8")

describe("technical SEO assets", () => {
  it("has a valid XML sitemap containing each indexable app route exactly once", () => {
    const document = new JSDOM(sitemap, { contentType: "application/xml" }).window.document
    expect(document.querySelector("parsererror")).toBeNull()
    expect(document.documentElement.localName).toBe("urlset")
    expect(document.documentElement.namespaceURI).toBe("http://www.sitemaps.org/schemas/sitemap/0.9")

    const locations = [...document.querySelectorAll("url > loc")].map((loc) => loc.textContent)
    const expected = routes.map((route) => `${baseUrl}${route === "/" ? "/" : route}`)
    expect(locations).toEqual(expected)
    expect(new Set(locations).size).toBe(locations.length)
    expect(locations.every((url) => url?.startsWith(`${baseUrl}/`) && !url.includes("?"))).toBe(true)
    expect(document.querySelectorAll("lastmod, priority, changefreq")).toHaveLength(0)
  })

  it("allows crawling and references the production sitemap", () => {
    expect(robots).toBe(`User-agent: *\nAllow: /\n\nSitemap: ${baseUrl}/sitemap.xml\n`)
  })
})
