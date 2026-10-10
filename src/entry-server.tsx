import { renderToString } from "react-dom/server"
import { StaticRouter } from "react-router-dom"
import App from "./app/App"
import { headHtml, takeServerHead } from "./lib/seo"

export { routes } from "./app/routes"
export { SITE } from "./config/site"

/** Used by scripts/prerender.mjs: returns the page HTML and its <head> tags. */
export function render(url: string) {
  const html = renderToString(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>,
  )
  const head = takeServerHead()
  return { html, head: head ? headHtml(head) : "" }
}
