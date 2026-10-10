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
    for (const t of tools) {
      expect(toolComponents[t.slug], t.slug).toBeDefined()
      expect(t.seoTitle.length).toBeLessThanOrEqual(75)
      expect(t.seoDescription.length).toBeLessThanOrEqual(175)
      expect(t.steps.length).toBeGreaterThanOrEqual(2)
      expect(t.faqs.length).toBeGreaterThanOrEqual(2)
    }
  })
  it("pre-renders every route with a title, description and canonical", () => {
    for (const url of routes) {
      const { html, head } = render(url)
      expect(html.length, url).toBeGreaterThan(500)
      expect(head, url).toContain("<title>")
      expect(head, url).toContain('name="description"')
      expect(head, url).toContain('rel="canonical"')
      expect(html, url).not.toContain("<title>")
    }
  })
  it("tool pages include structured data and real content", () => {
    const { html, head } = render("/json-to-java")
    expect(head).toContain("application/ld+json")
    expect(head).toContain("FAQPage")
    expect(html.replace(/<!-- -->/g, "")).toContain("How to use JSON to Java")
    expect(html).toContain("snake_case keys")
  })
  it("unknown URLs render a noindex 404", () => {
    const { head } = render("/nope")
    expect(head).toContain("noindex")
  })
})
