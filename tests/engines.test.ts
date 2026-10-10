import { describe, expect, it } from "vitest"
import { decodeBase64, encodeBase64 } from "../src/lib/base64"
import { describeCron, nextRuns } from "../src/lib/cron"
import { jsonToJava } from "../src/lib/generators/java"
import { jsonToTypeScript } from "../src/lib/generators/typescript"
import { decodeJwt, makeSampleJwt, tokenStatus } from "../src/lib/jwt"
import { diffJsonText } from "../src/lib/jsonDiff"
import { runRegex } from "../src/lib/regexRun"
import { dateInputToDate, parseTimestamp } from "../src/lib/timestamp"

const ts = { rootName: "Root", style: "interface", exportTypes: true, readonly: false } as const
const java = { rootName: "User", packageName: "", style: "pojo", jackson: true } as const

describe("JSON -> TypeScript", () => {
  it("handles nested objects, arrays, nulls and optional fields", () => {
    const out = jsonToTypeScript(
      JSON.stringify({ id: 1, name: "a", tags: ["x"], address: { city: "Pune" }, items: [{ a: 1 }, { a: 2, b: null }] }),
      ts,
    )
    expect(out).toContain("export interface Root {")
    expect(out).toContain("id: number;")
    expect(out).toContain("tags: string[];")
    expect(out).toContain("address: Address;")
    expect(out).toContain("items: Item[];")
    expect(out).toContain("b?: null;")
  })
  it("merges number types and creates unions", () => {
    const out = jsonToTypeScript(JSON.stringify({ v: [1, "a", null] }), ts)
    expect(out).toContain("v: (string | number | null)[];")
  })
  it("quotes invalid identifiers and supports type alias + readonly", () => {
    const out = jsonToTypeScript('{"first-name":"a"}', { ...ts, style: "type", readonly: true })
    expect(out).toContain('readonly "first-name": string;')
    expect(out).toContain("export type Root = {")
  })
  it("throws a friendly error for invalid JSON", () => {
    expect(() => jsonToTypeScript("{bad", ts)).toThrow(/Invalid JSON/)
  })
  it("handles array roots", () => {
    expect(jsonToTypeScript('[{"a":1}]', ts)).toContain("export type RootList = Root[];")
  })
})

describe("JSON -> Java", () => {
  const src = JSON.stringify({ id: 5000000000, user_name: "x", score: 1.5, active: true, tags: ["a"], class: "c", profile: { age: 3 } })
  it("generates a POJO with Jackson annotations", () => {
    const out = jsonToJava(src, java)
    expect(out).toContain("public class User {")
    expect(out).toContain("private Long id;")
    expect(out).toContain('@JsonProperty("user_name")')
    expect(out).toContain("private String userName;")
    expect(out).toContain("private Double score;")
    expect(out).toContain("private List<String> tags;")
    expect(out).toContain("private String classValue;")
    expect(out).toContain("public class Profile {")
    expect(out).toContain("import java.util.List;")
    expect(out).toContain("public String getUserName()")
  })
  it("supports records, lombok, public fields and package", () => {
    expect(jsonToJava(src, { ...java, style: "record" })).toContain("public record User(")
    const lombok = jsonToJava(src, { ...java, style: "lombok", packageName: "com.acme" })
    expect(lombok).toContain("@Data")
    expect(lombok).toContain("package com.acme;")
    expect(lombok).not.toContain("getUserName")
    expect(jsonToJava(src, { ...java, style: "fields", jackson: false })).toContain("public String userName;")
  })
  it("rejects primitives at the root", () => {
    expect(() => jsonToJava("42", java)).toThrow(/top level/)
  })
})

describe("JWT", () => {
  it("decodes a token and reports status", () => {
    const d = decodeJwt(makeSampleJwt(1000))
    expect(d.header.alg).toBe("HS256")
    expect(d.payload.name).toBe("John")
    expect(tokenStatus(d.payload, 2000).state).toBe("valid")
    expect(tokenStatus(d.payload, 99999).state).toBe("expired")
  })
  it("accepts a Bearer prefix and rejects garbage", () => {
    expect(decodeJwt(`Bearer ${makeSampleJwt()}`).payload.sub).toBe("101")
    expect(() => decodeJwt("abc")).toThrow()
    expect(() => decodeJwt("a.b.c")).toThrow()
  })
})

