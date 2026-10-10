import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import AdSlot from "@/components/AdSlot"
import Button from "@/components/Button"
import Faq from "@/components/Faq"
import Icon, { type IconName } from "@/components/Icon"
import Seo from "@/components/Seo"
import ToolCard from "@/components/ToolCard"
import { SITE } from "@/config/site"
import { track } from "@/lib/analytics"
import { getTool, popularSlugs, tools } from "@/tools/registry"

const faqs: [string, string][] = [
  ["Are these developer tools free?", "Yes. Every tool on DevTools is free to use, with no usage limits for everyday tasks."],
  ["Is my data uploaded?", "Whenever possible, processing happens locally in your browser. Your input is not stored on our servers."],
  ["Can I use these tools without signing up?", "Absolutely. No account or email address is required."],
  ["Which browsers are supported?", "DevTools works in the latest versions of Chrome, Safari, Firefox, and Edge."],
  ["Do I need to install anything?", "No. All tools run directly in your browser, on desktop and mobile."],
]

const features: [IconName, string, string][] = [
  ["lock", "Privacy-first", "Your data stays in your browser whenever possible."],
  ["bolt", "Fast", "Instant results without unnecessary uploads."],
  ["gift", "Free", "Use essential developer tools without creating an account."],
]

export default function Home() {
  const [query, setQuery] = useState("")
  const filtered = tools.filter((t) =>
    `${t.name} ${t.description} ${t.category}`.toLowerCase().includes(query.toLowerCase()),
  )
  useEffect(() => {
    const q = query.trim().toLowerCase()
    if (q.length < 2) return
    const t = setTimeout(
      () => track("search_used", { query: q.slice(0, 30), query_length: q.length, result_count: filtered.length }),
      800,
    )
    return () => clearTimeout(t)
  }, [query, filtered.length])
  const popular = popularSlugs.map(getTool).filter((t) => t !== undefined)

  return (
    <>
      <Seo
        title={`${SITE.name} - Free Online Developer Tools`}
        description="Free browser-based developer tools: convert JSON to Java or TypeScript, decode JWTs, format SQL, test regex and more. No sign-up, privacy-friendly."
        path="/"
        jsonLd={[{ "@context": "https://schema.org", "@type": "WebSite", name: SITE.name, url: SITE.url + "/", description: "Free online developer tools that run in your browser." }]}
      />

      <section className="relative overflow-hidden border-b border-slate-100 bg-hero">
        <div className="absolute left-1/2 top-8 h-80 w-80 -translate-x-1/2 rounded-full bg-brand-100/50 blur-3xl" />
        <div className="container-page relative py-14 text-center sm:py-20 lg:py-28">
          <div className="eyebrow mx-auto">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Free · Fast · Privacy-friendly
          </div>
          <h1 className="heading-hero mx-auto mt-6 max-w-4xl">Free tools for developers</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Format, convert, decode and test your data with simple browser-based developer utilities.
          </p>

          <div className="mx-auto mt-8 flex max-w-2xl items-center gap-3 rounded-2xl border border-slate-200 bg-surface p-1.5 pl-4 shadow-xl shadow-slate-200/50 transition focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-50 sm:mt-9 sm:p-2 sm:pl-5">
            <span className="text-slate-400"><Icon name="search" size={21} /></span>
            <input
              id="tool-search"
              type="search"
              className="min-w-0 flex-1 bg-transparent py-2.5 text-slate-900 outline-none placeholder:text-slate-400"
              placeholder="Search a developer tool..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search developer tools"
            />
            <Button
              className="hidden sm:inline-flex"
              onClick={() => document.getElementById("tools")?.scrollIntoView({ behavior: "smooth" })}
            >
              Find tool
            </Button>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm">
            <span className="font-semibold text-slate-400">Popular:</span>
            {popular.map((t) => (
              <Link
                key={t.slug}
                to={`/${t.slug}`}
                className="inline-flex min-h-9 items-center font-semibold text-slate-600 underline decoration-slate-200 underline-offset-4 hover:text-brand-600"
              >
                {t.slug === "api-response-formatter" ? "JSON Formatter" : t.shortName || t.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="tools" className="container-page py-12 sm:py-16 lg:py-20">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <span className="section-kicker">All utilities</span>
            <h2 className="section-title">Developer tools</h2>
            <p className="section-copy">Everything you need for everyday development tasks.</p>
          </div>
          <span className="text-sm font-semibold text-slate-400">{filtered.length} tools</span>
        </div>
        {filtered.length ? (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:mt-9 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((t) => <ToolCard key={t.slug} tool={t} />)}
          </div>
        ) : (
          <div className="mt-9 rounded-2xl border border-slate-200 px-4 py-16 text-center">
            <p className="font-bold text-slate-800">No tools found</p>
            <button className="mt-2 min-h-11 text-sm font-bold text-brand-600" onClick={() => setQuery("")}>
              Clear search
            </button>
          </div>
        )}
      </section>

      <section className="container-page pb-12 sm:pb-16"><AdSlot wide /></section>

      <section id="about" className="border-y border-slate-100 bg-slate-50/70">
        <div className="container-page py-12 sm:py-16 lg:py-20">
          <div className="text-center">
            <span className="section-kicker">Why DevTools</span>
            <h2 className="section-title">Built for developers</h2>
            <p className="section-copy mx-auto">Get the answer you need, then get back to building.</p>
          </div>
          <div className="mt-10 grid gap-4 sm:gap-5 md:grid-cols-3">
            {features.map(([icon, title, copy]) => (
              <div className="feature-card" key={title}>
                <span className="icon-box"><Icon name={icon} /></span>
                <h3 className="mt-5 text-lg font-extrabold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-12 sm:py-16 lg:py-20">
        <span className="section-kicker">Quick access</span>
        <h2 className="section-title">Most popular</h2>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {popular.map((t) => <ToolCard key={t.slug} compact tool={t} />)}
        </div>
      </section>

      <section className="border-y border-slate-100 bg-brand-50/50">
        <div className="container-page grid gap-8 py-12 sm:py-16 lg:grid-cols-[0.85fr_1.15fr] lg:gap-10 lg:py-20">
          <div>
            <span className="section-kicker">Made for real work</span>
            <h2 className="section-title max-w-md">Simple developer tools for everyday work</h2>
          </div>
          <p className="max-w-2xl self-center text-base leading-8 text-slate-600">
            DevTools provides browser-based utilities for formatting JSON, converting data structures, testing
            regular expressions, decoding JWTs, generating UUIDs, and more. Every utility is designed to be fast,
            focused, and easy to use, without setup or sign-up.
          </p>
        </div>
      </section>

      <section className="container-narrow py-12 sm:py-16 lg:py-20" style={{ maxWidth: "48rem" }}>
        <div className="text-center">
          <span className="section-kicker">Help center</span>
          <h2 className="section-title">Frequently asked questions</h2>
        </div>
        <div className="mt-9 divide-y divide-slate-200 border-y border-slate-200">
          {faqs.map(([q, a]) => <Faq key={q} question={q} answer={a} />)}
        </div>
      </section>
    </>
  )
}
