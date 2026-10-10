import { create } from "jsondiffpatch"
import { parseJson } from "./jsonModel"

export type Change = { type: "added" | "removed" | "changed"; path: string; before?: unknown; after?: unknown }

const differ = create({
  // match array items by id when present, otherwise by position
  objectHash: (o: object, index?: number) => {
    const r = o as Record<string, unknown>
    const id = r.id ?? r._id ?? r.key
    return id !== undefined ? `id:${String(id)}` : `pos:${index ?? 0}`
  },
  arrays: { detectMove: false },
})

const isArr = Array.isArray
const keyPath = (base: string, key: string) => (/^[A-Za-z_$][\w$]*$/.test(key) ? `${base}.${key}` : `${base}[${JSON.stringify(key)}]`)

function walk(delta: unknown, path: string, out: Change[]) {
  if (isArr(delta)) {
    if (delta.length === 1) out.push({ type: "added", path, after: delta[0] })
    else if (delta.length === 2) out.push({ type: "changed", path, before: delta[0], after: delta[1] })
    else if (delta.length === 3 && delta[2] === 0) out.push({ type: "removed", path, before: delta[0] })
    return
  }
  if (delta && typeof delta === "object") {
    const d = delta as Record<string, unknown>
    if (d._t === "a") {
      for (const k of Object.keys(d)) {
        if (k === "_t") continue
        const idx = k.startsWith("_") ? k.slice(1) : k
        walk(d[k], `${path}[${idx}]`, out)
      }
    } else for (const k of Object.keys(d)) walk(d[k], keyPath(path, k), out)
  }
}

export function diffValues(a: unknown, b: unknown): Change[] {
  const delta = differ.diff(a, b)
  const out: Change[] = []
  if (delta !== undefined) walk(delta, "$", out)
  return out
}

export function diffJsonText(aText: string, bText: string): Change[] {
  const a = parseSide(aText, "JSON A")
  const b = parseSide(bText, "JSON B")
  return diffValues(a, b)
}

function parseSide(text: string, label: string): unknown {
  try {
    return parseJson(text)
  } catch (e) {
    throw Object.assign(e as Error, { message: `${label} is not valid. ${(e as Error).message}` })
  }
}

export const preview = (v: unknown, max = 120) => {
  const s = JSON.stringify(v) ?? "undefined"
  return s.length > max ? `${s.slice(0, max)}…` : s
}
