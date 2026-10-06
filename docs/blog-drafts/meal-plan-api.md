---
slug: meal-plan-api
title: Meal Plan API
meta_title: Meal Plan API
meta_description: A meal plan API for the foods in the plan, not a generated menu. Search and barcode calls, then your code builds the week. From 1,000 free calls.
excerpt: Calorie API is not a meal-plan generator. It is the food data underneath one: search, barcode, and per-100g macros, so your planner can price a week in API calls.
keywords: meal plan api, meal planning api, meal plan nutrition api, food api for meal planning
---

A meal plan API, in the sense of "POST a calorie target, receive seven dinners," is not this product. Spoonacular and a pile of AI wrappers sell that. Calorie API is the nutrition lookup your planner calls while it builds the week: search, suggest, barcode, per-100g macros.

If you wanted generated menus, read [Spoonacular API pricing](/blog/spoonacular-api-pricing) before you read the rest. If you are writing the planner and you need the foods to be real, this is the API.

## What you call, per food, not per week

A day template of four meals, three foods each, is twelve foods. You resolve each food once, store the id, and reuse it.

| Step | Call | How often |
|---|---|---|
| User types "oats" | `GET /api/v1/search/suggest` or search | Once per new food |
| User confirms a portion | No call. Scale per-100g by grams | Every log |
| User scans a package | `GET /api/v1/search/barcode/{upc}` | Once per new package |
| Weekly grocery total | No call. Sum what you stored | Every view |

Twelve new foods is about twelve calls. A week of repeating those foods is still about twelve calls, not eighty-four. The people who blow a meal-plan quota are the ones who re-search on every screen render. Cache the food id. Plus may cache the response up to 30 days under the [commercial license](/commercial-license). Do not download the catalog.

```bash
curl "https://api.calorieapi.com/api/v1/search/foods?q=rolled+oats" \
  -H "X-API-Key: YOUR_API_KEY"
```

There is no endpoint that accepts a list of ingredients and returns a meal plan, and no endpoint that parses "two eggs and toast." Recipe aggregation is your loop: search each ingredient, multiply per 100 grams by the grams in the recipe. Edamam will do that loop for you and then license every recipe monthly. That trade is on the [Edamam pricing](/blog/edamam-food-database-api-pricing-startup-alternative) page. Do the loop if you want a bill that does not grow after you stop adding recipes.

## What a planner should budget

From [pricing](/pricing) on 1 October 2026:

- Free: 1,000 calls a month, no card, non-commercial. Enough to build the planner UI.
- Basic: $15, 20,000 calls, still non-commercial.
- Plus: $150, 1 million calls, the plan for a commercial meal-planning app, header `X-API-Usage-Type: commercial`.

A commercial planner on Basic is a terms breach, even if 20,000 calls would have covered the traffic. The [meal planning solution page](/solutions/meal-planning-apps) is the product description. This article is the call budget.

The [best nutrition API](/blog/best-food-nutrition-apis-2025) breakdown is the right stop if the planner also needs recipe articles and photos. That is Spoonacular, metered in points, and it should not be forced through this API.
---FAQ---
Q: Does Calorie API generate a meal plan?
A: No. It returns foods, barcodes, and per-100g macros. Your application builds the plan and stores it. There is no endpoint that accepts a calorie target and returns a week of menus.
Q: How many API calls does a week of meals use?
A: About one call per distinct food the first time it is chosen. Repeating oats every morning does not require a new search if you stored the food id.
Q: Can a meal planning app use the free plan?
A: For development, yes. 1,000 calls a month, no card, non-commercial. A planner that charges users needs Plus or Enterprise.
Q: How is this different from Spoonacular?
A: Spoonacular sells recipe content and meal-plan content, priced in daily points. Calorie API sells the food lookup underneath a planner you write.
