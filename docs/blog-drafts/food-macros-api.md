---
slug: food-macros-api
title: Food Macros API
meta_title: Food Macros API
meta_description: A food macros API that returns calories, protein, carbs, and fat per 100g. Free tier is 1,000 calls a month. Scale the portion in your app.
excerpt: A food macros API should return calories, protein, carbohydrate, and fat on one scale. Calorie API uses per 100 grams, so a 150 gram serving is multiplication, not a second lookup.
keywords: food macros api, macro api, macros per 100g, food macro api, macro tracking api
---

A food macros API is a lookup for four numbers: calories, protein, carbohydrate, and fat. The useful ones return those numbers on a fixed scale. Calorie API returns them **per 100 grams**. A 150 gram chicken breast is the payload times 1.5. You do that math. The API does not keep the user's diary.

Figures for our plans are from [calorieapi.com/pricing](/pricing) on 1 October 2026.

## What one call returns

`GET /api/v1/search/foods?q=chicken+breast` with an `X-API-Key` header returns ranked foods. Each food has a stable id and per-100g macros. Micronutrients are included when we have them. They are not guaranteed on every row. The four macros are the contract.

`verified_only` drops foods that are not in the curated tier. Use it when a fitness app would rather show nothing than show a community guess.

Search is keywords. "Chicken breast" works. "I had a chicken bowl from that place" does not. That sentence is a Nutritionix problem, described in the [Nutritionix alternative](/blog/nutritionix-api-alternative).

## A serving, worked once

| Food | Per 100g | Logged amount | What you store |
|---|---|---|---|
| Chicken breast | 165 kcal, 31g protein | 150g | 248 kcal, 46.5g protein |
| Cooked rice | 130 kcal, 28g carbs | 200g | 260 kcal, 56g carbs |

Daily totals, targets, and streaks are sums in your database. The API is called when the user picks a food or scans a barcode, not on every redraw of the day. Cache the food id. The [commercial license](/commercial-license) lets a Plus customer keep a response for up to 30 days. Do not walk the catalog to build your own copy. That is prohibited.

Barcode is a second call, `GET /api/v1/search/barcode/{upc}`, same macro shape, with an Open Food Facts fallback when the code is not in our set. Unknown codes are a 404. Fall back to search.

## What it costs

| Plan | Price | Calls / month | Foods per search | Commercial app |
|---|---|---|---|---|
| Free | $0 | 1,000 | 20 | No |
| Basic | $15 | 20,000 | 50 | No |
| Core | $50 | 150,000 | 100 | No |
| Plus | $150 | 1,000,000 | 100 | Yes |

Free needs no card. Basic and Core are paid and still non-commercial. A gym app that charges users is Plus, and the request carries `X-API-Usage-Type: commercial`. Rate limits are per account: 10, 30, 50, and 200 per minute from Free through Plus.

A user who logs three foods is about three search calls, or one suggest plus one details call if you use autocomplete. Twenty thousand calls is thousands of logging sessions, not twenty thousand users. Price it from a week of real logs, then read the live table again before you launch. The [best nutrition API](/blog/best-food-nutrition-apis-2025) page is the decision if you are still choosing a vendor.
---FAQ---
Q: What is a food macros API?
A: It returns calories, protein, carbohydrate, and fat for a food. Calorie API returns those per 100 grams so your app can scale any portion. It does not store the user's meals.
Q: Does the food macros API calculate net carbs?
A: You subtract fiber from carbohydrate in your app when both values are present. The API does not return a single net-carb field as the source of truth.
Q: Is there a free food macros API?
A: The free plan is 1,000 calls a month, no card, non-commercial, 20 foods per search. Paid non-commercial plans start at $15 a month for 20,000 calls.
Q: Can I use it in a paid fitness app?
A: Only on Plus or Enterprise, with the header X-API-Usage-Type: commercial. Basic and Core are non-commercial even though they are paid.
