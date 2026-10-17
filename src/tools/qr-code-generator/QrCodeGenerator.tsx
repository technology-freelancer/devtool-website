import { useEffect, useMemo, useState, type ReactNode } from "react"
import Button from "@/components/Button"
import ErrorNote from "@/components/ErrorNote"
import { OptionSelect } from "@/components/OptionControls"
import { useDebouncedUsage } from "@/hooks/useDebouncedUsage"
import { useToolAnalytics } from "@/hooks/useToolAnalytics"
import { downloadText } from "@/lib/download"
import { traceToolRun } from "@/lib/monitoring"
import { buildPayload, colourWarning, qrPngDataUrl, qrSvg, type Ecc, type QrFields, type QrKind, type QrStyle } from "@/lib/qr"

const KINDS: { value: QrKind; label: string; track: string }[] = [
  { value: "text", label: "Link or text", track: "qr.type.text" }, { value: "wifi", label: "Wi-Fi", track: "qr.type.wifi" }, { value: "email", label: "Email", track: "qr.type.email" }, { value: "phone", label: "Phone", track: "qr.type.phone" },
]
const INITIAL: QrFields = { text: "https://example.com", ssid: "", password: "", security: "WPA", hidden: false, email: "", subject: "", body: "", phone: "" }
const input = "h-11 w-full rounded-(--radius-control) border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-800 outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-50"

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-600">{label}</span>{children}</label>
}

