# SEO Implementation Plan — CalorieAPI.com

> **Status (2026-07-03): IMPLEMENTED.** All phases P0–P4 are in the codebase. Remaining
> follow-ups are operational: set `NEXT_PUBLIC_ORG_SAMEAS` (and optionally
> `NEXT_PUBLIC_ORG_FOUNDING_DATE`, `NEXT_PUBLIC_STAT_UPTIME`, `NEXT_PUBLIC_STAT_LATENCY`) in
> production, add real quotes to `src/lib/testimonials-data.ts` when available, review
> comparison-page claims (`asOf` fields) on a schedule, and pursue the off-site items in §8.

Response to `docs/seo-audit.txt`. Scope: **codebase-only** changes in `food-nutrition-frontend`.
Off-site work from the audit (Reddit participation, brand mentions, GitHub presence, external
dashboards/Ahrefs/SEMrush) is intentionally excluded — see §8.

---

## 1. Executive summary

The audit's core message: stop ranking isolated pages and become the recognized *entity* for
nutrition APIs — broader semantic coverage, stronger machine-readable entity signals, and topic
clusters that both Google and LLMs can traverse.

The codebase already has excellent SEO plumbing (per-page metadata registry, JSON-LD builders,
revalidated sitemap, `llms.txt`, RSS, canonical-host middleware, next/image everywhere). What it
lacks is **surface area and entity depth**:

1. **~14 indexable public URLs total.** Competitors expose hundreds of semantic entry points.
   No use-case pages, no comparison/alternative pages, no framework guides.
2. **Docs is one monolithic client-rendered page** (`'use client'`) — one URL for the entire API
   reference, weak crawlability, no per-endpoint entry points.
3. **Entity graph is thin**: `Organization.sameAs` is `[]`, schemas are not linked via `@id`,
   no `WebAPI`/`TechArticle` types, 5 FAQs duplicated verbatim on two URLs.
4. **Nothing links topically** beyond header/footer + generic "SEO content" blocks — no
   hub-and-spoke cluster linking.

The plan below fixes these in 5 phases, ordered by impact-per-effort. Phases 0–1 are the audit's
"quick wins"; phases 2–3 are the semantic-expansion core; phase 4 is conversion polish.

---

## 2. Already in place — do not redo

| Asset | Where |
|---|---|
| Per-route titles/descriptions/canonicals/OG/Twitter | `src/lib/public-page-seo.ts` + `src/lib/metadata.ts` + `src/lib/build-public-metadata.ts` |
| Organization + WebSite JSON-LD (site-wide) | `src/app/layout.tsx` + `src/components/seo/structured-data.tsx` |
| SoftwareApplication ("api"), Product/Offer (pricing, live prices), FAQPage, BlogPosting, ItemList, BreadcrumbList, WebPage JSON-LD | `src/lib/seo-jsonld.ts`, `src/components/seo/*` |
| Sitemap w/ 300 s revalidation + blog slugs | `src/app/sitemap.ts` |
| robots.txt (dashboard/admin/auth/checkout disallowed) | `src/app/robots.ts` |
| `llms.txt` (site summary + pricing + blog catalog) | `src/app/llms.txt/route.ts`, `src/lib/blog-discovery.ts` |
| RSS feed + `alternates.types` link | `src/app/blog/feed.xml/route.ts` |
| Canonical host + HTTPS 301 middleware (skips SEO files) | `src/lib/canonical-redirect.ts`, `src/proxy.ts` |
| Legacy-URL 301s (`/signup`, `/login`, `/register`) | `next.config.mjs` |
| next/image everywhere, WebP, alt text, 30-day cache | `next.config.mjs`, components |
| Keyword-rich content sections w/ contextual links on every marketing page | `src/components/seo/public-page-seo-content.tsx`, `home-seo-content.tsx` |
| Root OG image route | `src/app/opengraph-image.tsx` |

---

## 3. Gap analysis (audit item → codebase reality)

