---
slug: nutrition-database-api
title: Nutrition Database API
meta_title: Nutrition Database API
meta_description: A nutrition database API you query, not a file you download. Search, barcode, and per-100g macros. Free tier is 1,000 calls a month.
excerpt: A nutrition database API is a query interface over a food catalog. Calorie API does not ship the database as a download. You search, scan, and cache the foods your users actually log.
keywords: nutrition database api, nutrition data api, food nutrition database api, nutrition database api free
---

A nutrition database API is not a SQL dump and not a CSV of every food on earth. It is a query interface: you send a name or a barcode, you get calories and macros for that food, you keep the row your user picked.

Calorie API is that interface. The catalog behind it is the 4M+ foods listed on the site, generic, branded, and restaurant-style, not limited to the United States. You do not receive the catalog. Bulk download and scraping are prohibited. Cache the foods people log. On Plus, the [commercial license](/commercial-license) allows keeping a response for up to 30 days.

## The queries

```bash
curl "https://api.calorieapi.com/api/v1/search/foods?q=greek+yogurt&verified_only=true" \
  -H "X-API-Key: YOUR_API_KEY"
```

Search accepts a multi-word query, brand and category filters, and `verified_only` when you would rather miss a food than show an unverified one. Suggest (`GET /api/v1/search/suggest?q=`) is the short payload for typeahead. Food details (`GET /api/v1/foods/{id}`) is the full per-100g record once the user picks a row. Barcode is `GET /api/v1/search/barcode/{upc}`.

Macros are per 100 grams: calories, protein, carbohydrate, fat. Micronutrients appear when we have them. Scale the portion in your app. There is no endpoint that accepts "a bowl of yogurt with honey" and returns a parsed meal. That is a different product, covered on [Nutritionix API pricing](/blog/nutritionix-api-pricing).

## Free access, and what it is not

From [pricing](/pricing) on 1 October 2026:

- Free: 1,000 calls a month, no card, 10 requests a minute, 20 foods per search, non-commercial.
- Basic: $15, 20,000 calls, 30 a minute, 50 foods, still non-commercial.
- Core: $50, 150,000 calls, 50 a minute.
- Plus: $150, 1,000,000 calls, 200 a minute, the commercial plan. Send `X-API-Usage-Type: commercial`.

USDA FoodData Central is the free government database if your foods are generic US reference items and you will build search yourself. It is not this API. The [USDA guide](/blog/usda-fooddata-central-api-guide) is the right page when the question is the demo key and nutrient IDs.

Open Food Facts is the open barcode set. We already use it as a fallback when a code is not in our catalog, and we return it in the same JSON shape. Using us does not replace their project. It avoids maintaining two parsers. The [food database API](/food-database-api) product page is the endpoint map. This article is the contract: query, don't export.

A monthly quota of 402 means the plan is used up. A 429 means you went too fast this minute. They are different failures. Caching by food id fixes the second one and most of the first.
---FAQ---
Q: Can I download the nutrition database?
A: No. The API is a query interface. Bulk export and scraping are not allowed. Cache the foods your users log. Plus customers may keep a response for up to 30 days.
Q: What does a nutrition database API return?
A: For a search or a barcode: a food id and per-100g calories, protein, carbohydrate, and fat, plus micronutrients when we have them. Your app stores anything the user logs.
Q: Is there a free nutrition database API?
A: The free plan is 1,000 calls a month, no credit card, non-commercial. USDA FoodData Central is a separate free government API for US reference foods.
Q: How is this different from a food database API?
A: Same product. The food database API page is the product. This article is the rule for using it: search and barcode, not a file download.
