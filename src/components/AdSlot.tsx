export default function AdSlot({ wide = false }: { wide?: boolean }) {
  return (
    <div
      className={`ad-slot mx-auto flex w-full items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center ${
        wide ? "min-h-28 max-w-5xl" : "min-h-24"
      }`}
    >
      <div>
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Advertisement</span>
        <span className="mt-1 block text-xs text-slate-300">Reserved ad space</span>
      </div>
    </div>
  )
}
