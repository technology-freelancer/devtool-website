import { prerenderToNodeStream } from "react-dom/static"
import { StaticRouter } from "react-router-dom"
import App from "./app/App"
import { headHtml, takeServerHead } from "./lib/seo"
import { SITE } from "./config/site"
import { getLearn, preloadLearnForPath } from "./tools/learn"

export { routes } from "./app/routes"
export { SITE } from "./config/site"

/**
 * Used by scripts/prerender.mjs: returns the page HTML and its <head> tags.
 * The Learn content for the page is loaded first so it is part of the static HTML.
 */
export async function render(url: string) {
  await preloadLearnForPath(url) // Learn text must be ready before rendering so it lands in the static HTML
  const { prelude } = await prerenderToNodeStream(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>,
  )
  const decoder = new TextDecoder()
  let html = ""
  for await (const chunk of prelude) html += decoder.decode(chunk as Uint8Array, { stream: true })
  html += decoder.decode()
  const head = takeServerHead()
  const slug = url.replace(/^\/+|\/+$/g, "")
  return { html, head: head ? headHtml(head) : "", modified: getLearn(slug)?.updatedIso ?? SITE.lastModified }
}
