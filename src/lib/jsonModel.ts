/**
 * JSON -> type tree. Shared by the TypeScript and Java generators.
 * Pure functions, no DOM: fully unit-tested.
 */
import { ToolError } from "./toolError"

export type Field = { key: string; type: TypeNode; optional: boolean }
export type ObjectNode = { kind: "object"; name: string; fields: Field[] }
export type TypeNode =
  | { kind: "string" | "boolean" | "null" | "any" | "int" | "long" | "double" }
  | { kind: "array"; item: TypeNode }
  | ObjectNode
  | { kind: "union"; types: TypeNode[] }

const INT_MAX = 2147483647

/* ---------- naming helpers ---------- */
export function words(input: string): string[] {
  return input
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[^A-Za-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
}
export const toPascalCase = (s: string) =>
  words(s).map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase()).join("") || "Item"
export const toCamelCase = (s: string) => {
  const p = toPascalCase(s)
  const out = p[0].toLowerCase() + p.slice(1)
  return /^[0-9]/.test(out) ? `_${out}` : out
}
export function singularize(word: string): string {
  if (/ies$/i.test(word) && word.length > 3) return word.slice(0, -3) + "y"
  if (/(s|x|z|ch|sh)es$/i.test(word) && word.length > 4) return word.slice(0, -2)
  if (/s$/i.test(word) && !/ss$/i.test(word) && word.length > 2) return word.slice(0, -1)
  return word
}

/* ---------- inference ---------- */
function classifyNumber(n: number): TypeNode {
  if (!Number.isInteger(n)) return { kind: "double" }
  return Math.abs(n) > INT_MAX ? { kind: "long" } : { kind: "int" }
}

export function infer(value: unknown, name = "Root"): TypeNode {
  if (value === null) return { kind: "null" }
  switch (typeof value) {
    case "string": return { kind: "string" }
    case "boolean": return { kind: "boolean" }
    case "number": return classifyNumber(value)
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return { kind: "array", item: { kind: "any" } }
    const itemName = singularize(name)
    let item = infer(value[0], itemName)
    for (let i = 1; i < value.length; i++) item = merge(item, infer(value[i], itemName))
    return { kind: "array", item }
  }
  if (typeof value === "object") {
    const fields: Field[] = Object.entries(value as Record<string, unknown>).map(([key, v]) => ({
      key,
      type: infer(v, toPascalCase(key)),
      optional: false,
    }))
    return { kind: "object", name, fields }
  }
  return { kind: "any" }
}

const NUM_RANK: Record<string, number> = { int: 1, long: 2, double: 3 }

function mergeObjects(a: ObjectNode, b: ObjectNode): ObjectNode {
  const fields: Field[] = []
  const bByKey = new Map(b.fields.map((f) => [f.key, f]))
  for (const fa of a.fields) {
    const fb = bByKey.get(fa.key)
    if (fb) {
      fields.push({ key: fa.key, type: merge(fa.type, fb.type), optional: fa.optional || fb.optional })
      bByKey.delete(fa.key)
    } else fields.push({ ...fa, optional: true })
  }
  for (const fb of bByKey.values()) fields.push({ ...fb, optional: true })
  return { kind: "object", name: a.name, fields }
}

/** Combine several types into one (union when they genuinely differ). */
export function normalizeUnion(types: TypeNode[]): TypeNode {
  const flat: TypeNode[] = []
  for (const t of types) {
    if (t.kind === "union") flat.push(...t.types)
    else flat.push(t)
  }
  if (flat.some((t) => t.kind === "any")) return { kind: "any" }

  let num: TypeNode | null = null
  let obj: ObjectNode | null = null
  let arr: TypeNode | null = null
  const prims = new Set<string>()
  for (const t of flat) {
    if (t.kind === "int" || t.kind === "long" || t.kind === "double") {
      if (!num || NUM_RANK[t.kind] > NUM_RANK[num.kind as string]) num = t
    } else if (t.kind === "object") obj = obj ? mergeObjects(obj, t) : t
    else if (t.kind === "array") arr = arr ? { kind: "array", item: merge((arr as { item: TypeNode }).item, t.item) } : t
    else prims.add(t.kind)
  }
  const out: TypeNode[] = []
  if (prims.has("string")) out.push({ kind: "string" })
  if (num) out.push(num)
  if (prims.has("boolean")) out.push({ kind: "boolean" })
  if (obj) out.push(obj)
  if (arr) out.push(arr)
  if (prims.has("null")) out.push({ kind: "null" })
  return out.length === 1 ? out[0] : { kind: "union", types: out }
}

export function merge(a: TypeNode, b: TypeNode): TypeNode {
  if (a.kind === b.kind && a.kind !== "object" && a.kind !== "array" && a.kind !== "union") return a
  if (a.kind === "object" && b.kind === "object") return mergeObjects(a, b)
  if (a.kind === "array" && b.kind === "array") return { kind: "array", item: merge(a.item, b.item) }
  return normalizeUnion([a, b])
}

/* ---------- parsing + class collection ---------- */
export function parseJson(input: string): unknown {
  try {
    return JSON.parse(input)
  } catch (e) {
    throw new ToolError(`Invalid JSON: ${e instanceof Error ? e.message : "could not parse"}`, "invalid_json")
  }
}

/** Collect every object node (unique by identity) and give each a unique, PascalCase name. */
export function collectObjects(root: TypeNode, rootName: string): ObjectNode[] {
  const seen = new Set<ObjectNode>()
  const ordered: ObjectNode[] = []
  const walk = (t: TypeNode) => {
    if (t.kind === "object") {
      if (seen.has(t)) return
      seen.add(t)
      ordered.push(t)
      t.fields.forEach((f) => walk(f.type))
    } else if (t.kind === "array") walk(t.item)
    else if (t.kind === "union") t.types.forEach(walk)
  }
  walk(root)
  const used = new Set<string>()
  ordered.forEach((node, i) => {
    const base = i === 0 && (root.kind === "object" || root.kind === "array") ? rootName : toPascalCase(node.name)
    let name = base
    for (let n = 2; used.has(name); n++) name = `${base}${n}`
    used.add(name)
    node.name = name
  })
  return ordered
}

/** The innermost object of `Root` (object) or `Root[]` (array of objects) */
export function rootObject(root: TypeNode): ObjectNode | null {
  if (root.kind === "object") return root
  if (root.kind === "array") return rootObject(root.item)
  if (root.kind === "union") return null
  return null
}