| Audit recommendation | Current state | Fix (phase) |
|---|---|---|
| Entity signals / Knowledge Graph | `Organization.sameAs: []`; no `@id` linking between schemas; no `legalName`/`contactPoint` | P0 |
| SoftwareApplication/API/TechnicalArticle schema | `SoftwareApplication` exists; no `WebAPI`, no `TechArticle`, schemas are islands | P0, P1 |
| FAQ content for AI answers | 5 generic FAQs, identical FAQPage JSON-LD on `/` and `/faq` (duplication) | P0 |
| Documentation depth, semantic headings, per-topic entry points | Single client-rendered `/docs` page; content hardcoded in TSX | P1 |
| Framework-specific tutorials (Next.js, React Native, Flutter, Node) | None | P1 |
| Dedicated capability pages (Barcode API, Meal Tracking API, Food Database API) | None — home page carries every keyword | P2 |
| Comparison/alternative pages (Nutritionix, Edamam, USDA, Spoonacular) | None | P2 |
| Use-case pages (fitness, healthcare, meal planners, grocery/retail) | None | P2 |
| Topic clusters / internal linking architecture | Header/footer + ad-hoc inline links only | P3 |
| Expand high-performing landing page w/o cannibalizing | `home-seo-content.tsx` exists but shallow | P0, P3 |
| Technical SEO: crawlability, canonicalization, CWV | `/docs`, `/pricing`, `/contact` are client components; sitemap `lastModified: now` for all static routes (false freshness signal) | P0, P1 |
| Changelogs as authority signal | 3 hardcoded entries in TSX | P4 |
| Conversion: testimonials, speed/uptime proof, case studies | None | P4 |
| AI-readable site (llms.txt) | Blog-only catalog | P3 |

---

## 4. Target information architecture

### 4.1 New route map (keyword → URL)

**Capability pages** — top-level static slugs (highest commercial intent; explicit folders, no
catch-all risk). Thin `page.tsx` wrappers around one shared template + data registry:

| Primary queries | Route |
|---|---|
| barcode nutrition api, upc food lookup api, barcode scanner food api | `/barcode-nutrition-api` |
| food database api, food data api json, food search api | `/food-database-api` |
| meal tracking api, meal logging api, food diary api | `/meal-tracking-api` |
| nutrition analysis api, macro tracking api, calorie counting api | `/nutrition-analysis-api` |

> ⚠️ The audit suggests a "Recipe Nutrition API" page, but the backend has **no recipe-analysis
> endpoint** (docs cover search, barcode, food details, nutrients, brands, categories only).
> Do not ship a capability page for a capability that doesn't exist — it will read as thin/false
> to both users and LLMs. Revisit if/when the endpoint ships; until then the meal-tracking and
> analysis pages can mention recipe-building *workflows* built on food search.

**Docs split** — server-rendered sub-routes replacing the monolith (§5 P1):

```
/docs                    → overview + quickstart (hub)
/docs/authentication     → API keys, auth errors
/docs/food-search        → GET /api/v1/search/foods (match_mode, verified_only)
/docs/barcode-lookup     → GET /api/v1/search/barcode/{upc} (+ Open Food Facts fallback)
/docs/food-details       → GET /api/v1/foods/{id}
/docs/reference-data     → nutrients / brands / categories endpoints
/docs/rate-limits        → quotas, abuse protection, commercial flag
/docs/errors             → error handling
/docs/guides             → guide index (hub)
/docs/guides/[slug]      → react-native-food-tracking, nextjs, flutter, node, python
```

**Use-case pages** — dynamic segment, data-driven:

```
/solutions/[slug]  → fitness-apps, meal-planning-apps, healthcare, grocery-retail, wellness-saas
```

**Comparison pages** — dynamic segment, data-driven:

```
/compare                       → "Best nutrition API" hub (honest comparison table, links to all)
/compare/nutritionix-alternative
/compare/edamam-alternative
/compare/usda-fooddata-central-alternative
/compare/spoonacular-alternative
```

