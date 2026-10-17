import { useEffect, useState } from "react"
import type { Learn } from "./types"

/**
 * Learn content is code-split per tool: a tool page downloads only its own text.
 * - Pre-render (server) and first load (browser) call `loadLearn()` BEFORE rendering/hydrating,
 *   so the content is in the static HTML and hydration never has to wait for a download.
 * - Client-side navigation loads it in an effect.
 */
const loaders: Record<string, () => Promise<{ default: Learn }>> = {
  "json-to-java": () => import("./content/json-to-java"),
  "json-to-typescript": () => import("./content/json-to-typescript"),
  "jwt-decoder": () => import("./content/jwt-decoder"),
  "cron-generator": () => import("./content/cron-generator"),
  "sql-formatter": () => import("./content/sql-formatter"),
  "regex-tester": () => import("./content/regex-tester"),
  "api-response-formatter": () => import("./content/api-response-formatter"),
  "uuid-generator": () => import("./content/uuid-generator"),
  "base64-converter": () => import("./content/base64-converter"),
  "timestamp-converter": () => import("./content/timestamp-converter"),
  "json-diff": () => import("./content/json-diff"),
  "aes-encryption-decryption": () => import("./content/aes-encryption-decryption"),
  "qr-code-generator": () => import("./content/qr-code-generator"),
}

export const learnLoaders = loaders
const cache = new Map<string, Learn>()

export const getLearn = (slug: string) => cache.get(slug)

export async function loadLearn(slug: string): Promise<Learn | undefined> {
  const hit = cache.get(slug)
  if (hit) return hit
  const load = loaders[slug]
  if (!load) return undefined
  const { default: data } = await load()
  cache.set(slug, data)
  return data
}

/** Preload for a URL path such as "/json-to-java". Safe for any path. */
export const preloadLearnForPath = (path: string) => loadLearn(path.replace(/^\/+|\/+$/g, ""))

export function useLearn(slug: string): Learn | undefined {
  const [, bump] = useState(0)
  const data = cache.get(slug)
  useEffect(() => {
    if (!cache.has(slug)) void loadLearn(slug).then(() => bump((n) => n + 1))
  }, [slug])
  return data
}