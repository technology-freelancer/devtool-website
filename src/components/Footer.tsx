import { Link } from "react-router-dom"
import { openConsentSettings } from "@/lib/consent"
import Logo from "./Logo"

const links = [
  { label: "Tools", to: "/#tools" },
  { label: "About", to: "/#about" },
  { label: "Privacy", to: "/privacy" },
  { label: "Terms", to: "/terms" },
  { label: "Contact", to: "/contact" },
]

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="container-page py-10">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">
          <div>
            <Logo />
            <p className="mt-3 text-sm text-slate-500">Simple tools for developers.</p>
          </div>
          <nav className="flex flex-wrap gap-x-7 gap-y-1 text-sm font-semibold text-slate-600" aria-label="Footer">
            {links.map((l) => (
              <Link key={l.label} to={l.to} className="inline-flex min-h-11 items-center hover:text-brand-600">
                {l.label}
              </Link>
            ))}
            <button type="button" onClick={openConsentSettings} className="inline-flex min-h-11 items-center hover:text-brand-600">
              Cookie settings
            </button>
          </nav>
        </div>
        <div className="mt-8 border-t border-slate-200 pt-6 text-xs text-slate-400">
          © {new Date().getFullYear()} DevTools. Built for developers everywhere.
        </div>
      </div>
    </footer>
  )
}
