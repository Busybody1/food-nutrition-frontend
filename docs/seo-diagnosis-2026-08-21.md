# CalorieAPI — SEO diagnosis, 21 Aug 2026

**Question asked:** "Food Database API" and "Food API" only rank on page 2–3, and clicks are falling.
What can we improve — content, backlinks, etc.?

**Short answer:** the ranking problem for those two terms is *cannibalization plus thin pages*, but that
is not what is driving the click decline. The site took an **algorithmic step-change on 17–18 July 2026**
that cut commercial-intent impressions by ~40%, and a single zero-CTR blog post is hiding it in the
Search Console headline. There is also a **14,000-impression/month opportunity sitting unclaimed**, and
the backlink engine that was built for exactly this problem is **switched off**.

All figures below are pulled live from the Search Console API (`sc-domain:calorieapi.com`) via the
`seo-agents` service account. Windows are 28-day, ending 2026-08-18 (GSC lags ~3 days).

---

## 1. What the numbers actually say

### 1.1 The headline is misleading

| | prev 28d (06-24→07-21) | cur 28d (07-22→08-18) | Δ |
|---|---|---|---|
| Clicks | 324 | 287 | **−11%** |
| Impressions | 28,974 | 29,276 | +1% |
| CTR | 1.12% | 0.98% | −13% |

Now remove the two pages that earn impressions but no clicks — `/blog/usda-fooddata-central-api-guide`
and `/blog/food-com-recipe-nutrition-api`:

| | prev 28d | cur 28d | Δ |
|---|---|---|---|
| USDA guide | 6 clk / 4,448 imp | 8 clk / **14,336 imp** | +222% impressions |
| food.com post | 0 clk / 825 imp | 0 clk / 608 imp | — |
| **Everything else** | **318 clk / 23,701 imp** | **279 clk / 14,332 imp** | **−40% impressions** |
| CTR of "everything else" | 1.34% | **1.95%** | +45% |

**The commercial content lost 40% of its impressions in one month.** CTR on it actually *improved*.
The flat top-line impression count is an accident: the USDA post's ~10,000 extra zero-click
impressions almost exactly replaced the ~9,400 commercial impressions that were lost.

### 1.2 It was a step-change on 17–18 July, not a drift

Daily impressions with the USDA guide excluded:

```
Jun 20 – Jul 16   500 → 1,536/day, rising.  Clicks climbing: 19, 19, 16, 23, 24/day
Jul 17 – Jul 21   683, 1092, 623, 796, 481   <-- cliff
Jul 22 – Aug 18   ~400–600/day, flat.        Clicks ~10/day, no recovery in 32 days
```

**Google's June 2026 core update began 30 June and finished rolling out on 17 July 2026.** The
step-change lands on the day the rollout completed. That is the single most likely cause, and it is
consistent with the site's content profile (see §2.1). Nine new posts also went live on 17 July, but
a nine-post publish does not produce an instant site-wide impression cliff — the update does.

Confirm or rule out a manual action: **Search Console → Security & Manual Actions → Manual actions.**
The API does not expose this; it needs a human look. If it is clean, this is purely algorithmic.

Per-page damage, same windows:

| Page | prev | cur |
|---|---|---|
| `/` | 189 clk / 3,064 imp / pos 10.5 | 166 clk / 2,304 imp / pos **14.2** |
| `/blog/best-food-nutrition-apis-2025` | 31 clk / 3,799 imp / pos 9.0 | 26 clk / 2,510 imp / pos 9.7 |
| `/blog/free-food-apis` | 10 clk / 149 imp | 1 clk / 46 imp |
| `/food-database-api` | 4 clk / 79 imp / pos 20.7 | 0 clk / 133 imp / pos **26.0** |

The homepage carries 58% of all site clicks and lost 25% of its impressions. That is the whole
click decline.

### 1.3 The two target queries

Current 28d:

| Query | Impressions | Clicks | Position (prev) |
|---|---|---|---|
| `food api` | 47 | 0 | 22.9 (19.7) |
| `food database api` | 14 | 1 | 22.9 (15.2) |
| `nutrition api` | 124 | 0 | **45.2 (32.5)** — was 5 clicks |
| `calorie api` | 117 | 41 | 14.8 (9.1) |

