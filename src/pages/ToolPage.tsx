import { Suspense, useEffect } from "react"
import { useParams } from "react-router-dom"
import ComingSoon from "@/components/ComingSoon"
import ToolShell from "@/components/ToolShell"
import { useIsClient } from "@/hooks/useIsClient"
import { track } from "@/lib/analytics"
import { toolComponents } from "@/tools/components"
import { getTool } from "@/tools/registry"
import NotFound from "./NotFound"

/** Reserves the workspace's space so the page does not jump when the tool loads. */
const Placeholder = () => <div className="container-page min-h-[30rem] py-10" aria-busy="true" aria-label="Loading tool" />

export default function ToolPage() {
  const { slug } = useParams()
  const tool = getTool(slug)
  const isClient = useIsClient()

  useEffect(() => {
    if (tool) track("tool_open", { tool: tool.slug })
  }, [tool])

  if (!tool) return <NotFound />
  const Workspace = toolComponents[tool.slug]

  return (
    <ToolShell tool={tool}>
      {!Workspace ? (
        <ComingSoon tool={tool} />
      ) : isClient ? (
        <Suspense fallback={<Placeholder />}>
          <Workspace />
        </Suspense>
      ) : (
        <Placeholder />
      )}
    </ToolShell>
  )
}
