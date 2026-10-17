import { EX } from "../examples"
import type { Learn } from "../types"

const learn: Learn = {
  updated: "October 2026",
  updatedIso: "2026-10-15",
  sections: [
    {
      heading: "What is a Unix timestamp?",
      blocks: [
        { t: "p", text: "A Unix timestamp, also called epoch time, is the number of seconds that have passed since 1 January 1970 at 00:00:00 UTC, which is called the Unix epoch. Leap seconds are not counted. The number is the same everywhere on Earth, so it does not depend on a time zone. That makes it a reliable way to store, compare and sort moments in time." },
      ],
    },
    {
      heading: "Seconds, milliseconds and other units",
      blocks: [
        {
          t: "table",
          head: ["Unit", "Digits today", "Example", "Common in"],
          rows: [
            ["Seconds", "10", `\`${EX.tsEpoch}\``, "Unix and Linux tools, most web APIs, JWT claims (`exp`, `iat)."],
            ["Milliseconds", "13", `\`${EX.tsEpoch}000\``, "JavaScript `Date.now()`, Java `System.currentTimeMillis()`."],
            ["Microseconds", "16", `\`${EX.tsEpoch}000000\``, "Some databases and tracing tools."],
            ["Nanoseconds", "19", `\`${EX.tsEpoch}000000000\``, "Go `UnixNano()` and high-resolution logging."],
          ],
        },
        { t: "p", text: "This tool reads seconds and milliseconds. Values of 100 billion or more are treated as milliseconds. For microseconds or nanoseconds, divide by 1,000,000 or 1,000,000,000 first to get seconds, or choose the unit by hand." },
      ],
    },
    {
      heading: "Worked example",
      blocks: [
        { t: "code", label: `Timestamp ${EX.tsEpoch}`, code: `UTC:      ${EX.tsUtc}\nISO 8601: ${EX.tsIso}` },
        { t: "p", text: "The `Z` at the end of the ISO string means UTC. In India Standard Time (UTC+5:30) the same moment is 20 May 2025, 20:00:00. The tool shows the result in your own time zone as well." },
      ],
    },
    {
      heading: "ISO 8601 and time zones",
      blocks: [
        {
          t: "ul",
          items: [
            "ISO 8601 writes dates as `2025-05-20T14:30:00Z`, or with an offset such as `2025-05-20T20:00:00+05:30`.",
            "Store and exchange times in UTC, and convert to the user's time zone only for display.",
            "Avoid ambiguous text dates such as `05/06/2025`, which means different days in different countries.",
          ],
        },
      ],
    },
    {
      heading: "Get the current timestamp in code",
      blocks: [
        {
          t: "table",
          head: ["Language or tool", "Seconds since the epoch"],
          rows: [
            ["JavaScript", "`Math.floor(Date.now() / 1000)`"],
            ["Python", "`int(time.time())`"],
            ["Java", "`Instant.now().getEpochSecond()`"],
            ["Go", "`time.Now().Unix()`"],
            ["PHP", "`time()`"],
            ["Bash", "`date +%s`"],
            ["PostgreSQL", "`EXTRACT(EPOCH FROM now())`"],
            ["MySQL", "`UNIX_TIMESTAMP()`"],
          ],
        },
      ],
    },
    {
      heading: "Common timestamp mistakes",
      blocks: [
        {
          t: "ul",
          items: [
            "**Mixing seconds and milliseconds.** A seconds value read as milliseconds gives a date in January 1970. A milliseconds value read as seconds gives a date tens of thousands of years away.",
            "**JavaScript months start at 0.** `new Date(2025, 4, 20)` is 20 May, not 20 April.",
            "**Date-only and date-time strings behave differently.** In JavaScript, `new Date('2025-05-20')` is read as UTC, but `new Date('2025-05-20T14:30')` is read as local time.",
            "**Storing local time without a zone.** Daylight saving changes make such values ambiguous. Store UTC.",
            "**Negative timestamps** are valid and mean dates before 1970.",
          ],
        },
      ],
    },
    {
      heading: "The Year 2038 problem",
      blocks: [
        { t: "p", text: `Systems that store seconds in a signed 32-bit integer can count only up to 2,147,483,647, which is ${EX.tsMax32}. One second later the value overflows. Modern software uses 64-bit values, but older embedded devices, databases and file formats may still be affected.` },
      ],
    },
    {
      heading: "Convert timestamps in JavaScript",
      blocks: [
        { t: "code", label: "Timestamp to date, and date to timestamp", code: ["// seconds -> Date (multiply by 1000: Date uses milliseconds)", "new Date(1747751400 * 1000).toISOString()", "// '2025-05-20T14:30:00.000Z'", "", "// ISO string -> seconds", "Math.floor(Date.parse('2025-05-20T14:30:00Z') / 1000)", "// 1747751400", "", "// show the same moment in a specific time zone", "new Date(1747751400 * 1000).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })"].join("\n") },
        { t: "p", text: "Always pass an explicit time zone to `toLocaleString()` or `Intl.DateTimeFormat` when the result matters, because the default depends on the visitor's device. For heavy date work, such as adding months or handling recurring events, a library like date-fns or Luxon is safer than manual arithmetic." },
      ],
    },
    {
      heading: "Timestamps in databases and APIs",
      blocks: [
        {
          t: "ul",
          items: [
            "**PostgreSQL** `timestamptz` stores the moment in UTC and converts it to the session time zone for display. Plain `timestamp` has no zone and is easy to misread.",
            "**MySQL** `TIMESTAMP` is stored in UTC but only covers 1970 to 2038. `DATETIME` has a wider range but does no time zone conversion.",
            "**JSON APIs** usually send either ISO 8601 text (`2025-05-20T14:30:00Z`) or an epoch number. Check whether the number is in seconds or milliseconds before you convert it.",
            "**JWT claims** such as `exp` and `iat` are always whole seconds.",
          ],
        },
      ],
    },
  ],
  references: [
    { label: "Unix time on Wikipedia", href: "https://en.wikipedia.org/wiki/Unix_time" },
    { label: "ISO 8601 on Wikipedia", href: "https://en.wikipedia.org/wiki/ISO_8601" },
    { label: "MDN: Date", href: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date" },
  ],
  related: [
    { slug: "jwt-decoder", anchor: "JWT decoder", why: "shows exp, iat and nbf claims as readable times." },
    { slug: "cron-generator", anchor: "Cron expression generator", why: "builds schedules and lists their next run times." },
  ],
}
export default learn