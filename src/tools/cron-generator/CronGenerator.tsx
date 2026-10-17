import { useMemo, useState } from "react"
import Button from "@/components/Button"
import CopyIconButton from "@/components/CopyIconButton"
import ErrorNote from "@/components/ErrorNote"
import { useDebouncedUsage } from "@/hooks/useDebouncedUsage"
import { useToolAnalytics } from "@/hooks/useToolAnalytics"
import { describeCron, nextRuns } from "@/lib/cron"
import { ToolError } from "@/lib/toolError"

const FIELDS = [
  { label: "Minute", hint: "0-59" },
  { label: "Hour", hint: "0-23" },
  { label: "Day", hint: "1-31" },
  { label: "Month", hint: "1-12" },
  { label: "Weekday", hint: "0-6 (Sun=0)" },
]

const PRESETS: [string, string, string][] = [
  ["Every minute", "* * * * *", "cron.preset.every-minute"],
  ["Every 5 minutes", "*/5 * * * *", "cron.preset.every-5-minutes"],
  ["Hourly", "0 * * * *", "cron.preset.hourly"],
  ["Daily at midnight", "0 0 * * *", "cron.preset.daily-at-midnight"],
  ["Daily at 9:00", "0 9 * * *", "cron.preset.daily-at-9"],
  ["Weekdays at 9:00", "0 9 * * 1-5", "cron.preset.weekdays-at-9"],
  ["Weekly (Sunday)", "0 0 * * 0", "cron.preset.weekly-sunday"],
  ["Monthly (1st)", "0 0 1 * *", "cron.preset.monthly-1st"],
]

export default function CronGenerator() {
  const analytics = useToolAnalytics("cron-generator")
  const [values, setValues] = useState(["0", "0", "*", "*", "*"])
  const [utc, setUtc] = useState(false)
  const expression = values.map((v) => v.trim()).join(" ")

  const result = useMemo(() => {
    try {
      return { text: describeCron(expression), runs: nextRuns(expression, 5, utc), error: null as string | null, code: undefined as string | undefined }
    } catch (e) {
      return { text: "", runs: [] as Date[], error: e instanceof Error ? e.message : "Invalid expression", code: e instanceof ToolError ? e.code : "invalid_cron" }
    }
  }, [expression, utc])

  useDebouncedUsage("cron-generator", expression, result)

  const fmt = (d: Date) =>
    d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "medium", ...(utc ? { timeZone: "UTC" } : {}) }) + (utc ? " UTC" : "")

  const setAll = (expr: string) => {
    const parts = expr.trim().split(/\s+/)
    if (parts.length === 5) setValues(parts)
  }

  return (
    <div className="container-page max-w-5xl py-8 sm:py-10" data-track-area="tool-workspace">
      <div className="rounded-(--radius-card) border border-slate-200 bg-surface p-4 shadow-(--shadow-card) sm:p-8">
        <h2 className="text-lg font-extrabold text-slate-900">Build your expression</h2>
        <p className="mt-1 text-sm text-slate-500">Set each field, use * for every value, or pick a preset.</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {PRESETS.map(([label, expr, trackName]) => (
            <button
              key={label}
              data-track={trackName}
              type="button"
              onClick={() => setAll(expr)}
              className={`min-h-9 rounded-full border px-3 text-xs font-bold transition ${expression === expr ? "border-brand-300 bg-brand-50 text-brand-700" : "border-slate-200 bg-surface text-slate-600 hover:border-slate-300"}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-5">
          {FIELDS.map((f, i) => (
            <label key={f.label} className={i === 4 ? "col-span-2 md:col-span-1" : ""}>
              <span className="mb-2 block text-xs font-bold text-slate-600">{f.label} <span className="font-medium text-slate-400">{f.hint}</span></span>
              <input
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-center font-mono font-bold text-slate-800 outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-50"
                value={values[i]}
                onChange={(e) => setValues(values.map((v, j) => (j === i ? e.target.value : v)))}
                autoCapitalize="off"
                spellCheck={false}
              />
            </label>
          ))}
        </div>

        <label className="mt-5 block">
          <span className="mb-2 block text-xs font-bold text-slate-600">Or paste an existing expression to explain it</span>
          <input
            className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 font-mono text-slate-800 outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-50"
            placeholder="*/15 9-17 * * 1-5"
            onChange={(e) => setAll(e.target.value)}
            spellCheck={false}
          />
        </label>

        <div className="mt-8 rounded-2xl bg-slate-950 p-5 text-white sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-6">
          <div className="min-w-0">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Generated expression</span>
            <code className="mt-2 block break-all font-mono text-xl font-bold tracking-widest sm:text-2xl">{expression}</code>
            <p className="mt-2 text-sm text-slate-300">{result.error ? "Fix the expression to see its meaning." : `${result.text}.`}</p>
          </div>
          <div className="mt-5 sm:mt-0">
            <Button data-track="cron.copy" variant="secondary" onClick={() => { navigator.clipboard?.writeText(expression); analytics.copy() }} icon="copy">Copy expression</Button>
          </div>
        </div>
        {result.error && <ErrorNote message={result.error} />}
      </div>

      {!result.error && (
        <div className="info-panel mt-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-extrabold text-slate-900">Next 5 runs</h2>
            <div className="flex items-center gap-1 rounded-xl border border-slate-200 p-1 text-xs font-bold">
              {[false, true].map((u) => (
                <button key={String(u)} data-track="cron.utc-toggle" type="button" onClick={() => setUtc(u)} className={`min-h-8 rounded-lg px-3 ${utc === u ? "bg-brand-600 text-white" : "text-slate-600"}`}>
                  {u ? "UTC" : "Local time"}
                </button>
              ))}
            </div>
          </div>
          <ol className="mt-4 divide-y divide-slate-100">
            {result.runs.map((d) => (
              <li key={d.toISOString()} className="flex items-center justify-between gap-3 py-2.5 text-sm font-semibold text-slate-700">
                <span>{fmt(d)}</span>
                <CopyIconButton text={d.toISOString()} label="Copy ISO time" />
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}