export default function QrCodeGenerator() {
  const analytics = useToolAnalytics("qr-code-generator")
  const [kind, setKind] = useState<QrKind>("text")
  const [fields, setFields] = useState<QrFields>(INITIAL)
  const [ecc, setEcc] = useState<Ecc>("M")
  const [margin, setMargin] = useState(4)
  const [dark, setDark] = useState("#000000")
  const [light, setLight] = useState("#ffffff")
  const [width, setWidth] = useState(512)
  const [svg, setSvg] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [code, setCode] = useState("")
  const set = <K extends keyof QrFields>(key: K, value: QrFields[K]) => setFields((current) => ({ ...current, [key]: value }))
  const payload = useMemo(() => buildPayload(kind, fields), [kind, fields])
  const style: QrStyle = { ecc, margin, dark, light, width }
  const warning = colourWarning(dark, light)

  useEffect(() => {
    if (!payload) { setSvg(""); setError(null); return }
    let cancelled = false
    const timer = setTimeout(async () => {
      try {
        const result = await traceToolRun("qr-code-generator", new Blob([payload]).size, () => qrSvg(payload, { ecc, margin, dark, light, width }))
        if (!cancelled) { setSvg(result); setError(null); setCode("") }
      } catch (e) {
        if (!cancelled) { setSvg(""); setError(e instanceof Error ? e.message : "Could not create the QR code."); setCode("qr_too_big") }
      }
    }, 200)
    return () => { cancelled = true; clearTimeout(timer) }
  }, [payload, ecc, margin, dark, light, width])

  useDebouncedUsage("qr-code-generator", payload ? `${kind}:${payload.length}:${ecc}` : "", { error, code })
  const previewUrl = svg ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}` : ""

  const downloadPng = async () => {
    if (!payload) return
    try {
      const url = await traceToolRun("qr-code-generator", new Blob([payload]).size, () => qrPngDataUrl(payload, style))
      const link = document.createElement("a")
      link.href = url
      link.download = "qr-code.png"
      document.body.appendChild(link)
      link.click()
      link.remove()
      analytics.download()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create the PNG.")
    }
  }

  return (
    <div className="container-page py-8 sm:py-10" data-track-area="tool-workspace">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-5">
          <section className="info-panel">
            <h2 className="text-base font-extrabold text-slate-900">1. What should the QR code contain?</h2>
            <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="QR code type">
              {KINDS.map((item) => (
                <button key={item.value} data-track={item.track} role="tab" aria-selected={kind === item.value} type="button" onClick={() => setKind(item.value)} className={`min-h-11 rounded-(--radius-control) border px-4 text-sm font-bold transition ${kind === item.value ? "border-brand-600 bg-brand-600 text-white" : "border-slate-200 bg-surface text-slate-700 hover:border-slate-300"}`}>
                  {item.label}
                </button>
              ))}
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {kind === "text" && <div className="sm:col-span-2"><Field label="Link or text"><textarea className={`${input} h-auto min-h-28 py-3 font-mono`} value={fields.text} onChange={(e) => set("text", e.target.value)} placeholder="https://example.com" spellCheck={false} /></Field></div>}
              {kind === "wifi" && <>
                <Field label="Network name (SSID)"><input className={input} value={fields.ssid} onChange={(e) => set("ssid", e.target.value)} autoComplete="off" /></Field>
                <Field label="Password"><input className={input} type="text" value={fields.password} onChange={(e) => set("password", e.target.value)} disabled={fields.security === "nopass"} autoComplete="off" /></Field>
                <OptionSelect label="Security" value={fields.security} onChange={(v) => set("security", v as QrFields["security"])} options={[{ value: "WPA", label: "WPA/WPA2/WPA3" }, { value: "WEP", label: "WEP" }, { value: "nopass", label: "No password" }]} />
                <label className="flex h-11 items-center gap-2.5 self-end text-sm font-bold text-slate-700"><input type="checkbox" className="h-4 w-4 accent-brand-600" checked={fields.hidden} onChange={(e) => set("hidden", e.target.checked)} /> Hidden network</label>
              </>}
              {kind === "email" && <>
                <Field label="Email address"><input className={input} type="email" value={fields.email} onChange={(e) => set("email", e.target.value)} placeholder="name@example.com" /></Field>
                <Field label="Subject (optional)"><input className={input} value={fields.subject} onChange={(e) => set("subject", e.target.value)} /></Field>
                <div className="sm:col-span-2"><Field label="Message (optional)"><input className={input} value={fields.body} onChange={(e) => set("body", e.target.value)} /></Field></div>
              </>}
              {kind === "phone" && <Field label="Phone number"><input className={input} type="tel" value={fields.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 98765 43210" /></Field>}
            </div>
          </section>
          <section className="info-panel">
            <h2 className="text-base font-extrabold text-slate-900">2. Customize</h2>
            <div className="mt-4 flex flex-wrap items-end gap-3 sm:gap-4">
              <OptionSelect label="Error correction" value={ecc} onChange={(v) => setEcc(v as Ecc)} options={[{ value: "L", label: "Low (7%)" }, { value: "M", label: "Medium (15%)" }, { value: "Q", label: "Quartile (25%)" }, { value: "H", label: "High (30%)" }]} />
              <OptionSelect label="Download size" value={String(width)} onChange={(v) => setWidth(Number(v))} options={[256, 512, 768, 1024].map((n) => ({ value: String(n), label: `${n} × ${n} px` }))} />
              <OptionSelect label="Quiet zone" value={String(margin)} onChange={(v) => setMargin(Number(v))} options={[{ value: "4", label: "4 modules (standard)" }, { value: "2", label: "2 modules" }, { value: "0", label: "None" }]} />
              <Field label="Code colour"><input type="color" value={dark} onChange={(e) => setDark(e.target.value)} className="h-11 w-16 cursor-pointer rounded-(--radius-control) border border-slate-200 bg-slate-50 p-1" aria-label="Code colour" /></Field>
              <Field label="Background"><input type="color" value={light} onChange={(e) => setLight(e.target.value)} className="h-11 w-16 cursor-pointer rounded-(--radius-control) border border-slate-200 bg-slate-50 p-1" aria-label="Background colour" /></Field>
              <Button data-track="qr.reset-colours" variant="ghost" onClick={() => { setDark("#000000"); setLight("#ffffff") }}>Reset colours</Button>
            </div>
            {warning && <p role="alert" className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{warning}</p>}
          </section>
        </div>
        <aside className="info-panel h-fit lg:sticky lg:top-24">
          <h2 className="text-base font-extrabold text-slate-900">3. Preview and download</h2>
          <div className="mt-4 grid aspect-square place-items-center overflow-hidden rounded-xl border border-slate-200" style={{ background: light }}>
            {previewUrl ? <img src={previewUrl} alt={`QR code containing your ${KINDS.find((k) => k.value === kind)?.label.toLowerCase()}`} className="h-full w-full" width={width} height={width} /> : <span className="px-6 text-center text-sm text-slate-400">Your QR code appears here</span>}
          </div>
          {error && <ErrorNote message={error} />}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button data-track="qr.download.png" disabled={!svg} icon="download" onClick={() => void downloadPng()}>PNG</Button>
            <Button data-track="qr.download.svg" disabled={!svg} variant="secondary" icon="download" onClick={() => { downloadText("qr-code.svg", svg, "image/svg+xml"); analytics.download() }}>SVG</Button>
          </div>
          <p className="mt-4 text-xs leading-5 text-slate-400">Static QR code: the data is stored in the image itself. It never expires, has no tracking and does not depend on our server. Test-scan it before you print.</p>
        </aside>
      </div>
    </div>
  )
}
