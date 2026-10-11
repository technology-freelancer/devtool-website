import { Route, Routes } from "react-router-dom"
import { Analytics } from "@vercel/analytics/react"
import ConsentBanner from "@/components/ConsentBanner"
import Footer from "@/components/Footer"
import Header from "@/components/Header"
import RouteTracker from "@/components/RouteTracker"
import ScrollManager from "@/components/ScrollManager"
import Home from "@/pages/Home"
import { ContactPage, PrivacyPage, TermsPage } from "@/pages/LegalPages"
import NotFound from "@/pages/NotFound"
import ToolPage from "@/pages/ToolPage"

export default function App() {
  return (
    <div className="flex min-h-dvh flex-col bg-page font-sans text-slate-900">
      <RouteTracker />
      <ScrollManager />
      <Header />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/:slug" element={<ToolPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
      <ConsentBanner />
      <Analytics />
    </div>
  )
}