### 4.2 Cluster linking model (hub-and-spoke)

Every page belongs to a cluster and links **up** to its hub, **across** to 2–4 siblings, and
**down** to conversion (`/pricing`, `/auth/register`, `/playground`):

- **Barcode cluster**: `/barcode-nutrition-api` ↔ `/docs/barcode-lookup` ↔ guide(s) ↔ `/solutions/grocery-retail` ↔ related blog posts
- **Tracking cluster**: `/meal-tracking-api` ↔ `/docs/food-search` ↔ `/docs/guides/react-native-food-tracking` ↔ `/solutions/fitness-apps`
- **Comparison cluster**: `/compare` hub ↔ each alternative page ↔ the capability page each query implies
- Home remains the "nutrition API / food calorie API" hub; every capability page links home with
  varied anchor text; home links to each capability page once.

Anti-cannibalization rules (audit's explicit concern):
- One primary query family per URL (table above); never reuse a page's primary phrase as another
  page's `<h1>`/title.
- Home keeps "food calorie API"; capability pages take the modifier queries.
- Self-referencing canonicals on every new route (already automatic via `buildPageMetadata`).

---

## 5. Phased implementation

### Phase 0 — Entity & technical foundation (quick wins, ~1–2 days)

**P0.1 — Connect the entity graph with `@id`s** (`src/components/seo/structured-data.tsx`, `src/lib/seo-jsonld.ts`)
- Give stable ids: `${SITE_URL}/#organization`, `${SITE_URL}/#website`, `${SITE_URL}/#api`.
- Organization: add `legalName: 'BusyBody FIT LTD'`, `contactPoint` (support email,
  `contactType: 'technical support'`), `foundingDate` (env), and populate `sameAs` from a new
  env var (`NEXT_PUBLIC_ORG_SAMEAS` — comma-separated: GitHub org, X/Twitter, LinkedIn,
  Crunchbase, product directories as they come online). Empty entries filtered; emit `sameAs`
  only when non-empty.
- WebSite: `publisher: { '@id': '#organization' }`.
- SoftwareApplication: add `@id`, `provider: { '@id': '#organization' }`,
  `softwareHelp`/`documentation: absoluteUrl('/docs')`, `termsOfService: absoluteUrl('/terms')`.
- Add a sibling **`WebAPI`** node (`@type: 'WebAPI'`, `documentation`, `provider`,
  `termsOfService`, `offers`) — this is the schema type AI crawlers associate with API products.
- `buildWebPageJsonLd`: reference `isPartOf: { '@id': '#website' }` instead of inline WebSite.

**P0.2 — Fix FAQ duplication + expand FAQ data** (`src/lib/faq-data.ts`)
- Restructure to grouped sets: `GENERAL_FAQS` (current 5), `IMPLEMENTATION_FAQS` (auth errors,
  pagination, barcode misses/fallback, rate-limit handling, response format), `PRICING_FAQS`
  (quota overage, commercial use, cancellation), `DATA_FAQS` (coverage, verification, per-100g
  normalization, update cadence). Target 20–25 total.
- `/faq` page: render all groups with `<h2>` per group; FAQPage JSON-LD = full set.
- Home: render a *different* subset (implementation + data highlights); FAQPage JSON-LD = that
  subset only — no more verbatim duplication across URLs.
- New capability/solution pages (P2) each get 3–5 page-specific FAQs from these pools + their own.

**P0.3 — Sitemap honesty + contact schema**
- `src/app/sitemap.ts`: stop stamping `lastModified: now` on all static routes (false freshness
  signal). Add a `lastModified` field per entry in a small constants map, updated when a page
  materially changes; keep dynamic dates for blog.
- Contact page: `buildContactPageJsonLd()` exists in `seo-jsonld.ts` but is rendered nowhere —
  wire it into the contact layout alongside `PublicPageSchema`.

**P0.4 — Expand the high-performing home page** (`src/components/marketing/home-seo-content.tsx`)
- Audit quick-win #1. Add sections *below the fold, without touching hero/title/h1*:
  "Popular use cases" (links to future `/solutions/*`; ship linking to `/docs` sections until P2
  lands), "Integrate in minutes" (3-step snippet w/ link to quickstart), implementation FAQ block
  (P0.2 subset), and a short "How CalorieAPI compares" teaser (links to `/compare` once live).

**Acceptance**: Rich Results Test passes on `/`, `/pricing`, `/faq`; schema.org validator shows
one connected graph (Organization ← WebSite ← WebPage, Organization ← WebAPI); no duplicate
FAQPage content across URLs; sitemap dates stable between deploys.

---

### Phase 1 — Docs restructure: monolith → server-rendered cluster (~3–5 days)

The single biggest crawlability fix. Currently `/docs/page.tsx` is `'use client'`, one URL,
content hardcoded in TSX.

**P1.1 — Extract content to data modules**
- Extend the existing pattern (`src/lib/docs/barcode-lookup.ts`) to
  `src/lib/docs/<section>.ts` per section: endpoint metadata, parameter tables, code samples per
  language, field definitions, troubleshooting notes, 3–5 section-specific FAQs.

**P1.2 — Split into server-rendered routes** (map in §4.1)
- Each route: RSC `page.tsx` exporting metadata (extend `PUBLIC_PAGE_SEO` with the new paths —
  the `PublicPagePath` union makes omissions a type error), rendering shared layout components.
- Keep interactivity (language tabs, copy buttons, sidebar filter) in leaf client components —
  `docs-code-block.tsx` already exists for this.
- `/docs` becomes the hub: quickstart + cards linking every sub-page.
- Sidebar becomes cross-route nav (server component with active-state via `usePathname` in a tiny
  client leaf). Add visible breadcrumbs + prev/next pagination links between sections.
- Old anchor deep-links (`/docs#barcode-lookup`): add `redirects()` entries in `next.config.mjs`
  for any hash-less legacy paths if they exist; hash anchors themselves keep working on the hub —
  optionally render small anchor stubs on `/docs` linking to the new sub-pages.

**P1.3 — TechArticle schema for docs**
- New builder `buildTechArticleJsonLd({ headline, description, path, dateModified, proficiencyLevel })`
  in `seo-jsonld.ts`; render on every docs sub-page + guide, `isPartOf: { '@id': '#website' }`,
  `about: { '@id': '#api' }`. FAQPage JSON-LD per docs page from its section FAQs.

**P1.4 — Framework guides** (`/docs/guides/[slug]`)
- Registry `src/lib/guides-data.ts`: `{ slug, title, description, framework, keywords, sections[], codeSamples, faqs, related[] }`.
- `generateStaticParams` + `generateMetadata` from registry.
- Launch set (audit examples): `react-native-food-tracking`, `nextjs-nutrition-app`,
  `flutter-barcode-scanning`, `nodejs-food-search`, `python-nutrition-data`.
- Each guide: TechArticle + BreadcrumbList + FAQPage JSON-LD, working end-to-end code targeting
  real endpoints, links to its capability page + docs section + playground.

**P1.5 — Register everything**
- Add all docs/guide routes to `sitemap.ts` (guides from registry) and to the docs sidebar,
  footer "Developers" column, and `llms.txt` (P3.2).

**Acceptance**: every endpoint has its own indexable, server-rendered URL with unique
title/description/canonical/TechArticle; `curl` of each URL returns full content HTML with no JS;
CWV unchanged or better on docs (less client JS).

---

### Phase 2 — Commercial surface area: capability, solution, comparison pages (~4–6 days)

All three page types follow one implementation pattern: **typed data registry + shared RSC
template + thin routes**, mirroring `public-page-seo.ts`.

**P2.1 — Capability pages** (4 top-level routes, §4.1)
- `src/lib/capability-pages-data.ts`: `{ slug, h1, title, description, keywords, heroCopy, features[], codeSample, useCases[], faqs[], relatedDocs[], relatedGuides[], relatedSolutions[] }`.
- Template `src/components/marketing/capability-page.tsx`: hero (h1 = primary query), live code
  sample, feature grid, use-case links, FAQ section, comparison teaser, CTA band.
- JSON-LD per page: WebPage (`about: {'@id': '#api'}`) + BreadcrumbList + FAQPage + `Service` or
  feature-scoped `WebAPI` node.
- Extend `PUBLIC_PAGE_SEO` (or a parallel registry) so metadata stays centralized and typed.

**P2.2 — Solution pages** (`/solutions/[slug]`)
- `src/lib/solutions-data.ts` registry; `generateStaticParams`; same template family with
  industry-specific pain points, integration architecture blurb, relevant endpoints, FAQs.
- Launch set: `fitness-apps`, `meal-planning-apps`, `healthcare`, `grocery-retail`,
  `wellness-saas` (audit's list minus restaurant-software unless product supports menu data —
  verify before writing copy).

**P2.3 — Comparison pages** (`/compare` + `/compare/[slug]`)
- `src/lib/comparisons-data.ts`: per competitor — feature matrix rows (endpoint coverage, free
  tier, rate limits, data verification, barcode support, pricing model), honest "when they're the
  better fit" section (credibility is what earns LLM citations), migration notes (field mapping,
  code diff), FAQs ("Is CalorieAPI a good Nutritionix alternative for X?").
