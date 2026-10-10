import { Component, type ErrorInfo, type ReactNode } from "react"
import { captureError } from "@/lib/monitoring"

type State = { failed: boolean }

/** Catches render crashes, reports them (redacted) and shows a friendly fallback. */
export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    captureError(error, { stage: "render" })
    if (import.meta.env.DEV) console.error(error, info.componentStack)
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <main className="container-page py-24 text-center">
        <span className="section-kicker">Something went wrong</span>
        <h1 className="heading-page mt-2">This page hit an error</h1>
        <p className="mt-3 text-slate-500">Your data was not sent anywhere. Reload the page to try again.</p>
        <button
          className="mt-6 inline-flex min-h-11 items-center rounded-(--radius-control) bg-brand-600 px-5 text-sm font-bold text-white hover:bg-brand-700"
          onClick={() => window.location.assign("/")}
        >
          Back to home
        </button>
      </main>
    )
  }
}
