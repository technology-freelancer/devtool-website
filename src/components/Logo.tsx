import { Link } from "react-router-dom"

export default function Logo() {
  return (
    <Link to="/" className="group flex items-center gap-2.5" aria-label="DevTools home">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white shadow-sm transition-transform group-hover:-rotate-3">
        <span className="font-mono text-sm font-bold">&lt;/&gt;</span>
      </span>
      <span className="text-xl font-extrabold tracking-tight text-slate-900">DevTools</span>
    </Link>
  )
}
