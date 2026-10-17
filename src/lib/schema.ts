import { SITE } from "@/config/site"
import { canonicalUrl } from "./seo"

const context = "https://schema.org"

export const breadcrumbLd = (items: { name: string; path: string }[]) => ({
  "@context": context,
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: canonicalUrl(item.path) })),
})

export const organizationLd = () => ({ "@context": context, "@type": "Organization", name: SITE.name, url: `${SITE.url}/`, logo: `${SITE.url}/favicon-192.png` })

export const websiteLd = () => ({ "@context": context, "@type": "WebSite", name: SITE.name, url: `${SITE.url}/`, inLanguage: "en", description: "Free online developer tools that run in your browser." })

export const itemListLd = (items: { name: string; path: string }[]) => ({
  "@context": context,
  "@type": "ItemList",
  itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, url: canonicalUrl(item.path) })),
})