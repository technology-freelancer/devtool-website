import { currentToolSlug, track } from "@/lib/analytics"

/** Small option controls shared by tools. All styling comes from the theme tokens. */
const field =
  "h-11 rounded-(--radius-control) border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-800 outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-50"

const optionTrackName = (label: string) => `tool.option.${label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`

export function OptionSelect({
  label, value, onChange, options, dataTrack,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  dataTrack?: string
}) {
  const trackName = dataTrack ?? optionTrackName(label)
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-slate-600">{label}</span>
      <select className={`${field} min-w-32`} value={value} data-track={trackName} onChange={(e) => {
        const choice = options.find((option) => option.value === e.target.value)?.value
        if (choice === undefined) return
        track("tool_option_changed", { tool: currentToolSlug(), option: label, choice })
        onChange(choice)
      }}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  )
}

export function OptionText({
  label, value, onChange, placeholder, width = "w-40", type = "text",
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; width?: string; type?: "text" | "password" }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-slate-600">{label}</span>
      <input
        type={type}
        className={`${field} ${width} font-mono`}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        autoCapitalize="off"
        autoCorrect="off"
        autoComplete={type === "password" ? "off" : undefined}
        spellCheck={false}
      />
    </label>
  )
}

export function OptionToggle({ label, checked, onChange, dataTrack }: { label: string; checked: boolean; onChange: (v: boolean) => void; dataTrack?: string }) {
  const trackName = dataTrack ?? optionTrackName(label)
  return (
    <label data-track={trackName} className="flex h-11 cursor-pointer items-center gap-2.5 rounded-(--radius-control) border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-700 has-[:checked]:border-brand-300 has-[:checked]:bg-brand-50 has-[:checked]:text-brand-700">
      <input type="checkbox" data-track={trackName} className="h-4 w-4 accent-brand-600" checked={checked} onChange={(e) => {
        const choice = e.target.checked ? "on" : "off"
        track("tool_option_changed", { tool: currentToolSlug(), option: label, choice })
        onChange(e.target.checked)
      }} />
      {label}
    </label>
  )
}
