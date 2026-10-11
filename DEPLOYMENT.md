# Deployment, Search Console and AdSense checklist

The build output (`dist/`) is plain static files. Any static host works. Cloudflare Pages is the recommended free option.

## 1. Before the first deploy
1. Set in `.env` (or in your host's environment variables):
   - `VITE_SITE_URL=https://your-domain.com` (no trailing slash)
   - `VITE_CONTACT_EMAIL=you@your-domain.com`
   - `VITE_OPERATOR_NAME=Your Name or Company`
2. Run `npm run build`. The build prints a warning while these are unset.
3. Read `/privacy` and `/terms` in the built site. They are templates; have them reviewed for your situation and country.
4. `public/sitemap.xml` and `public/robots.txt` are copied to the site root. When adding a public, indexable route, add its canonical URL to the sitemap; do not add 404 or query-string URLs.

## 2. Deploy (Cloudflare Pages)
1. Push the project to a GitHub repository.
2. Cloudflare dashboard > Workers & Pages > Create > Pages > Connect to Git.
3. Build command: `npm run build` · Output directory: `dist` · Environment variable `NODE_VERSION=20`.
4. Add the `VITE_*` variables from step 1 (plus the PostHog and Sentry values from `.env`).
5. Add your custom domain. HTTPS is automatic.

Netlify and Vercel use the same settings. `public/_headers` (Cloudflare/Netlify) and `vercel.json` set cache and security headers.

## 3. Verify the live site
- View source on `/json-to-java`: you should see the page text, title, canonical and JSON-LD (not an empty page).
- Open `/sitemap.xml`, `/robots.txt` and a made-up URL (should show the 404 page).
- Test on a real phone: tools, menu, copy and download.
- Open the site with Sentry and PostHog: PostHog > Activity > Live events should show page views.

## 4. Google Search Console
1. Add a **Domain** property and verify with the DNS TXT record at your domain registrar.
2. Sitemaps > submit `https://your-domain.com/sitemap.xml`.
3. URL inspection > request indexing for the home page and your top 3 tools.
4. Check back weekly: Performance (queries, clicks), Pages (indexing errors).

## 5. Uptime and alerts
- UptimeRobot: HTTP monitors for `/` and 3 or 4 tool URLs, 5-minute interval, email alerts.
- Sentry: set alerts for new issues. In project settings turn on "Prevent Storing of IP Addresses" and "Data Scrubber".
- PostHog: Settings > Authorized URLs: add your domain.

## 6. AdSense readiness
Approval is never guaranteed, and sites made only of tools are sometimes rejected as "low value content". Improve your chances:
- Give each tool page real, unique text. The guide, features and FAQs are a start; add longer how-to articles over time (for example "How JWTs work", "Cron expression cheat sheet").
- Keep the Privacy Policy, Terms and Contact pages live and linked in the footer (they are).
- Apply once the site has been live and indexed for a while and has steady organic traffic.
- After approval: add the AdSense script to `index.html`, replace the placeholder in `src/components/AdSlot.tsx` with your ad unit, and add `public/ads.txt` with the line AdSense gives you.
- Visitors in the EEA, UK and Switzerland need a Google-certified consent banner for ads. Enable Google's free "Privacy & messaging" tool in AdSense. The built-in banner here only covers analytics.
- Update `/privacy` when ads go live (it already mentions AdSense).
- Do not show ads on the 404 page or on thin pages.

## 7. Performance
- `npm run build` enforces a size budget (`scripts/check-size.mjs`).
- After deploying, run PageSpeed Insights (pagespeed.web.dev) on `/` and two tool pages, mobile mode. Aim for LCP under 2.5 s, CLS under 0.1, INP under 200 ms.
- Fonts are self-hosted and preloaded; each tool's code loads only on its page; Sentry and PostHog load after the page is interactive.

## 8. Weekly review (10 minutes)
Most visited URLs and tools (PostHog) · tools with traffic but few `tool_success` events · copy and download rates · new Sentry issues · Search Console queries and indexing errors.