`nutrition api` is the worst casualty: 5 clicks → 0, and it fell 13 positions.

---

## 2. Root causes, ranked

### 2.1 Thin, bulk-published content — the core-update exposure

Publishing history from the sitemap:

- **82 posts published 9–19 June 2026** (a ten-day bulk publish)
- 9 posts on 17 July 2026
- **nothing since** — 35 days of silence

Live word counts (rendered text, fetched today):

| URL | Words |
|---|---|
| `/` | 1,005 |
| `/food-database-api` | **469** |
| `/nutrition-analysis-api` | 500 |
| `/barcode-nutrition-api` | 517 |
| `/meal-tracking-api` | 532 |
| `/compare/nutritionix-alternative` | 647 |
| `/blog/food-database-api-for-developers` | 762 |
| `/blog/best-food-nutrition-apis-2025` | 879 |
| `/blog/usda-fooddata-central-api-guide` | 881 |

Every page on the site is thin. The money page for the exact query being asked about —
`/food-database-api` — is **469 words**. The page-1 results for "food database api" are 1,500–3,000-word
pages on established domains. Google's June 2026 core update and the June 2026 spam update (24–26 June,
five days after the bulk publish finished) both target exactly this profile: rapid scaled publishing,
low per-page depth, weak external corroboration.

This is the thing to fix, and the fix is **consolidate and deepen, not publish more**.

### 2.2 Severe cannibalization on precisely the terms asked about

Distinct URLs competing per query (90-day window):

| Query | URLs | Best-ranking URL | The "intended" page |
|---|---|---|---|
| `food database api` | **8** | `/` at pos 14.3 | `/food-database-api` at pos 27.7 |
| `food api` | **6** | `/` at pos 19.8 | none exists |
| `nutrition api` | **16** | `/blog/what-is-a-nutrition-api` at 14.3 | `/nutrition-analysis-api` at **81.8** |
| `food nutrition api` | **13** | `/` at 28.4 | — |
| `free nutrition api` | **20** | `/` at 15.1 | — |
| `calorie api` | **37** | `/` at 3.2 ✅ | `/` |
| `food search api` | **11** | `/` at 18.9 | `/food-database-api` at 41.4 |

For `food database api`, the dedicated page ranks **13 positions worse than the homepage**, and a
near-duplicate blog post (`/blog/food-database-api-for-developers`, same H1 topic, 762 words) sits
between them. Google is being asked to choose between three pages that say the same thing and is
splitting the signal across all of them.

`calorie api` is the counter-example that proves the mechanism: 37 URLs compete but the homepage
dominates at position 3.2 and takes 90 of 95 clicks — because it is unambiguously the strongest page
for that phrase. That is what the other terms lack.

`/docs` is a repeat offender across the board — it ranks for `calorie api` (15.5), `nutrition api`
(78.2), `free nutrition api` (45.3), `food nutrition api` (78.1). It should not be competing for
commercial head terms at all.

### 2.3 14,336 impressions/month being thrown away

`/blog/usda-fooddata-central-api-guide`: **538 distinct queries, 14,336 impressions, average
position 7.3, 8 clicks. CTR 0.06%.**

The queries are unambiguous:

```
usda fooddata central api official               177 imp   pos 9.6
usda fooddata central api official documentation  84 imp   pos 9.3
api.nal.usda.gov fdc v1 foods search demo_key     67 imp   pos 5.6
usda fooddata central api key required            57 imp   pos 8.4
fooddata central api key demo                     47 imp   pos 6.5
usda api key                                      39 imp   pos 8.8
```

These are **developers looking for a USDA API key, the demo-key limits, and the search endpoint** —
which is precisely the target customer. The page ranks on page 1 for all of it and converts none of it,
because the title ("It's Free, But Here's Why Developers Switch") answers a question nobody asked.

At a realistic 3% CTR this page alone is **~430 clicks/month — more than the entire site earns today.**
This is the highest-ROI item on the list and it is pure on-page work.

### 2.4 The backlink engine is switched off

From `agent_settings` in the `seo_agents` database, read today:

```
backlinks.enabled            = false     <-- global gate
backlinks.enabled.calorieapi = true          (never reached; global gate wins)
directories.enabled          = false     <-- global gate
directories.enabled.calorieapi = true        (never reached)
content.enabled              = true
content.autopublish.calorieapi = false
dry_run                      = false
```

