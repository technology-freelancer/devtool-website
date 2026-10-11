import { useState } from "react"
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
  const close = () => setOpen(false)
  return (
    <header
      className="sticky top-0 z-40 border-b border-slate-100 bg-page/95 backdrop-blur"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="container-page flex items-center justify-between" style={{ height: "var(--header-height)" }}>
        <Logo />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          <div className="relative">
            <button
              type="button"
              className="nav-link inline-flex items-center gap-2"
              aria-expanded={browseOpen}
              aria-controls="tool-browser"
              onClick={() => setBrowseOpen(!browseOpen)}
            >
              Browse tools <Icon name="chevron" size={15} />
            </button>
            {browseOpen && (
              <div id="tool-browser" className="absolute left-0 top-full z-50 mt-3 w-[min(46rem,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/10">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-extrabold text-slate-900">Developer tools</p>
                    <p className="mt-1 text-xs text-slate-500">Pick a tool and get straight to work.</p>
                  </div>
                  <Link to="/#tools" onClick={() => setBrowseOpen(false)} className="text-sm font-bold text-brand-600 hover:text-brand-700">
                    View all <span aria-hidden="true">→</span>
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
          <Link to="/#about" className="nav-link">About</Link>
          <Link to="/contact" className="nav-link">Contact</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/#search"
            className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-600"
            aria-label="Search tools"
            title="Search tools"
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
        <nav className="container-page border-t border-slate-100 bg-white py-4 shadow-lg shadow-slate-900/5 md:hidden" aria-label="Mobile navigation">
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
