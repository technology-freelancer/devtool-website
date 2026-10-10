import { useState } from "react"
import { copyText } from "@/lib/clipboard"
import Icon from "./Icon"

/** Compact copy button for rows and panel headers. */
export default function CopyIconButton({ text, label = "Copy", onCopy }: { text: string; label?: string; onCopy?: () => void }) {
  const [done, setDone] = useState(false)
  return (
    <button
      type="button"
      disabled={!text}
      aria-label={label}
      title={label}
      className="inline-flex h-8 min-w-8 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-surface px-2 text-xs font-bold text-slate-500 transition hover:border-slate-300 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
      onClick={async () => {
        if (await copyText(text)) {
          onCopy?.()
          setDone(true)
          setTimeout(() => setDone(false), 1500)
        }
      }}
    >
      <Icon name={done ? "check" : "copy"} size={14} />
      {done ? "Copied" : ""}
    </button>
  )
}
