import { useState } from "react"
import { OptionSelect, OptionText, OptionToggle } from "@/components/OptionControls"
import TextToolWorkspace from "@/components/TextToolWorkspace"
import { jsonToJava, type JavaOptions } from "@/lib/generators/java"
import { toPascalCase } from "@/lib/jsonModel"

const SAMPLE = `{
  "id": 101,
  "user_name": "John",
  "email": "john@example.com",
  "active": true,
  "address": { "city": "Pune", "zip": "411001" },
  "orders": [
    { "order_id": 1, "total": 99.5 },
    { "order_id": 2, "total": 20 }
  ]
}`

export default function JsonToJava() {
  const [rootName, setRootName] = useState("User")
  const [packageName, setPackageName] = useState("")
  const [style, setStyle] = useState<JavaOptions["style"]>("pojo")
  const [jackson, setJackson] = useState(true)
  const name = toPascalCase(rootName || "Root")

  return (
    <TextToolWorkspace
      slug="json-to-java"
      inputLabel="JSON Input"
      outputLabel="Java Output"
      inputBadge="JSON"
      outputBadge="JAVA"
      sample={SAMPLE}
      actionLabel="Generate Java"
      run={(input) => jsonToJava(input, { rootName: name, packageName, style, jackson })}
      runKey={`${name}|${packageName}|${style}|${jackson}`}
      filename={`${name}.java`}
      mime="text/x-java-source"
      options={
        <>
          <OptionText label="Root class" value={rootName} onChange={setRootName} placeholder="User" />
          <OptionText label="Package (optional)" value={packageName} onChange={setPackageName} placeholder="com.example.model" width="w-52" />
          <OptionSelect
            label="Style"
            value={style}
            onChange={(v) => setStyle(v as JavaOptions["style"])}
            options={[
              { value: "pojo", label: "POJO (getters/setters)" },
              { value: "lombok", label: "Lombok @Data" },
              { value: "record", label: "Java record" },
              { value: "fields", label: "Public fields" },
            ]}
          />
          <OptionToggle label="Jackson annotations" checked={jackson} onChange={setJackson} />
        </>
      }
    />
  )
}
