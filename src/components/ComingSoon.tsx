import type { Tool } from "@/tools/registry"
import Icon from "./Icon"

export default function ComingSoon({ tool }: { tool: Tool }) {
  return (
    <div className="container-page py-8 sm:py-10">
      <div className="info-panel flex min-h-64 flex-col items-center justify-center text-center">
        <span className="icon-box"><Icon name="bolt" /></span>
        <h2 className="text-lg font-extrabold text-slate-900">{tool.name} is coming soon</h2>
        <p className="mt-1 max-w-md text-sm text-slate-500">The tool workspace will appear here.</p>
      </div>
    </div>
  )
}
