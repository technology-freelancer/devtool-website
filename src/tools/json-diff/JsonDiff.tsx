import { useState } from "react"
import Button from "@/components/Button"
import CopyIconButton from "@/components/CopyIconButton"
import Editor from "@/components/Editor"
import ErrorNote from "@/components/ErrorNote"
import { useToolAnalytics } from "@/hooks/useToolAnalytics"
import { diffJsonText, preview, type Change } from "@/lib/jsonDiff"
import { ToolError } from "@/lib/toolError"

const A = `{
  "name": "DevTools",
  "version": 1,
  "active": true,
  "tags": ["json", "api"],
  "owner": { "id": 7, "team": "core" }
}`
const B = `{
  "name": "DevTools Pro",
  "version": 2,
  "tags": ["json", "api", "diff"],
  "owner": { "id": 7, "team": "platform" },
  "beta": true
}`

const MARK = { added: "+", removed: "−", changed: "~" } as const
const CLASS = { added: "diff-added", removed: "diff-removed", changed: "diff-changed" } as const

const line = (c: Change) =>
  c.type === "changed" ? `~ ${c.path}: ${preview(c.before)} → ${preview(c.after)}` : c.type === "added" ? `+ ${c.path}: ${preview(c.after)}` : `− ${c.path}: ${preview(c.before)}`

export default function JsonDiff() {
  const analytics = useToolAnalytics("json-diff")
  const [a, setA] = useState(A)
  const [b, setB] = useState(B)
  const [changes, setChanges] = useState<Change[] | null>(() => diffJsonText(A, B))
  const [error, setError] = useState<string | null>(null)

  const compare = () => {
    analytics.used()
    try {
      setChanges(diffJsonText(a, b))
      setError(null)
      analytics.success()
    } catch (e) {
      setChanges(null)
      setError(e instanceof Error ? e.message : "Could not compare these documents.")
      analytics.error(e instanceof ToolError ? e.code : "unexpected")
    }
  }

  const count = (t: Change["type"]) => changes?.filter((c) => c.type === t).length ?? 0

  return (
    <div className="container-page py-8 sm:py-10">
      <div className="grid gap-5 lg:grid-cols-2">
        <Editor label="JSON A (original)" value={a} onChange={setA} badge="JSON" lineNumbers />
        <Editor label="JSON B (changed)" value={b} onChange={setB} badge="JSON" lineNumbers />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button onClick={compare} className="w-full sm:w-auto">Compare JSON</Button>
        <Button variant="secondary" icon="swap" onClick={() => { setA(b); setB(a) }}>Swap</Button>
        <Button variant="secondary" onClick={() => { setA(""); setB(""); setChanges(null); setError(null); analytics.clear() }}>Clear</Button>
      </div>
      {error && <ErrorNote message={error} />}

      {changes && (
        <div className="info-panel mt-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-extrabold text-slate-900">Differences</h2>
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">{count("added")} added</span>
              <span className="rounded-full bg-rose-50 px-2.5 py-1 text-rose-700">{count("removed")} removed</span>
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-800">{count("changed")} changed</span>
              <CopyIconButton text={changes.map(line).join("\n")} label="Copy differences" onCopy={analytics.copy} />
            </div>
          </div>
          {changes.length === 0 ? (
            <p className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm font-bold text-emerald-800">The two JSON documents are identical.</p>
          ) : (
            <div className="code-area mt-4 max-h-[28rem] space-y-1 overflow-auto">
              {changes.map((c, i) => (
                <div key={`${c.path}-${i}`} className={`${CLASS[c.type]} break-all py-0.5`}>
                  <span className="mr-2 font-bold">{MARK[c.type]}</span>
                  <span className="font-bold">{c.path}</span>
                  <span>: {c.type === "changed" ? `${preview(c.before)} → ${preview(c.after)}` : preview(c.type === "added" ? c.after : c.before)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <p className="mt-4 text-xs text-slate-400">Key order is ignored. Array items with an id are matched by id; others by position. Nothing is uploaded.</p>
    </div>
  )
}
