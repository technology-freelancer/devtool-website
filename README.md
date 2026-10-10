# DevTools

Free browser-based developer tools. React + TypeScript + Vite + Tailwind CSS v4. **No backend**: every tool runs in the visitor's browser.

**Tools (11):** JSON to Java · JSON to TypeScript · JWT Decoder · Cron Generator · SQL Formatter · Regex Tester · API Response Formatter · UUID Generator · Base64 · Timestamp Converter · JSON Diff

## Run
```bash
npm install
npm run dev        # http://localhost:5173
npm test           # 52 unit, render and hydration tests
npm run build      # typecheck + build + pre-render + size budget
npm run preview    # serve the production build
```

## Change the look (one file: `src/style.css`)
| Want to change | Edit |
|---|---|
| Font family | the two `@import "@fontsource-variable/…"` lines + `--font-sans` / `--font-mono` |
| Accent colour | `--color-brand-50 … 950` |
| Text / border / background greys | `--color-slate-50 … 950` |
| Page / card background | `--color-page`, `--color-surface` |
| Roundness and shadows | `--radius-*`, `--shadow-*` |
| Content width, side padding | `--container-max`, `--gutter` |
| Breakpoints | `--breakpoint-*` |

## Project map
```
src/style.css            theme + global styles (single source)
src/config/site.ts       site name, URL, contact email (from .env)
src/tools/registry.ts    every tool: name, SEO title/description, guide steps, features, FAQs
src/tools/components.ts  tool slug -> lazy-loaded workspace component
src/tools/<tool>/        one folder per tool UI
src/lib/                 pure logic (generators, jwt, cron, diff, base64...) - unit tested
src/components/          shared UI (ToolShell, Editor, TextToolWorkspace, ConsentBanner...)
src/lib/analytics.ts     PostHog wrapper (only place that touches PostHog)
src/lib/monitoring.ts    Sentry wrapper (redacts messages)
scripts/prerender.mjs    static HTML per page + sitemap.xml + robots.txt + 404.html
scripts/check-size.mjs   JavaScript size budget
tests/                   vitest
```

## Add a tool
1. Create `src/tools/<slug>/MyTool.tsx` (text-in/text-out tools can use `TextToolWorkspace`).
2. Add one entry to `src/tools/registry.ts` (name, SEO text, steps, features, FAQs).
3. Add one line to `src/tools/components.ts`.
Route, card, related links, sitemap, pre-rendered page and JSON-LD all follow automatically.

## Privacy rules (do not break)
- Never send pasted input or generated output to analytics, Sentry or any server.
- `track()` only accepts short codes and counters. `ToolError.code` is the only error detail sent.
- PostHog autocapture and session replay stay off.
See `src/lib/analytics.ts` and `src/lib/monitoring.ts`.

## Environment (`.env`)
`VITE_POSTHOG_KEY`, `VITE_POSTHOG_HOST`, `VITE_SENTRY_DSN` (public keys), `VITE_SITE_URL`, `VITE_CONTACT_EMAIL`, `VITE_OPERATOR_NAME`.
Analytics and Sentry run only in production builds. To test in dev set `VITE_ANALYTICS_IN_DEV=true` / `VITE_MONITORING_IN_DEV=true` in `.env.local`.

See **DEPLOYMENT.md** for hosting, Search Console, uptime monitoring and AdSense.
