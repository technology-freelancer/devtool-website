import { decodeBase64Bytes } from "./base64"
import { ToolError } from "./toolError"

export type AesMode = "GCM" | "CBC" | "CTR"
export type KeySource = "password" | "raw"
export type BytesFormat = "hex" | "base64" | "utf8"
export type TextEncoding = "base64" | "hex"

export type AesOptions = {
  mode: AesMode
  keyBits: 128 | 256
  keySource: KeySource
  secret: string
  keyFormat?: BytesFormat
  iv?: string
  ivFormat?: BytesFormat
  encoding: TextEncoding
}

export const PBKDF2_ITERATIONS = 600_000
export const SALT_BYTES = 16
export const IV_BYTES: Record<AesMode, number> = { GCM: 12, CBC: 16, CTR: 16 }

const subtle = (): SubtleCrypto => {
  const s = globalThis.crypto?.subtle
  if (!s) throw new ToolError("Your browser only allows encryption on secure pages. Open this site over HTTPS (or localhost).", "no_webcrypto")
  return s
}
const buf = (u: Uint8Array) => u as unknown as BufferSource

export const bytesToHex = (b: Uint8Array) => Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("")
export const bytesToBase64 = (b: Uint8Array) => {
  let s = ""
  for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode(...b.subarray(i, i + 0x8000))
  return btoa(s)
}

export function hexToBytes(hex: string): Uint8Array {
  const clean = hex.replace(/[\s:]/g, "").replace(/^0x/i, "")
  if (!/^[0-9a-fA-F]*$/.test(clean) || clean.length % 2 !== 0) throw new ToolError("That is not valid hex. Use pairs of 0-9 and a-f.", "invalid_hex")
  return Uint8Array.from(clean.match(/../g) ?? [], (h) => parseInt(h, 16))
}

function parseBytes(text: string, format: BytesFormat, label: string): Uint8Array {
  const t = text.trim()
  if (!t) throw new ToolError(`Enter the ${label}.`, `missing_${label.replace(/\W+/g, "_")}`)
  if (format === "hex") return hexToBytes(t)
  if (format === "base64") return decodeBase64Bytes(t)
  return new TextEncoder().encode(text)
}

function encodeOut(bytes: Uint8Array, enc: TextEncoding) {
  return enc === "hex" ? bytesToHex(bytes) : bytesToBase64(bytes)
}
function decodeIn(text: string, enc: TextEncoding): Uint8Array {
  const t = text.trim()
  if (!t) throw new ToolError("Paste the encrypted text first.", "empty_input")
  return enc === "hex" ? hexToBytes(t) : decodeBase64Bytes(t)
}
const random = (n: number) => globalThis.crypto.getRandomValues(new Uint8Array(n))

async function importKey(raw: Uint8Array, mode: AesMode, usage: KeyUsage[]) {
  return subtle().importKey("raw", buf(raw), { name: `AES-${mode}` }, false, usage)
}
async function deriveKey(password: string, salt: Uint8Array, bits: number, mode: AesMode, usage: KeyUsage[]) {
  const material = await subtle().importKey("raw", buf(new TextEncoder().encode(password)), "PBKDF2", false, ["deriveKey"])
  return subtle().deriveKey({ name: "PBKDF2", salt: buf(salt), iterations: PBKDF2_ITERATIONS, hash: "SHA-256" }, material, { name: `AES-${mode}`, length: bits }, false, usage)
}
function rawKeyBytes(o: AesOptions): Uint8Array {
  const key = parseBytes(o.secret, o.keyFormat ?? "hex", "key")
  const need = o.keyBits / 8
  if (key.length !== need) throw new ToolError(`AES-${o.keyBits} needs a key of exactly ${need} bytes. Yours is ${key.length} bytes.`, "bad_key_length")
  return key
}
const algo = (mode: AesMode, iv: Uint8Array): AesGcmParams | AesCbcParams | AesCtrParams =>
  mode === "GCM" ? { name: "AES-GCM", iv: buf(iv), tagLength: 128 } : mode === "CBC" ? { name: "AES-CBC", iv: buf(iv) } : { name: "AES-CTR", counter: buf(iv), length: 64 }
