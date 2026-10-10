import { useEffect } from "react"
import { useLocation } from "react-router-dom"

/** Scrolls to #hash targets (and focuses #search) or to the top on route change. */
export default function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0 })
      return
    }
    const id = hash.slice(1)
    const t = setTimeout(() => {
      const el = document.getElementById(id === "search" ? "tools" : id)
      el?.scrollIntoView({ behavior: "smooth" })
      if (id === "search") document.getElementById("tool-search")?.focus({ preventScroll: true })
    }, 50)
    return () => clearTimeout(t)
  }, [pathname, hash])
  return null
}
