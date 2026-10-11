import { EX } from "../examples"
import type { Learn } from "../types"

const learn: Learn = {
  updated: "October 2026",
  sections: [
    {
      heading: "What is Base64?",
      blocks: [
        { t: "p", text: "Base64 is a way to write any binary data using only 64 safe text characters: the letters A-Z and a-z, the digits 0-9, and two symbols. That lets data such as images, files or raw bytes travel through systems built for text, like email, JSON, HTML and URLs." },
        { t: "note", kind: "warn", text: "Base64 is an encoding, not encryption. Anyone can decode it instantly. Never use it to hide passwords or secrets." },
      ],
    },
    {
      heading: "How Base64 works",
      blocks: [
        { t: "p", text: "Base64 takes the data three bytes (24 bits) at a time and splits them into four groups of 6 bits. Each 6-bit value picks one character from the 64-character alphabet. Because three bytes become four characters, the output is about 33% larger than the input. If the input length is not a multiple of three, `=` padding characters fill the last group." },
        { t: "p", text: `The text \`Man\` is the bytes 77, 97, 110 and encodes to \`${EX.b64Man}\`. Decoding \`${EX.b64Man}\` gives back \`${EX.b64Roundtrip}\`.` },
      ],
    },
    {
      heading: "Standard and URL-safe Base64",
      blocks: [
        {
          t: "table",
          head: ["", "Standard", "URL-safe"],
          rows: [
            ["Characters 62 and 63", "`+` and `/`", "`-` and `_`"],
            ["Padding", "`=` is added", "Usually left out"],
            ["Used in", "Email (MIME), data URIs, most older systems", "URLs, file names, JWT segments"],
            ["Defined in", "RFC 4648, section 4", "RFC 4648, section 5"],
          ],
        },
        { t: "p", text: "The two forms differ only in a few characters, so mixing them up is a common cause of decoding errors. This tool lets you choose the URL-safe alphabet when encoding, and accepts both when decoding." },
      ],
    },
    {
      heading: "Worked examples",
      blocks: [
        {
          t: "table",
          head: ["Text", "Base64 result", "Why it is interesting"],
          rows: [
            [EX.b64Plain, `\`${EX.b64Encoded}\``, "Padded with `==` because the length is not a multiple of three."],
            ["नमस्ते", `\`${EX.b64Unicode}\``, "Non-English text is converted to UTF-8 bytes first."],
            ["???>>>", `\`${EX.b64Std}\``, "Standard alphabet. It contains `/` and `+`."],
            ["???>>> (URL-safe)", `\`${EX.b64Url}\``, "The same bytes with `_` and `-`, safe to put in a URL."],
          ],
        },
      ],
    },
    {
      heading: "Where Base64 is used",
      blocks: [
        {
          t: "ul",
          items: [
            "**Data URIs** that embed a small image directly in HTML or CSS.",
            "**HTTP Basic authentication.** The header holds `username:password` encoded in Base64. This is encoding only, so it must always travel over HTTPS.",
            "**JWTs.** Each of the first two parts is URL-safe Base64 of a JSON object. See the [JWT decoder](/jwt-decoder).",
            "**Email attachments and binary data inside JSON** or other text formats.",
          ],
        },
      ],
    },
    {
      heading: "Common Base64 errors",
      blocks: [
        {
          t: "ul",
          items: [
            "**Invalid characters.** Only letters, digits, `+`, `/`, `-`, `_` and `=` are allowed. Spaces and line breaks are ignored by this tool.",
            "**Wrong length.** A valid Base64 string cannot have a length that leaves a single leftover character. This usually means part of the text was cut off.",
            "**Missing padding.** Many URL-safe values omit `=`. This tool accepts that.",
            "**'Not valid UTF-8 text'.** The data decoded correctly but is binary, such as an image or a PDF, not text.",
            "**Unicode in code.** In JavaScript, `btoa()` throws an error for characters outside the Latin-1 range. Convert the text to UTF-8 bytes first. This tool does that for you.",
          ],
        },
      ],
    },
  ],
  references: [
    { label: "RFC 4648: Base16, Base32 and Base64 data encodings", href: "https://www.rfc-editor.org/rfc/rfc4648" },
    { label: "MDN glossary: Base64", href: "https://developer.mozilla.org/en-US/docs/Glossary/Base64" },
  ],
  related: [
    { slug: "jwt-decoder", anchor: "JWT decoder", why: "reads the Base64URL header and payload of a token." },
    { slug: "uuid-generator", anchor: "UUID generator", why: "creates unique ids you may want to encode compactly." },
  ],
}
export default learn