import { useEffect } from "react"
import { applyHead, setServerHead, type SeoMeta } from "@/lib/seo"

/** Sets title, description, canonical, social tags and JSON-LD. Works in the browser and during pre-render. */
export default function Seo(props: SeoMeta) {
  const isServer = typeof document === "undefined"
  if (isServer) setServerHead(props)
  const key = JSON.stringify(props)
  useEffect(() => {
    if (!isServer) applyHead(props)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  return null
}
