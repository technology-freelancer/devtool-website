import { useRef, type KeyboardEvent, type ReactNode } from "react"

type Props = {
  label: string
  value: string
  onChange?: (value: string) => void
  readOnly?: boolean
  badge?: string
  placeholder?: string
  lineNumbers?: boolean
  onKeyDown?: (e: KeyboardEvent<HTMLTextAreaElement>) => void
  headerAction?: ReactNode
}

const MAX_GUTTER_LINES = 10000

/** Shared code pane: used for every tool's input and output. Plain textarea = tiny bundle, great on mobile. */
export default function Editor({
  label, value, onChange, readOnly = false, badge, placeholder, lineNumbers = false, onKeyDown, headerAction,
}: Props) {
  const gutterRef = useRef<HTMLPreElement>(null)
  const lines = value ? value.split("\n").length : 0
  const showGutter = lineNumbers && lines > 0 && lines <= MAX_GUTTER_LINES
  const gutter = showGutter ? Array.from({ length: lines }, (_, i) => i + 1).join("\n") : ""

  return (
    <div className="flex min-h-72 flex-col overflow-hidden rounded-(--radius-card) border border-slate-200 bg-surface shadow-(--shadow-card) sm:min-h-[25rem]">
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-slate-200 bg-slate-50 px-4">
        <span className="text-sm font-extrabold text-slate-800">{label}</span>
        <div className="flex items-center gap-2">
          {headerAction}
          {badge && (
            <span className="rounded-md border border-slate-200 bg-surface px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {badge}
            </span>
          )}
        </div>
      </div>
      <div className="flex min-h-0 flex-1">
        {showGutter && (
          <pre
            ref={gutterRef}
            aria-hidden="true"
            className="code-area m-0 w-11 shrink-0 select-none overflow-hidden border-r border-slate-100 bg-slate-50/60 py-5 pr-2 text-right text-slate-300"
          >
            {gutter}
          </pre>
        )}
        <textarea
          aria-label={label}
          className={`code-area min-h-0 flex-1 resize-none p-4 outline-none sm:p-5 ${showGutter ? "py-5" : ""} ${
            readOnly ? "bg-slate-50/40 text-slate-700" : "bg-surface text-slate-800"
          }`}
          value={value}
          readOnly={readOnly}
          placeholder={placeholder}
          wrap={lineNumbers ? "off" : "soft"}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          onChange={(e) => onChange?.(e.target.value)}
          onKeyDown={onKeyDown}
          onScroll={(e) => {
            if (gutterRef.current) gutterRef.current.scrollTop = e.currentTarget.scrollTop
          }}
        />
      </div>
      <div className="flex h-9 shrink-0 items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/60 px-4 text-xs font-semibold text-slate-400">
        <span>{lines} {lines === 1 ? "line" : "lines"}</span>
        <span>{value.length.toLocaleString()} chars</span>
      </div>
    </div>
  )
}
