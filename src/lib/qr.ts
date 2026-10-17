import QRCode from "qrcode"
import { ToolError } from "./toolError"

export type QrKind = "text" | "wifi" | "email" | "phone"
export type QrFields = {
  text: string
  ssid: string
  password: string
  security: "WPA" | "WEP" | "nopass"
  hidden: boolean
  email: string
  subject: string
  body: string
  phone: string
}
export type Ecc = "L" | "M" | "Q" | "H"
export type QrStyle = { ecc: Ecc; margin: number; dark: string; light: string; width: number }

const esc = (s: string) => s.replace(/([\\;,:\"])/g, "\\$1")

export function buildPayload(kind: QrKind, f: QrFields): string {
  switch (kind) {
    case "text": return f.text
    case "wifi": {
      if (!f.ssid.trim()) return ""
      const pass = f.security === "nopass" ? "" : `P:${esc(f.password)};`
      return `WIFI:T:${f.security};S:${esc(f.ssid)};${pass}${f.hidden ? "H:true;" : ""};`
    }
    case "email": {
      if (!f.email.trim()) return ""
      const query = [f.subject && `subject=${encodeURIComponent(f.subject)}`, f.body && `body=${encodeURIComponent(f.body)}`].filter(Boolean).join("&")
      return `mailto:${f.email.trim()}${query ? `?${query}` : ""}`
    }
    case "phone": return f.phone.trim() ? `tel:${f.phone.replace(/[^\d+]/g, "")}` : ""
  }
}

const opts = (s: QrStyle) => ({ errorCorrectionLevel: s.ecc, margin: s.margin, width: s.width, color: { dark: s.dark, light: s.light } })
const tooBig = (e: unknown) => new ToolError(/too big|capacity|data/i.test(e instanceof Error ? e.message : "") ? "There is too much data for one QR code. Shorten the text, or choose a lower error-correction level." : "Could not create a QR code from this input.", "qr_too_big")

export async function qrSvg(text: string, style: QrStyle): Promise<string> {
  try { return await QRCode.toString(text, { type: "svg", ...opts(style) }) }
  catch (e) { throw tooBig(e) }
}
export async function qrPngDataUrl(text: string, style: QrStyle): Promise<string> {
  try { return await QRCode.toDataURL(text, { type: "image/png", ...opts(style) }) }
  catch (e) { throw tooBig(e) }
}
export function qrModules(text: string, ecc: Ecc) {
  const qr = QRCode.create(text, { errorCorrectionLevel: ecc })
  return { size: qr.modules.size, data: qr.modules.data, version: qr.version }
}

function luminance(hex: string) {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!match) return null
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(match[1].slice(i, i + 2), 16) / 255).map((c) => c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
export function contrastRatio(a: string, b: string): number | null {
  const la = luminance(a), lb = luminance(b)
  if (la === null || lb === null) return null
  const [hi, lo] = la > lb ? [la, lb] : [lb, la]
  return (hi + 0.05) / (lo + 0.05)
}
export function colourWarning(dark: string, light: string): string | null {
  const ratio = contrastRatio(dark, light)
  if (ratio === null) return "Use colours in #RRGGBB format."
  if ((luminance(dark) ?? 0) > (luminance(light) ?? 1)) return "The code is lighter than its background. Many scanners cannot read inverted codes."
  if (ratio < 4) return "Low contrast. Use a much darker code on a lighter background so it scans reliably."
  return null
}
