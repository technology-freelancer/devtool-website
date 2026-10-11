import { Link } from "react-router-dom"
import { openConsentSettings } from "@/lib/consent"
import Logo from "./Logo"

const links = [
  { label: "Tools", to: "/#tools" },
  { label: "About", to: "/#about" },
  { label: "Privacy", to: "/privacy" },
  { label: "Terms", to: "/terms" },
  { label: "Contact", to: "/contact" },
]

const socials = [
  { label: "GitHub", href: "https://github.com/devtools-com", icon: "github" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/devtools-co/", icon: "linkedin" },
  { label: "Instagram", href: "https://www.instagram.com/devtools_com/", icon: "instagram" },
  // { label: "MDN Web Docs", href: "https://developer.mozilla.org/", icon: "mdn" },
  { label: "Medium", href: "https://devtoolscom.medium.com/", icon: "medium" },
  { label: "Reddit", href: "https://www.reddit.com/user/devtools-com/", icon: "reddit" },
  // { label: "X", href: "https://x.com/", icon: "x" },
  // { label: "YouTube", href: "https://www.youtube.com/", icon: "youtube" },
] as const

function SocialIcon({ name }: { name: (typeof socials)[number]["icon"] }) {
  const common = { fill: "currentColor", height: 20, viewBox: "0 0 24 24", width: 20, "aria-hidden": true as const }
  switch (name) {
    case "github":
      return <svg {...common}><path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.56.1.76-.24.76-.54v-2.08c-3.1.68-3.76-1.32-3.76-1.32-.5-1.29-1.23-1.63-1.23-1.63-1.01-.69.08-.68.08-.68 1.12.08 1.71 1.15 1.71 1.15 1 1.7 2.62 1.21 3.26.93.1-.72.39-1.21.71-1.49-2.48-.28-5.09-1.24-5.09-5.52 0-1.22.44-2.22 1.15-3-.12-.28-.5-1.42.11-2.96 0 0 .94-.3 3.05 1.15a10.6 10.6 0 0 1 5.55 0c2.11-1.45 3.05-1.15 3.05-1.15.61 1.54.23 2.68.11 2.96.72.78 1.15 1.78 1.15 3 0 4.29-2.61 5.24-5.1 5.51.4.35.76 1.03.76 2.08v3.05c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z" /></svg>
    case "linkedin":
      return <svg {...common}><path d="M20.45 2H3.55C2.69 2 2 2.68 2 3.52v16.96c0 .84.69 1.52 1.55 1.52h16.9c.86 0 1.55-.68 1.55-1.52V3.52c0-.84-.69-1.52-1.55-1.52ZM7.93 18.34H4.98V9.6h2.95v8.74ZM6.45 8.4a1.71 1.71 0 1 1 0-3.42 1.71 1.71 0 0 1 0 3.42Zm11.89 9.94h-2.95v-4.25c0-1.01-.02-2.31-1.41-2.31-1.41 0-1.63 1.1-1.63 2.24v4.32H9.4V9.6h2.83v1.2h.04c.39-.74 1.36-1.52 2.8-1.52 2.99 0 3.55 1.97 3.55 4.53v4.53Z" /></svg>
    case "instagram":
      return <svg {...common}><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2.2A2.8 2.8 0 0 0 4.2 7v10A2.8 2.8 0 0 0 7 19.8h10a2.8 2.8 0 0 0 2.8-2.8V7A2.8 2.8 0 0 0 17 4.2H7Zm5 3.1a4.7 4.7 0 1 1 0 9.4 4.7 4.7 0 0 1 0-9.4Zm0 2.2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Zm5.1-3.9a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2Z" /></svg>
    case "mdn":
      return <svg {...common}><path d="M2 5h3.3l2.2 3.1L9.7 5H13v14H9.8V10l-2.3 3-2.3-3v9H2V5Zm12 0h3.1c3.1 0 4.9 2.5 4.9 7s-1.8 7-4.9 7H14V5Zm3.1 10.8c1.2 0 1.8-1.2 1.8-3.8s-.6-3.8-1.8-3.8h-.1v7.6h.1Z" /></svg>
    case "medium":
      return <svg {...common}><path d="M3 6.2c0-.3-.1-.5-.4-.7L1 4.2V4h6.3l4.9 10.7L16.5 4H22v.2l-1.4 1.3c-.1.1-.2.2-.2.4v11.8c0 .2.1.3.2.4l1.4 1.3v.2h-7v-.2l1.5-1.3c.1-.1.1-.2.1-.4V8.1l-5.5 11.4h-.4L4.3 8.1v7.6c0 .5.2.9.6 1.2l1.9 2.3v.2H1v-.2l1.9-2.3c.4-.3.6-.7.5-1.2V6.2H3Z" /></svg>
    case "reddit":
      return <svg {...common}><path d="M12 3.2a1.7 1.7 0 0 1 3.3-.5l3.1.7a1.3 1.3 0 1 1-.3 1.2l-3-.7-.9 4.2c2.2.2 4.1 1 5.3 2.2a2 2 0 1 1 1.4 3.4c0 3.5-3.9 6.3-8.9 6.3s-8.9-2.8-8.9-6.3a2 2 0 1 1 1.4-3.4C5.7 9.1 7.6 8.3 9.8 8l.9-4.3A1.7 1.7 0 0 1 12 3.2ZM8.4 12a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6Zm7.2 0a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6Zm-7 4c1.6 1.3 5.2 1.3 6.8 0l-.8-.9c-1.2 1-4 1-5.2 0l-.8.9Z" /></svg>
    case "x":
      return <svg {...common}><path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3L12 14.9 5.8 22H2.6l7.3-8.4L1.9 2h6.4l4.4 6.5L18.9 2Zm-1.1 17.9h1.7L7.4 4H5.6l12.2 15.9Z" /></svg>
    case "youtube":
      return <svg {...common}><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.3 3.6-6.3 3.6Z" /></svg>
  }
}

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="container-page py-10">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">
          <div>
            <Logo />
            <p className="mt-3 text-sm text-slate-500">Simple tools for developers.</p>
          </div>
          <nav className="flex flex-wrap gap-x-7 gap-y-1 text-sm font-semibold text-slate-600" aria-label="Footer">
            {links.map((l) => (
              <Link key={l.label} to={l.to} className="inline-flex min-h-11 items-center hover:text-brand-600">
                {l.label}
              </Link>
            ))}
            <button type="button" onClick={openConsentSettings} className="inline-flex min-h-11 items-center hover:text-brand-600">
              Cookie settings
            </button>
          </nav>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3" aria-label="Social media and developer resources">
          {socials.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.label}
              title={social.label}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
            >
              <SocialIcon name={social.icon} />
            </a>
          ))}
        </div>
        <div className="mt-8 border-t border-slate-200 pt-6 text-xs text-slate-400">
          © {new Date().getFullYear()} DevTools. Built for developers everywhere.
        </div>
      </div>
    </footer>
  )
}