- `/compare` hub: full matrix + links to each alternative page → this is the "reference-worthy
  asset" the audit wants Reddit/LLMs to cite.
- ⚠️ Competitor pricing/features change: keep every claim in the data file with an
  `asOf: '2026-07'` field rendered as "as of July 2026", and schedule content review. No scraping.
- JSON-LD: WebPage + BreadcrumbList + FAQPage. (Skip `Product` comparisons in schema — Google
  penalizes review-less product schema; plain semantic HTML tables are what LLMs read anyway.)

**P2.4 — Wire into site graph**
- Header: "Product" dropdown (capability pages) — or keep header lean and add footer columns:
  "APIs" (capability pages), "Solutions", "Compare" (`src/components/layout/footer.tsx`).
- Sitemap: all new routes from registries.
- Home + docs hub + pricing get contextual links to relevant new pages (varied anchor text).

**Acceptance**: ~20 new indexable URLs, each server-rendered with unique metadata, connected
JSON-LD, ≥3 contextual inbound links from existing pages, and self-canonical; no two pages share
a primary keyword; Rich Results Test passes per template.

---

### Phase 3 — Cluster glue: internal linking + AI discoverability (~2–3 days)

**P3.1 — `RelatedResources` component** (`src/components/seo/related-resources.tsx`)
- Server component: takes typed refs (`docs | guide | solution | capability | compare | blog`),
  renders a "Related resources" section (h2 + descriptive anchor text, `prefetch={false}` like
  `SeoInlineLink`). Drop into all new templates + blog post page + docs sub-pages.
