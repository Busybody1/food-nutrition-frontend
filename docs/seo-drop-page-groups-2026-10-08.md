# calorieapi.com: which page groups drove the July 2026 drop (and the bigger one in September)

**Date:** 8 Oct 2026. Read-only. Data from the Search Console API (`sc-domain:calorieapi.com`, search type web,
`dataState: all`), the `blog_posts` table (read-only SELECT), and git history of both repos.
Raw daily series: `seo-drop-page-groups-2026-10-08.csv`, in the same folder as this file.

## Verdict

1. **There was no single cliff on 17 July.** Two separate things got blended together:
   - **The June bulk batch had already faded by 17 July.** It peaked 26 Jun to 2 Jul at about 490 impressions/day,
     started sliding on 3 Jul, and was down to 74/day on 16 Jul. The drop happened before 17 July (see Table A).
   - **A 3-day spike on 11 to 13 July.** Non-USDA impressions were 1,045, 1,536 and 1,385/day on those days. In
     the same days the number of URLs getting impressions jumped from 34–37/day to 80–89/day. The new URLs came from
     the 3 Jul site restructure (new `/compare/*`, `/solutions/*`, `/docs/*` and capability pages, plus an expanded
     sitemap) and the 10 Jul blog fix. The spike faded between 14 and 18 Jul. The "1,536/day" in the
     21 Aug diagnosis is the peak day of this spike, not a level the site held.
2. **Measured between the steady periods before and after (1–9 Jul vs 22 Jul–18 Aug), non-USDA impressions fell
   908 → 534/day (−41%).** Most of that loss came from two blog groups:

   | Group | Change (impressions/day) | Share of the net loss |
   |---|---|---|
   | June batch (excluding comparison posts) | −253 | 68% |
   | Comparison posts | −147 | 39% |
   | Home | −54 | 14% |
   | Docs | −12 | 3% |
   | Product pages | +31 | offset |
   | 17 Jul posts | +48 | offset |
   | `/blog` index | +12 | offset |

   **Clicks were 10.0/day in both periods.** The click decline people noticed was the end of a one-week peak
   (17.5/day, 10–17 Jul).
3. **Pages were not dropped from the index.** 113 URLs had impressions in the week before 17 Jul and 113 in the
   week after. Only 2 URLs with ≥10 impressions went to zero. Positions held or improved:
   - comparison posts: 8.5 → 9.0
   - June batch: 12.6 → 8.7
   - site excluding USDA: 12.5 → 10.2

   The pages were shown for fewer queries, mostly the deeper, long-tail ones. Google does not report 85–98% of the
   queries behind the comparison and June-batch impressions, so the lost queries cannot be listed.
4. **Nothing broke during the 24–26 June spam update.** Every group grew that week (site +88%, 7 days vs 7 days).
5. **The 17 July posts did not cause the drop.** The comparison posts started falling on 14 Jul and the June
   batch on 3 Jul, both before the new posts went live. Two things the new posts did do:
   - The USDA guide took over the USDA queries from `/blog/usda-fooddata-central-vs-commercial-food-database`
     (248 → 11 impressions/week for the old post), but brought far more volume to that topic.
   - The other 8 new posts had a launch spike (613 impressions on 18 Jul) that faded to about 26/day within a week.
6. **September was the bigger drop.** Property impressions fell from 762/day (1–17 Sep) to 284/day (18–29 Sep),
   −63%. It hit blog posts almost only, with breaks on 16–18 Sep:

   | Group | Change (impressions/day) |
   |---|---|
   | USDA guide | 339 → 95 (−72%) |
   | Comparison posts | 115 → 57 (−51%) |
   | June batch | 106 → 45 (−58%) |
   | 17 Jul batch | 52 → 15 (−71%) |
   | Home | no break around 18 Sep |
   | Product pages | −33% |

   Timing points away from the September spam update:
   - The drop started **6 days before** that update began (24 Sep), and nothing fell further on 24 Sep.
   - The USDA guide started falling on 14 Sep, five days after its **9 Sep title and content rewrite**. Its clicks
     did not go up: about 0/day afterwards.
   - The URL count did not change (106 → 113) and median positions held, so pages were not dropped from the index
     here either.
