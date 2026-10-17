import { useEffect, useMemo, useRef, useState } from "react"
import ErrorNote from "@/components/ErrorNote"
import Editor from "@/components/Editor"
import { OptionToggle } from "@/components/OptionControls"
import { useDebouncedUsage } from "@/hooks/useDebouncedUsage"
import { runRegex, type RegexMatch, type RegexResult } from "@/lib/regexRun"
import { traceToolRun } from "@/lib/monitoring"

const SAMPLE_TEXT = "john@example.com\nhello@devtools.com\nnot-an-email\nteam@product.io"
const FLAGS = [
  { f: "g", label: "g global" },
  { f: "i", label: "i ignore case" },
  { f: "m", label: "m multiline" },
  { f: "s", label: "s dotAll" },
  { f: "u", label: "u unicode" },
]
const TIMEOUT_MS = 1500

type State = { running: boolean; matches: RegexMatch[]; truncated: boolean; error: string | null; code: string }
const IDLE: State = { running: false, matches: [], truncated: false, error: null, code: "" }

export default function RegexTester() {
  const [pattern, setPattern] = useState("[\\w.-]+@[\\w.-]+\\.\\w+")
  const [flags, setFlags] = useState("g")
  const [text, setText] = useState(SAMPLE_TEXT)
  const [state, setState] = useState<State>(IDLE)
  const worker = useRef<Worker | null>(null)
  const reqId = useRef(0)

  useEffect(() => {
    if (!pattern) { setState(IDLE); return }
    const id = ++reqId.current
    const timer = setTimeout(() => {
      const finish = (r: RegexResult) => {
        if (id !== reqId.current) return
        setState(r.ok ? { running: false, matches: r.matches, truncated: r.truncated, error: null, code: "" } : { ...IDLE, error: r.error, code: r.code })
      }
      const sizeBytes = new Blob([pattern, text]).size
      const execution = traceToolRun("regex-tester", sizeBytes, () => {
        if (typeof Worker === "undefined") return runRegex(pattern, flags, text)
        worker.current?.terminate() // a previous run may still be busy
        const w = new Worker(new URL("./regexWorker.ts", import.meta.url), { type: "module" })
        worker.current = w
        setState((s) => ({ ...s, running: true }))
        return new Promise<RegexResult>((resolve, reject) => {
          const guard = setTimeout(() => {
            w.terminate()
            if (worker.current === w) worker.current = null
            if (id === reqId.current) setState({ ...IDLE, error: "This pattern took too long to run. It may cause catastrophic backtracking, for example nested quantifiers like (a+)+.", code: "timeout" })
            reject(new Error("Regex worker timed out"))
          }, TIMEOUT_MS)
          w.onmessage = (e: MessageEvent<{ id: number; result: RegexResult }>) => {
            clearTimeout(guard)
            resolve(e.data.result)
          }
          w.onerror = () => {
            clearTimeout(guard)
            if (id === reqId.current) setState({ ...IDLE, error: "The regex could not be evaluated.", code: "worker_error" })
            reject(new Error("Regex worker failed"))
          }
        })
      })
      void execution.then(finish, () => undefined)
    }, 250)
    return () => clearTimeout(timer)
  }, [pattern, flags, text])

  useEffect(() => () => worker.current?.terminate(), [])

  useDebouncedUsage("regex-tester", pattern ? `${pattern.length}:${flags}:${text.length}` : "", state.running ? null : { error: state.error, code: state.code })

  const toggleFlag = (f: string) => setFlags((cur) => (cur.includes(f) ? cur.replace(f, "") : cur + f))

  const segments = useMemo(() => {
    const out: { text: string; hit: boolean }[] = []
    let pos = 0
    for (const m of state.matches) {
      if (m.end === m.index || m.index < pos) continue
      if (m.index > pos) out.push({ text: text.slice(pos, m.index), hit: false })
      out.push({ text: text.slice(m.index, m.end), hit: true })
      pos = m.end
    }
    if (pos < text.length) out.push({ text: text.slice(pos), hit: false })
    return out
  }, [state.matches, text])

  return (
    <div className="container-page py-8 sm:py-10" data-track-area="tool-workspace">
      <div className="rounded-(--radius-card) border border-slate-200 bg-surface p-4 shadow-(--shadow-card) sm:p-6">
        <label htmlFor="regex-pattern" className="text-sm font-extrabold text-slate-800">Regular Expression</label>
        <div className="mt-3 flex items-center rounded-xl border border-slate-200 bg-slate-50 font-mono focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-50">
          <span className="pl-4 text-lg font-bold text-slate-400">/</span>
          <input
            id="regex-pattern"
            className="h-12 min-w-0 flex-1 bg-transparent px-2 font-bold text-slate-800 outline-none"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="your pattern"
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
          />
          <span className="pr-4 text-lg font-bold text-slate-400">/{flags}</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {FLAGS.map(({ f, label }) => <OptionToggle key={f} label={label} dataTrack={`regex.flag.${f}`} checked={flags.includes(f)} onChange={() => toggleFlag(f)} />)}
        </div>
      </div>

      {state.error && <ErrorNote message={state.error} />}

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Editor label="Test string" value={text} onChange={setText} badge="TEXT" lineNumbers />
        <div className="flex min-h-72 flex-col overflow-hidden rounded-(--radius-card) border border-slate-200 bg-surface shadow-(--shadow-card) sm:min-h-[25rem]">
          <div className="flex h-12 shrink-0 items-center justify-between border-b border-slate-200 bg-slate-50 px-4">
            <span className="text-sm font-extrabold text-slate-800">Test Results</span>
            <span className="rounded-md border border-slate-200 bg-surface px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {state.running ? "Running…" : `${state.matches.length}${state.truncated ? "+" : ""} ${state.matches.length === 1 ? "match" : "matches"}`}
            </span>
          </div>
          <div className="min-h-0 flex-1 overflow-auto p-4 sm:p-5">
            <pre className="code-area m-0 whitespace-pre-wrap break-words text-slate-700">
              {segments.map((s, i) => s.hit ? <mark key={i} className="rounded bg-brand-100 px-0.5 text-brand-900">{s.text}</mark> : <span key={i}>{s.text}</span>)}
            </pre>
          </div>
        </div>
      </div>

      {state.matches.length > 0 && (
        <div className="info-panel mt-5">
          <h2 className="text-base font-extrabold text-slate-900">Match details</h2>
          <ul className="mt-4 max-h-96 divide-y divide-slate-100 overflow-auto">
            {state.matches.slice(0, 200).map((m, i) => (
              <li key={`${m.index}-${i}`} className="py-3 text-sm">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <code className="min-w-0 break-all font-mono font-bold text-slate-800">{m.text || "(empty match)"}</code>
                  <span className="text-xs font-semibold text-slate-400">#{i + 1} · position {m.index}–{m.end}</span>
                </div>
                {(m.groups.length > 0 || Object.keys(m.named).length > 0) && (
                  <dl className="mt-2 grid gap-x-4 gap-y-1 text-xs sm:grid-cols-2">
                    {m.groups.map((g, gi) => (
                      <div key={gi} className="flex gap-2"><dt className="font-bold text-slate-400">Group {gi + 1}</dt><dd className="break-all font-mono text-slate-700">{g ?? "undefined"}</dd></div>
                    ))}
                    {Object.entries(m.named).map(([k, v]) => (
                      <div key={k} className="flex gap-2"><dt className="font-bold text-brand-600">{k}</dt><dd className="break-all font-mono text-slate-700">{v ?? "undefined"}</dd></div>
                    ))}
                  </dl>
                )}
              </li>
            ))}
          </ul>
          {state.matches.length > 200 && <p className="mt-3 text-xs text-slate-400">Showing the first 200 matches.</p>}
        </div>
      )}
      <p className="mt-4 text-xs text-slate-400">Uses your browser&apos;s JavaScript RegExp engine, in a background thread. Nothing is uploaded.</p>
    </div>
  )
}
