import { Link } from "react-router-dom"
import type { Block, Learn } from "./types"

function Inline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g)
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith("**") && p.endsWith("**") && p.length > 4) return <strong key={i} className="font-bold text-slate-800">{p.slice(2, -2)}</strong>
        if (p.startsWith("`") && p.endsWith("`") && p.length > 1) {
          return <code key={i} className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.85em] text-slate-800">{p.slice(1, -1)}</code>
        }
        const m = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(p)
        if (m) {
          const cls = "font-semibold text-brand-600 underline underline-offset-2"
          return m[2].startsWith("/") ? (
            <Link key={i} to={m[2]} className={cls}>{m[1]}</Link>
          ) : (
            <a key={i} href={m[2]} className={cls} target="_blank" rel="noopener noreferrer">{m[1]}</a>
          )
        }
        return p
      })}
    </>
  )
}

function BlockView({ b }: { b: Block }) {
  switch (b.t) {
    case "p":
      return <p className="mt-4 text-[0.9375rem] leading-7 text-slate-600"><Inline text={b.text} /></p>
    case "ul":
      return (
        <ul className="mt-4 space-y-2.5 text-[0.9375rem] leading-7 text-slate-600">
          {b.items.map((it, i) => (
            <li key={i} className="flex gap-3"><span aria-hidden="true" className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" /><span><Inline text={it} /></span></li>
          ))}
        </ul>
      )
    case "table":
      return (
        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>{b.head.map((h) => <th key={h} scope="col" className="px-4 py-3">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {b.rows.map((r, i) => (
                <tr key={i}>{r.map((c, j) => <td key={j} className={`px-4 py-3 align-top leading-6 ${j === 0 ? "font-semibold text-slate-900" : ""}`}><Inline text={c} /></td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    case "code":
      return (
        <figure className="mt-4">
          <figcaption className="mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">{b.label}</figcaption>
          <pre className="code-area m-0 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-800"><code>{b.code}</code></pre>
        </figure>
      )
    case "note":
      return (
        <div className={`mt-4 rounded-xl border p-4 text-sm leading-6 ${b.kind === "warn" ? "border-amber-200 bg-amber-50 text-amber-900" : "border-brand-100 bg-brand-50/60 text-slate-700"}`}>
          <strong>{b.kind === "warn" ? "Watch out: " : "Tip: "}</strong><Inline text={b.text} />
        </div>
      )
  }
}

export default function LearnSection({ data, toolName }: { data: Learn; toolName: string }) {
  return (
    <section className="mt-12 border-t border-slate-200 pt-10 sm:mt-14" aria-label={`Learn about ${toolName}`}>
      <span className="section-kicker">Learn</span>
      <p className="mt-2 text-xs font-semibold text-slate-400">Last updated: {data.updated}</p>
      {data.sections.map((s) => (
        <div key={s.heading} className="mt-9">
          <h2 className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl">{s.heading}</h2>
          {s.blocks.map((b, i) => <BlockView key={i} b={b} />)}
        </div>
      ))}
      {data.related.length > 0 && (
        <div className="mt-9">
          <h2 className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl">Related tools</h2>
          <ul className="mt-4 space-y-2 text-[0.9375rem] leading-7 text-slate-600">
            {data.related.map((r) => (
              <li key={r.slug}><Link to={`/${r.slug}`} className="font-semibold text-brand-600 underline underline-offset-2">{r.anchor}</Link> {r.why}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="mt-9">
        <h2 className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl">Further reading</h2>
        <ul className="mt-4 space-y-2 text-[0.9375rem] leading-7">
          {data.references.map((r) => (
            <li key={r.href}><a href={r.href} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-600 underline underline-offset-2">{r.label}</a></li>
          ))}
        </ul>
      </div>
    </section>
  )
}