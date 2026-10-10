import { CronExpressionParser } from "cron-parser"
import cronstrue from "cronstrue"
import { ToolError } from "./toolError"

export function parseCron(expr: string) {
  const parts = expr.trim().split(/\s+/)
  if (parts.length !== 5) throw new ToolError("A cron expression needs exactly 5 fields: minute hour day month weekday.", "invalid_cron")
  return parts
}

export function describeCron(expr: string): string {
  parseCron(expr)
  try {
    return cronstrue.toString(expr.trim(), { use24HourTimeFormat: true, throwExceptionOnParseError: true })
  } catch (e) {
    throw new ToolError(typeof e === "string" ? e : "This cron expression is not valid.", "invalid_cron")
  }
}

export function nextRuns(expr: string, count = 5, utc = false, from = new Date()): Date[] {
  parseCron(expr)
  try {
    const it = CronExpressionParser.parse(expr.trim(), { currentDate: from, ...(utc ? { tz: "UTC" } : {}) })
    return it.take(count).map((d) => d.toDate())
  } catch {
    throw new ToolError("This cron expression is not valid.", "invalid_cron")
  }
}
