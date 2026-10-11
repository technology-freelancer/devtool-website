import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import Icon from "./Icon"
import Logo from "./Logo"
import { popularSlugs, tools } from "@/tools/registry"

const toolGroups = [...new Set(tools.map((tool) => tool.category))].map((category) => ({
  category,
  tools: tools.filter((tool) => tool.category === category),
}))
const popularTools = tools.filter((tool) => popularSlugs.includes(tool.slug))

export default function Header() {
  const [open, setOpen] = useState(false)
  const [browseOpen, setBrowseOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const browseButtonRef = useRef<HTMLButtonElement>(null)
  const close = () => setOpen(false)

  useEffect(() => {
    if (!open && !browseOpen) return
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) {
        setOpen(false)
        setBrowseOpen(false)
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false)
        setBrowseOpen(false)
        browseButtonRef.current?.focus()
      }
    }
    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open, browseOpen])

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 shadow-sm shadow-slate-900/[0.03] backdrop-blur before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-gradient-to-r before:from-brand-300 before:via-brand-600 before:to-cyan-400"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="container-page flex items-center justify-between gap-3" style={{ height: "var(--header-height)" }}>
        <div className="flex min-w-0 items-center gap-3">
          <Logo />
          <span className="hidden border-l border-slate-200 pl-3 text-[0.6875rem] font-bold leading-4 text-slate-400 xl:block">Free tools<br />for builders</span>
        </div>
        <nav className="ml-auto hidden items-center gap-1 rounded-2xl border border-slate-100 bg-slate-50/80 p-1 md:flex" aria-label="Main navigation">
          <div className="relative">
            <button
              ref={browseButtonRef}
              type="button"
              className={`inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-extrabold transition ${browseOpen ? "bg-white text-brand-700 shadow-sm ring-1 ring-slate-200" : "bg-brand-600 text-white shadow-sm hover:bg-brand-700"}`}
              aria-expanded={browseOpen}
              aria-controls="tool-browser"
              onClick={() => setBrowseOpen(!browseOpen)}
            >
              <Icon name="braces" size={17} /> Tools <span className={`rounded-md px-1.5 py-0.5 text-[0.625rem] font-extrabold ${browseOpen ? "bg-brand-50 text-brand-700" : "bg-white/20 text-white"}`}>{tools.length}</span><Icon name="chevron" size={14} />
            </button>
            {browseOpen && (
              <div id="tool-browser" className="absolute right-0 top-full z-50 mt-2 max-h-[min(75vh,40rem)] w-[min(48rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/10 sm:p-5">
                <div className="mb-4 flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <p className="text-sm font-extrabold text-slate-900">Find the right tool</p>
                    <p className="mt-1 text-xs text-slate-500">{tools.length} free utilities, organized by task.</p>
                  </div>
                  <Link to="/#search" onClick={() => setBrowseOpen(false)} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-bold text-slate-700 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700">
                    <Icon name="search" size={16} /> Search
                  </Link>
                </div>
                <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                  {toolGroups.map((group) => (
                    <div key={group.category}>
                      <h2 className="mb-1.5 text-[0.6875rem] font-extrabold uppercase tracking-wider text-slate-400">{group.category}</h2>
                      <ul className="space-y-0.5">
                        {group.tools.map((tool) => (
                          <li key={tool.slug}>
                            <Link
                              to={`/${tool.slug}`}
                              onClick={() => setBrowseOpen(false)}
                              className="flex min-h-9 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-slate-700 hover:bg-brand-50 hover:text-brand-700"
                            >
                              <Icon name={tool.icon} size={16} />
                              {tool.shortName || tool.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <Link to="/#about" className="rounded-xl px-3 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-white hover:text-brand-700 hover:shadow-sm">About</Link>
          <Link to="/contact" className="rounded-xl px-3 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-white hover:text-brand-700 hover:shadow-sm">Contact</Link>
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            to="/#search"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-slate-600 shadow-sm transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-600 sm:px-3.5"
            aria-label="Search tools"
            title="Search tools"
          >
            <Icon name="search" size={18} />
            <span className="hidden text-sm font-bold sm:inline">Search</span>
          </Link>
          <button
            className={`grid h-11 w-11 place-items-center rounded-xl border transition md:hidden ${open ? "border-brand-200 bg-brand-50 text-brand-700" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => setOpen(!open)}
          >
            <Icon name={open ? "x" : "menu"} />
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-navigation" className="container-page max-h-[calc(100dvh-var(--header-height))] overflow-y-auto border-t border-slate-100 bg-white py-4 shadow-lg shadow-slate-900/5 md:hidden" aria-label="Mobile navigation">
          <div className="grid grid-cols-2 gap-2">
            <Link to="/#tools" className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand-600 px-3 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700" onClick={close}>
              <Icon name="braces" size={17} /> Browse all tools
            </Link>
            <Link to="/#search" className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-700 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700" onClick={close}>
              <Icon name="search" size={17} /> Search tools
            </Link>
          </div>
          <div className="mt-4 border-t border-slate-100 pt-4">
            <div className="mb-2 flex items-center justify-between px-1">
              <p className="text-xs font-extrabold text-slate-900">Popular tools</p>
              <span className="text-[0.6875rem] font-medium text-slate-400">Quick access</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {popularTools.map((tool) => (
                <Link key={tool.slug} to={`/${tool.slug}`} className="flex min-h-14 min-w-0 items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold leading-tight text-slate-700 transition hover:border-brand-200 hover:bg-brand-50/60 hover:text-brand-700" onClick={close}>
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600"><Icon name={tool.icon} size={17} /></span>
                  <span className="line-clamp-2 min-w-0">{tool.shortName || tool.name}</span>
                </Link>
              ))}
            </div>
          </div>
          <div className="mt-3 flex items-center justify-center gap-5 border-t border-slate-100 pt-2">
            <Link to="/#about" className="inline-flex min-h-10 items-center text-sm font-semibold text-slate-500 hover:text-brand-600" onClick={close}>About</Link>
            <span className="h-1 w-1 rounded-full bg-slate-300" aria-hidden="true" />
            <Link to="/contact" className="inline-flex min-h-10 items-center text-sm font-semibold text-slate-500 hover:text-brand-600" onClick={close}>Contact</Link>
          </div>
        </nav>
      )}
    </header>
  )
}
