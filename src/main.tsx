import { StrictMode } from "react"
import { createRoot, hydrateRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import App from "./app/App"
import ErrorBoundary from "./components/ErrorBoundary"
import { initAnalytics } from "./lib/analytics"
import { initClickTracking } from "./lib/clickTracking"
import { initMonitoring } from "./lib/monitoring"
import { preloadLearnForPath } from "./tools/learn"
import "./style.css"

initAnalytics()
initClickTracking()
initMonitoring()

const tree = (
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
)

async function start() {
  const root = document.getElementById("root")!
  // The Learn text for this page must be loaded before hydrating, so the client renders exactly what the server sent.
  await preloadLearnForPath(location.pathname).catch(() => undefined)
  const normalize = (p: string) => (p.length > 1 ? p.replace(/\/+$/, "") : p)
  // Pre-rendered pages carry data-route. Hydrate only when it matches this URL, otherwise render fresh.
  if (root.hasChildNodes() && root.dataset.route === normalize(location.pathname)) {
    hydrateRoot(root, tree)
  } else {
    root.innerHTML = ""
    createRoot(root).render(tree)
  }
}

void start()
