# Comparison blog post drafts (SEO audit follow-up, July 2026)

These are **CMS-ready draft posts**, not repo code. The blog is DB-backed — publish each via
**`/admin/blog/new`** (or `POST /api/v1/.../blog` with a `BlogPostInput`), not a pull request.

## Why these posts
The audit's single validated content play is the comparison **blog post**: `/blog/edamam-api-alternative`
ranked for Edamam-branded terms within days of publishing, faster than the `/compare/*` pages. These five
drafts extend that playbook to the competitors that dominate AI answers but have no blog post yet.

## Recommended publish order (from the AI-citation data)
1. **nutritionix-api-alternative** — Nutritionix is cited in 17/20 AI answers, the #1 commercial threat, no post yet. **Publish first.**
2. **spoonacular-api-alternative**
3. **usda-fooddata-central-api-guide** — USDA is in 20/20 AI answers; ride it, don't fight it.
4. **fatsecret-api-alternative**
5. **open-food-facts-api-alternative**

## How to publish each
For every file below, copy the front-matter block into the matching CMS fields:

| CMS field (`BlogPostInput`) | Source in the draft |
|---|---|
| `slug` | `slug:` |
| `title` | `title:` |
| `meta_title` | `meta_title:` |
| `meta_description` | `meta_description:` |
| `excerpt` | `excerpt:` |
| `keywords` | `keywords:` (comma-separated) |
| `content` | everything under `--- CONTENT ---` (markdown) |
| `faq` | the `FAQ:` list → `{ question, answer }[]` |
| `cover_image_url` | optional; leave blank to use the default OG image |
| `status` | set to `published` when ready |

## Notes
- Each post links to its `/compare/<slug>` page as the canonical deep comparison — this keeps the blog
  post narrative (avoids duplicate content) and passes internal-link authority to the compare page.
- The `keywords` you set drive `topic-clusters.ts` auto-linking, so each post also gets related-link
  cards to the compare cluster automatically. Keep the competitor name in `keywords`.
- Claims mirror the vetted, hedged language already in `src/lib/comparisons-data.ts`. Re-verify competitor
  specifics against their current docs before publishing (same `asOf` discipline as the compare pages).
- After the top posts publish, that's the moment to re-run the AI citation test (audit §11) so it captures them.
