import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import Seo from "@/components/Seo"
import { SITE } from "@/config/site"
import { openConsentSettings } from "@/lib/consent"

function Legal({ title, path, description, children }: { title: string; path: string; description: string; children: ReactNode }) {
  return (
    <main className="container-narrow py-12 sm:py-16" style={{ maxWidth: "48rem" }}>
      <Seo title={`${title} | ${SITE.name}`} description={description} path={path} />
      <h1 className="heading-page">{title}</h1>
      <p className="mt-2 text-sm text-slate-400">Last updated: {SITE.legalUpdated}</p>
      <div className="mt-8 space-y-4 text-[0.9375rem] leading-7 text-slate-600 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-extrabold [&_h2]:text-slate-900 [&_li]:ml-5 [&_li]:list-disc [&_a]:font-semibold [&_a]:text-brand-600 [&_a]:underline">
        {children}
      </div>
    </main>
  )
}

export function PrivacyPage() {
  return (
    <Legal title="Privacy Policy" path="/privacy" description={`How ${SITE.name} handles your data: tools run in your browser and your input is never uploaded.`}>
      <p>{SITE.name} provides free developer tools at {SITE.url}. This page explains what data is and is not collected when you use the site.</p>

      <h2>Your tool input stays in your browser</h2>
      <p>Everything you paste into a tool (JSON, JWTs, SQL, API responses, text, regular expressions and so on) is processed locally by JavaScript in your browser. It is not uploaded to our servers, and it is not included in analytics or error reports.</p>

      <h2>Analytics</h2>
      <p>We use PostHog to understand how the site is used. We record page views and simple events such as which tool was opened, and whether Copy or Download was clicked. Events contain the tool name only, never the content you entered. We also receive standard technical data such as your browser, device type, referring site and approximate location derived from your IP address. We do not record sessions or screen activity, and we respect the Do Not Track setting of your browser.</p>
      <p>Until you choose Allow in the cookie banner, analytics runs without storing anything on your device. If you choose Allow, an anonymous identifier is stored in your browser so repeat visits can be counted. You can change your choice at any time using <button className="font-semibold text-brand-600 underline" onClick={openConsentSettings}>Cookie settings</button>.</p>

      <h2>Error monitoring</h2>
      <p>We use Sentry to find bugs. When the site fails, a report containing the error type, browser and page address may be sent. We remove error messages that could contain your input and we do not send personal data.</p>

      <h2>Cookies and local storage</h2>
      <ul>
        <li>Your analytics choice is stored in your browser&apos;s local storage.</li>
        <li>If you allow analytics, PostHog stores an anonymous identifier in local storage or a cookie.</li>
        <li>Fonts are served from this site, so no font requests are made to third parties.</li>
      </ul>

      <h2>Advertising</h2>
      <p>This site may show ads served by Google AdSense in the future. Google and its partners may use cookies to show ads based on your visits to this and other sites. You can manage ad personalization in your Google account&apos;s ad settings or at <a href="https://www.aboutads.info" rel="noopener noreferrer">aboutads.info</a>. We will update this page before ads are enabled.</p>

      <h2>Children</h2>
      <p>The site is intended for developers and is not directed at children under 13.</p>

      <h2>Changes and contact</h2>
      <p>We may update this policy and will change the date above when we do. Questions? Email <a href={`mailto:${SITE.email}`}>{SITE.email}</a> or see the <Link to="/contact">contact page</Link>.</p>
    </Legal>
  )
}

export function TermsPage() {
  return (
    <Legal title="Terms of Use" path="/terms" description={`The terms for using ${SITE.name}, a set of free online developer tools.`}>
      <p>By using {SITE.name} you agree to these terms. If you do not agree, please do not use the site.</p>

      <h2>Use of the tools</h2>
      <p>The tools are provided free of charge for lawful use. Do not use the site to attack, overload or interfere with it, or to break the law.</p>

      <h2>No warranty</h2>
      <p>The tools are provided &ldquo;as is&rdquo; without warranties of any kind. Results such as generated code, formatted output, decoded tokens and converted values may contain errors. Please review output before using it in production. Decoding a JWT does not verify its signature.</p>

      <h2>Limitation of liability</h2>
      <p>To the maximum extent permitted by law, {SITE.operator} is not liable for any loss or damage arising from your use of the site or from reliance on its output.</p>

      <h2>Your content</h2>
      <p>You keep all rights to the data you enter. Because tools run in your browser, we do not receive or store it. You are responsible for not entering data you are not allowed to process.</p>

      <h2>Intellectual property</h2>
      <p>The site design, text and code belong to {SITE.operator} or its licensors. Open-source libraries used by the site remain under their own licenses.</p>

      <h2>Changes and contact</h2>
      <p>We may change these terms and the site at any time. Questions? Email <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.</p>
    </Legal>
  )
}

export function ContactPage() {
  return (
    <Legal title="Contact" path="/contact" description={`Contact ${SITE.name}: report a bug, suggest a tool or ask a question.`}>
      <p>We read every message. Email us to report a bug, suggest a new tool or ask a question about privacy.</p>
      <p><a href={`mailto:${SITE.email}`}>{SITE.email}</a></p>
      <p>When reporting a bug, please tell us the tool, your browser and device, and what you expected to happen. Please do not send secrets, tokens or private data.</p>
    </Legal>
  )
}
