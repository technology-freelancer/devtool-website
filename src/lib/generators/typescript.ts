import { collectObjects, infer, parseJson, type TypeNode } from "../jsonModel"

export type TsOptions = {
  rootName: string
  style: "interface" | "type"
  exportTypes: boolean
  readonly: boolean
}

const IDENT = /^[A-Za-z_$][\w$]*$/

function tsType(t: TypeNode): string {
  switch (t.kind) {
    case "string": return "string"
    case "boolean": return "boolean"
    case "int": case "long": case "double": return "number"
    case "null": return "null"
    case "any": return "unknown"
    case "object": return t.name
    case "array": {
      const inner = tsType(t.item)
      return inner.includes(" | ") ? `(${inner})[]` : `${inner}[]`
    }
    case "union": return t.types.map(tsType).join(" | ")
  }
}

export function jsonToTypeScript(input: string, opts: TsOptions): string {
  const data = parseJson(input)
  const root = infer(data, opts.rootName)
  const objects = collectObjects(root, opts.rootName)
  const exp = opts.exportTypes ? "export " : ""
  const ro = opts.readonly ? "readonly " : ""

  const blocks = objects.map((o) => {
    const lines = o.fields.map((f) => {
      const key = IDENT.test(f.key) ? f.key : JSON.stringify(f.key)
      return `  ${ro}${key}${f.optional ? "?" : ""}: ${tsType(f.type)};`
    })
    const body = lines.length ? `\n${lines.join("\n")}\n` : ""
    return opts.style === "interface"
      ? `${exp}interface ${o.name} {${body}}`
      : `${exp}type ${o.name} = {${body}};`
  })

  if (root.kind === "array" && objects.length) {
    blocks.push(`${exp}type ${opts.rootName}List = ${tsType(root).replace(new RegExp(`^${opts.rootName}`), opts.rootName)};`)
  } else if (root.kind !== "object") {
    blocks.push(`${exp}type ${opts.rootName} = ${tsType(root)};`)
  }
  return blocks.join("\n\n")
}
