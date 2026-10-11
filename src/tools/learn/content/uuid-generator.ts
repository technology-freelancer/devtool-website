import type { Learn } from "../types"

const learn: Learn = {
  updated: "October 2026",
  sections: [
    {
      heading: "What is a UUID?",
      blocks: [
        { t: "p", text: "A UUID (universally unique identifier) is a 128-bit value written as 32 hexadecimal digits in five groups, in the pattern 8-4-4-4-12. Because it can be generated anywhere without asking a central server, many systems can create ids independently without clashes. Microsoft platforms call the same thing a GUID." },
        { t: "p", text: "UUIDs are used as database keys, request and correlation ids, file names and idempotency keys for payments and APIs." },
      ],
    },
    {
      heading: "UUID versions compared",
      blocks: [
        {
          t: "table",
          head: ["Version", "Built from", "Sorts by creation time", "Typical use"],
          rows: [
            ["v1", "A timestamp plus a node id", "Not as plain text, because the time fields are reordered", "Older systems."],
            ["v4", "Random numbers", "No", "General purpose ids. The most common choice."],
            ["v7", "A Unix timestamp in milliseconds plus random bits", "Yes", "Database primary keys and any id that should sort by time."],
          ],
        },
        { t: "p", text: "Version 7 is defined in [RFC 9562](https://www.rfc-editor.org/rfc/rfc9562), the current UUID standard." },
      ],
    },
    {
      heading: "Anatomy of a UUID",
      blocks: [
        { t: "code", label: "A version 4 UUID (illustrative)", code: ["f47ac10b-58cc-4372-a567-0e02b2c3d479", "              ^    ^", "              |    +-- variant digit (8, 9, a or b)", "              +------- version digit (4 here)"].join("\n") },
        { t: "p", text: "The first digit of the third group tells you the version, and the first digit of the fourth group shows the variant. For standard UUIDs the variant digit is 8, 9, a or b." },
      ],
    },
    {
      heading: "Which version should you use?",
      blocks: [
        {
          t: "ul",
          items: [
            "**Default to v4** for ids that only need to be unique.",
            "**Use v7 for database primary keys.** New rows get ids that increase over time, so inserts land near the end of the index instead of at random places, which is usually kinder to database performance.",
            "**Do not use a UUID as a secret.** A random v4 is hard to guess, but ids are meant to identify things, not to authorize access. Use a dedicated random token for that.",
            "**Remember that v1 and v7 contain the creation time.** If that must stay private, use v4.",
          ],
        },
      ],
    },
    {
      heading: "How likely is a collision?",
      blocks: [
        { t: "p", text: "A v4 UUID has 122 random bits. You would need to generate roughly 2.7 quintillion (2.7 × 10^18) of them to reach a 50% chance of a single duplicate. In real systems, collisions come from bugs, such as a weak random number generator or copied ids, far more often than from chance." },
      ],
    },
    {
      heading: "Formatting and storage",
      blocks: [
        {
          t: "ul",
          items: [
            "UUIDs are case-insensitive. Standards recommend lowercase output, and you should compare them without regard to case.",
            "The no-hyphen form is just the 32 hex digits. Some systems and URLs prefer it.",
            "Microsoft tools sometimes show braces, as in `{...}`.",
            "Store UUIDs in a native `uuid` column where your database has one, or as 16 bytes, instead of 36-character text. It saves space and speeds up indexes.",
          ],
        },
      ],
    },
    {
      heading: "Generate a UUID in code",
      blocks: [
        {
          t: "table",
          head: ["Language or database", "Code"],
          rows: [
            ["JavaScript (browser and Node.js)", "`crypto.randomUUID()`"],
            ["Python", "`uuid.uuid4()`"],
            ["Java", "`UUID.randomUUID()`"],
            ["C#", "`Guid.NewGuid()`"],
            ["Go", "`uuid.New()` (google/uuid package)"],
            ["PostgreSQL 13 and later", "`gen_random_uuid()`"],
          ],
        },
      ],
    },
    {
      heading: "UUIDs versus auto-increment ids",
      blocks: [
        { t: "table", head: ["", "Auto-increment integer", "UUID"], rows: [
          ["Size", "4 or 8 bytes", "16 bytes"],
          ["Who creates it", "The database, one row at a time", "Any client or server, even offline"],
          ["Guessable", "Yes. `/users/1`, `/users/2` can be enumerated", "No, though an id must never replace real authorization"],
          ["Merging data from several systems", "Ids collide and need remapping", "Ids stay unique"],
          ["Index friendliness", "Excellent: always appends", "v4 is random and scatters inserts. v7 appends like a counter"],
        ] },
        { t: "p", text: "Auto-increment ids are smaller and simpler for a single database. UUIDs shine when ids are created in many places, when you merge data, or when you do not want to expose how many records you have." },
      ],
    },
  ],
  references: [
    { label: "RFC 9562: Universally Unique Identifiers (UUIDs)", href: "https://www.rfc-editor.org/rfc/rfc9562" },
    { label: "MDN: crypto.randomUUID()", href: "https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID" },
  ],
  related: [
    { slug: "timestamp-converter", anchor: "Timestamp converter", why: "reads the Unix time that v7 UUIDs are built from." },
    { slug: "base64-converter", anchor: "Base64 converter", why: "encodes ids for compact, URL-safe text." },
  ],
}
export default learn