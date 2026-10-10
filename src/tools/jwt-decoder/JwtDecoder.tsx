import { useMemo, useState } from "react"
import Button from "@/components/Button"
import CopyIconButton from "@/components/CopyIconButton"
import Editor from "@/components/Editor"
import ErrorNote from "@/components/ErrorNote"
import Icon from "@/components/Icon"
import { useDebouncedUsage } from "@/hooks/useDebouncedUsage"
import { useToolAnalytics } from "@/hooks/useToolAnalytics"
import { decodeJwt, formatClaimTime, makeSampleJwt, tokenStatus, type DecodedJwt } from "@/lib/jwt"
import { ToolError } from "@/lib/toolError"

type Result = { data: DecodedJwt; error: null } | { data: null; error: string; code: string }

const STATUS_STYLE = {
  valid: "border-emerald-200 bg-emerald-50 text-emerald-800",
  expired: "border-rose-200 bg-rose-50 text-rose-800",
  "not-yet-valid": "border-amber-200 bg-amber-50 text-amber-900",
  "no-expiry": "border-slate-200 bg-slate-50 text-slate-700",
} as const

const str = (v: unknown) => (v === undefined || v === null ? null : typeof v === "string" ? v : Array.isArray(v) ? v.join(", ") : JSON.stringify(v))

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">{label}</span>
      <span className="mt-1.5 block break-words text-sm font-bold text-slate-800">{value}</span>
    </div>
  )
}

export default function JwtDecoder() {
  const analytics = useToolAnalytics("jwt-decoder")
  const [token, setToken] = useState(() => makeSampleJwt())

  const result: Result | null = useMemo(() => {
    if (!token.trim()) return null
    try {
      return { data: decodeJwt(token), error: null }
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : "Invalid token", code: e instanceof ToolError ? e.code : "invalid_jwt" }
    }
  }, [token])

  useDebouncedUsage("jwt-decoder", token ? "has-token" + token.length : "", result)

  const d = result?.data ?? null
  const status = d ? tokenStatus(d.payload) : null
  const info: [string, string | null][] = d
    ? [
        ["Algorithm", str(d.header.alg)],
        ["Type", str(d.header.typ)],
        ["Key ID", str(d.header.kid)],
        ["Issuer", str(d.payload.iss)],
        ["Subject", str(d.payload.sub)],
        ["Audience", str(d.payload.aud)],
        ["Issued at", formatClaimTime(d.payload.iat)],
        ["Expires", formatClaimTime(d.payload.exp)],
        ["Not before", formatClaimTime(d.payload.nbf)],
        ["JWT ID", str(d.payload.jti)],
      ]
    : []

  return (
    <div className="container-page py-8 sm:py-10">
      <div className="rounded-(--radius-card) border border-slate-200 bg-surface p-4 shadow-(--shadow-card) sm:p-6">
        <div className="mb-3 flex items-center justify-between gap-2">
          <label htmlFor="jwt-input" className="text-sm font-extrabold text-slate-800">JWT Token</label>
          <span className="badge">Processed locally</span>
        </div>
        <textarea
          id="jwt-input"
          className="code-area min-h-36 w-full resize-y break-all rounded-xl border border-slate-200 bg-slate-50 p-4 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-50"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Paste a JWT (eyJhbGciOi…) — it decodes as you type"
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
        />
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setToken(makeSampleJwt())}>Sample</Button>
          <Button variant="secondary" onClick={() => { setToken(""); analytics.clear() }}>Clear</Button>
        </div>
      </div>

      <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
        <span className="mt-0.5"><Icon name="shield" size={18} /></span>
        <span><strong>Security note:</strong> Decoding a JWT does not verify its signature. Never trust the claims of a token you have not verified on your server.</span>
      </div>

      {result?.error && <ErrorNote message={result.error} />}

      {d && status && (
        <>
          {d.header.alg === "none" || String(d.header.alg).toLowerCase() === "none" ? (
            <ErrorNote message='This token uses alg "none", meaning it is unsigned. Servers must reject unsigned tokens.' />
          ) : null}
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <Editor label="Header" value={d.headerText} readOnly badge="JSON" headerAction={<CopyIconButton text={d.headerText} label="Copy header" onCopy={analytics.copy} />} />
            <Editor label="Payload" value={d.payloadText} readOnly badge="JSON" headerAction={<CopyIconButton text={d.payloadText} label="Copy payload" onCopy={analytics.copy} />} />
          </div>
          <div className="info-panel mt-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-extrabold text-slate-900">Token information</h2>
              <span className={`rounded-full border px-3 py-1 text-xs font-bold ${STATUS_STYLE[status.state]}`}>{status.label}</span>
            </div>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {info.filter((i): i is [string, string] => i[1] !== null).map(([l, v]) => <Info key={l} label={l} value={v} />)}
              <Info label="Signature" value={d.signature ? `Present (${d.signature.length} characters), not verified` : "Missing (unsigned token)"} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
