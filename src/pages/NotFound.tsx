import { Link } from "react-router-dom"
import Seo from "@/components/Seo"

export default function NotFound() {
  return (
    <main className="container-page py-24 text-center">
      <Seo title="Page not found | DevTools" description="This page does not exist." path="/404" noindex />
      <span className="section-kicker">Error 404</span>
      <h1 className="heading-page mt-2">Page not found</h1>
      <p className="mt-3 text-slate-500">That page does not exist. Try one of our tools instead.</p>
      <Link to="/#tools" className="mt-6 inline-flex min-h-11 items-center rounded-(--radius-control) bg-brand-600 px-5 text-sm font-bold text-white hover:bg-brand-700">
        Browse all tools
      </Link>
    </main>
  )
}
