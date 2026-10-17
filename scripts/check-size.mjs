// Performance budget: fails the build if JavaScript chunks grow past agreed limits (gzip).
import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { gzipSync } from "node:zlib"

const dir = join("dist", "assets")
const BUDGET_KB = { entry: 110, anyChunk: 170, sentry: 170 }
const rows = []
let failed = false
for (const f of readdirSync(dir).filter((f) => f.endsWith(".js"))) {
  const source = readFileSync(join(dir, f))
  const kb = gzipSync(source).length / 1024
  const isSentry = /sentry/i.test(f) || /instrumentPageLoad|sentry\.origin/.test(source.toString("utf8"))
  rows.push([f, kb, isSentry])
}
rows.sort((a, b) => b[1] - a[1])
const html = readFileSync(join("dist", "index.html"), "utf8")
const entry = /src="\/assets\/([^"]+\.js)"/.exec(html)?.[1]

console.log("\nJavaScript size (gzip):")
for (const [f, kb, isSentry] of rows) {
  const limit = f === entry ? BUDGET_KB.entry : isSentry ? BUDGET_KB.sentry : BUDGET_KB.anyChunk
  const over = kb > limit
  if (over) failed = true
  console.log(`  ${over ? "✗" : "✓"} ${f.padEnd(44)} ${kb.toFixed(1).padStart(6)} KB${f === entry ? "  (entry, loads on every page)" : isSentry ? `  (Sentry, budget ${BUDGET_KB.sentry} KB)` : ""}`)
}
if (failed) {
  console.error("\nBundle budget exceeded. Lazy-load the heavy code or drop a dependency.")
  process.exit(1)
}
