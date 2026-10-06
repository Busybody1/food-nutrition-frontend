---
slug: log-meal-api
title: Log Meal API
meta_title: Log Meal API
meta_description: LogMeal and CalorieMama estimate a meal from a photo. This API looks up a food you already named. Use each one for the job it actually does.
excerpt: A Log Meal API estimates nutrition from a picture. Calorie API does not. It looks up a food by name or barcode. Here is when the photo API is the product, and when it is not.
keywords: log meal api, logmeal api, caloriemama api, food image recognition api
---

"Log Meal API" is what people type when they want a photo of a plate turned into calories. LogMeal and CalorieMama sell that. Calorie API does not, except as an enterprise add-on you buy from sales. If the requirement is "the user takes a picture," this page will tell you to go to them. If the requirement is "the user knows the food," stay.

I am not quoting LogMeal's or CalorieMama's prices. Both change, and a second-hand number would be worse than a link to their own pricing. What does not change is the shape of the product: pixels in, an estimate out, with a confidence you have to design for.

## What a photo API is good at

A photo model is the right call when the user will not type and will not scan. Restaurant plates, homemade food, "what is this." The failure mode is a confident wrong food. Your UI has to show the guess and let them correct it. The correction is a text search. That second step is a nutrition lookup, which is the API on this site.

So a photo product and a lookup API are usually stacked, not swapped:

1. Photo vendor returns a guessed name and a portion.
2. You search that name, or you trust their nutrients if the contract says you may.
3. The user fixes the name. You call search again.
4. You store the log. Neither API should be your diary.

## What to call when there is no photo

```bash
curl "https://api.calorieapi.com/api/v1/search/foods?q=grilled+salmon" \
  -H "X-API-Key: YOUR_API_KEY"
```

Calories and macros are per 100 grams. Barcode is `GET /api/v1/search/barcode/{upc}` for packaged food, which is a label, not an estimate. Unknown codes are 404. There is no natural-language endpoint. "I had the salmon and the rice" will not parse. Type the foods, or pay a vendor who parses sentences. That vendor's public price starts far above a lookup API. The comparison is on [Nutritionix API pricing](/blog/nutritionix-api-pricing).

Our image-to-calorie endpoint is not on Free, Basic, Core, or Plus. It is on the custom enterprise plan. Ask on the [contact](/contact) page. Do not build a client against an endpoint that is not in the public docs.

The self-serve plans, from [pricing](/pricing) on 1 October 2026, are 1,000 free calls, then $15 for 20,000, $50 for 150,000, and $150 for 1 million. Only Plus and Enterprise are commercial, and Plus requests include `X-API-Usage-Type: commercial`. The [food tracking API](/blog/food-tracking-api) page is the logging architecture once the food has a name.
---FAQ---
Q: Is Calorie API a LogMeal alternative for photos?
A: Not on the public plans. Photo calorie estimation is an enterprise add-on. LogMeal and CalorieMama are the products built around a picture. Use this API for the name or the barcode after the user confirms the food.
Q: What is the CalorieMama API used for?
A: CalorieMama estimates nutrition from a food photo. It is not a barcode and search API. Pair it with a lookup if users need to correct the guess.
Q: Can I log a meal by typing with this API?
A: Yes. Search or suggest for the food, then store the portion in your app. The API does not keep the meal.
Q: Do you parse sentences like "two eggs and toast"?
A: No. Search is keywords. Resolve each food yourself, or use a natural-language vendor such as Nutritionix for that sentence.
