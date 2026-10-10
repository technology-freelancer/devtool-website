import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { applyConsent } from "@/lib/analytics"
import { getConsent, setConsent } from "@/lib/consent"
import Button from "./Button"

/** Asks once whether analytics may store an anonymous ID. Hidden for pre-render. */
export default function ConsentBanner() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (getConsent() === null) setOpen(true)
    const reopen = () => setOpen(true)
    window.addEventListener("devtools:consent-open", reopen)
    return () => window.removeEventListener("devtools:consent-open", reopen)
  }, [])

  if (!open) return null
  const choose = (value: "granted" | "denied") => {
    setConsent(value)
    applyConsent(value === "granted")
    setOpen(false)
  }

  return (
    <div
      role="dialog"
      aria-label="Analytics preferences"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-surface/98 shadow-[0_-8px_30px_rgb(15_23_42/0.08)] backdrop-blur"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="container-page flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <p className="text-sm leading-6 text-slate-600">
          We use privacy-friendly analytics to see which tools are used. Never your input. May we store an anonymous ID in your browser?{" "}
          <Link to="/privacy" className="font-semibold text-brand-600 underline">Privacy policy</Link>
        </p>
        <div className="flex shrink-0 gap-2">
          <Button variant="secondary" className="flex-1 sm:flex-none" onClick={() => choose("denied")}>No thanks</Button>
          <Button className="flex-1 sm:flex-none" onClick={() => choose("granted")}>Allow</Button>
        </div>
      </div>
    </div>
  )
}
