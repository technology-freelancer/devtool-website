// @vitest-environment jsdom
import { act } from "react"
import { hydrateRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { describe, expect, it, vi } from "vitest"
import App from "../src/app/App"
import { render, routes } from "../src/entry-server"

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

describe("pre-rendered pages hydrate without mismatches", () => {
  for (const url of [...routes, "/nope"]) {
    it(url, async () => {
      const { html } = render(url)
      document.body.innerHTML = `<div id="root">${html}</div>`
      window.history.pushState({}, "", url)
      const errors: string[] = []
      const spy = vi.spyOn(console, "error").mockImplementation((...a) => { errors.push(String(a[0]) + String(a[1] ?? "")) })
      const onRecoverable = vi.fn()
      await act(async () => {
        hydrateRoot(document.getElementById("root")!, <BrowserRouter><App /></BrowserRouter>, { onRecoverableError: onRecoverable })
        await new Promise((r) => setTimeout(r, 200))
      })
      spy.mockRestore()
      expect(onRecoverable).not.toHaveBeenCalled()
      expect(errors.filter((e) => /hydrat|did not match|mismatch/i.test(e))).toEqual([])
    })
  }
})
