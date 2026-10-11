// @vitest-environment jsdom
import { act } from "react"
import { hydrateRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { describe, expect, it, vi } from "vitest"
import App from "../src/app/App"
import { render, routes } from "../src/entry-server"
import { preloadLearnForPath } from "../src/tools/learn"

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

describe("pre-rendered pages hydrate without mismatches", () => {
  for (const url of [...routes, "/nope"]) {
    it(url, async () => {
      const { html } = await render(url)
      await preloadLearnForPath(url) // same as main.tsx
      document.body.innerHTML = `<div id="root">${html}</div>`
      window.history.pushState({}, "", url)
      const errors: string[] = []
      const spy = vi.spyOn(console, "error").mockImplementation((...a) => { errors.push(String(a[0]) + String(a[1] ?? "")) })
      const onRecoverable = vi.fn()
      let root: ReturnType<typeof hydrateRoot> | undefined
      await act(async () => {
        root = hydrateRoot(document.getElementById("root")!, <BrowserRouter><App /></BrowserRouter>, { onRecoverableError: onRecoverable })
        await new Promise((r) => setTimeout(r, 400))
      })
      spy.mockRestore()
      await act(async () => root?.unmount()) // keep tests isolated
      expect(onRecoverable).not.toHaveBeenCalled()
      expect(errors.filter((e) => /hydrat|did not match|mismatch/i.test(e))).toEqual([])
    })
  }
})