7. **The MCP and 050–055 posts show no sign of a penalty.** They went from 0 to about 155 impressions/day and
   2.7 clicks/day (30 Sep–6 Oct), median position 8.1. The site recovered to about 440/day. With the automated
   spike days removed, median position was flat or better for every group through 6 Oct, while the September spam
   update was rolling out.

## Groups

| # | Group | Members | Notes |
|---|---|---|---|
| 1 | Home `/` | 1 | |
| 2 | Product/marketing | 30 paths with impressions | pricing, capability, `/compare/*`, `/solutions/*`, `/mcp`, legal, etc. |
| 3 | `/docs*` | 15 paths with impressions | Only `/docs` itself had impressions before 11 Jul |
| 4 | `/blog/usda-fooddata-central-api-guide` | 1 | **Created 17 Jul** (part of the July batch, split out) |
| 5 | Comparison posts | 19 | slug token best / alternative / vs / compar* / top. All are from the June batch |
| 6 | June bulk batch | 63 | the remaining posts **created** 9–19 Jun (82 total minus the 19 in group 5) |
| 7 | 17 July batch | 8 | `calorieninjas-api-alternative` kept here, not in group 5 |
| 8 | Other blog | `/blog` index + `?page=` | **No pre-June posts exist** (see caveats) |
| 9 | MCP 24 (042/043/044/045/047) + 050–055 (21) | 45 | slugs parsed from the migration files |
| 10 | Other later posts | 13 | 10 Oct-01 posts, `free-food-calories-api-guide`, 2 Oct-07 posts |

Caveats:
- **`published_at` is back-dated for the June batch too, not only the MCP posts.** 64 of the 82 June posts were
  created on 19 Jun with `published_at` spread over 20 May to 18 Jun. Group 6 is therefore defined by `created_at`.
- Every `/blog/*` URL that appears in GSC exists in `blog_posts`, and the earliest `created_at` is 9 Jun, so the
  "pre-June posts" group is empty.
- GSC has no rows for this property before **30 May 2026**. Data for 7 Oct is partial.
- Page-level sums (`date × page`) are higher than the property total in the GSC UI, because one search can show
  several of our URLs. The CSV has both (`site_all_pages` vs `property_total`).

## Table A: July, by group (7-day average/day before vs after)

| Group | Detected break | Impressions/day | Clicks/day | Position | 24 Jun (spam update) | 17 Jul |
|---|---|---|---|---|---|---|
| 1 Home | 7 Jul | 153 → 111 (−28%) | 6.4 → 7.4 | 9.3 → 12.3 | +76% | **−8%** |
| 2 Product | 17 Jul | 171 → 95 (−45%) | 2.9 → 1.7 | 17.7 → 16.6 | +51% | −45% |
| 3 Docs | 15 Jul | 65 → 33 (−49%) | 0.0 → 0.4 | 26.7 → 18.4 | +171% | −46% |
| 4 USDA guide | new 17 Jul; dip 26 Jul | 917 → 213 (−77%) | 1.4 → 0.1 | 7.2 → 7.5 | — | new |
| 5 Comparison | **18 Jul** (falling from 14 Jul) | 433 → 148 (−66%) | 2.7 → 1.4 | 8.5 → 9.2 | +50% | −65% |
| 6 June batch | **15 Jul** (sliding from 3 Jul) | 220 → 71 (−68%) | 2.3 → 1.3 | 11.7 → 8.4 | +136% | −65% |
| 7 17 Jul batch | 23 Jul (launch spike fading) | 199 → 26 (−87%) | 0.7 → 0.3 | 5.9 → 7.4 | — | new |
| 8 `/blog` index | none | — | — | — | +50% | +5% |
| Site excluding USDA | 19 Jul | 964 → 552 (−43%) | 17.7 → 11.6 | 11.3 → 12.0 | **+88%** | −32% |

