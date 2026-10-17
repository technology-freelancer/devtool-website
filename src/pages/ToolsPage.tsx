import { Link } from "react-router-dom"
import Seo from "@/components/Seo"
import ToolCard from "@/components/ToolCard"
import { SITE } from "@/config/site"
import { breadcrumbLd, itemListLd } from "@/lib/schema"
import { tools } from "@/tools/registry"

const CATEGORIES: [string, string][] = [
  ["Convert", "Transform JSON, text, and timestamps between useful formats."],
  ["Format", "Make JSON, API responses and SQL queries easier to read."],
  ["Decode", "Inspect token data and other encoded values."],
  ["Generate", "Create cron schedules, UUIDs and QR codes."],
  ["Test", "Try regular expressions against sample text."],
  ["Compare", "Find what changed between two JSON documents."],
  ["Security", "Encrypt and decrypt text with AES in your browser."],
]

export default function ToolsPage() {
  const known = new Set(CATEGORIES.map(([name]) => name))
  const groups = [...CATEGORIES, ...[...new Set(tools.map((tool) => tool.category))].filter((category) => !known.has(category)).map((category): [string, string] => [category, ""])]
    .map(([name, blurb]) => ({ name, blurb, items: tools.filter((tool) => tool.category === name) }))
    .filter((group) => group.items.length)

  return (
    <main>
      <Seo
        title={`All Free Online Developer Tools | ${SITE.name}`}
        description="Browse free DevTools utilities: JSON to Java and TypeScript, JWT decoder, SQL formatter, regex tester, UUID, Base64, AES encryption and QR codes."
        path="/tools"
        jsonLd={[breadcrumbLd([{ name: "Home", path: "/" }, { name: "All tools", path: "/tools" }]), itemListLd(tools.map((tool) => ({ name: tool.name, path: `/${tool.slug}` })))]}
      />
      <section className="border-b border-slate-100 bg-hero">
        <div className="container-page py-10 sm:py-14">
          <nav aria-label="Breadcrumb" className="flex items-center gap-x-2 text-sm text-slate-500">
            <Link to="/" className="inline-flex min-h-9 items-center hover:text-brand-600">Home</Link>
            <span aria-hidden="true">/</span><span className="font-semibold text-slate-700">All tools</span>
          </nav>
          <h1 className="heading-page mt-5">Free online developer tools</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
            {SITE.name} has {tools.length} free utilities for everyday development work. Each tool runs in your browser, so the data you paste is not uploaded. Choose a category, then open a tool to get started.
          </p>
        </div>
      </section>
      <div className="container-page space-y-12 py-10 sm:py-14">
        {groups.map((group) => (
          <section key={group.name} aria-labelledby={`category-${group.name}`}>
            <h2 id={`category-${group.name}`} className="section-title mt-0">{group.name} tools</h2>
            {group.blurb && <p className="section-copy max-w-3xl">{group.blurb}</p>}
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((tool) => <ToolCard key={tool.slug} tool={tool} />)}
            </div>
          </section>
        ))}
      </div>
    </main>
  )
}
