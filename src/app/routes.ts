import { tools } from "@/tools/registry"

/** Every URL that is pre-rendered to static HTML and listed in the sitemap. */
export const staticPages = ["/tools", "/about", "/privacy", "/terms", "/contact"]
export const routes = ["/", ...tools.map((t) => `/${t.slug}`), ...staticPages]
