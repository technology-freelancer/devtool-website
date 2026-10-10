import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { SITE } from "@/config/site"
import { track } from "@/lib/analytics"
import { canonicalUrl } from "@/lib/seo"
import { relatedTools, type Tool } from "@/tools/registry"
import AdSlot from "./AdSlot"
import Faq from "./Faq"
import Icon from "./Icon"
import Seo from "./Seo"
import ToolCard from "./ToolCard"

export function toolTitle(tool: Tool) {
  return tool.slug.startsWith("json-to-") ? `${tool.name} Converter` : tool.name
}

const PRIVACY_FAQ: [string, string] = ["Is my input saved or uploaded?", "No. Everything is processed locally in your browser. Your input is never sent to our servers or to analytics."]

function jsonLd(tool: Tool) {
  const url = canonicalUrl(`/${tool.slug}`)
  const faqs = [...tool.faqs, PRIVACY_FAQ]
  return [
    { "@context": "https://schema.org", "@type": "WebApplication", name: toolTitle(tool), url, description: tool.seoDescription, applicationCategory: "DeveloperApplication", operatingSystem: "Any", browserRequirements: "Requires JavaScript", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: SITE.url + "/" }, { "@type": "ListItem", position: 2, name: toolTitle(tool), item: url }] },
  ]
}

/**
 * The reusable page frame for EVERY tool: SEO title/description, breadcrumb, heading,
 * the tool workspace (children), ad slot, how-to, features, FAQ and related tools.
 */
export default function ToolShell({ tool, children }: { tool: Tool; children: ReactNode }) {
  return (
    <main className="bg-slate-50/40">
      <Seo title={`${tool.seoTitle} | ${SITE.name}`} description={tool.seoDescription} path={`/${tool.slug}`} jsonLd={jsonLd(tool)} />

      <div className="container-page pt-7 sm:pt-9 lg:pt-12">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-x-2 text-sm text-slate-500">
          <Link to="/" className="inline-flex min-h-9 items-center hover:text-brand-600">Home</Link>
          <span aria-hidden="true">/</span>
          <Link to="/#tools" className="inline-flex min-h-9 items-center hover:text-brand-600">Developer Tools</Link>
          <span aria-hidden="true">/</span>
          <span className="font-semibold text-slate-700">{tool.name}</span>
        </nav>
        <div className="mt-6 flex items-start gap-3 sm:mt-8 sm:gap-4">
          <span className="icon-box-lg"><Icon name={tool.icon} size={26} /></span>
          <div className="min-w-0">
            <span className="section-kicker">{tool.category} tool</span>
            <h1 className="heading-page mt-1">{toolTitle(tool)}</h1>
            <p className="mt-3 text-base text-slate-600">{tool.description}</p>
          </div>
        </div>
      </div>

      {children}

      <div className="container-page py-6"><AdSlot /></div>

      <section className="container-narrow py-10 sm:py-14">
        <div className="prose-section">
          <span className="section-kicker">Quick guide</span>
          <h2 className="section-title">How to use {tool.name}</h2>
          <p>{tool.description} It runs in your browser, so your data stays private.</p>
        </div>
        <ol className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-3 sm:gap-6">
          {tool.steps.map(([title, text], i) => (
            <li key={title} className="content-card">
              <span className="step-number">{i + 1}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ol>
        <div className="mt-10 sm:mt-12">
          <h2 className="text-xl font-black text-slate-950 sm:text-2xl">Supported features</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {tool.features.map((f) => (
              <div key={f} className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                  <Icon name="check" size={14} />
                </span>
                {f}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-10 sm:mt-12">
          <h2 className="text-xl font-black text-slate-950 sm:text-2xl">Frequently asked questions</h2>
          <div className="mt-5 divide-y divide-slate-200 border-y border-slate-200">
            {[...tool.faqs, PRIVACY_FAQ].map(([q, a]) => <Faq key={q} question={q} answer={a} />)}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-100 bg-slate-50">
        <div className="container-page py-10 sm:py-12">
          <h2 className="text-xl font-black text-slate-950">Related developer tools</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {relatedTools(tool).map((t) => (
              <ToolCard
                key={t.slug}
                compact
                tool={t}
                onSelect={() => track("related_tool_clicked", { tool: tool.slug, to_tool: t.slug })}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
