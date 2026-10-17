import { useState } from "react"
import { v1, v4, v7 } from "uuid"
import Button from "@/components/Button"
import Editor from "@/components/Editor"
import { OptionSelect, OptionToggle } from "@/components/OptionControls"
import { useToolAnalytics } from "@/hooks/useToolAnalytics"
import { copyText } from "@/lib/clipboard"
import { downloadText } from "@/lib/download"
import { traceToolRun } from "@/lib/monitoring"

type Version = "v4" | "v7" | "v1"
const GEN: Record<Version, () => string> = { v4: () => v4(), v7: () => v7(), v1: () => v1() }

function generate(version: Version, count: number, upper: boolean, hyphens: boolean) {
  return Array.from({ length: count }, () => {
    let id = GEN[version]()
    if (!hyphens) id = id.replace(/-/g, "")
    return upper ? id.toUpperCase() : id
  }).join("\n")
}

export default function UuidGenerator() {
  const a = useToolAnalytics("uuid-generator")
  const [version, setVersion] = useState<Version>("v4")
  const [count, setCount] = useState(5)
  const [upper, setUpper] = useState(false)
  const [hyphens, setHyphens] = useState(true)
  const [output, setOutput] = useState(() => generate("v4", 5, false, true))
  const [copied, setCopied] = useState(false)

  const safeCount = Math.min(1000, Math.max(1, Math.floor(count) || 1))
  const run = async () => {
    a.used()
    const output = await traceToolRun("uuid-generator", safeCount * 36, () => generate(version, safeCount, upper, hyphens))
    setOutput(output)
    a.success({ option: version })
  }

  return (
    <div className="container-page max-w-5xl py-8 sm:py-10" data-track-area="tool-workspace">
      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-(--radius-card) border border-slate-200 bg-surface p-3 sm:gap-4 sm:p-4">
        <OptionSelect label="Version" value={version} onChange={(v) => setVersion(v as Version)} options={[{ value: "v4", label: "v4 (random)" }, { value: "v7", label: "v7 (time-ordered)" }, { value: "v1", label: "v1 (timestamp)" }]} />
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold text-slate-600">How many (1–1000)</span>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={1000}
            className="h-11 w-28 rounded-(--radius-control) border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-800 outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-50"
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
          />
        </label>
        <OptionToggle label="UPPERCASE" checked={upper} onChange={setUpper} />
        <OptionToggle label="Hyphens" checked={hyphens} onChange={setHyphens} />
      </div>
      <Editor label="Generated UUIDs" value={output} readOnly badge={version.toUpperCase()} lineNumbers />
      <div className="mt-4 flex flex-wrap gap-2">
        <Button data-track="uuid.generate" onClick={() => void run()} className="w-full sm:w-auto">Generate UUIDs</Button>
        <Button
          variant="secondary"
          data-track="uuid.copy"
          icon={copied ? "check" : "copy"}
          onClick={async () => {
            if (await copyText(output)) { a.copy(); setCopied(true); setTimeout(() => setCopied(false), 1800) }
          }}
        >
          {copied ? "Copied" : "Copy"}
        </Button>
        <Button data-track="uuid.download" variant="secondary" icon="download" onClick={() => { downloadText("uuids.txt", output + "\n"); a.download() }}>Download</Button>
      </div>
      <p className="mt-4 text-xs text-slate-400">Generated in your browser with a cryptographically secure random source. Nothing is uploaded.</p>
    </div>
  )
}
