import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react"
import { useToolAnalytics } from "@/hooks/useToolAnalytics"
import { copyText, readClipboard } from "@/lib/clipboard"
import { downloadText } from "@/lib/download"
import { ToolError } from "@/lib/toolError"
import Button from "./Button"
import Editor from "./Editor"
import ErrorNote from "./ErrorNote"

type Props = {
  slug: string
  inputLabel: string
  outputLabel: string
  inputBadge?: string
  outputBadge?: string
  sample: string
  actionLabel: string
  /** Pure function: input text -> output text. Throw ToolError for user-fixable problems. */
  run: (input: string) => string
  filename: string
  mime?: string
  /** Optional option controls (selects, toggles) shown above the editors. */
  options?: ReactNode
  lineNumbers?: boolean
  /** Changes whenever an option changes; re-runs automatically once a result exists. */
  runKey?: string
}

/**
 * The reusable two-pane workspace (input | output) used by every text-in/text-out tool.
 * It owns: run / clear / paste / sample / copy / download / error state / analytics.
 * Everything runs in the browser; analytics only ever receive the tool slug and an error code.
 */
export default function TextToolWorkspace({
  slug, inputLabel, outputLabel, inputBadge, outputBadge, sample, actionLabel,
  run, filename, mime = "text/plain", options, lineNumbers = true, runKey = "",
}: Props) {
  const analytics = useToolAnalytics(slug)
  const [input, setInput] = useState(sample)
  const [output, setOutput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const execute = (silent = false) => {
    if (!silent) analytics.used()
    if (!input.trim()) {
      setOutput("")
      if (!silent) {
        setError("Paste or type something in the input first.")
        analytics.error("empty_input")
      }
      return
    }
    try {
      setOutput(run(input))
      setError(null)
      if (!silent) analytics.success()
    } catch (e) {
      setOutput("")
      if (e instanceof ToolError) {
        setError(e.message)
        if (!silent) analytics.error(e.code)
      } else {
        setError("Something went wrong while processing your input.")
        if (!silent) analytics.error("unexpected")
      }
    }
  }

  // Show a result for the sample on first load, and refresh it when options change.
  const executeRef = useRef(execute)
  executeRef.current = execute
  useEffect(() => {
    executeRef.current(true)
  }, [runKey])

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault()
      execute()
    }
  }

  const clear = () => {
    setInput("")
    setOutput("")
    setError(null)
    analytics.clear()
  }

  const paste = async () => {
    const text = await readClipboard()
    if (text === null) setError("Your browser blocked clipboard access. Press Ctrl+V (or long-press and Paste) in the input.")
    else {
      setInput(text)
      setError(null)
    }
  }

  const copy = async () => {
    if (!output) return
    if (await copyText(output)) {
      analytics.copy()
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } else setError("Could not copy automatically. Select the output and copy it manually.")
  }

  const download = () => {
    if (!output) return
    downloadText(filename, output, mime)
    analytics.download()
  }

  return (
    <div className="container-page py-8 sm:py-10">
      {options && (
        <div className="mb-4 flex flex-wrap items-end gap-3 rounded-(--radius-card) border border-slate-200 bg-surface p-3 sm:gap-4 sm:p-4">
          {options}
        </div>
      )}
      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <Editor
            label={inputLabel}
            value={input}
            onChange={setInput}
            badge={inputBadge}
            lineNumbers={lineNumbers}
            onKeyDown={onKeyDown}
            placeholder="Paste or type here…  (Ctrl/Cmd + Enter to run)"
          />
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={() => execute()} className="w-full sm:w-auto">{actionLabel}</Button>
            <Button variant="secondary" onClick={paste}>Paste</Button>
            <Button variant="secondary" onClick={() => { setInput(sample); setError(null) }}>Sample</Button>
            <Button variant="secondary" onClick={clear}>Clear</Button>
          </div>
        </div>
        <div>
          <Editor
            label={outputLabel}
            value={output}
            readOnly
            badge={outputBadge}
            lineNumbers={lineNumbers}
            placeholder="Your result appears here"
          />
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="secondary" icon={copied ? "check" : "copy"} onClick={copy} disabled={!output}>
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button variant="secondary" icon="download" onClick={download} disabled={!output}>
              Download
            </Button>
          </div>
        </div>
      </div>
      {error && <ErrorNote message={error} />}
      <p className="mt-4 text-xs text-slate-400">Processed locally in your browser. Your input is never uploaded.</p>
    </div>
  )
}