How the dates were picked: "detected break" is the day with the largest 7-day vs 7-day drop between 25 Jun and
5 Aug. The 24 Jun and 17 Jul columns compare the 7 days before each date with the 7 days starting on it.

**June batch before 17 July:** the 7-day average was 493/day on 26 Jun–2 Jul and 179/day on 10–16 Jul (−64%).
The fall from 179 to 63 after 17 Jul is the end of the same slide.

**USDA guide dip:** it got 17 and 26 impressions on 26–27 Jul, against 700–1,300/day before. It came back at
300–500/day. The cause is unknown.

## Table B: Steady periods (average/day)

| Group | 1–9 Jul | 22 Jul–18 Aug | 1–13 Sep | 19–28 Sep | 30 Sep–6 Oct |
|---|---|---|---|---|---|
| 1 Home | 136 imp / 7.3 clk | 82 / 5.9 | 66 / 7.0 | 56 / 4.5 | 72 / 4.3 |
| 2 Product | 60 / 0.3 | 91 / 1.1 | 68 / 0.4 | 52 / 0.8 | 84 / 1.1 |
| 3 Docs | 36 / 0.0 | 24 / 0.2 | 19 / 0.1 | 16 / 0.2 | 25 / 0.9 |
| 4 USDA guide | 0 | 512 / 0.3 | 440 / 0.4 | 89 / 0.0 | 76 / 0.0 |
| 5 Comparison | 333 / 1.2 | 186 / 1.7 | 149 / 0.5 | 54 / 0.6 | 48 / 0.4 |
| 6 June batch | 343 / 1.1 | 90 / 0.9 | 91 / 0.7 | 52 / 0.3 | 59 / 1.0 |
| 7 17 Jul batch | 0 | 48 / 0.1 | 48 / 0.1 | 10 / 0.1 | 5 / 0.1 |
| 9 MCP + 050–055 | 0 | 0 | 0 | ~0 | 155 / 2.7 |
| Site excluding USDA (page sum) | 908 / 10.0 | 534 / 10.0 | 449 / 8.7 | 248 / 6.6 | 491 / 11.9 |
| **Property total (GSC UI)** | 813 / 10.0 | ~1,000 / ~9.5 | 762 / 9.5 (1–17 Sep) | 284 / 6.2 (18–29 Sep) | 441 / 11.9 |

## Table C: Did URLs drop out of the index?

| Window | URLs with ≥1 impression | URLs with ≥5 | ≥10 impressions → 0 | ≥10 impressions → ≤2 |
|---|---|---|---|---|
| 10–16 Jul vs 18–24 Jul | 113 → 113 | 87 → 70 | 2 | 11 |
| 8–14 Sep vs 22–28 Sep | 106 → 113 | 59 → 59 | 0 | 3 |

- In July, the ≥5 count fell mostly in the June batch (36 → 17). Every other group was flat.
- The 2 URLs that went to zero were `/blog/flutter-food-database-api-integration-tutorial` and
  `/blog/recipe-blog-nutrition-label-generator-api`.
- URL Inspection today (read-only; 196 URLs = every non-blog path seen in GSC plus all 149 posts in `blog_posts`):
  **190 are "Submitted and indexed"**. All 190 have a PASS verdict, a successful fetch and indexing allowed, and
  Google's canonical matches ours on every one. The other 6:

  | Status | URL | Note |
  |---|---|---|
  | Crawled, not indexed | `/blog/affordable-food-nutrition-api-indie-developers` (June batch) | last crawled **10 Jul**, never re-crawled |
  | Discovered, not indexed | `/blog/food-api-production-monitoring-quota-usage-dashboard` (June batch) | never crawled; 0 GSC impressions all period |
  | Discovered, not indexed | `/blog/micronutrient-vitamin-mineral-food-api-developers` (June batch) | never crawled; 0 GSC impressions all period |
  | Unknown to Google | `/dashboard` | expected |
  | API 500 error | `/blog/edamam-food-database-api-pricing-startup-alternative` | not answered; it has impressions in GSC |
  | API 500 error | `/blog/chatgpt-personal-trainer` | not answered |

  Indexed: all 15 docs URLs, all 8 July-batch posts, the USDA guide, 18 of 19 comparison posts (the 19th errored),
  60 of 63 June-batch posts, 44 of 45 MCP and 050–055 posts (1 errored), and all 13 later posts.
