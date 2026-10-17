import { EX } from "../examples"
import type { Learn } from "../types"

const learn: Learn = {
  updated: "October 2026",
  updatedIso: "2026-10-15",
  sections: [
    {
      heading: "What is a JSON diff?",
      blocks: [
        { t: "p", text: "A JSON diff compares two JSON documents by their structure and values, not by lines of text. A plain text diff reports a change when keys are reordered or the indentation differs. A JSON diff ignores those differences and reports only real changes: values that were added, removed or changed, each with its path." },
      ],
    },
    {
      heading: "How to read the results",
      blocks: [
        {
          t: "table",
          head: ["Symbol", "Meaning", "Example"],
          rows: [
            ["`+`", "Added: the key or item exists only in JSON B", "`+ $.beta: true`"],
            ["`-`", "Removed: it exists only in JSON A", "`- $.active: true`"],
            ["`~`", "Changed: the value is different", "`~ $.version: 1 -> 2`"],
          ],
        },
        { t: "p", text: "Paths start with `$` for the root. `.owner.team` goes into nested objects, and `[2]` means the item at index 2 of an array." },
      ],
    },
    {
      heading: "Worked example",
      blocks: [
        { t: "code", label: "JSON A (original)", code: EX.diffA },
        { t: "code", label: "JSON B (changed)", code: EX.diffB },
        { t: "code", label: "Differences found", code: EX.diffOut },
        { t: "p", text: "The key order differs between A and B and is not reported. The `tags` array grew by one item, which shows as an addition at index 2." },
      ],
    },
    {
      heading: "How arrays are compared",
      blocks: [
        {
          t: "ul",
          items: [
            "Items that are objects with an `id`, `_id` or `key` are matched by that value, so reordering the array does not make every item look changed.",
            "Other items are matched by position. Inserting an item at the start can shift every later item and produce many differences.",
            "A moved item appears as one removal and one addition.",
          ],
        },
        { t: "note", kind: "tip", text: "If an array produces too much noise, sort it first in your code, or make sure each object has an id." },
      ],
    },
    {
      heading: "What counts as a difference",
      blocks: [
        {
          t: "ul",
          items: [
            "**null is not the same as a missing key.** A key set to `null` in B but absent in A is reported as an addition, and the reverse as a removal.",
            "**Type matters.** `\"1\"` (text) and `1` (number) are different.",
            "**Number formatting does not.** `1` and `1.0` are the same number.",
            "**Key order and whitespace are ignored.** Key names are case-sensitive.",
          ],
        },
      ],
    },
    {
      heading: "When to use a JSON diff",
      blocks: [
        {
          t: "ul",
          items: [
            "Checking what changed between two versions of an API response.",
            "Finding configuration drift between staging and production.",
            "Verifying the output of a data migration or transformation.",
            "Working out why a webhook payload does not match what your code expects.",
            "Updating test fixtures when an API changes.",
          ],
        },
        { t: "p", text: "The result is meant for people to read. It is not a JSON Patch document (see [RFC 6902](https://www.rfc-editor.org/rfc/rfc6902)) that you can apply automatically. Very large documents depend on your device's memory." },
      ],
    },
    {
      heading: "Tips for cleaner comparisons",
      blocks: [
        { t: "ul", items: [
          "**Remove noisy fields first.** Request ids, timestamps and trace ids differ on every call. Delete them from both documents so the real changes stand out.",
          "**Compare like with like.** Use responses for the same request, the same user and the same environment.",
          "**Sort or key your arrays.** If order does not matter, sort the arrays in both documents first, or make sure objects have an `id`.",
          "**Narrow big documents.** Paste only the subtree you care about, such as one entry of `data.items`, and the list of differences stays short.",
          "**Validate first.** If one side is not valid JSON, the tool tells you which side, so fix that before comparing.",
        ] },
      ],
    },
  ],
  references: [
    { label: "RFC 8259: The JSON data interchange format", href: "https://www.rfc-editor.org/rfc/rfc8259" },
    { label: "RFC 6902: JSON Patch", href: "https://www.rfc-editor.org/rfc/rfc6902" },
    { label: "jsondiffpatch, the open-source library behind this tool", href: "https://github.com/benjamine/jsondiffpatch" },
  ],
  related: [
    { slug: "api-response-formatter", anchor: "API response formatter", why: "formats and validates each document before you compare them." },
    { slug: "json-to-typescript", anchor: "JSON to TypeScript converter", why: "generates types so changes to the shape are caught at compile time." },
  ],
}
export default learn