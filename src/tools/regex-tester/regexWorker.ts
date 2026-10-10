/// Runs user regexes off the main thread so a catastrophic pattern can be terminated.
import { runRegex } from "@/lib/regexRun"

type Req = { id: number; pattern: string; flags: string; text: string }
const post = (m: unknown) => (self as unknown as { postMessage: (m: unknown) => void }).postMessage(m)

self.addEventListener("message", (e: MessageEvent<Req>) => {
  const { id, pattern, flags, text } = e.data
  post({ id, result: runRegex(pattern, flags, text) })
})
