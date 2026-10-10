import { useMemo } from "react"
import { track, type AnalyticsProps } from "@/lib/analytics"

/**
 * Per-tool tracking helpers. Tool components call these; they add the tool slug
 * automatically. Pass ONLY short codes/counters, never user input or output.
 *
 *   const a = useToolAnalytics("json-to-java")
 *   a.used()                    // user clicked Generate
 *   a.success()  / a.error("invalid_json")
 *   a.copy() / a.download() / a.clear()
 */
export function useToolAnalytics(tool: string) {
  return useMemo(
    () => ({
      used: (p?: AnalyticsProps) => track("tool_used", { tool, ...p }),
      success: (p?: AnalyticsProps) => track("tool_success", { tool, ...p }),
      error: (error_type: string) => track("tool_error", { tool, error_type }),
      copy: () => track("copy_clicked", { tool }),
      download: () => track("download_clicked", { tool }),
      clear: () => track("clear_clicked", { tool }),
    }),
    [tool],
  )
}
