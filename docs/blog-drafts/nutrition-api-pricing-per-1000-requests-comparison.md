---
slug: nutrition-api-pricing-per-1000-requests-comparison
title: Nutrition API Pricing
meta_title: Nutrition API Pricing
meta_description: Nutrition API pricing compared on one scale. Calorie API from $0. Spoonacular uses points. Nutritionix starts at $499 a month.
excerpt: Nutrition API pricing is hard to compare because vendors sell calls, points, recipes, and countries. This page puts the public numbers on one date and links the page that bills you.
keywords: nutrition api pricing, nutrition api cost, food api pricing, nutrition api pricing comparison
---

Nutrition API pricing is four incompatible units. Calorie API sells a monthly call quota. Spoonacular sells points. Edamam sells calls on one product and accumulating recipe licenses on another. Nutritionix and FatSecret sell a platform, and the public number is either large or missing.

The numbers below were read on 1 October 2026. The page that charges you is [/pricing](/pricing). If this article and that page ever disagree, the pricing page wins. I am writing both on the same day so they do not.

## The only table that is in the same unit

These are Calorie API plans. One search, one suggest, one barcode, and one food-details call each count as one call.

| Plan | Price | Calls / month | Rate limit | Commercial |
|---|---|---|---|---|
| Free | $0, no card | 1,000 | 10 / min | No |
| Basic | $15 | 20,000 | 30 / min | No |
| Core | $50 | 150,000 | 50 / min | No |
| Plus | $150 | 1,000,000 | 200 / min | Yes |

Per 1,000 calls, the paid self-serve plans are $0.75 on Basic, about $0.33 on Core, and $0.15 on Plus, if you use the whole quota. You should not buy Plus to chase the per-call figure. You buy Plus because the app makes money. The request then includes `X-API-Usage-Type: commercial`. Free, Basic, and Core are non-commercial even when Basic and Core are paid.

Over quota, the API returns HTTP 402 until the cycle resets or you upgrade. A 429 is the per-minute limit, not the bill.

## Everyone else's unit

| Vendor | Public price | The unit | Where the detail is |
|---|---|---|---|
| Spoonacular | $0, then $29, $79, $149 | Points per day. Free is 50, then HTTP 402. A search is usually more than 1 point | [Spoonacular API pricing](/blog/spoonacular-api-pricing) |
| Edamam Food Database | $14 / 100k, $69 / 750k, $299 / 5M | Prepaid calls. Cache is limited to a few fields | [Edamam pricing](/blog/edamam-food-database-api-pricing-startup-alternative) |
| Edamam Nutrition Analysis | From $29 | A license per analyzed recipe that does not shrink when you delete the recipe | Same article |
| Nutritionix | From $499 / month, billed annually | Monthly active users, not calls. No public free tier | [Nutritionix API pricing](/blog/nutritionix-api-pricing) |
| FatSecret | $0 for US Basic at 5,000 calls / day | Country datasets. Premier is quoted | [FatSecret API pricing](/blog/fatsecret-api-pricing) |

A "$14 for 100,000 calls" plan can be cheaper than $15 for 20,000 calls and still be the wrong product if you need barcode UX, or if their cache rules stop you storing the response. Price after you know the call, not before.

The [best nutrition API](/blog/best-food-nutrition-apis-2025) page is the product decision. This page is only the bill. Internal links from other articles should send "nutrition API pricing" here, and the button on this page should send the buyer to [/pricing](/pricing), which is where the card is entered.
---FAQ---
Q: How much does a nutrition API cost?
A: Calorie API is free for 1,000 calls a month, then $15 for 20,000, $50 for 150,000, and $150 for 1 million. Only the $150 Plus plan and Enterprise cover a commercial app.
Q: Why do nutrition API prices look impossible to compare?
A: Because Spoonacular charges points, Edamam charges per recipe on its analysis product, Nutritionix charges per monthly active user, and FatSecret charges per country. Convert to your own call mix before you compare.
Q: What is the price per 1,000 requests?
A: If you use the full quota, Basic is $0.75 per 1,000 calls, Core about $0.33, and Plus $0.15. Unused quota does not lower the subscription.
Q: Does the free plan require a credit card?
A: No. It is non-commercial, 20 foods per search, and 10 requests a minute.
