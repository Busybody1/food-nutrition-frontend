---
slug: food-database-api-for-developers
title: Food Database API
meta_title: Food Database API
meta_description: A food database API with search and barcode. You query it. You do not download it. Free tier is 1,000 calls a month, no card.
excerpt: A food database API lets you search foods and scan barcodes without hosting the catalog. Calorie API is that query layer over 4M+ foods, with a free developer tier.
keywords: food database api, food data api, food database api for developers, food api database
---

A food database API is how you search a catalog you do not host. Calorie API is that API: multi-word search, autocomplete, barcode, and per-100g nutrition, over the 4M+ foods listed on the site. The product page is [/food-database-api](/food-database-api). This article is the version written for the search "food database API," including the limit people skip: you cannot take the database with you.

## Query, then stop

```bash
curl "https://api.calorieapi.com/api/v1/search/foods?q=oat+milk&limit=20" \
  -H "X-API-Key: YOUR_API_KEY"
```

`limit` tops out at 100 on an authenticated search. The free plan caps a response at 20 foods. Filters cover brand, category, and nutrients. `verified_only=true` keeps unverified rows out. Suggest is the lighter call for a dropdown. Food details by id is the record you store.

Barcode lookup uses the same nutrition shape and falls through to Open Food Facts when we do not have the UPC or EAN. A code neither side knows is HTTP 404. That is a signal to search by name, not a broken client.

What you may cache is the foods your users log. Plus allows up to 30 days under the [commercial license](/commercial-license). Walking page after page of search to build a private mirror is prohibited on every plan. If the business requirement is "we own the file," this is the wrong vendor. USDA publishes reference data you can work from directly. The [USDA guide](/blog/usda-fooddata-central-api-guide) is that path, with its own rate limits and no barcode endpoint.

## Price of a query, not of a dump

From [pricing](/pricing) on 1 October 2026:

- Free, $0, 1,000 calls a month, 10 per minute, no card, non-commercial.
- Basic, $15, 20,000 calls, 30 per minute, non-commercial.
- Core, $50, 150,000 calls, 50 per minute, non-commercial.
- Plus, $150, 1,000,000 calls, 200 per minute, commercial, with `X-API-Usage-Type: commercial`.

A food database API that charges in "points," where one search plus the size of the page is not one request, will not match this table. That is Spoonacular. Read [Spoonacular API pricing](/blog/spoonacular-api-pricing) if you also need recipe articles. Read [Edamam pricing](/blog/edamam-food-database-api-pricing-startup-alternative) if you need their nutrition analysis and can live with recipe licenses that accumulate.

The sibling article [nutrition database API](/blog/nutrition-database-api) makes the same no-download rule from the nutrition side. Use one URL as the page you link internally. This one owns "food database API."
---FAQ---
Q: What is a food database API?
A: A REST API for searching foods and looking up barcodes, returning calories and macros per 100 grams. You do not receive a database file.
Q: Can I download the food database?
A: No. Bulk download and scraping are not allowed. Cache the foods your users select. Plus may keep a response for 30 days.
Q: Is there a free food database API?
A: The free plan is 1,000 calls a month with no credit card, for non-commercial use. USDA FoodData Central is a separate free government API.
Q: Does barcode search use the same database?
A: Barcode hits from our catalog and from the Open Food Facts fallback return one JSON shape. Unknown codes return 404.
