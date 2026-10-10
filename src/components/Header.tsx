import { useState } from "react"
import { Link } from "react-router-dom"
import Icon from "./Icon"
import Logo from "./Logo"

export default function Header() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  return (
    <header
      className="sticky top-0 z-40 border-b border-slate-100 bg-page/95 backdrop-blur"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="container-page flex items-center justify-between" style={{ height: "var(--header-height)" }}>
        <Logo />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          <Link to="/#tools" className="nav-link">Tools</Link>
          <Link to="/#about" className="nav-link">About</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/#search"
            className="hidden h-11 w-11 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 md:grid"
            aria-label="Search tools"
          >
            <Icon name="search" size={18} />
          </Link>
          <button
            className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 text-slate-700 md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            <Icon name={open ? "x" : "menu"} />
          </button>
        </div>
      </div>
      {open && (
        <nav className="container-page border-t border-slate-100 py-3 md:hidden" aria-label="Mobile">
          <Link to="/#tools" className="mobile-link" onClick={close}>All tools</Link>
          <Link to="/#search" className="mobile-link" onClick={close}>Search tools</Link>
          <Link to="/#about" className="mobile-link" onClick={close}>About</Link>
        </nav>
      )}
    </header>
  )
}
