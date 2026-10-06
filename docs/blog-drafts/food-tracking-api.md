---
slug: food-tracking-api
title: Food Tracking API
meta_title: Food Tracking API
meta_description: A food tracking API returns the food. Your app stores the diary. Search, barcode, and per-100g macros, from a free 1,000-call plan.
excerpt: A food tracking API should resolve the food the user ate. It should not be the system of record for the diary. Here is the split, and what each lookup costs.
keywords: food tracking api, food tracker api, meal tracking api, food logging api
---

A food tracking API has two jobs people mash together. One is "what is this food." The other is "remember that I ate it." Calorie API does the first. Your database does the second.

That split is the product. We do not have a user table for your customers' meals, and we will not add one. If the diary has to live on the vendor, FatSecret's platform includes diary endpoints. The price of that choice is on [FatSecret API pricing](/blog/fatsecret-api-pricing). If the diary is yours, you want a lookup with a stable food id.

## The tracker's four steps

1. The user types. Call `GET /api/v1/search/suggest?q=` and render id, name, and brand. Debounce. This is the call people fire too often.
2. They pick a row. Call `GET /api/v1/foods/{id}` once. Store the id and the per-100g calories, protein, carbohydrate, and fat on your log line.
3. They scan. Call `GET /api/v1/search/barcode/{upc}`. 404 means ask them to search by name.
4. They open the day again. Read your table. Zero API calls.

```bash
curl "https://api.calorieapi.com/api/v1/search/suggest?q=oat" \
  -H "X-API-Key: YOUR_API_KEY"
```

A tracker that calls search every time the history screen loads will look "slow" and "expensive" for a reason that is not the API. The food id is the cache key.

## Quotas for a tracker, not for a demo

From [pricing](/pricing) on 1 October 2026. Free is 1,000 calls a month, 10 per minute, no card, non-commercial, 20 foods per search. Basic is $15 and 20,000 calls, and it is still non-commercial. A tracker in an App Store listing that charges for premium is Plus: $150, 1 million calls, 200 per minute, header `X-API-Usage-Type: commercial`.

Attribution stays on screen unless that Plus or Enterprise agreement waives it. The credit is part of the free and paid non-commercial terms, not a courtesy.

The [calorie tracker API](/blog/calorie-tracking-api) article is the same flow under the other common name. The [meal plan API](/blog/meal-plan-api) article is what changes when the tracker also builds a week ahead: you still resolve each food once. The [meal tracking API](/meal-tracking-api) page is the product view if you are choosing endpoints rather than reading the quota.
---FAQ---
Q: Does the food tracking API store meals?
A: No. It returns food data. Your application stores the diary, the user, and the daily total.
Q: Which endpoint should a food tracker call while the user types?
A: GET /api/v1/search/suggest. Call food details only after they select a result, and do not call either one when you redraw a day you already saved.
Q: Can I use it in a commercial tracking app?
A: Yes, on Plus or Enterprise, with the header X-API-Usage-Type: commercial. Free, Basic, and Core are non-commercial.
Q: What is a reasonable call budget?
A: About one details call per new food, plus suggest traffic while they type. Repeating breakfast from history should be zero calls if you stored the food id.
