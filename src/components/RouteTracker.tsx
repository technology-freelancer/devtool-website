import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import { currentToolSlug, trackPageview } from "@/lib/analytics"
import { setMonitoringTool } from "@/lib/monitoring"

/** Sends one page view per route change (React Router never reloads the page). */
export default function RouteTracker() {
  const { pathname } = useLocation()
  useEffect(() => {
    trackPageview(pathname)
    setMonitoringTool(currentToolSlug(pathname) ?? null)
  }, [pathname])
  return null
}
