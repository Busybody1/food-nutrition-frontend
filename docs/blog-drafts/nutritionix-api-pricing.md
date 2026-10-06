---
slug: nutritionix-api-pricing
title: Nutritionix API Pricing
meta_title: Nutritionix API Pricing
meta_description: Nutritionix API pricing starts at $499/mo, billed annually, and caps monthly active users. Here is the live table and what a year costs.
excerpt: Nutritionix API pricing is an annual contract priced by monthly active users, not by API calls. Starter is $499 a month. The public free tier is gone.
keywords: nutritionix api pricing, nutritionix pricing, nutritionix api pricing 2026, nutritionix api free tier, nutritionix api pricing official
---

Nutritionix API pricing, read from [nutritionix.com/api](https://www.nutritionix.com/api) on 1 October 2026, is not a request pack. It is an annual contract with a cap on monthly active users. The page lists three paid columns and a business trial, and it says the plans are billed annually.

| Plan | Listed price | Monthly active users | Attribution | SLA |
|---|---|---|---|---|
| Business trial | Free | Up to 2 | Required | None listed |
| Starter | $499/month | Up to 200 | Required | 99.9% |
| MVP | $999/month | Up to 1,000 | Required | 99.9% |
| Unicorn | From $1,850/month | Custom | Removable option | 99.9% |

Starter, MVP, and Unicorn include the natural-language engine, barcode scanning, derived wellness claims, caching, and the right to request database additions. Support is email on Starter and MVP, email and phone on Unicorn. If the app is freemium, sells hardware, or has more than 100,000 monthly active users, they tell you to contact sales instead of using this grid. Bulk database licensing is a separate conversation.

A year of Starter at the listed monthly rate is **$5,988**. A year of MVP is **$11,988**. You pay that whether August was busy. Crossing 200 monthly active users is not an overage line. It is a different plan.

## The free tier people still write about

Older guides, including earlier versions of this one, describe a small daily request allowance and an attribution badge. That is no longer the public offer. The [developer portal](https://developer.nutritionix.com/) says the open no-cost trial was discontinued, and the pricing FAQ says students can no longer get a non-commercial free trial. What remains in the table is a business trial for up to 2 monthly active users, with attribution required.

If a tutorial still shows a free `x-app-id` you minted years ago, treat it as a leftover account, not a plan you can hand a new developer.

## What an active user costs versus a call

The unit is the point of the price. Nutritionix is charging for humans in the app. Calorie API charges for HTTP calls. Those are not the same meter, so a single “cheaper” claim is usually wrong.

On [our pricing page](/pricing), also as published on 1 October 2026:

| Plan | Price | Calls / month | Who it is for |
|---|---|---|---|
| Free | $0 | 1,000 | Development, no card |
| Basic | $15 | 20,000 | Non-commercial |
| Core | $50 | 150,000 | Non-commercial |
| Plus | $150 | 1,000,000 | Commercial production |
| Custom | Quote | Custom | Enterprise, image-to-calorie on this tier |

Plus is **$1,800 a year** if you stay on it twelve months, against $5,988 for Nutritionix Starter. Plus buys a million calls and a commercial license. Starter buys up to 200 monthly active users and the natural-language stack. If those 200 people each log a restaurant meal by typing a sentence, Starter is the product you wanted and the call-quota API will not parse it. If those 200 people are not your constraint, and request volume is, the MAU ladder is an expensive way to buy search.

Rate limits on our side are per account, not per IP: 10, 30, 50, and 200 requests a minute from Free through Plus. Foods returned per search cap at 20, 50, or 100 depending on plan. None of that appears on the Nutritionix grid, because they are not selling requests.

## Attribution, caching, and the header people forget

Attribution is required on the Nutritionix trial, Starter, and MVP. Only Unicorn lists it as a removable option.

Our terms also require a visible credit when you display the data, unless the Plus or Enterprise agreement waives it. Do not read this post as “switch and delete the badge.” Read it as “the badge comes off Nutritionix only at the top tier, and it comes off ours only if the contract says so.”

Commercial use of Calorie API is not “any paid plan.” Free, Basic, and Core are non-commercial even though Basic and Core cost money. A production app that charges users or runs ads needs Plus or Enterprise and this header on the request:

```bash
curl "https://api.calorieapi.com/api/v1/search/foods?q=greek+yogurt" \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "X-API-Usage-Type: commercial"
```

Nutritionix folds commercial use into the MAU plan. We split it into a plan plus a header, and using a cheaper plan for a live commercial app is a breach that can be back-billed. That is in the terms. Budget for Plus if the app will charge.

## How to choose in an afternoon

1. Count monthly active users, not hopes. Under 2, the business trial is the only Nutritionix door. From 3 to 200, Starter. From 201 to 1,000, MVP.
2. Multiply the listed monthly price by 12. That is the annual commitment their page describes.
3. If the feature you cannot build is natural language or restaurant menus, stop. Pay Nutritionix or do not ship that feature. A [Nutritionix alternative](/blog/nutritionix-api-alternative) does not include their parser.
4. If the feature is search and barcode, price Plus against Starter using calls you can count from a week of logs. The [pricing page](/pricing) is the number to use for us, not this article, the next time either side changes a cell.
---FAQ---
Q: How much does the Nutritionix API cost?
A: As of 1 October 2026 the published plans are a business trial for up to 2 monthly active users, Starter at $499 a month for up to 200, MVP at $999 a month for up to 1,000, and Unicorn from $1,850 a month. Nutritionix says these plans are billed annually.
Q: Does Nutritionix still have a free API tier?
A: The public free developer tier has been discontinued. The pricing table still shows a free business trial capped at 2 monthly active users. The FAQ says students are no longer offered a non-commercial free trial.
Q: Is Nutritionix priced per request?
A: No. The published grid is capped by monthly active users. Request quotas are not listed on that page. Apps over 100,000 MAU, freemium apps, and hardware products are told to contact sales.
Q: What is the self-serve alternative if I need food search?
A: Calorie API bills by API calls, month to month. Free is 1,000 calls. Commercial production is the Plus plan at $150 a month for 1 million calls, with the header X-API-Usage-Type: commercial. It does not parse natural-language meals.
