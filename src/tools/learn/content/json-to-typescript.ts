import { EX } from "../examples"
import type { Learn } from "../types"

const learn: Learn = {
  updated: "October 2026",
  sections: [
    {
      heading: "What does a JSON to TypeScript converter do?",
      blocks: [
        { t: "p", text: "When you call an API from TypeScript you want the compiler to know the shape of the response, so typos and missing fields are caught while you type. This tool looks at a sample of your JSON and writes the matching `interface` or `type` declarations, including nested objects and arrays." },
        { t: "p", text: "It saves the tedious part: reading a long response and typing every field by hand. You still review the result, because a single sample cannot show everything the API might return." },
      ],
    },
    {
      heading: "How JSON types map to TypeScript types",
      blocks: [
        {
          t: "table",
          head: ["JSON value", "TypeScript type", "Notes"],
          rows: [
            ["string", "`string`", "Dates arrive as strings. Parse them yourself."],
            ["number (whole or decimal)", "`number`", "TypeScript has one number type. Integers above 2^53 lose precision."],
            ["true / false", "`boolean`", ""],
            ["null", "`null`", "A field that is only ever null in your sample is typed `null`. See the example below."],
            ["array", "`T[]`", "An empty array becomes `unknown[]` because the item type is unknown."],
            ["object", "`interface` or `type`", "Nested objects get their own named declaration."],
            ["mixed values", "union, e.g. `string | number`", "Arrays with several value types become `(string | number)[]`."],
          ],
        },
      ],
    },
    {
      heading: "Worked example",
      blocks: [
        { t: "code", label: "JSON input", code: EX.tsJson },
        { t: "code", label: "TypeScript output", code: EX.tsInterface },
        { t: "p", text: "Two details are worth noticing. `coupon?: string` is optional because only one of the two orders contains it. `email: null` is typed `null` because the sample only shows a null value. If the real field can hold a string, change it to `email: string | null` by hand." },
      ],
    },
    {
      heading: "Optional (?) versus nullable (| null)",
      blocks: [
        { t: "p", text: "These mean different things and APIs use both:" },
        {
          t: "table",
          head: ["Declaration", "Meaning"],
          rows: [
            ["`coupon?: string`", "The key may be missing from the object."],
            ["`coupon: string | null`", "The key is always present but its value may be null."],
            ["`coupon?: string | null`", "The key may be missing, or present with a null value."],
          ],
        },
        { t: "p", text: "The generator marks a field optional when some objects in an array lack the key, and adds `| null` when your sample mixes null and real values. Check your API documentation for the cases the sample did not show." },
      ],
    },
    {
      heading: "interface or type: which should you use?",
      blocks: [
        { t: "p", text: "For plain JSON shapes both work. Interfaces can be extended and merged, and their error messages are often easier to read. Type aliases can also describe unions, tuples and mapped types. Follow your team's convention. The tool lets you switch, and toggle `export` and `readonly`, with one click." },
      ],
    },
    {
      heading: "Types are not runtime validation",
      blocks: [
        { t: "note", kind: "warn", text: "TypeScript types disappear when your code is compiled. If the API returns something different from the generated type, nothing will warn you at runtime." },
        { t: "p", text: "For data from outside your control, validate it where it enters your app with a schema library such as [Zod](https://zod.dev), and infer the TypeScript type from the schema. Use the generated types as a fast starting point." },
      ],
    },
    {
      heading: "Common mistakes",
      blocks: [
        {
          t: "ul",
          items: [
            "**Using a tiny sample.** Include an array with several items so optional fields show up.",
            "**Trusting numbers as ids.** Integers larger than 9,007,199,254,740,991 cannot be represented exactly in JavaScript. APIs should send such ids as strings.",
            "**Expecting Date objects.** JSON has no date type. Convert the strings after parsing.",
            "**Keys that are not valid identifiers.** Names such as `first-name` are quoted automatically (`\"first-name\": string`).",
          ],
        },
      ],
    },
  ],
  references: [
    { label: "TypeScript handbook: everyday types", href: "https://www.typescriptlang.org/docs/handbook/2/everyday-types.html" },
    { label: "TypeScript handbook: object types", href: "https://www.typescriptlang.org/docs/handbook/2/objects.html" },
    { label: "Zod: TypeScript-first schema validation", href: "https://zod.dev" },
    { label: "RFC 8259: The JSON data interchange format", href: "https://www.rfc-editor.org/rfc/rfc8259" },
  ],
  related: [
    { slug: "json-to-java", anchor: "JSON to Java converter", why: "builds the matching classes for your backend." },
    { slug: "api-response-formatter", anchor: "API response formatter", why: "formats and validates the response first." },
    { slug: "json-diff", anchor: "JSON diff", why: "compares two responses to spot optional or changed fields." },
  ],
}
export default learn