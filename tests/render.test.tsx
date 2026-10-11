import { renderToString } from "react-dom/server"
import { MemoryRouter } from "react-router-dom"
import { describe, expect, it } from "vitest"
import { render, routes } from "../src/entry-server"
import JsonToJava from "../src/tools/json-to-java/JsonToJava"
import JsonToTypeScript from "../src/tools/json-to-typescript/JsonToTypeScript"
import JwtDecoder from "../src/tools/jwt-decoder/JwtDecoder"
import CronGenerator from "../src/tools/cron-generator/CronGenerator"
import SqlFormatter from "../src/tools/sql-formatter/SqlFormatter"
import RegexTester from "../src/tools/regex-tester/RegexTester"
import ApiResponseFormatter from "../src/tools/api-response-formatter/ApiResponseFormatter"
import UuidGenerator from "../src/tools/uuid-generator/UuidGenerator"
import Base64Converter from "../src/tools/base64-converter/Base64Converter"
import TimestampConverter from "../src/tools/timestamp-converter/TimestampConverter"
import JsonDiff from "../src/tools/json-diff/JsonDiff"
import { tools } from "../src/tools/registry"
import { toolComponents } from "../src/tools/components"
import { canonicalUrl } from "../src/lib/seo"

const components = { JsonToJava, JsonToTypeScript, JwtDecoder, CronGenerator, SqlFormatter, RegexTester, ApiResponseFormatter, UuidGenerator, Base64Converter, TimestampConverter, JsonDiff }

describe("tool workspaces render without errors", () => {
  for (const [name, C] of Object.entries(components)) {
    it(name, () => {
      const html = renderToString(<MemoryRouter><C /></MemoryRouter>)
      expect(html.length).toBeGreaterThan(200)
    })
  }
})

describe("registry and pre-render", () => {
  it("every tool has a component, SEO text and unique slug", () => {
    expect(new Set(tools.map((t) => t.slug)).size).toBe(tools.length)
    expect(new Set(tools.map((t) => t.seoTitle)).size).toBe(tools.length)
    expect(new Set(tools.map((t) => t.seoDescription)).size).toBe(tools.length)
    for (const t of tools) {
      expect(toolComponents[t.slug], t.slug).toBeDefined()
      expect(`${t.seoTitle} | DevTools`.length).toBeLessThanOrEqual(64)
      expect(t.seoDescription.length).toBeLessThanOrEqual(155)
      expect(t.steps.length).toBeGreaterThanOrEqual(2)
      expect(t.faqs.length).toBeGreaterThanOrEqual(2)
    }
  })
  it("pre-renders every route with a title, description and canonical", async () => {
    for (const url of routes) {
      const { html, head } = await render(url)
      expect(html.length, url).toBeGreaterThan(500)
      expect(head, url).toContain("<title>")
      expect(head, url).toContain('name="description"')
      expect(head, url).toContain('rel="canonical"')
      expect(head, url).toContain(`href="${canonicalUrl(url)}"`)
      expect(html, url).not.toContain("<title>")
    }
  })
  it("tool pages include structured data and the Learn content in the static HTML", async () => {
    const { html, head } = await render("/json-to-java")
    expect(head).toContain("application/ld+json")
    expect(head).toContain("FAQPage")
    expect(html.replace(/<!-- -->/g, "")).toContain("How to use JSON to Java")
    expect(html).toContain("snake_case keys")
    expect(html.replace(/<!-- -->/g, "")).toContain("Last updated: October 2026")
    expect(html).toContain("What is a JSON to Java converter?")
  })
  it("every tool page has a Learn section in its static HTML", async () => {
    for (const t of tools) {
      const { html } = await render(`/${t.slug}`)
      expect(html, t.slug).toContain("Further reading")
      expect(html.replace(/<!-- -->/g, ""), t.slug).toContain("Last updated:")
    }
  })
  it("unknown URLs render a noindex 404", async () => {
    const { head } = await render("/nope")
    expect(head).toContain("noindex")
  })
})
