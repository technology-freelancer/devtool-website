import { ToolError } from "./toolError"

export function encodeBase64(text: string, urlSafe = false): string {
  const bytes = new TextEncoder().encode(text)
  let bin = ""
  const CHUNK = 0x8000
  for (let i = 0; i < bytes.length; i += CHUNK) bin += String.fromCharCode(...bytes.subarray(i, i + CHUNK))
  const b64 = btoa(bin)
  return urlSafe ? b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "") : b64
}

/** Accepts standard and URL-safe alphabets, with or without padding, ignoring whitespace. */
export function decodeBase64Bytes(input: string): Uint8Array {
  const clean = input.replace(/\s+/g, "").replace(/-/g, "+").replace(/_/g, "/")
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(clean) || clean.length % 4 === 1) {
    throw new ToolError("This is not valid Base64. Check for stray characters or missing data.", "invalid_base64")
  }
  const padded = clean + "=".repeat((4 - (clean.length % 4)) % 4)
  let bin: string
  try {
    bin = atob(padded)
  } catch {
    throw new ToolError("This is not valid Base64.", "invalid_base64")
  }
  return Uint8Array.from(bin, (c) => c.charCodeAt(0))
}

export function decodeBase64(input: string): string {
  const bytes = decodeBase64Bytes(input)
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes)
  } catch {
    throw new ToolError("The decoded bytes are not valid UTF-8 text (it may be binary data).", "not_text")
  }
}