- Centralize the cluster map in `src/lib/topic-clusters.ts` so links are data, not ad-hoc JSX —
  this is the audit's "stronger topical relationships" made enforceable.

**P3.2 — Expand `llms.txt`** (`src/lib/blog-discovery-format.ts` / `blog-discovery.ts`)
- Add sections beyond blog: Docs (each sub-route + one-line summary), Guides, APIs (capability
  pages), Solutions, Compare — generated from the P1/P2 registries so it can't drift.
- Add `/llms-full.txt` route: full plain-text rendering of docs content (from the data modules —
  they're structured, so this is a formatter, not new content) for LLM ingestion.

**P3.3 — Blog integration**
- Blog post page: render `RelatedResources` mapped from post keywords/tags → cluster entries.
- Verify pagination canonicals on `/blog?page=N` (self-referencing per page, not all → page 1);
  fix if needed.
- Optional: `WebSite` `potentialAction: SearchAction` targeting `/blog?query={search_term_string}`
  (blog search exists; dashboard search is auth-gated so site-level SearchAction is otherwise N/A).

**P3.4 — Per-route OG images**
- Extend the existing `opengraph-image.tsx` pattern: parameterized `ImageResponse` per segment for
  capability/solution/compare/docs routes (title + section label), and dynamic blog-post OG images
  (post title). One shared banner for every URL (current state) wastes social/AI-preview signal.

**Acceptance**: every public page shows ≥3 descriptive contextual links beyond nav; `llms.txt`
lists all public surfaces; unique OG image per template family.

---

### Phase 4 — Trust, freshness, conversion (~2–3 days, some content dependencies)

- **Changelog as data** (`src/content/changelog.ts`): move the 3 hardcoded entries out of TSX,
  render with `<time dateTime>`, per-entry anchors; include recent entries in `llms.txt`. A live
  changelog is an audit-cited entity signal — make adding entries a 2-line data change.
- **Proof components**: reusable `StatsBand` (median response time, uptime, DB size —
  `FOOD_DATABASE_SIZE_LABEL` already exists in `site.ts`) and `Testimonials` (data-driven;
  **blocked on real quotes** — ship the component, gate rendering on data presence). Add to home,
  pricing, capability pages.
- **Case-study scaffold**: `/customers/[slug]` route + registry, same template pattern; ship when
  first real story exists (don't publish placeholders — thin/fake content harms entity trust).
- **Pricing page SSR**: plans are client-fetched today; the RSC pattern already exists
  (`buildPricingProductJsonLdAsync` calls `fetchPublicPlans()` server-side). Render the plan grid
  server-side with the same data and keep only checkout interactions client-side — better LCP and
  crawlable prices.
- **Conversion instrumentation** (codebase part of the audit's measurement framework): GA4 events
  on register/pricing CTA clicks from each new template (component prop `sourcePage`) so keyword →
  signup attribution is possible in GA4. External dashboards remain out of scope.

---

## 6. Sequencing & effort

| Phase | Effort | Depends on | New URLs |
|---|---|---|---|
| P0 Entity + quick wins | 1–2 days | — | 0 |
| P1 Docs cluster + guides | 3–5 days | P0.1 (schema builders) | ~13 |
| P2 Capability/solutions/compare | 4–6 days | P0.2 (FAQ pools), P1 (link targets) | ~14 |
| P3 Cluster glue + llms.txt | 2–3 days | P1, P2 (registries) | 1 (`llms-full.txt`) |
| P4 Trust + conversion | 2–3 days | content inputs (quotes, stats) | 0–few |

Ship P0 immediately and independently. P1 and P2 can be built in parallel by different people
(P2 links to P1 URLs — stub the hrefs if P2 lands first).

## 7. Risks & guardrails

- **Cannibalization**: enforce the one-primary-query-per-URL map (§4.1); never change home's
  h1/title during expansion (it's the page that already ranks — audit quick-win #1 says *add*
  sections, don't rewrite).
- **Thin/false content**: no recipe-API page (no endpoint); no placeholder testimonials/case
  studies; comparison claims dated with `asOf` and reviewed on a schedule.
- **Client-component regressions**: new marketing surfaces must be RSC-first; interactivity only
  in leaf client components.
- **Registry drift**: sitemap, llms.txt, nav, and RelatedResources must all consume the same
  registries (`guides-data`, `solutions-data`, `comparisons-data`, `capability-pages-data`,
  `topic-clusters`) — never hand-maintain URL lists in two places.

## 8. Explicitly out of scope (off-site items from the audit)

Reddit participation & thread strategy; GitHub org presence & sample repos (recommended — but a
separate repo effort, not this codebase); API-directory submissions; third-party citations;
Google Knowledge Graph monitoring; Ahrefs/SEMrush dashboards; AI-citation tracking. The codebase
contribution to these is P0.1 `sameAs` (points the entity graph at those profiles once they
exist) and P2.3's `/compare` hub (the citable asset).
