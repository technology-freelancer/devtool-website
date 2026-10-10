import { ToolError } from "./toolError"

export type Unit = "auto" | "seconds" | "milliseconds"

export function parseTimestamp(input: string, unit: Unit = "auto"): { date: Date; unit: "seconds" | "milliseconds" } {
  const raw = input.trim()
  if (!/^-?\d+(\.\d+)?$/.test(raw)) throw new ToolError("Enter a numeric Unix timestamp, for example 1747751400.", "invalid_timestamp")
  const n = Number(raw)
  const resolved = unit === "auto" ? (Math.abs(n) >= 1e11 ? "milliseconds" : "seconds") : unit
  const date = new Date(resolved === "seconds" ? n * 1000 : n)
  if (Number.isNaN(date.getTime())) throw new ToolError("That timestamp is outside the range of valid dates.", "invalid_timestamp")
  return { date, unit: resolved }
}

export function relativeTime(date: Date, now = Date.now()): string {
  const diffSec = Math.round((date.getTime() - now) / 1000)
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" })
  const units: [Intl.RelativeTimeFormatUnit, number][] = [["year", 31536000], ["month", 2592000], ["day", 86400], ["hour", 3600], ["minute", 60], ["second", 1]]
  for (const [u, size] of units) if (Math.abs(diffSec) >= size || u === "second") return rtf.format(Math.round(diffSec / size), u)
  return "now"
}

/** `value` is a datetime-local string: YYYY-MM-DDTHH:mm[:ss]. */
export function dateInputToDate(value: string, utc: boolean): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value)
  if (!m) throw new ToolError("Pick a valid date and time.", "invalid_date")
  const [, y, mo, d, h, mi, s] = m.map(Number) as number[]
  const date = utc ? new Date(Date.UTC(y, mo - 1, d, h, mi, s || 0)) : new Date(y, mo - 1, d, h, mi, s || 0)
  if (Number.isNaN(date.getTime())) throw new ToolError("Pick a valid date and time.", "invalid_date")
  return date
}

export function toDateTimeLocal(date: Date): string {
  const p = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}T${p(date.getHours())}:${p(date.getMinutes())}:${p(date.getSeconds())}`
}
