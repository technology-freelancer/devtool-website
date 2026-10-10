import { collectObjects, infer, parseJson, toCamelCase, toPascalCase, rootObject, type TypeNode } from "../jsonModel"
import { ToolError } from "../toolError"

export type JavaOptions = {
  rootName: string
  packageName: string
  style: "pojo" | "lombok" | "record" | "fields"
  jackson: boolean
}

const RESERVED = new Set(
  "abstract assert boolean break byte case catch char class const continue default do double else enum extends final finally float for goto if implements import instanceof int interface long native new package private protected public return short static strictfp super switch synchronized this throw throws transient try void volatile while true false null var record".split(" "),
)

function javaType(t: TypeNode, usesList: { v: boolean }): string {
  switch (t.kind) {
    case "string": return "String"
    case "boolean": return "Boolean"
    case "int": return "Integer"
    case "long": return "Long"
    case "double": return "Double"
    case "null": case "any": return "Object"
    case "object": return t.name
    case "array": usesList.v = true; return `List<${javaType(t.item, usesList)}>`
    case "union": {
      const real = t.types.filter((x) => x.kind !== "null")
      return real.length === 1 ? javaType(real[0], usesList) : "Object"
    }
  }
}

const fieldName = (key: string) => {
  const n = toCamelCase(key)
  return RESERVED.has(n) ? `${n}Value` : n
}

export function jsonToJava(input: string, opts: JavaOptions): string {
  const data = parseJson(input)
  const root = infer(data, opts.rootName)
  if (!rootObject(root)) throw new ToolError("Java classes need a JSON object (or an array of objects) at the top level.", "unsupported_root")
  const rootName = toPascalCase(opts.rootName)
  const objects = collectObjects(root, rootName)

  const list = { v: false }
  let needsProperty = false
  const classes = objects.map((o) => {
    const members = o.fields.map((f) => {
      const name = fieldName(f.key)
      const type = javaType(f.type, list)
      const annotate = opts.jackson && name !== f.key
      if (annotate) needsProperty = true
      return { name, type, key: f.key, annotate }
    })
    const ann = (m: (typeof members)[number]) => (m.annotate ? `@JsonProperty("${m.key}") ` : "")
    const classAnn = [opts.style === "lombok" ? "@Data" : "", opts.jackson ? "@JsonIgnoreProperties(ignoreUnknown = true)" : ""].filter(Boolean)
    const head = classAnn.length ? `${classAnn.join("\n")}\n` : ""

    if (opts.style === "record") {
      const comps = members.map((m) => `${ann(m)}${m.type} ${m.name}`).join(", ")
      return `${head}public record ${o.name}(${comps}) {}`
    }
    const cap = (s: string) => s[0].toUpperCase() + s.slice(1)
    if (opts.style === "fields") {
      const lines = members.map((m) => `    ${m.annotate ? `@JsonProperty("${m.key}")\n    ` : ""}public ${m.type} ${m.name};`)
      return `${head}public class ${o.name} {\n${lines.join("\n")}\n}`
    }
    const fieldLines = members.map((m) => `    ${m.annotate ? `@JsonProperty("${m.key}")\n    ` : ""}private ${m.type} ${m.name};`)
    let body = fieldLines.join("\n")
    if (opts.style === "pojo") {
      const accessors = members.map(
        (m) =>
          `    public ${m.type} get${cap(m.name)}() {\n        return ${m.name};\n    }\n\n    public void set${cap(m.name)}(${m.type} ${m.name}) {\n        this.${m.name} = ${m.name};\n    }`,
      )
      body += `\n\n${accessors.join("\n\n")}`
    }
    return `${head}public class ${o.name} {\n${body}\n}`
  })

  const imports: string[] = []
  if (opts.jackson) {
    imports.push("com.fasterxml.jackson.annotation.JsonIgnoreProperties")
    if (needsProperty) imports.push("com.fasterxml.jackson.annotation.JsonProperty")
  }
  if (opts.style === "lombok") imports.push("lombok.Data")
  if (list.v) imports.push("java.util.List")
  imports.sort()

  const header = [
    opts.packageName.trim() ? `package ${opts.packageName.trim()};` : "",
    imports.map((i) => `import ${i};`).join("\n"),
    "// Save each public class in its own file (ClassName.java).",
  ].filter(Boolean)
  return `${header.join("\n\n")}\n\n${classes.join("\n\n")}\n`
}