function checkIv(iv: Uint8Array, mode: AesMode) {
  if (iv.length !== IV_BYTES[mode]) throw new ToolError(`AES-${mode} needs an IV of exactly ${IV_BYTES[mode]} bytes. Yours is ${iv.length} bytes.`, "bad_iv_length")
}

export async function aesEncrypt(plaintext: string, o: AesOptions): Promise<string> {
  const data = new TextEncoder().encode(plaintext)
  try {
    if (o.keySource === "password") {
      if (!o.secret) throw new ToolError("Enter a password.", "missing_password")
      const salt = random(SALT_BYTES)
      const iv = random(IV_BYTES[o.mode])
      const key = await deriveKey(o.secret, salt, o.keyBits, o.mode, ["encrypt"])
      const ct = new Uint8Array(await subtle().encrypt(algo(o.mode, iv), key, buf(data)))
      return encodeOut(concat(salt, iv, ct), o.encoding)
    }
    const key = await importKey(rawKeyBytes(o), o.mode, ["encrypt"])
    const userIv = o.iv?.trim() ? parseBytes(o.iv, o.ivFormat ?? "hex", "IV") : null
    const iv = userIv ?? random(IV_BYTES[o.mode])
    checkIv(iv, o.mode)
    const ct = new Uint8Array(await subtle().encrypt(algo(o.mode, iv), key, buf(data)))
    return encodeOut(userIv ? ct : concat(iv, ct), o.encoding)
  } catch (e) {
    if (e instanceof ToolError) throw e
    throw new ToolError("Encryption failed. Check your settings.", "encrypt_failed")
  }
}

export async function aesDecrypt(text: string, o: AesOptions): Promise<string> {
  const bytes = decodeIn(text, o.encoding)
  const ivLen = IV_BYTES[o.mode]
  let plain: ArrayBuffer
  try {
    if (o.keySource === "password") {
      if (!o.secret) throw new ToolError("Enter the password used to encrypt.", "missing_password")
      if (bytes.length < SALT_BYTES + ivLen + 1) throw new ToolError("This text is too short to be encrypted data from this tool.", "too_short")
      const salt = bytes.slice(0, SALT_BYTES)
      const iv = bytes.slice(SALT_BYTES, SALT_BYTES + ivLen)
      const ct = bytes.slice(SALT_BYTES + ivLen)
      const key = await deriveKey(o.secret, salt, o.keyBits, o.mode, ["decrypt"])
      plain = await subtle().decrypt(algo(o.mode, iv), key, buf(ct))
    } else {
      const key = await importKey(rawKeyBytes(o), o.mode, ["decrypt"])
      const userIv = o.iv?.trim() ? parseBytes(o.iv, o.ivFormat ?? "hex", "IV") : null
      if (!userIv && bytes.length < ivLen + 1) throw new ToolError("This text is too short to contain an IV and data.", "too_short")
      const iv = userIv ?? bytes.slice(0, ivLen)
      checkIv(iv, o.mode)
      plain = await subtle().decrypt(algo(o.mode, iv), key, buf(userIv ? bytes : bytes.slice(ivLen)))
    }
  } catch (e) {
    if (e instanceof ToolError) throw e
    throw new ToolError("Could not decrypt. The password or key is wrong, the settings (mode, key size, format) do not match, or the data was changed.", "decrypt_failed")
  }
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(plain)
  } catch {
    throw new ToolError("Decryption produced data that is not valid text. A wrong key or mode can cause this, especially in CTR mode, which cannot detect errors.", "not_text")
  }
}

function concat(...parts: Uint8Array[]) {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0))
  let offset = 0
  for (const part of parts) { out.set(part, offset); offset += part.length }
  return out
}