Consequence, from the same database:

| Table | Rows |
|---|---|
| `directories` | 62 seeded (RapidAPI Hub, publicapis.dev, apilist.fun, freepublicapis.com, …) |
| `submissions` | **0** |
| `prospects` | **0** |
| `outreach_emails` | **0** |

The July audit scored the backlink profile 1/10 and called it "the single biggest lever". The system
built to move it has produced nothing because two booleans are `false`. Both agents already enforce
human approval and a 5/day send cap, so flipping them on is low-risk.

Also still pending from the July plan: the **RapidAPI listing** (the proxy-secret gateway is built in
the backend, deploy needs `RAPIDAPI_PROXY_SECRET` set), and **apis.guru** submission — which needs the
OpenAPI spec on a branded URL. It is currently only reachable at
`https://food-nutrition-database-cd7099c2be07.herokuapp.com/openapi.json`;
`https://calorieapi.com/openapi.json` returns 404.

### 2.5 The content agent has written nothing for calorieapi.com

Since going live it has produced **one** article, and that was for busybody.io. Every calorieapi run
ends the same way:

```
2026-08-21  calorieapi: skipped_duplicate "nutritionix-api"
            clashes: nutritionix-api-alternative, nutritionix-api-pricing,
                     migrate-from-nutritionix-api-to-alternative
2026-08-17  calorieapi: skipped_duplicate "open-food-facts-api"
            clashes: open-food-facts-vs-paid-food-api-commercial-apps, …
```

Research surfaces a competitor-brand keyword, the duplicate guard correctly notices the 82 June posts
already cover it, discards it, and writes nothing. Upstream, the relevance screen is rejecting almost
everything: last run classified 94 calorieapi ideas and rejected **91 as off-topic**, yielding 2
candidates.

Given §2.1, this is arguably a lucky failure — publishing more thin posts right now would deepen the
hole. But the pipeline should be pointed at real gaps rather than spinning.

### 2.6 Hygiene

`http://www.calorieapi.com/*` returns a **Cloudflare 522 after ~20 seconds**. The other three legs are
fine (`https://www` → 301, `http://` non-www → 301). Google has `http://www.calorieapi.com/` and
`https://www.calorieapi.com/docs` in its index from earlier crawls (184 impressions over 90 days,
0 in the last 28). Not currently costing traffic, but every crawl of those URLs burns 20 seconds and
ends in an error. Likely cause: the redirect is a **Page Rule** scoped to `https://www.calorieapi.com/*`
— Page Rule patterns are scheme-specific. Fix by enabling **SSL/TLS → Edge Certificates → Always Use
HTTPS**, or by changing the pattern to `*www.calorieapi.com/*`.

Cosmetic: `/compare/nutritionix-alternative` renders its H1 as
`Nutritionix Alternative :  Calorie API  vs  Nutritionix` — space before the colon, doubled spaces.
`/food-database-api` has an H2 reading "What the food database api gives you" (lowercase, mangled from
the slug).

---

## 3. What to do, in order

### P0 — Claim the USDA traffic *(on-page only, biggest single win)*

Rewrite `/blog/usda-fooddata-central-api-guide` to serve the intent it already ranks for:

- **Title:** something like `USDA FoodData Central API: Demo Key, Rate Limits & Endpoints (2026)`
- **Above the fold:** how to get an API key, what `DEMO_KEY` actually allows, the
  `/v1/foods/search` request/response shape, the rate limits — the concrete answers those 538
  queries want.
- **Then** the commercial angle ("here's what breaks in production, here's the managed alternative").
- Do not bait-and-switch. The page must genuinely answer the question or the CTR gain reverses.

Expected: 0.06% → 2–4% CTR on 14,336 impressions ≈ **290–570 clicks/month**, from an audience that is
by definition building against a food API.

Apply the same lens to `/blog/food-com-recipe-nutrition-api` (608 impressions, pos 3.9, 0 clicks) —
either make it earn the click or accept it as noise.

### P1 — Consolidate the cannibalized clusters

