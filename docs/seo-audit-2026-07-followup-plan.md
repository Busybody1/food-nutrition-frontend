# CalorieAPI — SEO Audit Follow-up Plan (July 2026)

**Responds to:** `docs/calorieapi-seo-audit-2026-07-05.html` (RankRGV audit, v3, dated July 9 2026)
**Builds on:** `food-nutrition-frontend/docs/seo-implementation-plan.md` (5-phase plan, implemented July 3 2026)
**Scope:** what we can move via the **codebase** or **new content/data**. Off-page/ops items are listed but tagged, because that is where the real leverage now sits.

---

## ✅ Implementation status — July 10 2026

The codebase + new-content portion of this plan is **implemented and verified** (`tsc`, `eslint`, `next build` all pass; both new routes prerender). Shipped in this pass:

| Item | What shipped | Files |
|---|---|---|
| **A1** | FatSecret + Open Food Facts comparison pages (`/compare/fatsecret-alternative`, `/compare/open-food-facts-alternative`) + hub rows; auto-flow into sitemap/llms.txt/hub | `src/lib/comparisons-data.ts`, `src/lib/topic-clusters.ts` |
| **C1** | `<meta name="keywords">` removed at both emit points (kept the `keywords?` param as accepted-but-ignored so callers still compile) | `src/app/layout.tsx`, `src/lib/metadata.ts` |
| **B1/B2** | Homepage now links `/blog` + two live posts, `/solutions/wellness-saas`, and references all 6 competitors | `src/components/marketing/home-seo-content.tsx` |
| **C2** | Homepage body expanded ("From the developer blog" + widened compare paragraph) to lift text-to-HTML ratio | same file |
| **E1** | Google Analytics moved to `strategy="lazyOnload"` (marginal; noted below) | `src/components/analytics/google-analytics.tsx` |
| **A2** | 5 CMS-ready comparison blog drafts (Nutritionix → Spoonacular → USDA → FatSecret → Open Food Facts) | `docs/blog-drafts/` |

**Turned out already-done (verified in code, no work needed):** D1 (FAQPage JSON-LD) and D2 (BreadcrumbList JSON-LD) are already emitted on **every** compare/solution/capability page — see `comparison-page.tsx:27-39`, `solution-page.tsx:54-66`, `capability-page.tsx:58-69`. The earlier "only the homepage emits FAQPage" note was based on a stale read; disregard D1/D2 below.
**D4 (OpenAPI):** backend is FastAPI → `/openapi.json` is already public, and a RapidAPI spec exists at `food-nutrition-backend/docs/rapidapi/openapi.rapidapi.json`. No code needed — apis.guru/RapidAPI submission is an ops step (§3A).

**Still requires action (not codebase):** publish the A2 blog drafts via `/admin/blog/new`; then the ops levers in §3 — backlinks (esp. shipping the RapidAPI listing) and Search Console re-indexing.

---

## 0. TL;DR — the reframing that matters

The audit's on-page "still open" list is **mostly stale**. Its underlying data (DataForSEO `ranked_keywords`) is a **May–June cache**, taken *before* the July 3 SEO implementation shipped ~25 routes. When you reconcile the audit against the current code, three of its headline "to-do" items are **already done**:

| Audit says | Reality in code | Verdict |
|---|---|---|
| "No Nutritionix comparison content — write it first" | `/compare/nutritionix-alternative` exists (`comparisons-data.ts:38`), plus Edamam, USDA, Spoonacular | **Page done.** Gap is the *blog* version + indexing |
| "Internally link the orphaned feature pages (`/barcode-nutrition-api`, `/food-database-api`)" | Both already linked from homepage body (`home-seo-content.tsx:75,79`) + footer | **Done.** Real orphans are different (see §2B) |
| "Feature pages exist, need creation → no, need indexing" | Confirmed — capability/solution/compare/guide registries all live | **Correct** — indexing, not building |

**So the true bottlenecks are, in order:**
1. **Off-page authority** (backlinks) — scorecard 1/10, untouched. The single biggest lever. Mostly *not* code.
2. **Indexing** — ~25 July-3 pages + the dropped `/docs`/Edamam URLs need to be crawled/re-crawled. Ops (Search Console), not code.
3. **A handful of genuine codebase gaps** — real, small, high-ROI (see §2).

Everything below is sorted so the highest-leverage *codebase* work is Tier A–B; ops levers that dominate impact are called out in §3 so they don't get lost.

---

## 1. Confirmed-done (verified live 7/9 in the audit — no action)

www→non-www 301 (Cloudflare) · robots.txt AI-crawler unblock · OG image URL · 6 JSON-LD blocks · on-page brand standardization ("Calorie API"). These are done; the only residual is Google re-crawling them (§3).

---

## 2. Codebase & new-content actions

### Tier A — New content on the validated playbook (highest code-side ROI)

