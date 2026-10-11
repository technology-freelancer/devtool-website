import { EX } from "../examples"
import type { Learn } from "../types"

const learn: Learn = {
  updated: "October 2026",
  sections: [
    {
      heading: "What is a JSON formatter?",
      blocks: [
        { t: "p", text: "A JSON formatter adds indentation and line breaks to JSON so people can read it. This is called pretty-printing. The opposite, minifying, removes all unneeded whitespace to make the text smaller. Neither changes the data." },
        { t: "p", text: "This tool also works as a validator. It parses your text as JSON and stops at the first syntax error, with the browser's error message, so you can find the problem." },
      ],
    },
    {
      heading: "Worked example: from one line to readable JSON",
      blocks: [
        { t: "code", label: "Compact API response", code: EX.apiCompact },
        { t: "code", label: "Formatted with 2 spaces", code: EX.apiPretty },
      ],
    },
    {
      heading: "JSON syntax rules",
      blocks: [
        {
          t: "table",
          head: ["Rule", "Valid", "Invalid"],
          rows: [
            ["Strings use double quotes", "`{\"a\": \"b\"}`", "`{'a': 'b'}`"],
            ["Keys are quoted", "`{\"a\": 1}`", "`{a: 1}`"],
            ["No trailing commas", "`[1, 2]`", "`[1, 2,]`"],
            ["No comments", "(none)", "`// note` or `/* note */`"],
            ["Numbers have no leading zeros and no NaN or Infinity", "`7`", "`07`, `NaN`"],
            ["Only these values: string, number, object, array, true, false, null", "`null`", "`undefined`"],
          ],
        },
      ],
    },
    {
      heading: "Common JSON errors and what they usually mean",
      blocks: [
        { t: "p", text: "The exact wording differs between Chrome, Firefox and Safari, but the causes are the same." },
        {
          t: "table",
          head: ["Error message (approximately)", "Likely cause"],
          rows: [
            ["Unexpected token '<'", "The text is HTML, such as an error page or a login redirect, not JSON."],
            ["Unexpected end of JSON input", "The text is empty or was cut off."],
            ["Unexpected token ' (single quote)", "Single quotes were used instead of double quotes."],
            ["Expected double-quoted property name", "An unquoted key, or a trailing comma."],
            ["Unexpected non-whitespace character after JSON", "Two JSON documents were pasted together, or the text has extra characters at the end."],
          ],
        },
      ],
    },
    {
      heading: "Format, minify or sort keys?",
      blocks: [
        {
          t: "ul",
          items: [
            "**Format** when you read, debug or review a response.",
            "**Minify** to reduce size, for example when embedding JSON in a config value or a URL parameter.",
            "**Sort keys** to get a stable order, which makes two outputs easy to compare. Key order carries no meaning in a JSON object.",
          ],
        },
        { t: "note", kind: "warn", text: "JavaScript reads numbers as 64-bit floating point values. Whole numbers above 9,007,199,254,740,991 lose precision when parsed, so very large ids can change. APIs should send them as strings. If a key appears twice in an object, the last value wins." },
      ],
    },
    {
      heading: "Debugging an API response",
      blocks: [
        {
          t: "ul",
          items: [
            "Check the HTTP status code and the `Content-Type` header before blaming the JSON.",
            "Copy the raw response body, not a preview that your tool has already reformatted.",
            "Remove tokens, passwords and personal data before sharing a response with anyone.",
            "Use the [JSON diff tool](/json-diff) to compare a working response with a failing one.",
          ],
        },
      ],
    },
    {
      heading: "JSON is not a JavaScript object",
      blocks: [
        { t: "p", text: "JSON looks like a JavaScript object literal but is stricter, and the two are often confused. A JavaScript object can have unquoted keys, single-quoted strings, trailing commas, functions and `undefined`. None of those are valid JSON, so pasting an object copied from your code into a JSON tool often fails." },
        { t: "p", text: "Going the other way, `JSON.stringify()` quietly changes some values: properties set to `undefined` or to functions are left out, a `Date` becomes an ISO text string, `NaN` and `Infinity` become `null`, and a `BigInt` throws an error. Remember this when a saved or logged value looks different from the object that produced it." },
      ],
    },
  ],
  references: [
    { label: "RFC 8259: The JSON data interchange format", href: "https://www.rfc-editor.org/rfc/rfc8259" },
    { label: "json.org: the JSON syntax diagrams", href: "https://www.json.org" },
    { label: "MDN: JSON.parse()", href: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse" },
  ],
  related: [
    { slug: "json-diff", anchor: "JSON diff", why: "compares two responses and lists what changed." },
    { slug: "json-to-typescript", anchor: "JSON to TypeScript converter", why: "turns a response into TypeScript types." },
    { slug: "json-to-java", anchor: "JSON to Java converter", why: "turns a response into Java classes." },
  ],
}
export default learn