**`food database api`** — pick `/food-database-api` as the single target:
- 301 `/blog/food-database-api-for-developers` → `/food-database-api`, merging its unique material in.
- Expand `/food-database-api` from 469 → 1,500+ words: response schema, how ranking/`verified_only`
  actually behave, coverage split (generic vs branded vs restaurant), provenance, pagination limits,
  code in three languages, a coverage-and-licensing comparison table.
- Keep the 11 existing internal links; make the anchor text exactly "food database API".

**`nutrition api`** — 16 competing URLs and a 13-position drop. `/nutrition-analysis-api` at position
81.8 is not a credible target; either make it the real one (same depth treatment) or concede the term
to `/blog/what-is-a-nutrition-api` (pos 14.3) and stop the other 14 pages from chasing it.

**`food api`** — the homepage is already the de-facto target at 19.8. Do **not** build a `/food-api`
page; it would cannibalize the homepage, whose H1/title are locked. Fold
`/blog/what-is-a-food-api` (pos 49.4) into the homepage's orbit with a direct link, or retire it.

**`/docs`** — stop it competing on commercial head terms. Its job is reference, not acquisition.

### P2 — Depth on the four capability pages

469–532 words cannot rank for a head commercial term regardless of links. Target 1,200–2,000 words of
genuinely unique, specific content per page. Fix the mangled H2s while in there.

This is also the direct answer to §2.1: fewer, deeper, better pages is what the June core update
rewards. Consider consolidating or noindexing the weakest of the 82 June posts — 31 of them have
under 20 impressions in 90 days, and 4 have zero.

### P3 — Turn the authority engine on *(this is the backlinks answer)*

In order of risk:

1. **Flip `directories.enabled` → true.** 62 directories seeded, 0 submitted, free, no email involved.
2. **Serve the OpenAPI spec at `https://calorieapi.com/openapi.json`** (a Next.js route or rewrite to
   the Heroku origin), then submit to **apis.guru**.
3. **Ship the RapidAPI listing** — the gateway is already built; it needs `RAPIDAPI_PROXY_SECRET`
   deployed. Distribution and a strong referring domain in one move.
4. **Flip `backlinks.enabled` → true.** Human approval and the 5/day cap are already enforced in code;
   approved-but-unsent mail is visible and revocable.
5. **Manual, and worth more than all of the above:** a Product Hunt launch, a "how we built a 4M-food
   API" post on dev.to/Hashnode, open-source SDK repos with README links, and genuine
   Stack Overflow / Reddit answers (which are also primary retrieval sources for LLM citations).

Caveat worth stating plainly: with 30 existing links that are all spam-tier naked URLs, **a handful of
real editorial links is worth more than a hundred directory listings.** Directories are the free,
safe place to start — they are not the win.

### P4 — Point the content agent at real gaps

Do this *after* P0–P2, not before. When it resumes:

- Seed `keyword_opportunities` from the GSC data directly — queries sitting at position 11–30 with real
  impressions are the reachable wins, and the agent currently never sees them.
- Move the "does an existing post already cover this slug" check *upstream* into research, before
  SERP credits are spent, so the pipeline stops discarding one candidate per day.
- Keep `content.autopublish` false. Given the core-update exposure, every post should have a human read
  it.

### P5 — Hygiene

- Fix `http://www` (Cloudflare: Always Use HTTPS, or rescope the Page Rule).
- Check GSC → Manual actions.
- Fix the `/compare/*` H1 spacing and the slug-derived H2 casing.

---

## 4. What I could not check

- **Manual actions** — not exposed by the API; needs the Search Console UI.
- **The actual backlink profile** — no Ahrefs/Majestic/DataForSEO-Backlinks access from here. The
  "30 spam-tier links, 1/10" figure is carried over from the July RankRGV audit and is now 6 weeks old.
- **Whether competitors moved** on 17 July. If the step-change was a core update, competitor movement
  on the same date would corroborate it.

---

## 5. Expectation setting

P0 is the only item with a fast payback — it is a title and intro rewrite against traffic that already
exists, and should show inside two weeks.

P1–P2 are recovery work from a core update. Core-update recovery is generally not visible until a
subsequent update runs, which historically means **6–12 weeks**, and it is not guaranteed. The
consolidation is still correct on its own merits — it fixes cannibalization that predates the update.

P3 is the compounding one and the slowest. Nothing on this site ranks for a head term like "food api"
without referring domains it does not currently have, and no amount of on-page work substitutes for
that.
