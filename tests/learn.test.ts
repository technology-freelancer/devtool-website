import { describe, expect, it } from "vitest"
import { computeExamples } from "../src/tools/learn/computeExamples"
import { EX } from "../src/tools/learn/examples"
import { learnLoaders } from "../src/tools/learn"
import type { Block } from "../src/tools/learn/types"
import { tools } from "../src/tools/registry"

const words = (b: Block): number => {
  const count = (s: string) => s.split(/\s+/).filter(Boolean).length
  switch (b.t) {
    case "p": case "note": return count(b.text)
    case "ul": return b.items.reduce((n, i) => n + count(i), 0)
    case "table": return [...b.head, ...b.rows.flat()].reduce((n, c) => n + count(c), 0)
    case "code": return 0
  }
}

describe("Learn content", () => {
  it("worked examples match the real tool output (run: npx tsx scripts/gen-learn-examples.ts to refresh)", () => {
    expect(JSON.parse(JSON.stringify(EX))).toEqual(JSON.parse(JSON.stringify(computeExamples())))
  })

  for (const t of tools) {
    it(`${t.slug}: substantial, valid content`, async () => {
      expect(learnLoaders[t.slug], "missing loader").toBeDefined()
      const { default: learn } = await learnLoaders[t.slug]()
      const total = learn.sections.flatMap((s) => s.blocks).reduce((n, b) => n + words(b), 0)
      expect(total, "word count").toBeGreaterThanOrEqual(450)
      expect(learn.sections.length).toBeGreaterThanOrEqual(4)
      expect(learn.sections.some((s) => s.blocks.some((b) => b.t === "code" || b.t === "table"))).toBe(true)
      expect(learn.references.length).toBeGreaterThanOrEqual(2)
      for (const r of learn.references) expect(r.href).toMatch(/^https:\/\//)
      for (const r of learn.related) {
        expect(tools.some((x) => x.slug === r.slug), `related ${r.slug}`).toBe(true)
        expect(r.slug).not.toBe(t.slug)
      }
      const headings = learn.sections.map((s) => s.heading)
      expect(new Set(headings).size).toBe(headings.length)
    })
  }
})