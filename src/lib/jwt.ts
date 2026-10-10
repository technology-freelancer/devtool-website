import { decodeBase64 } from "./base64"
import { ToolError } from "./toolError"

export type DecodedJwt = {
  header: Record<string, unknown>
  payload: Record<string, unknown>
  headerText: string
  payloadText: string
  signature: string
}

function part(raw: string, label: string): Record<string, unknown> {
  let text: string
  try {
    text = decodeBase64(raw)
  } catch {
    throw new ToolError(`The ${label} is not valid Base64URL.`, "invalid_jwt")
  }
  try {
    const v = JSON.parse(text)
    if (v === null || typeof v !== "object" || Array.isArray(v)) throw new Error()
    return v as Record<string, unknown>
  } catch {
    throw new ToolError(`The ${label} is not a valid JSON object.`, "invalid_jwt")
  }
}

/** Display-only decode. Does NOT verify the signature. */
export function decodeJwt(input: string): DecodedJwt {
  const token = input.trim().replace(/^bearer\s+/i, "").replace(/\s+/g, "")
  const parts = token.split(".")
  if (parts.length < 2 || parts.length > 3 || !parts[0] || !parts[1]) {
    throw new ToolError("A JWT has three parts separated by dots: header.payload.signature.", "invalid_jwt")
  }
  const header = part(parts[0], "header")
  const payload = part(parts[1], "payload")
  return {
    header,
    payload,
    headerText: JSON.stringify(header, null, 2),
    payloadText: JSON.stringify(payload, null, 2),
    signature: parts[2] ?? "",
  }
}

export type TokenStatus = { state: "expired" | "valid" | "not-yet-valid" | "no-expiry"; label: string }

export function describeDuration(seconds: number): string {
  const s = Math.abs(Math.round(seconds))
  const units: [string, number][] = [["day", 86400], ["hour", 3600], ["minute", 60], ["second", 1]]
  for (const [name, size] of units) {
    if (s >= size) {
      const n = Math.floor(s / size)
      return `${n} ${name}${n === 1 ? "" : "s"}`
    }
  }
  return "0 seconds"
}

export function tokenStatus(payload: Record<string, unknown>, nowSec = Math.floor(Date.now() / 1000)): TokenStatus {
  const exp = typeof payload.exp === "number" ? payload.exp : null
  const nbf = typeof payload.nbf === "number" ? payload.nbf : null
  if (nbf !== null && nowSec < nbf) return { state: "not-yet-valid", label: `Not valid yet (starts in ${describeDuration(nbf - nowSec)})` }
  if (exp === null) return { state: "no-expiry", label: "No expiration claim" }
  if (nowSec >= exp) return { state: "expired", label: `Expired ${describeDuration(nowSec - exp)} ago` }
  return { state: "valid", label: `Not expired (expires in ${describeDuration(exp - nowSec)})` }
}

export function formatClaimTime(seconds: unknown): string | null {
  if (typeof seconds !== "number" || !Number.isFinite(seconds)) return null
  const d = new Date(seconds * 1000)
  if (Number.isNaN(d.getTime())) return null
  return `${d.toLocaleString()} (${d.toISOString()})`
}

const b64url = (obj: unknown) => btoa(JSON.stringify(obj)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")

/** A demo token that always has a fresh expiry. The signature is fake. */
export function makeSampleJwt(nowSec = Math.floor(Date.now() / 1000)): string {
  const header = { alg: "HS256", typ: "JWT" }
  const payload = { sub: "101", name: "John", role: "admin", iat: nowSec, exp: nowSec + 3600 }
  return `${b64url(header)}.${b64url(payload)}.c2lnbmF0dXJlLW5vdC12ZXJpZmllZA`
}
