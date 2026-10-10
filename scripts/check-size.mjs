// Performance budget: fails the build if JavaScript chunks grow past agreed limits (gzip).
import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { gzipSync } from "node:zlib"

const dir = join("dist", "assets")
const BUDGET_KB = { entry: 110, anyChunk: 170 }
const rows = []
let failed = false
for (const f of readdirSync(dir).filter((f) => f.endsWith(".js"))) {
  const kb = gzipSync(readFileSync(join(dir, f))).length / 1024
  rows.push([f, kb])
}
rows.sort((a, b) => b[1] - a[1])
const html = readFileSync(join("dist", "index.html"), "utf8")
const entry = /src="\/assets\/([^"]+\.js)"/.exec(html)?.[1]

console.log("\nJavaScript size (gzip):")
for (const [f, kb] of rows) {
  const limit = f === entry ? BUDGET_KB.entry : BUDGET_KB.anyChunk
  const over = kb > limit
  if (over) failed = true
  console.log(`  ${over ? "✗" : "✓"} ${f.padEnd(44)} ${kb.toFixed(1).padStart(6)} KB${f === entry ? "  (entry, loads on every page)" : ""}`)
}
if (failed) {
  console.error("\nBundle budget exceeded. Lazy-load the heavy code or drop a dependency.")
  process.exit(1)
}
