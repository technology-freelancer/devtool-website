export type Block =
  | { t: "p"; text: string }
  | { t: "ul"; items: string[] }
  | { t: "table"; head: string[]; rows: string[][] }
  | { t: "code"; label: string; code: string }
  | { t: "note"; kind: "tip" | "warn"; text: string }

export type Section = { heading: string; blocks: Block[] }

/** Educational content shown under each tool. Inline syntax in text: `code` and [label](/internal-or-https-link). */
export type Learn = {
  updated: string
  sections: Section[]
  references: { label: string; href: string }[]
  related: { slug: string; anchor: string; why: string }[]
}