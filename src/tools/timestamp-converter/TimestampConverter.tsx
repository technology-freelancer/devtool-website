import { useEffect, useMemo, useState } from "react"
import Button from "@/components/Button"
import CopyIconButton from "@/components/CopyIconButton"
import ErrorNote from "@/components/ErrorNote"
import { OptionSelect } from "@/components/OptionControls"
import { useDebouncedUsage } from "@/hooks/useDebouncedUsage"
import { useToolAnalytics } from "@/hooks/useToolAnalytics"
import { dateInputToDate, parseTimestamp, relativeTime, toDateTimeLocal, type Unit } from "@/lib/timestamp"

function Row({ label, value, onCopy }: { label: string; value: string; onCopy?: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="min-w-0">
        <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">{label}</span>
        <span className="mt-1 block break-words font-mono text-sm font-bold text-slate-800">{value}</span>
      </div>
      <CopyIconButton text={value} label={`Copy ${label}`} onCopy={onCopy} />
    </div>
  )
}

export default function TimestampConverter() {
  const analytics = useToolAnalytics("timestamp-converter")
  const [now, setNow] = useState(() => Date.now())
  const [input, setInput] = useState(() => String(Math.floor(Date.now() / 1000)))
  const [unit, setUnit] = useState<Unit>("auto")
  const [dateValue, setDateValue] = useState(() => toDateTimeLocal(new Date()))
  const [utc, setUtc] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const forward = useMemo(() => {
    if (!input.trim()) return null
    try {
      return { ...parseTimestamp(input, unit), error: null as string | null }
    } catch (e) {
      return { date: null, unit: null, error: e instanceof Error ? e.message : "Invalid timestamp" }
    }
  }, [input, unit])

  const backward = useMemo(() => {
    try {
      return { date: dateInputToDate(dateValue, utc), error: null as string | null }
    } catch (e) {
      return { date: null, error: e instanceof Error ? e.message : "Invalid date" }
    }
  }, [dateValue, utc])

  useDebouncedUsage("timestamp-converter", input ? `f:${input}:${unit}` : "", forward ? { error: forward.error, code: "invalid_timestamp" } : null)

  const tzName = Intl.DateTimeFormat().resolvedOptions().timeZone

  return (
    <div className="container-page max-w-6xl py-8 sm:py-10">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-(--radius-card) border border-brand-100 bg-brand-50/60 p-4 sm:p-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700">Current Unix time</span>
          <div className="mt-1 font-mono text-2xl font-extrabold text-slate-900">{Math.floor(now / 1000)}</div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => { setInput(String(Math.floor(Date.now() / 1000))); setUnit("seconds") }}>Use now</Button>
          <CopyIconButton text={String(Math.floor(now / 1000))} label="Copy current timestamp" onCopy={analytics.copy} />
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <section className="info-panel">
          <h2 className="text-base font-extrabold text-slate-900">Timestamp → Date</h2>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <label className="min-w-0 flex-1">
              <span className="mb-1.5 block text-xs font-bold text-slate-600">Unix timestamp</span>
              <input
                inputMode="numeric"
                className="h-11 w-full rounded-(--radius-control) border border-slate-200 bg-slate-50 px-3 font-mono text-sm font-bold text-slate-800 outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-50"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="1747751400"
                spellCheck={false}
              />
            </label>
            <OptionSelect label="Unit" value={unit} onChange={(v) => setUnit(v as Unit)} options={[{ value: "auto", label: "Auto-detect" }, { value: "seconds", label: "Seconds" }, { value: "milliseconds", label: "Milliseconds" }]} />
          </div>
          {forward?.error && <ErrorNote message={forward.error} />}
          {forward?.date && (
            <div className="mt-4 divide-y divide-slate-100">
              <Row label="UTC" value={forward.date.toUTCString()} onCopy={analytics.copy} />
              <Row label={`Local (${tzName})`} value={forward.date.toLocaleString(undefined, { dateStyle: "full", timeStyle: "long" })} onCopy={analytics.copy} />
              <Row label="ISO 8601" value={forward.date.toISOString()} onCopy={analytics.copy} />
              <Row label="Relative" value={relativeTime(forward.date, now)} />
              <Row label="Seconds / milliseconds" value={`${Math.floor(forward.date.getTime() / 1000)} / ${forward.date.getTime()}`} onCopy={analytics.copy} />
              <p className="pt-3 text-xs text-slate-400">Detected unit: {forward.unit}</p>
            </div>
          )}
        </section>

        <section className="info-panel">
          <h2 className="text-base font-extrabold text-slate-900">Date → Timestamp</h2>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <label className="min-w-0 flex-1">
              <span className="mb-1.5 block text-xs font-bold text-slate-600">Date and time</span>
              <input
                type="datetime-local"
                step={1}
                className="h-11 w-full rounded-(--radius-control) border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-800 outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-50"
                value={dateValue}
                onChange={(e) => setDateValue(e.target.value)}
              />
            </label>
            <OptionSelect label="Interpret as" value={utc ? "utc" : "local"} onChange={(v) => setUtc(v === "utc")} options={[{ value: "local", label: `Local (${tzName})` }, { value: "utc", label: "UTC" }]} />
          </div>
          {backward.error && <ErrorNote message={backward.error} />}
          {backward.date && (
            <div className="mt-4 divide-y divide-slate-100">
              <Row label="Unix seconds" value={String(Math.floor(backward.date.getTime() / 1000))} onCopy={analytics.copy} />
              <Row label="Unix milliseconds" value={String(backward.date.getTime())} onCopy={analytics.copy} />
              <Row label="ISO 8601" value={backward.date.toISOString()} onCopy={analytics.copy} />
            </div>
          )}
        </section>
      </div>
      <p className="mt-4 text-xs text-slate-400">All conversions happen in your browser using your device&apos;s clock and time zone.</p>
    </div>
  )
}
