import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import { trackPageview } from "@/lib/analytics"

/** Sends one page view per route change (React Router never reloads the page). */
export default function RouteTracker() {
  const { pathname } = useLocation()
  useEffect(() => {
    trackPageview(pathname)
  }, [pathname])
  return null
}
