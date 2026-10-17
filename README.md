# DevTools

Free browser-based developer tools. React + TypeScript + Vite + Tailwind CSS v4. **No backend**: every tool runs in the visitor's browser.

**Tools (13):** JSON to Java · JSON to TypeScript · JWT Decoder · Cron Generator · SQL Formatter · Regex Tester · API Response Formatter · UUID Generator · Base64 · Timestamp Converter · JSON Diff · AES Encryption / Decryption · QR Code Generator

## Run
```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit, render, hydration, and privacy tests
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
scripts/prerender.mjs    static HTML per page + 404.html
public/sitemap.xml       canonical production URLs for indexable routes
public/robots.txt        crawl rules and sitemap location
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
- Analytics contains only registered tool slugs, sanitized UI labels, pathnames, hostnames, short codes and coarse counters/buckets. `ToolError.code` is the only error detail sent.
- PostHog autocapture and session replay stay off.
See `src/lib/analytics.ts` and `src/lib/monitoring.ts`.

## Tracking & privacy

The following PostHog events are explicit app events. None includes typed text, tool output, textarea/input values, query strings or hashes. The separate Sentry `tool.run` span contains only a registered tool slug and an input-size bucket (`<1KB`, `1-10KB`, `10-100KB`, `>100KB`); exception messages are redacted.

| Event | Allowed properties |
|---|---|
| `$pageview`, `$pageleave` | `path` (pathname only); SDK `$current_url`, `$initial_current_url`, `$pathname` are sanitized to pathname |
| `tool_open`, `tool_used`, `tool_success`, `copy_clicked`, `download_clicked`, `clear_clicked` | `tool` (registered slug) |
| `tool_error` | `tool`, `error_type` (short code only) |
| `related_tool_clicked` | `tool`, `to_tool` (registered slugs) |
| `search_used` | `query_length`, `result_count` (counts only) |
| `tool_option_changed` | `tool`, `option` (static label), `choice` (enumerated option or `on`/`off`) |
| `ui_click` | `element`, `label` (sanitized/static), `area`, `target` (pathname or hostname, when applicable), `page` (pathname), `tool` (registered slug, when applicable) |
| `outbound_click` | `host` (hostname only), `area`, `page` (pathname) |
| `rage_click` | `element`, `label` (sanitized/static), `page` (pathname) |
| `consent_choice` | `choice` (`granted` or `denied`) |

PostHog SDK `referrer`/`referring_domain` properties and unrelated URL properties are removed by a final event allowlist; `$pageleave` keeps path-only metadata.

`ui_click` is the sanitized raw interaction layer and overlaps semantic funnel events such as `copy_clicked` and `tool_used`; both are retained intentionally. Click tracking is delegated from the browser entry only and is never initialized during server rendering.

## Environment (`.env`)
`VITE_POSTHOG_KEY`, `VITE_POSTHOG_HOST`, `VITE_SENTRY_DSN` (public keys), `VITE_SITE_URL`, `VITE_CONTACT_EMAIL`, `VITE_OPERATOR_NAME`.
Analytics and Sentry run only in production builds. To test in dev set `VITE_ANALYTICS_IN_DEV=true` / `VITE_MONITORING_IN_DEV=true` in `.env.local`.

See **DEPLOYMENT.md** for hosting, Search Console, uptime monitoring and AdSense.
