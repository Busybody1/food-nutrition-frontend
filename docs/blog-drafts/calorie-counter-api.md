---
slug: calorie-counter-api
title: Calorie Counter API
meta_title: Calorie Counter API
meta_description: A calorie counter API for the lookup, not the diary. Search, barcode, and per-100g calories. Free tier is 1,000 calls a month.
excerpt: A calorie counter API supplies the calories for a food. The counter itself, the daily total, lives in your app. Here is the call sequence and what the free plan covers.
keywords: calorie counter api, calorie counter api free, food calorie counter api, calories api
---

A calorie counter API answers one question: how many calories are in this food, at this amount. It does not add up the day, set a goal, or keep a streak. Those are rows in your database. Calorie API is the lookup.

The sibling phrase, a [calorie tracker API](/blog/calorie-tracking-api), is the same lookup described as the backend of a tracker. This page is the counter: three calls, then arithmetic.

## The three calls

1. Suggest, while the user types, so the list appears before they finish the word.
2. Search or food details, when they pick a row. Calories are per 100 grams.
3. Barcode, when they scan a package instead of typing.

```bash
curl "https://api.calorieapi.com/api/v1/search/barcode/3017620422003" \
  -H "X-API-Key: YOUR_API_KEY"
```

A 45 gram serving of a food listed at 530 kcal per 100 grams is `530 * 0.45`. Store that result on the log line. Opening the history screen must not call the API again.

Unknown barcodes return 404. Search by name. The barcode path falls through to Open Food Facts when we do not have the code, and still 404s if neither side knows it.

## Free, then the plan that matches a real counter

On 1 October 2026, from [pricing](/pricing):

| Plan | Price | Calls | Fits a counter when |
|---|---|---|---|
| Free | $0 | 1,000 / month | You are building it. Not commercial |
| Basic | $15 | 20,000 / month | Still non-commercial |
| Plus | $150 | 1,000,000 / month | The counter charges users or runs ads |

Ten requests a minute on Free is enough for one developer at a keyboard. It is not enough for a shared demo with a room of people searching at once. Plus is 200 a minute, per account, not per IP.

A counter that only needs calories still gets protein, carbs, and fat on the same object. You can ignore them. You do not pay extra for them. There is no points meter. [Spoonacular API pricing](/blog/spoonacular-api-pricing) is what points look like if you wandered into a recipe API by mistake.

Nutritionix will also give you calories, from a sentence, at $499 a month billed annually. That is a different product. The [Nutritionix alternative](/blog/nutritionix-api-alternative) says when the sentence is worth it.

## What not to expect

No photo estimate on Free, Basic, Core, or Plus. Image-to-calorie is Enterprise. No medical targets. No "is this too many calories." You display a number. The credit line required by our terms stays visible unless the Plus or Enterprise agreement waives it.
---FAQ---
Q: What does a calorie counter API return?
A: Calories and macros for a food, per 100 grams, from search or from a barcode. Your app multiplies by the serving and stores the daily total.
Q: Is there a free calorie counter API?
A: Yes. 1,000 calls a month, no credit card, non-commercial use, 20 foods per search.
Q: Does the API remember what the user ate?
A: No. It does not store diaries. The counter app does.
Q: How is this different from a calorie tracker API?
A: Same data. A tracker is the product around the log. The counter API is the lookup the tracker calls. See the calorie tracker API article for the logging flow.
