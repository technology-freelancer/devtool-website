import { useState } from "react"
import { OptionSelect, OptionToggle } from "@/components/OptionControls"
import TextToolWorkspace from "@/components/TextToolWorkspace"
import { parseJson } from "@/lib/jsonModel"

const SAMPLE = `{"id":101,"name":"John","email":"john@example.com","active":true,"roles":["admin","dev"],"address":{"city":"Pune","zip":"411001"}}`

function sortKeys(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(sortKeys)
  if (v && typeof v === "object") {
    return Object.fromEntries(Object.entries(v as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([k, x]) => [k, sortKeys(x)]))
  }
  return v
}

export default function ApiResponseFormatter() {
  const [mode, setMode] = useState("format")
  const [indent, setIndent] = useState("2")
  const [sorted, setSorted] = useState(false)

  const run = (input: string) => {
    let data = parseJson(input)
    if (sorted) data = sortKeys(data)
    if (mode === "minify") return JSON.stringify(data)
    return JSON.stringify(data, null, indent === "tab" ? "\t" : Number(indent))
  }

  return (
    <TextToolWorkspace
      slug="api-response-formatter"
      inputLabel="API Response"
      outputLabel="Formatted Response"
      inputBadge="JSON"
      outputBadge="JSON"
      sample={SAMPLE}
      actionLabel={mode === "minify" ? "Minify response" : "Format response"}
      run={run}
      runKey={`${mode}|${indent}|${sorted}`}
      filename="response.json"
      mime="application/json"
      options={
        <>
          <OptionSelect label="Mode" value={mode} onChange={setMode} options={[{ value: "format", label: "Format" }, { value: "minify", label: "Minify" }]} />
          {mode === "format" && (
            <OptionSelect label="Indent" value={indent} onChange={setIndent} options={[{ value: "2", label: "2 spaces" }, { value: "4", label: "4 spaces" }, { value: "tab", label: "Tab" }]} />
          )}
          <OptionToggle label="Sort keys A–Z" checked={sorted} onChange={setSorted} />
        </>
      }
    />
  )
}
