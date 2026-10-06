---
slug: api-for-food-calories
title: API for Food Calories
meta_title: API for Food Calories
meta_description: An API for food calories returns kcal per 100g from a name or a barcode. Scale the portion in your app. Free tier, 1,000 calls a month.
excerpt: An API for food calories answers a name or a barcode with calories per 100 grams. You multiply by the serving. The API does not total the day.
keywords: api for food calories, food calorie api, food calories api, calories api
---

An API for food calories takes a food name or a barcode and returns the calories. Calorie API returns them **per 100 grams**, with protein, carbohydrate, and fat on the same object. A 40 gram serving is the calorie number times 0.4. That multiplication is yours. The daily total is yours. The API does not keep either.

## One request

```bash
curl "https://api.calorieapi.com/api/v1/search/foods?q=almonds" \
  -H "X-API-Key: YOUR_API_KEY"
```

The query parameter is `q`, not `query`. The key is the `X-API-Key` header. Ranked foods come back with a stable id. Ask again with `GET /api/v1/foods/{id}` when you need the full record. For a package, `GET /api/v1/search/barcode/{upc}` returns the same calorie shape, or 404 if neither our catalog nor the Open Food Facts fallback knows the code.

Search is keywords. "Almonds" works. A sentence about a snack does not. If the product you are building starts from a sentence, read the [Nutritionix alternative](/blog/nutritionix-api-alternative) before you integrate the wrong API and then rewrite it.

## What the call costs

On 1 October 2026, [pricing](/pricing) is:

| Plan | Price | Calls a month | Commercial product |
|---|---|---|---|
| Free | $0, no card | 1,000 | No |
| Basic | $15 | 20,000 | No |
| Core | $50 | 150,000 | No |
| Plus | $150 | 1,000,000 | Yes |

A calorie lookup on every keystroke will burn the free thousand in an afternoon. Debounce. Use suggest while they type, and call search or food details when they commit. Re-opening yesterday's log must read your database, not ours.

Plus is the plan if the app charges, shows ads, or ships inside a company that does. The header on those requests is `X-API-Usage-Type: commercial`. Basic being inexpensive does not make it a commercial license.

Spoonacular can also return calories, inside a points budget where a search is not one point. The arithmetic is on [Spoonacular API pricing](/blog/spoonacular-api-pricing). Use that API when you need the recipe. Use this one when you need the number.

There is no photo calorie estimate on these plans. Image-to-calorie is the enterprise add-on. The [calorie counter API](/blog/calorie-counter-api) page is the same lookup described as the three calls a counter makes.
---FAQ---
Q: Is there an API for food calories?
A: Yes. Search by name or look up a barcode. Calories come back per 100 grams. Multiply by the grams the user ate.
Q: Is the API for food calories free?
A: The free plan is 1,000 calls a month, no credit card, for non-commercial use. Paid plans start at $15 a month for 20,000 calls and are still non-commercial until Plus.
Q: Does it add up the calories for the day?
A: No. Each call is one food. Your app stores the log and sums it.
Q: What if the barcode is unknown?
A: The barcode endpoint returns 404. Fall back to text search, or let the user enter the food.
