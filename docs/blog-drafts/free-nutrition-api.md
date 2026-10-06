---
slug: free-nutrition-api
title: Free Nutrition API
meta_title: Free Nutrition API
meta_description: A free nutrition API with 1,000 calls a month and no card. How that compares with USDA, Spoonacular's 50 points, and Nutritionix's closed free tier.
excerpt: Free nutrition APIs are not the same product. USDA is free reference data. Calorie API is 1,000 calls a month. Nutritionix no longer has a public free tier. Spoonacular is 50 points a day.
keywords: free nutrition api, nutrition api free, free food nutrition api, free nutrition api for developers
---

A free nutrition API in October 2026 means four different things, and only one of them is "unlimited food data."

| Offer | What "free" is | The catch |
|---|---|---|
| USDA FoodData Central | A government key | You build search, barcode, and support |
| Calorie API Free | 1,000 calls a month, no card | Non-commercial. 10 requests a minute. 20 foods per search |
| Spoonacular Free | 50 points a day | Then HTTP 402. A point is not a request. Backlink required |
| FatSecret Basic | 5,000 calls a day | US dataset only. Attribution required |
| Nutritionix | No public free tier | Business trial is 2 monthly active users |
| Edamam | A trial on some products | The $14 food-database plan is paid. Recipe licenses accumulate |

Prices and limits were read from each vendor's site and from [our pricing page](/pricing) on 1 October 2026.

## What the Calorie API free plan includes

Create an account, create a key, send it as `X-API-Key`. No card.

```bash
curl "https://api.calorieapi.com/api/v1/search/foods?q=banana" \
  -H "X-API-Key: YOUR_API_KEY"
```

You get ranked food search, suggest, and barcode lookup. Macros are per 100 grams. The catalog marketed on the site is 4M+ foods. The free plan does not include commercial production, the image-to-calorie API, or the MCP server. Those are other plans.

One thousand calls is enough to build the search screen and a barcode flow, and to run a personal project. It is not enough for a launched app with real users. When the month's quota is gone, the API returns HTTP 402 until the next cycle. Upgrade in the dashboard. The quota does not reset because you asked.

Displaying the data still needs a visible credit under our terms, unless a Plus or Enterprise agreement waives it. "Free" is not "unattributed."

## Which free tier to start on

Use USDA if the foods are generic US reference items and you will write the search UX. The [USDA guide](/blog/usda-fooddata-central-api-guide) covers the demo key and why production apps outgrow it.

Use this free plan if you want autocomplete, barcode, and per-100g macros this week without a card, and the app is not charging anyone yet.

Use Spoonacular's 50 points only if you need recipe content. The arithmetic is on [Spoonacular API pricing](/blog/spoonacular-api-pricing). Fifty points disappears in a few dozen searches.

Do not plan a student project on Nutritionix. Their developer portal says the public free tier is closed. Details are on [Nutritionix API pricing](/blog/nutritionix-api-pricing).

FatSecret Basic is the largest daily number in the table, and it is US-only. If the app's users are not in the US, that free tier is the wrong country. [FatSecret API pricing](/blog/fatsecret-api-pricing) is the edition breakdown.

## When free is the wrong plan

The day the app charges, runs ads, or sits inside a company that makes money, Free, Basic, and Core are all non-commercial. Basic is $15 and still not a commercial license. The commercial plan is Plus at $150 a month for 1 million calls, with `X-API-Usage-Type: commercial`.

Ship the prototype on the free thousand. Move to Plus before the first paying user, not after the first abuse notice.
---FAQ---
Q: Is there a free nutrition API without a credit card?
A: Yes. Calorie API's free plan is 1,000 calls a month, no card, for non-commercial development. Spoonacular's on-site free plan also requires no card and is 50 points a day.
Q: Is the USDA API the same as a free nutrition API for apps?
A: No. USDA FoodData Central is free reference data. It does not give you autocomplete and barcode UX. A consumer app usually adds a commercial food API for that layer.
Q: What happens after 1,000 calls?
A: Further requests return HTTP 402 until the monthly quota resets. You can upgrade from the dashboard. The free plan does not cover a commercial app.
Q: Does Nutritionix still have a free API?
A: Not a public one. The open trial was discontinued. A business trial is capped at 2 monthly active users.