The Edamam **blog post** (`/blog/edamam-api-alternative`) ranked for two Edamam-branded terms within days. That is the proven pattern. The comparison **pages** exist, but the audit's evidence says the **blog** format ranks fastest and is what LLMs cite. Do both: fill the missing pages, then publish the posts.

- **A1. Add the two genuinely-missing comparison pages** *(code — registry only)*
  - Missing vs. audit's target list: **FatSecret** (16/20 AI citations) and **Open Food Facts** (16/20).
  - Add one `ComparisonPage` object each to `src/lib/comparisons-data.ts` + a row to `COMPARE_HUB_ROWS`. Route, sitemap, `llms.txt`, related-links, OG image all wire up automatically. No new route file needed.
  - Do **not** add a "Recipe Nutrition API" comparison/page — no backend recipe endpoint exists (thin/false content). Standing constraint.

- **A2. Publish comparison + guide blog posts** *(new content — CMS, not a PR)*
  - Author via `/admin/blog/new` (DB-backed; `BlogPostInput` → `POST /blog`). Priority order from the AI-citation data:
    1. **Nutritionix alternative** (17/20 AI citations, the #1 commercial threat, no blog post yet)
    2. **Spoonacular alternative**
    3. **"Built on top of USDA FoodData Central"** explainer (USDA is in 20/20 AI answers — position as the production layer, don't fight it)
    4. **FatSecret alternative**, **Open Food Facts limitations**
  - For each post, set `keywords` to include the competitor + "alternative/comparison" so `topic-clusters.ts` auto-injects internal links to the matching `/compare/*` and capability hubs (`blog/[slug]/page.tsx:94`). This is the mechanism that makes DB posts non-orphaned for free.
  - These posts are the same content that "best nutrition APIs" roundups and LLMs cite → compounds across Google + AI channels simultaneously.

### Tier B — Close the *real* internal-linking gaps *(code — small, high-ROI)*

The audit's specific orphan claims are stale, but verification found real gaps:

- **B1. Homepage does not link `/blog` at all** (confirmed: no `/blog` in `src/components/marketing/`). Add a "From the developer blog" section to `home-seo-content.tsx` linking the ranking posts (`best-food-nutrition-apis-2025`, `edamam-api-alternative`, and the new Nutritionix post). This simultaneously: (a) fixes the `/blog` orphan, (b) passes homepage authority to the posts already ranking #12–29, (c) raises homepage word count (helps the text-to-HTML item in B3/C).
- **B2. Deep-link the orphaned children:**
  - `/solutions/wellness-saas` — the only solution not linked from the homepage body (other 4 are). Add it to `home-seo-content.tsx`.
  - Individual `/docs/guides/*` slugs — only the guides *index* is linked. Add deep links to specific guides from relevant capability pages' `related[]` arrays and from docs sections.
  - Per-competitor `/compare/[slug]` — the homepage links `/compare` (hub) but not the individual comparison pages. Cross-link them from the relevant blog posts (via `topic-clusters.ts`) and from each other's `related[]`.
- **B3. Recover the 4 dropped keywords** (`food db api`, `api food`, `edamam recipe api`, `edamam food database api`). These were ranking via `/docs` and `/blog/edamam-api-alternative` on the pre-fix www host that 530'd. Code-side contribution: strengthen internal links into `/docs` and the Edamam post, and bump the Edamam post's `updated_at`/content freshness so re-crawl finds a stronger page. The rest is a Search Console re-index request (§3).

### Tier C — On-page quick wins *(code)*

- **C1. Remove the `<meta name="keywords">` tag.** Emitted at `src/app/layout.tsx:43` (`keywords: SITE_KEYWORDS`) and `src/lib/metadata.ts:49` (per-page builder). Dropping the `keywords` line in the builder kills it for every routed page; also remove it from the layout `metadata`. Genuinely low-value (Google has ignored it since 2009) — do it as cleanup, don't oversell it.
- **C2. Expand homepage body depth** to lift the 4.2% text-to-HTML ratio and reinforce keyword coverage. `src/components/marketing/home-seo-content.tsx` is the designated, cannibalization-safe surface (uses `<h2>/<h3>` only). Add depth on data provenance, use cases, and a compare teaser. **Do NOT touch the hero `<h1>` ("Food Calorie API for production health apps", `home-hero.tsx:19`) or `SITE_TITLE`** — both rank and are cannibalization-sensitive.
- **C3. Fix the 2 missing image `title` attributes** (audit's minor unchanged item) while in the homepage components.

### Tier D — Structured data & AI-answer optimization *(code — feeds the already-strongest channel)*

AI answer engines are currently a **stronger discovery channel than Google organic** for this site (55% mention rate on a young domain). The crawler unblock is done; now maximize what those crawlers find:

- **D1. ~~Add `FAQPage` JSON-LD to comparison/solution pages~~ — ALREADY DONE.** Every compare/solution/capability page emits `buildFaqPageJsonLd(page.faqs)` (verified live). No action.
- **D2. ~~Add `BreadcrumbList` JSON-LD to deep pages~~ — ALREADY DONE.** All three page types emit `buildBreadcrumbJsonLd` + `buildWebPageJsonLd`. No action. (Only remaining schema idea: if real reviews exist, an `AggregateRating` — deferred, needs genuine review data.)
- **D3. Audit `llms.txt` / `llms-full.txt` completeness** — confirm the new comparison/guide entries and the DB blog posts all surface in `discoveryCatalog()` (`blog-discovery.ts:58`) and `buildLlmsFullTxt()`. This file is the single best AI-discovery asset and is already built; keep it exhaustive.
- **D4. (Verify, then act) Publish an OpenAPI spec** if one isn't already public. An OpenAPI/Swagger doc unlocks **apis.guru** and streamlines **RapidAPI** listing (§3) — turning an off-page authority play into a mostly-codebase deliverable. Check the backend for an existing spec before writing one.

### Tier E — Performance *(code — but low value, set expectations)*

The site is already well-optimized: GA is `afterInteractive`, fonts via `next/font` with `display:swap`, the API playground is lazy + `ssr:false` + intersection-gated, JSON-LD is inlined (no extra JS). The audit's "2 render-blocking scripts" are almost certainly Next framework chunks, and TTI 747ms is labeled "acceptable."

- **E1.** Only real lever: move Google Analytics from `afterInteractive` → `strategy="lazyOnload"` (`google-analytics.tsx`). Marginal. **Don't over-invest here** — there's little to squeeze and CWV isn't the constraint.

---

## 3. Off-codebase levers (NOT code — but this is where the biggest wins are)

Flagging explicitly so they aren't lost. I can't execute these; they need account/marketing action.

- **3A. Backlinks — the #1 lever (scorecard 1/10).** All 30 current links are spam-tier, 100% naked-URL anchors, zero editorial. Nothing on-page matters much without real referring domains.
  - **RapidAPI listing** — ties directly to the in-flight RapidAPI proxy-secret gateway already built in the backend (deploy needs `RAPIDAPI_PROXY_SECRET` set). Distribution + authority in one move. **Unblock and ship this.**
  - **public-apis.io**, **apis.guru** (needs the OpenAPI spec from D4), **Product Hunt launch** (5–15 organic links in a day), **dev.to/Hashnode** "I built a food API" post, **GitHub README** links from example projects/SDKs, genuine **Reddit/Stack Overflow** answers (also primary LLM retrieval sources).
- **3B. Search Console (indexing).**
  - Confirm `sitemap.xml` is **submitted** (audit couldn't verify).
  - Request re-index of `/docs`, `/blog/edamam-api-alternative`, and the 4 dropped-keyword URLs so Google re-crawls the fixed www redirect and consolidates signal.
  - Request re-index on pages still showing cached **"Busybody"** SERP snippets (on-page is already fixed — this is pure crawl lag).
  - Verify the ~25 July-3 pages are actually indexed (Coverage report).
- **3C. AI citation re-test** (~$2–3, 4 providers × 5 prompts). The July 5 baseline (55%; ChatGPT 1/5, Gemini 1/5) predates the crawler unblock. Re-run to confirm ChatGPT/Gemini moved to 3/5+. Pure measurement — do after the Tier A blog posts land so the re-test captures them.

---

## 4. Recommended sequencing

**Sprint 1 (code, ~half day):** C1 (remove meta keywords) · B1 (homepage→blog section) · B2 (wellness-saas + deep guide/compare links) · A1 (FatSecret + Open Food Facts compare pages) · D1 (FAQPage on compare/solution).
→ One PR. Ship, then request re-index (3B).

**Sprint 2 (code + content):** C2 (homepage depth) · D2 (BreadcrumbList) · D3 (llms.txt completeness) · D4 (OpenAPI spec check/publish) · B3 (Edamam post refresh). In parallel, start A2 blog posts (Nutritionix first) in the CMS.

**Sprint 3 (mostly ops, highest impact):** 3A backlinks — RapidAPI listing first (unblock the gateway), then directories + Product Hunt. 3C AI re-test after A2 posts publish.

**Explicitly de-prioritized:** E1 performance (marginal), C1 impact (do it, but it won't move rankings). The audit itself concludes: *"Next real lever is backlinks — nothing else here matters much without referring domains that aren't spam."* This plan agrees.

---

## 5. Standing constraints (from prior planning — do not violate)

- **No Recipe Nutrition API page/comparison** until a backend recipe-analysis endpoint exists (thin/false content otherwise).
- **Never touch the homepage `<h1>` or `<title>`**, and never reuse home's "food calorie API" primary phrase as another page's h1/title (cannibalization).
- **New URL surfaces must stay registry-driven** (`comparisons-data.ts`, `solutions-data.ts`, `capability-pages-data.ts`, `docs/guides-data.ts`) so sitemap / `llms.txt` / footer / related-links all update from one source.
- **Blog is DB/CMS-authored**, not files — new posts go through `/admin/blog`, not a PR.
