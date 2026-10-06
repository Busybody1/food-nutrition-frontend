---
slug: food-barcode-lookup-api
title: Food Barcode API
meta_title: Food Barcode API
meta_description: A food barcode API: send a UPC or EAN, get calories and macros. Unknown codes return 404. Free tier is 1,000 calls a month.
excerpt: A food barcode API turns a UPC or EAN into calories and macros. Calorie API checks our catalog, then Open Food Facts, and returns 404 when neither knows the code.
keywords: food barcode api, barcode food api, food api with barcode, upc food api, barcode nutrition api
---

A food barcode API accepts a UPC or EAN and returns the food. Calorie API does that at `GET /api/v1/search/barcode/{upc}` with an `X-API-Key` header. The body matches search: an id, a name, and calories, protein, carbohydrate, and fat per 100 grams. The product page is [/barcode-nutrition-api](/barcode-nutrition-api). This article is the one written for "food barcode API" and "barcode food API," which are the same request.

## What the call actually does

We look up our catalog first. If the code is not there, we ask Open Food Facts and, when they have it, return their record in our JSON shape. If neither side has it, the status is 404. That is the contract. A client that treats 404 as a crash will crash on every regional product we have never seen. Fall back to `GET /api/v1/search/foods?q=` and let the user pick.

```bash
curl "https://api.calorieapi.com/api/v1/search/barcode/3017620422003" \
  -H "X-API-Key: YOUR_API_KEY"
```

Do not strip leading zeros from a UPC before you send it. Do not call the endpoint again because the first 404 was disappointing. One scan is one call.

The response is a label, not a guess from a photo. Photo estimation is a different product. [Log Meal API](/blog/log-meal-api) is that distinction. Nutritionix sells a large grocery barcode set inside a plan that starts at $499 a month billed annually. If the missing codes are the only reason you are looking at them, price that against how often your users actually miss, using the notes on [Nutritionix API pricing](/blog/nutritionix-api-pricing).

## Quota, and the commercial line

From [pricing](/pricing) on 1 October 2026:

| Plan | Price | Calls / month | Barcode in a commercial app |
|---|---|---|---|
| Free | $0 | 1,000 | No |
| Basic | $15 | 20,000 | No |
| Core | $50 | 150,000 | No |
| Plus | $150 | 1,000,000 | Yes, with `X-API-Usage-Type: commercial` |

A grocery scanner that charges stores, or a consumer app with a subscription, is Plus even when the scan volume would fit in Basic. Basic is a paid non-commercial plan. The credit line in our terms stays unless the Plus or Enterprise agreement waives it.

Cache a code you have already resolved. Scanning the same yogurt every morning is a database read, not an API call. The [food database API](/blog/food-database-api-for-developers) page is the search side of the same catalog. The [free nutrition API](/blog/free-nutrition-api) page is the comparison if the other option on the table is "just use Open Food Facts directly," which you can, and which we already do on a miss.
---FAQ---
Q: How does the food barcode API work?
A: GET /api/v1/search/barcode/{upc} with your API key. We check our catalog, then Open Food Facts. You get per-100g macros, or a 404.
Q: What barcodes are supported?
A: UPC and EAN. Send the code as printed, including leading zeros. There is no separate endpoint per symbology.
Q: Is the food barcode API free?
A: The free plan includes barcode lookup inside 1,000 calls a month, no card, non-commercial. A commercial scanner needs Plus.
Q: What should the app do on 404?
A: Offer text search. Retrying the same unknown code will 404 again.
