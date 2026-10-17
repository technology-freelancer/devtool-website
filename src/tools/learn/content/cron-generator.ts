import { EX } from "../examples"
import type { Learn } from "../types"

const learn: Learn = {
  updated: "October 2026",
  updatedIso: "2026-10-15",
  sections: [
    {
      heading: "What is a cron expression?",
      blocks: [
        { t: "p", text: "A cron expression is a short text pattern that says when a job should run. It is used by the cron scheduler on Linux and macOS, and by many CI systems, cloud schedulers and job runners. The classic form has five fields separated by spaces: minute, hour, day of month, month and day of week." },
        { t: "p", text: "Read it from left to right. For example `0 9 * * 1-5` means minute 0, hour 9, any day of the month, any month, Monday to Friday: every weekday at 09:00." },
      ],
    },
    {
      heading: "The five fields and their allowed values",
      blocks: [
        {
          t: "table",
          head: ["Field", "Allowed values", "Notes"],
          rows: [
            ["Minute", "0-59", ""],
            ["Hour", "0-23", "24-hour clock."],
            ["Day of month", "1-31", ""],
            ["Month", "1-12", "Many implementations also accept JAN-DEC."],
            ["Day of week", "0-6", "Sunday is 0. Many implementations also accept 7 for Sunday, or SUN-SAT."],
          ],
        },
        {
          t: "table",
          head: ["Symbol", "Meaning", "Example"],
          rows: [
            ["`*`", "Every value", "`* * * * *` runs every minute."],
            ["`,`", "A list of values", "`0 8,17 * * *` runs at 08:00 and 17:00."],
            ["`-`", "A range", "`0 9 * * 1-5` runs Monday to Friday."],
            ["`/`", "A step", "`*/15 * * * *` runs every 15 minutes."],
          ],
        },
      ],
    },
    {
      heading: "Examples with plain-English meanings",
      blocks: [
        { t: "p", text: "These descriptions were produced by this tool, so you can paste any of them in to check it." },
        { t: "table", head: ["Expression", "Meaning"], rows: EX.cron.map(([e, d]) => [`\`${e}\``, d]) },
      ],
    },
    {
      heading: "Common cron mistakes",
      blocks: [
        {
          t: "ul",
          items: [
            "**A step is not 'every N from now'.** `*/5` in the minute field means minutes 0, 5, 10 and so on, fixed to the clock. A step that does not divide 60 evenly, such as `*/45`, runs at :00 and :45 and then at :00 again, which is uneven.",
            "**'Every 90 minutes' cannot be written as one expression.** Use two expressions, or a scheduler that supports intervals.",
            "**Day of month and day of week together.** In classic Unix cron, when both fields are restricted the job runs when either matches. `0 0 13 * 5` runs on the 13th and also on every Friday.",
            "**Time zones.** Cron runs in the time zone of the machine or service that schedules it. Many cloud schedulers and GitHub Actions use UTC. Local-time schedules can skip or repeat a run when daylight saving time changes.",
            "**Different formats.** Quartz and Spring use a leading seconds field and the `?` symbol, and AWS EventBridge uses six fields including the year. This tool uses the classic five-field format.",
            "**Last day of the month** is not part of standard cron. Schedule days 28-31 and check the date inside the job, or use a scheduler that supports it.",
          ],
        },
      ],
    },
    {
      heading: "Check the next run times before you deploy",
      blocks: [
        { t: "p", text: "A wrong schedule is easy to miss until a job fails to run. The tool lists the next five run times in your local time or in UTC, so you can confirm the schedule is what you meant. Pair it with the [timestamp converter](/timestamp-converter) if your scheduler reports Unix timestamps." },
      ],
    },
  ],
  references: [
    { label: "crontab(5) manual page", href: "https://man7.org/linux/man-pages/man5/crontab.5.html" },
    { label: "Cron on Wikipedia", href: "https://en.wikipedia.org/wiki/Cron" },
  ],
  related: [
    { slug: "timestamp-converter", anchor: "Timestamp converter", why: "converts scheduler timestamps to dates in any time zone." },
  ],
}
export default learn