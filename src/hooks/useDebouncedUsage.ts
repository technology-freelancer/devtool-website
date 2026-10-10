import { useEffect } from "react"
import { useToolAnalytics } from "./useToolAnalytics"

/**
 * For live tools (no Run button): reports ONE usage event after the user stops editing.
 * `key` changes when the input changes (never sent anywhere); `outcome` is the result state.
 */
export function useDebouncedUsage(slug: string, key: string, outcome: { error: string | null; code?: string } | null, delay = 1200) {
  const a = useToolAnalytics(slug)
  useEffect(() => {
    if (!key || !outcome) return
    const t = setTimeout(() => {
      a.used()
      if (outcome.error) a.error(outcome.code ?? "invalid_input")
      else a.success()
    }, delay)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
}
