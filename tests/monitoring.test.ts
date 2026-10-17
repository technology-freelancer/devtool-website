import { describe, expect, it, vi } from "vitest"
import { parseTraceSampleRate, scrubTransaction, traceToolRun } from "../src/lib/monitoring"

const asEvent = (event: object) => event as import("@sentry/core").TransactionEvent

describe("Sentry privacy-safe tracing", () => {
  it("strips query strings and hashes and removes request/user/IP data", () => {
    const event = asEvent({
      transaction: "https://devtools.example/jwt-decoder?token=SECRET#claims",
      user: { id: "user-secret", ip_address: "192.0.2.1", email: "person@example.com" },
      contexts: { user: { email: "person@example.com" }, request: { headers: { Authorization: "SECRET" } } },
      request: {
        url: "https://devtools.example/jwt-decoder?token=SECRET#claims",
        headers: { Authorization: "SECRET" },
        cookies: "session=SECRET",
        data: { token: "SECRET" },
        ip_address: "192.0.2.1",
        query_string: "token=SECRET",
        fragment: "claims",
      },
      spans: [
        { span_id: "one", trace_id: "trace", start_timestamp: 0, status: "ok", data: { url: "https://devtools.example/tool?input=SECRET#out" }, description: "GET https://devtools.example/tool?input=SECRET#out" },
      ],
      tags: { tool: "jwt-decoder" },
    })

    const scrubbed = scrubTransaction(event)
    const json = JSON.stringify(scrubbed)
    expect(event.transaction).toContain("?token=SECRET")
    expect(event.request?.headers).toHaveProperty("Authorization")
    expect(scrubbed.transaction).toBe("https://devtools.example/jwt-decoder")
    expect(scrubbed.request?.url).toBe("https://devtools.example/jwt-decoder")
    expect(scrubbed.spans?.[0]?.description).toBe("GET https://devtools.example/tool")
    expect(scrubbed.spans?.[0]?.data?.url).toBe("https://devtools.example/tool")
    expect(scrubbed.request).not.toHaveProperty("headers")
    expect(scrubbed.request).not.toHaveProperty("cookies")
    expect(scrubbed.request).not.toHaveProperty("data")
    expect(scrubbed.user).toBeUndefined()
    expect(scrubbed.contexts).not.toHaveProperty("user")
    expect(scrubbed.contexts).not.toHaveProperty("request")
    expect(scrubbed.tags?.tool).toBe("jwt-decoder")
    expect(json).not.toMatch(/SECRET|token|192\.0\.2\.1|person@example\.com|claims/i)
  })

  it("drops spans whose URL host is a PostHog host", () => {
    const event = asEvent({
      spans: [
        { span_id: "keep", trace_id: "trace", start_timestamp: 0, status: "ok", data: { url: "https://devtools.example/tool?x=1" } },
        { span_id: "drop-description", trace_id: "trace", start_timestamp: 0, status: "ok", description: "POST https://us.i.posthog.com/e/?distinct_id=PRIVATE" },
        { span_id: "drop-url", trace_id: "trace", start_timestamp: 0, status: "ok", data: { url: "https://eu.posthog.com/capture/?token=PRIVATE" } },
      ],
    })
    const scrubbed = scrubTransaction(event)
    expect(scrubbed.spans).toHaveLength(1)
    expect(scrubbed.spans?.[0]?.span_id).toBe("keep")
  })

  it("clamps the configured trace sample rate and defaults to 0.1", () => {
    expect(parseTraceSampleRate(undefined)).toBe(0.1)
    expect(parseTraceSampleRate("")).toBe(0.1)
    expect(parseTraceSampleRate("not-a-number")).toBe(0.1)
    expect(parseTraceSampleRate("-2")).toBe(0)
    expect(parseTraceSampleRate("0.35")).toBe(0.35)
    expect(parseTraceSampleRate("5")).toBe(1)
  })

  it("runs the function normally when the lazy Sentry SDK is not loaded", async () => {
    const fn = vi.fn(() => "result")
    await expect(traceToolRun("jwt-decoder", 999, fn)).resolves.toBe("result")
    expect(fn).toHaveBeenCalledOnce()
  })
})
