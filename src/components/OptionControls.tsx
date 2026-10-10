/** Small option controls shared by tools. All styling comes from the theme tokens. */
const field =
  "h-11 rounded-(--radius-control) border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-800 outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-50"

export function OptionSelect({
  label, value, onChange, options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-slate-600">{label}</span>
      <select className={`${field} min-w-32`} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  )
}

export function OptionText({
  label, value, onChange, placeholder, width = "w-40",
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; width?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-slate-600">{label}</span>
      <input
        className={`${field} ${width} font-mono`}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
      />
    </label>
  )
}

export function OptionToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex h-11 cursor-pointer items-center gap-2.5 rounded-(--radius-control) border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-700 has-[:checked]:border-brand-300 has-[:checked]:bg-brand-50 has-[:checked]:text-brand-700">
      <input type="checkbox" className="h-4 w-4 accent-brand-600" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  )
}
