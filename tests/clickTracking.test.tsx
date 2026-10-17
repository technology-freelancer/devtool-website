// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("../src/lib/analytics", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../src/lib/analytics")>()
  return { ...actual, track: vi.fn() }
})
vi.mock("../src/lib/monitoring", () => ({ addClickBreadcrumb: vi.fn() }))

import { scrubAnalyticsEvent, track } from "../src/lib/analytics"
import { initClickTracking } from "../src/lib/clickTracking"

let stopTracking: (() => void) | undefined

function click(element: Element) {
  element.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true }))
}

function events() {
  return vi.mocked(track).mock.calls.map(([name, props]) => ({ name, props }))
}

describe("delegated click tracking privacy", () => {
  beforeEach(() => {
    document.body.innerHTML = ""
    window.history.replaceState({}, "", "/jwt-decoder?session=PRIVATE#section")
    vi.clearAllMocks()
    stopTracking = initClickTracking()
  })

  afterEach(() => {
    stopTracking?.()
    stopTracking = undefined
  })

  it("tracks a named button with its safe area, page, and registered tool", () => {
    document.body.innerHTML = '<main data-track-area="tool-workspace"><button data-track="tool.run">Run</button></main>'
    click(document.querySelector("button")!)

    expect(events()).toEqual([{ name: "ui_click", props: {
      element: "button", label: "tool.run", area: "tool-workspace", page: "/jwt-decoder", tool: "jwt-decoder",
    } }])
  })

  it("sends only an internal pathname or an external hostname", () => {
    document.body.innerHTML = '<main><a href="/tools?token=SECRET#private">Tools page</a><a href="https://example.com/a?token=SECRET#x">Visit docs</a></main>'
    const [internal, external] = document.querySelectorAll("a")
    click(internal)
    click(external)

    expect(events()).toEqual([
      { name: "ui_click", props: { element: "link", label: "Tools page", area: "main", page: "/jwt-decoder", tool: "jwt-decoder", target: "/tools" } },
      { name: "ui_click", props: { element: "link", label: "Visit docs", area: "main", page: "/jwt-decoder", tool: "jwt-decoder", target: "example.com" } },
      { name: "outbound_click", props: { host: "example.com", area: "main", page: "/jwt-decoder" } },
    ])
    expect(JSON.stringify(events())).not.toMatch(/token|SECRET|private/i)
  })

  it("ignores textarea/text-input and data-track-ignore clicks", () => {
    document.body.innerHTML = '<main><textarea>secret</textarea><input type="text" value="SECRET"><div data-track-ignore><button data-track="private.action">Ignored</button></div></main>'
    for (const selector of ["textarea", "input", "button"]) click(document.querySelector(selector)!)
    expect(events()).toEqual([])
  })

  it.each([
    ["john@example.com", "unlabeled"],
    ["ABCDEFGHIJKLMNOPQRST", "unlabeled"],
    ["one two three four five six seven eight nine", "unlabeled"],
  ])("redacts unsafe text labels (%s)", (text, label) => {
    document.body.innerHTML = `<main><button>${text}</button></main>`
    click(document.querySelector("button")!)
    expect(events()[0]?.props?.label).toBe(label)
    expect(JSON.stringify(events())).not.toMatch(/john@example|ABCDEFGHIJKLMNOPQRST|one two three/i)
  })

  it("never includes values, placeholders, or selected-option text", () => {
    document.body.innerHTML = '<main><label><select><option value="SAFE">SAFE</option><option value="SECRET_VALUE" selected>SELECTED_SECRET_OPTION</option></select></label><label><input type="checkbox" value="CHECKBOX_SECRET" checked>Secret checkbox label</label><input type="text" placeholder="PLACEHOLDER_SECRET" value="INPUT_SECRET"></main>'
    click(document.querySelector("select")!)
    click(document.querySelector('input[type="checkbox"]')!)
    click(document.querySelector('input[type="text"]')!)

    const json = JSON.stringify(events())
    expect(events().map((event) => event.props?.label)).toEqual(["unlabeled", "unlabeled"])
    expect(json).not.toMatch(/SECRET|PLACEHOLDER|selected-option/i)
    for (const event of events()) {
      expect(event.props).not.toHaveProperty("value")
      expect(event.props).not.toHaveProperty("placeholder")
    }
  })

  it("emits exactly one rage_click for three fast clicks on one element", () => {
    document.body.innerHTML = '<main><button data-track="tool.run">Run</button></main>'
    const button = document.querySelector("button")!
    click(button)
    click(button)
    click(button)
    click(button)

    expect(events().filter((event) => event.name === "rage_click")).toEqual([
      { name: "rage_click", props: { element: "button", label: "tool.run", page: "/jwt-decoder" } },
    ])
  })

  it("only interpolates registry slugs into data-track template values", async () => {
    const { readdirSync, readFileSync } = await import("node:fs")
    const { join, relative, resolve } = await import("node:path")
    const files: string[] = []
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const path = join(dir, entry.name)
        if (entry.isDirectory()) walk(path)
        else if (path.endsWith(".tsx")) files.push(path)
      }
    }
    walk(resolve(process.cwd(), "src"))

    const dynamicAttribute = /\bdata-track\s*=\s*\{`([^`]*)`\}/g
    for (const path of files) {
      const source = readFileSync(path, "utf8")
      for (const [, template] of source.matchAll(dynamicAttribute)) {
        for (const [, interpolation] of template.matchAll(/\$\{([^}]+)\}/g)) {
          expect(interpolation.trim(), relative(process.cwd(), path)).toMatch(/^(?:tool|t|relatedTool)\.slug$/)
        }
      }
    }
  })

  it("strips SDK-enriched URL and free-text properties before PostHog sends", () => {
    const event = scrubAnalyticsEvent({
      uuid: "event-id",
      event: "ui_click",
      properties: {
        distinct_id: "anonymous-id",
        $current_url: "/jwt-decoder?token=SECRET#payload",
        $referrer: "https://example.com/?secret=SECRET",
        page: "/jwt-decoder?token=SECRET#payload",
        target: "https://example.com/a?token=SECRET#x",
        tool: "jwt-decoder",
        label: "tool.run",
        area: "tool-workspace",
        query_length: 8,
        query: "SECRET",
        text: "SECRET",
        unexpected: "SECRET",
      },
    })

    expect(event?.properties).toMatchObject({
      distinct_id: "anonymous-id",
      $current_url: "/jwt-decoder",
      page: "/jwt-decoder",
      target: "example.com",
      tool: "jwt-decoder",
      label: "tool.run",
      area: "tool-workspace",
      query_length: 8,
    })
    expect(JSON.stringify(event)).not.toMatch(/SECRET|referrer|unexpected|"query"/i)
    expect(scrubAnalyticsEvent({
      uuid: "event-id", event: "$pageleave", properties: { $current_url: "/jwt-decoder?token=SECRET", $referrer: "https://example.com/?token=SECRET" },
    })?.properties).toEqual({ $current_url: "/jwt-decoder" })
    expect(scrubAnalyticsEvent({ uuid: "event-id", event: "$exception", properties: { message: "SECRET" } })).toBeNull()
  })
})
