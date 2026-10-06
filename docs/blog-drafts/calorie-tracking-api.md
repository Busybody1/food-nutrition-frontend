---
slug: calorie-tracking-api
title: Calorie Tracker API
meta_title: Calorie Tracker API
meta_description: A calorie tracker API for the lookup behind a tracker. Search, barcode, and calories per 100g. Free tier is 1,000 calls a month.
excerpt: A calorie tracker API is the lookup a tracker calls when someone logs a food. It is not the tracker. Search, barcode, per-100g calories, and a free tier to build the first screen.
keywords: calorie tracker api, calorie tracking api, calorie tracking apis, food calorie tracker api
---

A calorie tracker API is the call your tracker makes at the moment of logging. Calorie API returns the food. The tracker, the account, the daily goal, and the streak live in your database. We do not store them, and a tracker that expects us to is integrating the wrong product.

The phrase people also search, [calorie counter API](/blog/calorie-counter-api), is this same lookup. This page is the tracker flow around it.

## Log one food

```bash
curl "https://api.calorieapi.com/api/v1/search/suggest?q=rice" \
  -H "X-API-Key: YOUR_API_KEY"
```

Suggest while they type. When they tap a row, `GET /api/v1/foods/{id}` returns calories, protein, carbohydrate, and fat per 100 grams. A 180 gram serving is that payload times 1.8. Write the result onto the log line with the food id. Tomorrow's breakfast, if it is the same rice, is a copy of that line. It is not another search.

Barcode logging is `GET /api/v1/search/barcode/{upc}`. A 404 is an unknown code, including after the Open Food Facts fallback. Show search. Do not retry the same code in a loop.

There is no endpoint for "add this to today's diary." If you need the vendor to hold the diary, that is FatSecret's platform, priced by country. See [FatSecret API pricing](/blog/fatsecret-api-pricing).

## Plans a tracker actually fits

Read on 1 October 2026 from [pricing](/pricing):

| Plan | Price | Calls / month | Per minute | A shipped, paid tracker |
|---|---|---|---|---|
| Free | $0 | 1,000 | 10 | No |
| Basic | $15 | 20,000 | 30 | No. Paid, still non-commercial |
| Core | $50 | 150,000 | 50 | No |
| Plus | $150 | 1,000,000 | 200 | Yes. Header `X-API-Usage-Type: commercial` |

The homepage already ranks for this query because the product is the tracker lookup. This article exists so the phrase has a page that shows the call sequence and the commercial line in the first screen. Link your docs and your app's settings page at Plus, not at Basic, if the tracker charges.

Natural language ("I had rice and chicken") is not supported. The [Nutritionix alternative](/blog/nutritionix-api-alternative) is the page for that requirement, and their starter plan is $499 a month. Photo logging is enterprise-only here. The [Log Meal API](/blog/log-meal-api) note says when a photo vendor belongs in front of this lookup.

Cache, then the quota is about new foods, not about how often someone opens the app. That is the difference between a tracker that fits in 20,000 calls and one that does not.
---FAQ---
Q: What is a calorie tracker API?
A: The nutrition lookup a calorie tracker calls: search, autocomplete, barcode, and per-100g calories. The tracker app stores the meals.
Q: Is there a free calorie tracker API?
A: Yes. 1,000 calls a month, no credit card, non-commercial use. A tracker you sell needs Plus or Enterprise.
Q: Does it track the user for me?
A: No. There is no diary endpoint. You save the food id and the scaled calories in your own database.
Q: How do I avoid burning the quota?
A: Call suggest while they type, call food details once when they confirm, and never call the API to redraw a day you already stored.