- The two URLs that went to zero in July are both indexed today. The flutter tutorial was last crawled 30 Sep and
  the recipe-blog post 25 Jun.

So in both episodes the pages stayed indexed. They lost the queries they appeared for, not their positions.

## Table D: September, and the September spam update (24 Sep–7 Oct)

| Group | Detected break | Impressions/day (7 days vs 7 days) | Position | Change at 24 Sep |
|---|---|---|---|---|
| 1 Home | 12 Sep | 71 → 54 (−24%) | 10.4 → 7.2 | +7% |
| 2 Product | 18 Sep | 68 → 46 (−33%) | 23.3 → 14.1 | +44% |
| 3 Docs | (noisy) | 30 → 19 | — | +63% |
| 4 USDA guide | **18 Sep** (falling from 14 Sep) | 339 → 95 (−72%) | 8.1 → 8.5 | −31% |
| 5 Comparison | **18 Sep** | 115 → 57 (−51%) | 10.0 → 9.7 | −16% |
| 6 June batch | **18 Sep** | 106 → 45 (−58%) | 11.5 → 10.5 | +23% |
| 7 17 Jul batch | 16 Sep | 52 → 15 (−71%) | 6.0 → 7.0 | −65% |
| 9 MCP + 050–055 | published 28–29 Sep | 0 → 155 (30 Sep–6 Oct) | median 8.1 | — |
| Site total | **18 Sep** | 755 → 326 (−57%) | 10.8 → 10.1 | **+5%** |

Median daily position, with the automated spike days 16 Sep, 25 Sep and 2 Oct left out:

| Period | Comparison | June batch | Product | Home |
|---|---|---|---|---|
| 8–17 Sep | 7.6 | 7.9 | 11.4 | 7.1 |
| 19–28 Sep | 8.4 | 8.8 | 9.2 | 7.1 |
| 30 Sep–6 Oct | 6.1 | 8.9 | 6.4 | 5.0 |

There is no sign of demotion during the update. The mean positions look worse in early October only because of
those spike days.

**USDA guide queries that Google reports** (8–14 Sep vs 22–28 Sep): 93 → 38 distinct queries. The head term
`usda fooddata central api` went from 35 impressions at position 8.3 to 1 at position 11.0.

## Deploy, robots and canonical check

**Frontend, 10–22 Jul:**
- **3 Jul, `5f1f567` (just before the window).** Site restructure: new `/compare/[slug]`, `/solutions/[slug]`,
  `/docs/[section]`, `/docs/guides/[slug]` and capability pages. The sitemap went from 13 static URLs plus blog
  posts to about 47 static URLs plus blog posts, with fixed `lastmod` dates. Product URLs first got impressions on
  6 Jul and docs sub-pages on 11 Jul. This is where the 11–13 Jul spike came from.
- **7 Jul, `f7efb31`.** `robots.ts` was replaced by a `robots.txt` route. The Allow/Disallow rules are the same; it
  only adds `Content-Signal`. Nothing is blocked.
- **10 Jul, `889ae6b` "fix broken blog".** This is the one that matters. Before it, `getBlogPost` returned `null`
  on any failed upstream response (timeout, 5xx, network), and the page then rendered `notFound()`, which is a 404
  with noindex. ISR cached that result for up to 300 s.

  So whenever the Heroku API stalled (H12 timeouts were being fixed in the same weeks), Googlebot could have
  received 404 + noindex on real posts. One fit with the data: the number of June-batch URLs with impressions
  sagged on 3–9 Jul (17–22/day) and jumped to 25–41/day on 10–13 Jul, right after the fix. That fits the theory but
  does not prove it, because there are no logs. The same commit added a 301 from `/blog/free-food-apis-2025` to
  `/blog/free-food-apis`.
