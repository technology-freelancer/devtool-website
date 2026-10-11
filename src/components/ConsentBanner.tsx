import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { applyConsent } from "@/lib/analytics"
import { getConsent, setConsent } from "@/lib/consent"
import Button from "./Button"
import Icon from "./Icon"

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
      aria-labelledby="consent-title"
      aria-describedby="consent-description"
      className="fixed inset-x-0 bottom-0 z-50 px-3 pb-3 sm:inset-x-auto sm:bottom-5 sm:left-5 sm:w-[min(35rem,calc(100vw-2.5rem))] sm:px-0 sm:pb-0"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.75rem)" }}
    >
      <div className="mx-auto max-w-7xl rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_18px_60px_rgb(15_23_42/0.18)] ring-1 ring-black/[0.03] sm:p-5">
        <div className="flex items-start gap-3.5">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-brand-100 bg-brand-50 text-brand-600">
            <Icon name="lock" size={21} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 id="consent-title" className="text-base font-extrabold tracking-tight text-slate-900">Your privacy, your choice</h2>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[0.625rem] font-extrabold uppercase tracking-wider text-slate-500">Optional analytics</span>
            </div>
            <p id="consent-description" className="mt-1.5 text-sm leading-6 text-slate-600">
              Allow anonymous usage analytics to help improve DevTools. Your tool input and output are never collected.
            </p>
            <Link to="/privacy" className="mt-1 inline-flex min-h-8 items-center text-xs font-bold text-brand-600 underline underline-offset-2 hover:text-brand-700">
              Read our privacy policy
            </Link>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:ml-[3.625rem] sm:mt-3 sm:flex sm:justify-end">
          <Button variant="secondary" className="w-full sm:order-1 sm:w-auto" onClick={() => choose("denied")}>Decline optional</Button>
          <Button className="w-full sm:order-2 sm:w-auto" onClick={() => choose("granted")}>Allow analytics</Button>
        </div>
      </div>
    </div>
  )
}