describe("Base64", () => {
  it("round-trips unicode and URL-safe variants", () => {
    const text = "Héllo, DevTools! 👋 日本語"
    expect(decodeBase64(encodeBase64(text))).toBe(text)
    const url = encodeBase64("???>>>", true)
    expect(url).not.toMatch(/[+/=]/)
    expect(decodeBase64(url)).toBe("???>>>")
  })
  it("rejects invalid input", () => {
    expect(() => decodeBase64("***")).toThrow()
  })
})

describe("Timestamp", () => {
  it("auto-detects seconds vs milliseconds", () => {
    expect(parseTimestamp("1747751400").date.toISOString()).toBe("2025-05-20T14:30:00.000Z")
    expect(parseTimestamp("1747751400000").unit).toBe("milliseconds")
    expect(() => parseTimestamp("abc")).toThrow()
  })
  it("converts UTC date input", () => {
    expect(dateInputToDate("2025-05-20T14:30", true).getTime()).toBe(1747751400000)
  })
})

describe("Cron", () => {
  it("describes and schedules", () => {
    expect(describeCron("0 9 * * 1-5")).toMatch(/09:00/)
    const runs = nextRuns("0 0 * * *", 3, true, new Date("2026-01-01T10:00:00Z"))
    expect(runs.map((r) => r.toISOString())).toEqual(["2026-01-02T00:00:00.000Z", "2026-01-03T00:00:00.000Z", "2026-01-04T00:00:00.000Z"])
    expect(() => describeCron("* * *")).toThrow()
  })
})

describe("Regex", () => {
  it("finds matches, groups and reports errors", () => {
    const r = runRegex("(?<u>\\w+)@(\\w+)\\.com", "g", "a@b.com c@d.com")
    expect(r.ok && r.matches.length).toBe(2)
    expect(r.ok && r.matches[0].named.u).toBe("a")
    expect(runRegex("(", "", "x").ok).toBe(false)
  })
  it("does not loop on empty matches", () => {
    const r = runRegex("a*", "g", "baaac")
    expect(r.ok).toBe(true)
  })
})

describe("JSON diff", () => {
  it("reports added, removed and changed", () => {
    const c = diffJsonText('{"a":1,"b":2,"c":{"x":1}}', '{"a":2,"c":{"x":1,"y":2},"d":1}')
    const key = (t: string) => c.filter((x) => x.type === t).map((x) => x.path)
    expect(key("changed")).toEqual(["$.a"])
    expect(key("removed")).toEqual(["$.b"])
    expect(key("added").sort()).toEqual(["$.c.y", "$.d"])
  })
  it("matches array items by id, or by position without ids", () => {
    const byId = diffJsonText('{"l":[{"id":1,"n":"a"},{"id":2,"n":"b"}]}', '{"l":[{"id":2,"n":"b2"},{"id":3}]}')
    expect(byId.some((x) => x.type === "changed" && x.path.endsWith(".n"))).toBe(true)
    const noId = diffJsonText('{"l":[{"n":"a"},{"n":"b"}]}', '{"l":[{"n":"a"},{"n":"c"}]}')
    expect(noId).toEqual([{ type: "changed", path: "$.l[1].n", before: "b", after: "c" }])
  })
  it("reports long string edits as a plain change", () => {
    const long = "x".repeat(200)
    const c = diffJsonText(JSON.stringify({ s: long }), JSON.stringify({ s: long + "y" }))
    expect(c).toHaveLength(1)
    expect(c[0].type).toBe("changed")
  })
  it("returns nothing for identical documents", () => {
    expect(diffJsonText('{"a":[1,2]}', '{ "a": [1, 2] }')).toEqual([])
  })
})
