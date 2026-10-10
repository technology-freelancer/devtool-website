import { useState } from "react"
import { OptionSelect, OptionText, OptionToggle } from "@/components/OptionControls"
import TextToolWorkspace from "@/components/TextToolWorkspace"
import { jsonToTypeScript } from "@/lib/generators/typescript"
import { toPascalCase } from "@/lib/jsonModel"

const SAMPLE = `{
  "id": 101,
  "name": "John",
  "email": "john@example.com",
  "active": true,
  "address": { "city": "Pune", "zip": "411001" },
  "orders": [
    { "id": 1, "total": 99.5, "coupon": null },
    { "id": 2, "total": 20 }
  ]
}`

export default function JsonToTypeScript() {
  const [rootName, setRootName] = useState("User")
  const [style, setStyle] = useState<"interface" | "type">("interface")
  const [exportTypes, setExportTypes] = useState(true)
  const [readonly, setReadonly] = useState(false)
  const name = toPascalCase(rootName || "Root")

  return (
    <TextToolWorkspace
      slug="json-to-typescript"
      inputLabel="JSON Input"
      outputLabel="TypeScript Output"
      inputBadge="JSON"
      outputBadge="TS"
      sample={SAMPLE}
      actionLabel="Generate TypeScript"
      run={(input) => jsonToTypeScript(input, { rootName: name, style, exportTypes, readonly })}
      runKey={`${name}|${style}|${exportTypes}|${readonly}`}
      filename="types.ts"
      options={
        <>
          <OptionText label="Root name" value={rootName} onChange={setRootName} placeholder="User" />
          <OptionSelect label="Declare with" value={style} onChange={(v) => setStyle(v as "interface" | "type")} options={[{ value: "interface", label: "interface" }, { value: "type", label: "type" }]} />
          <OptionToggle label="export" checked={exportTypes} onChange={setExportTypes} />
          <OptionToggle label="readonly" checked={readonly} onChange={setReadonly} />
        </>
      }
    />
  )
}
