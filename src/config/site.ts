/** Site-wide settings. Set the VITE_* values in .env before deploying (see DEPLOYMENT.md). */
export const SITE = {
  name: "DevTools",
  url: ((import.meta.env.VITE_SITE_URL as string | undefined) ?? "https://devtools-com.vercel.app").replace(/\/+$/, ""),
  email: (import.meta.env.VITE_CONTACT_EMAIL as string | undefined) ?? "hellothefreelancer@gmail.com",
  operator: (import.meta.env.VITE_OPERATOR_NAME as string | undefined) ?? "DevTools",
  tagline: "Free online developer tools",
  legalUpdated: "October 15, 2026",
  /** ISO date for pages without their own content date. Update when those pages change. */
  lastModified: "2026-10-15",
  imageAlt: "DevTools: free online developer tools that run in your browser",
}
export const SITE_IMAGE = `${SITE.url}/og-image.svg`
