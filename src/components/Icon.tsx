import type { ReactNode } from "react"

export type IconName =
  | "braces" | "code" | "shield" | "clock" | "database" | "regex" | "api"
  | "spark" | "swap" | "calendar" | "diff" | "search" | "arrow" | "menu"
  | "x" | "lock" | "bolt" | "gift" | "copy" | "download" | "check" | "chevron"

const paths: Record<IconName, ReactNode> = {
  braces: (<><path d="M8 3H6a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2 2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h2" /><path d="M16 3h2a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2 2 2 0 0 0-2 2v4a2 2 0 0 1-2 2h-2" /></>),
  code: (<><path d="m8 9-4 3 4 3" /><path d="m16 9 4 3-4 3" /><path d="m14 5-4 14" /></>),
  shield: (<><path d="M12 3 4.5 6v5.5c0 4.7 3.2 7.8 7.5 9.5 4.3-1.7 7.5-4.8 7.5-9.5V6L12 3Z" /><path d="m9 12 2 2 4-4" /></>),
  clock: (<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>),
  database: (<><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v7c0 1.7 3.6 3 8 3s8-1.3 8-3V5" /><path d="M4 12v7c0 1.7 3.6 3 8 3s8-1.3 8-3v-7" /></>),
  regex: (<><path d="M5 5v14" /><path d="M5 12h8" /><path d="M13 8v8" /><path d="m17 7 4 10" /><path d="m21 7-4 10" /></>),
  api: (<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M7 9h2M7 13h6M7 16h10" /></>),
  spark: (<><path d="m12 3 1.4 4.6L18 9l-4.6 1.4L12 15l-1.4-4.6L6 9l4.6-1.4L12 3Z" /><path d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15Z" /></>),
  swap: (<><path d="M4 8h14l-3-3" /><path d="m18 16H4l3 3" /></>),
  calendar: (<><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" /><path d="M8 14h2M14 14h2M8 17h2" /></>),
  diff: (<><path d="M8 4H4v16h4M16 4h4v16h-4" /><path d="M9 9h6M12 6v6M9 16h6" /></>),
  search: (<><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>),
  arrow: (<><path d="M5 12h14" /><path d="m14 7 5 5-5 5" /></>),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  x: <path d="m6 6 12 12M18 6 6 18" />,
  lock: (<><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>),
  bolt: <path d="m13 2-9 12h7l-1 8 9-12h-7l1-8Z" />,
  gift: (<><rect x="3" y="8" width="18" height="13" rx="2" /><path d="M12 8v13M3 12h18" /><path d="M12 8H8.5A2.5 2.5 0 1 1 11 5.5V8ZM12 8h3.5A2.5 2.5 0 1 0 13 5.5V8Z" /></>),
  copy: (<><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>),
  download: (<><path d="M12 3v12M7 10l5 5 5-5" /><path d="M5 21h14" /></>),
  check: <path d="m5 12 4 4L19 6" />,
  chevron: <path d="m9 18 6-6-6-6" />,
}

export default function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg
      aria-hidden="true"
      className="shrink-0"
      fill="none"
      height={size}
      width={size}
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    >
      {paths[name]}
    </svg>
  )
}