- **10 Jul, `fc63398` and `30e7170`.** `metadata.ts`, home SEO copy, `inlineCss`, AVIF. Cosmetic.
- **17 Jul, `817afad`.** Topic-cluster internal links for the 9 new posts. Backend `a1cf233` (migration 022)
  seeded the posts.
- None of these changes canonical tags, noindex, redirects or robots in a way that would demote the whole site.

**Backend, 10–22 Jul:** catalog and search endpoint work and admin plan endpoints. Nothing touches SEO.

**September:**
- 9 Sep, `a1474ba`: USDA guide rewrite (title "…A Developer's Guide (and When to Add a Layer)" became
  "USDA FDC API: Demo Key, Rate Limits, Search"; database `updated_at` 9 Sep 11:54 UTC) and a new
  `/nutrition-api` page.
- 11 Sep, `cf49cc1`: pricing JSON-LD, comparison data, `/tutorials` redirects.
- 15 Sep: admin-only frontend change. Backend migrations 036–039 ran on the food database, which is where
  `blog_posts` lives.
- Nothing applies to the whole blog.

**Live check today:**
- `robots.txt` allows everything public.
- `sitemap.xml` lists 150 blog URLs and 47 other URLs.
- The sampled blog pages return 200 with a canonical pointing to themselves and no noindex.

## Other patterns worth knowing

- **Google reports the query for only about 10–20% of impressions.** By day, 80–94% of property impressions have
  no reported query. On the comparison and June-batch posts it is 85–98%. Both drops happened in this unreported
  long tail. Traffic is 92–95% desktop and about 70% US. The September loss was almost all US desktop
  (720 → 245/day).
  - Some of the reported queries look automated, for example `-site:reddit.com -site:twitter.com … -site:wykop.pl`
    filter strings and `%`/`+`-prefixed queries. They are only 1–3% of reported query impressions, and what is
    behind the unreported share cannot be seen.
  - Whether these swings come from AI Mode or agent-driven searches cannot be tested with the API.
- **Automated spike days distort average position.** Mondays 3, 10, 17, 24 and 31 Aug and 7 Sep, then
  16 Sep, 25 Sep and 2 Oct, add product and docs impressions at positions 15–35 and pull the average down. Use
  medians, or leave those days out, when reading position.
- **The seo-agents DataForSEO SERP calls are ruled out as a source.** There are only a few per day, at
  about $0.002 each, and they started in August.
- **The mid-July click peak** (17.5/day, 10–17 Jul) was spread across the product, June-batch, comparison and home
  groups. Clicks then returned to the early-July level.

## Still unknown

1. **What changed on Google's side on 14–18 Jul and 14–18 Sep.** No update was announced, no URLs were dropped,
   and positions did not move. Only the set of (mostly unreported) queries shrank. A ranking-system or reporting
   change on Google's side, or a change in automated search traffic, would both look like this. The API cannot
   tell them apart.
2. **Whether Googlebot got 404 + noindex on blog posts before the 10 Jul fix.** To check, look at GSC →
   Settings → Crawl stats → By response, for 404 and 5xx between 20 Jun and 12 Jul, or at Heroku/Cloudflare logs.
3. **Whether the 9 Sep USDA rewrite caused that page's 80% fall** or only coincided with the drop across the whole
   blog on 18 Sep. The rest of the blog fell by a similar share with no edits, which suggests mostly coincidence.
   But the USDA guide started falling first (14 Sep) and lost its head term.
4. **Manual actions and the Page indexing timeline.** Both are only in the GSC UI.
5. **Whether competitors moved on the same dates.** This needs third-party rank data.
