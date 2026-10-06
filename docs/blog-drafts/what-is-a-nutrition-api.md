---
slug: what-is-a-nutrition-api
title: Nutrition API
meta_title: Nutrition API
meta_description: A nutrition API returns calories and macros for a food. Search and barcode, per 100 grams. Free tier is 1,000 calls a month.
excerpt: A nutrition API returns the calories and macros for a food you search or scan. This is the short definition, the endpoints, and the plan that is actually commercial.
keywords: nutrition api, what is a nutrition api, food nutrition api, nutrition analysis api
---

A nutrition API returns the nutrition for a food. You send a name or a barcode. You get calories, protein, carbohydrate, and fat, plus micronutrients when the record has them. Calorie API returns those values **per 100 grams**. Your application multiplies by the amount the user ate and stores the result. The API does not store the user.

That is the whole product. The longer integration notes are on [nutrition API for developers](/blog/nutrition-api-for-developers). The bill is on [nutrition API pricing](/blog/nutrition-api-pricing-per-1000-requests-comparison). The live checkout is [/pricing](/pricing).

## What you can call

```bash
curl "https://api.calorieapi.com/api/v1/search/foods?q=banana" \
  -H "X-API-Key: YOUR_API_KEY"
```

Search, suggest, food details by id, and barcode. Auth is the `X-API-Key` header. The catalog on the site is 4M+ foods, not US-only. `verified_only=true` restricts search to the curated tier. Unknown barcodes return 404 after an Open Food Facts fallback.

What you cannot call: GraphQL, a recipe search, a meal-plan generator, a sentence parser, or a photo estimator on the public plans. Photo estimation is enterprise. Sentence parsing is a Nutritionix-shaped product, priced on [Nutritionix API pricing](/blog/nutritionix-api-pricing). Recipe content is Spoonacular, priced on [Spoonacular API pricing](/blog/spoonacular-api-pricing).

## Plans, in one screen

On 1 October 2026:

| Plan | Price | Calls / month | Use it for |
|---|---|---|---|
| Free | $0 | 1,000 | Building. Not a commercial app |
| Basic | $15 | 20,000 | A paid plan that is still non-commercial |
| Core | $50 | 150,000 | Higher non-commercial volume |
| Plus | $150 | 1,000,000 | A commercial app. Send `X-API-Usage-Type: commercial` |

Free needs no card. Display still needs the attribution our terms require, unless Plus or Enterprise waives it. Rate limits run from 10 requests a minute on Free to 200 on Plus.

If the search was a comparison, the roundup is [best nutrition API in 2026](/blog/best-food-nutrition-apis-2025). This page is the definition. The pricing article is the bill. The homepage is the product. One URL owns each of those queries.
---FAQ---
Q: What is a nutrition API?
A: A service that returns calories and macros for a food. Calorie API does that over REST, per 100 grams, from search or from a barcode. It does not store meals.
Q: Is a nutrition API free?
A: The free plan is 1,000 calls a month, no credit card, non-commercial. See the pricing page for the current paid quotas.
Q: What is the difference between a nutrition API and a calorie API?
A: For this product, nothing. You get calories and the other macros on the same response. Calorie API is the name of the service.
Q: Can my company use it in production?
A: Yes, on Plus or Enterprise. Add the header X-API-Usage-Type: commercial. Basic and Core are not a commercial license.
