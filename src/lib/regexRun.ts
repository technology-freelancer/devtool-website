export type RegexMatch = { index: number; end: number; text: string; groups: (string | undefined)[]; named: Record<string, string | undefined> }
export type RegexResult =
  | { ok: true; matches: RegexMatch[]; truncated: boolean }
  | { ok: false; error: string; code: "invalid_regex" }

const LIMIT = 1000

export function runRegex(pattern: string, flags: string, text: string): RegexResult {
  let re: RegExp
  try {
    re = new RegExp(pattern, flags.includes("g") ? flags : flags + "g")
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message.replace(/^Invalid regular expression: /, "") : "Invalid pattern", code: "invalid_regex" }
  }
  const global = flags.includes("g")
  const matches: RegexMatch[] = []
  let truncated = false
  for (const m of text.matchAll(re)) {
    if (matches.length >= LIMIT) { truncated = true; break }
    matches.push({ index: m.index ?? 0, end: (m.index ?? 0) + m[0].length, text: m[0], groups: m.slice(1), named: { ...(m.groups ?? {}) } })
    if (!global) break
  }
  return { ok: true, matches, truncated }
}
