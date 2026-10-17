import { Link } from "react-router-dom"
import type { Tool } from "@/tools/registry"
import Icon from "./Icon"

export default function ToolCard({ tool, compact = false, onSelect, trackName }: { tool: Tool; compact?: boolean; onSelect?: () => void; trackName?: string }) {
  return (
    <Link to={`/${tool.slug}`} data-track={trackName ?? "card.tool." + tool.slug} onClick={onSelect} className={`group block w-full text-left ${compact ? "popular-card" : "tool-card"}`}>
      <span className={compact ? "icon-box-sm" : "icon-box"}>
        <Icon name={tool.icon} size={compact ? 19 : 22} />
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block font-extrabold text-slate-900 ${compact ? "text-sm" : "text-base"}`}>
          {tool.shortName || tool.name}
        </span>
        {!compact && (
          <>
            <span className="mt-1.5 block text-sm leading-6 text-slate-500">{tool.description}</span>
            <span className="mt-4 flex items-center gap-1.5 text-sm font-bold text-brand-600">
              Open tool <Icon name="arrow" size={16} />
            </span>
          </>
        )}
      </span>
      {compact && (
        <span className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-600">
          <Icon name="chevron" size={18} />
        </span>
      )}
    </Link>
  )
}
