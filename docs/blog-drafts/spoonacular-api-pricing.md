---
slug: spoonacular-api-pricing
title: Spoonacular API Pricing
meta_title: Spoonacular API Pricing
meta_description: Spoonacular API pricing is 50 points a day free, then $29 for 1,500 points. A point is not a request. Here is the live table.
excerpt: Spoonacular API pricing meters points, and the free plan is 50 points a day, not 150. When the points run out the API returns HTTP 402 until midnight UTC.
keywords: spoonacular api pricing, spoonacular pricing, spoonacular api free tier, spoonacular api pricing 2026, spoonacular api points
---

Spoonacular API pricing is a daily points quota, and the free plan is **50 points a day**. That figure is on [spoonacular.com/food-api/pricing](https://spoonacular.com/food-api/pricing) as of 1 October 2026. Guides that still say 150 points a day, including an older version of this post, are wrong. When the free quota is gone, the API responds with **HTTP 402** until midnight UTC. Paid plans keep answering and bill the extra points.

## The five plans

Spoonacular’s own pricing FAQ names them. The quotas below are the ones printed on the pricing page. Prices exclude tax. Plans are month to month, and a downgrade takes effect immediately, not at the end of the period.

| Plan | Price | Daily points | After the quota | Rate |
|---|---|---|---|---|
| Free | $0 | 50 | No more calls (HTTP 402) | 1 request/s, 2 concurrent |
| Cook | $29/mo | 1,500 | $0.005 per point | 5 request/s, 5 concurrent |
| Culinarian | $79/mo | 4,500 | $0.004 per point | 10 request/s, 10 concurrent |
| Chef | $149/mo | 10,000 | $0.002 per point | 20 request/s, 20 concurrent |
| Enterprise | From $300 | Custom | Custom | Custom |

The free plan requires a backlink. Cook and above drop the backlink. The pricing FAQ says an SLA is offered above $250 a month, while the Chef card lists a 99.9% uptime SLA, so read both lines before you put “SLA” in a proposal. Direct signup does not require a card for the free plan. The same API on RapidAPI does, because overages are billed there. Do not mix those two free tiers in a cost model.

## What a point buys

Spoonacular’s definition: usually **1 point per request plus 0.01 points per result**, with exceptions per endpoint. Third-party writeups of their docs add surcharges on the order of 0.1 points for nutrition data, 3 for a generated image, and 50 for video extraction. Use the endpoint page for the call you will make. The headers on the response are the source of truth in production:

- `X-API-Quota-Request` — points that call just cost
- `X-API-Quota-Used` — points used today

A search that returns 10 results is about 1.1 points if it follows the usual formula and adds nothing else. Fifty points is then about 45 of those searches, and the day is over. It is not 50 recipe-detail calls if those calls cost more, and it is not 150 of anything.

Cook at $29 is 1,500 points, about thirty times the free day. A day of 2,000 points on Cook is the quota plus 500 × $0.005 = **$2.50** of overage, on top of the $29. That overage is why “$29 a month” is not a ceiling.

## The cache rule that deletes your database

You may cache a user-requested response for **one hour**. After that you delete it and call again. If you cancel or they suspend the key, you delete everything you ever stored from the API. A meal log that keeps Spoonacular payloads as the system of record is outside that sentence. The architecture that fits is: call Spoonacular for recipe content, copy the fields your UI needs into your own records only if your counsel says the terms allow it, and assume the cache is ephemeral.

Calorie API’s [commercial license](/commercial-license) is a different clock: Plus may cache responses for up to 30 days, and still may not scrape the catalog into a competing dataset. Our [terms](/terms) also require attribution when you display the data, unless the Plus or Enterprise agreement waives it. Spoonacular’s free plan wants a backlink. Cook does not. Pick the rule you can actually operate.

## When the points are worth it

Spoonacular is a recipe product. Instructions, images, ingredient search (“what’s in the fridge”), diets, meal plans, and nutrition hanging off a recipe. USDA is the base of their ingredient nutrition, with gaps filled by hand, and they say the nutrition can be wrong and that you own that risk. There is no medical-condition endpoint.

Buy Cook or above if the app’s content is recipes. Do not buy it to power a barcode calorie log. You will spend points on recipe endpoints you never show, and you will throw the cache away every hour.

If the app only needs food search, barcode, and per-100g macros, the meter should be a request. On [our pricing page](/pricing):

| | Spoonacular free | Calorie API free | Calorie API Plus |
|---|---|---|---|
| Price | $0 | $0, no card | $150/mo |
| Unit | 50 points/day, then 402 | 1,000 calls/month | 1,000,000 calls/month |
| What you get | Recipe platform | Food search and barcode | Same, commercial use |
| Cache | 1 hour, then delete | Plan limits | Up to 30 days on Plus |

```bash
curl "https://api.calorieapi.com/api/v1/search/foods?q=oatmeal" \
  -H "X-API-Key: YOUR_API_KEY"
```

One call, one request, against the monthly quota. No points, no per-result fraction. Commercial apps add `X-API-Usage-Type: commercial` and use Plus. Basic at $15 is 20,000 calls and is not a commercial license.

The product difference, separate from this price sheet, is [Spoonacular as a recipe API versus a food API](/blog/spoonacular-alternative-nutrition-data-only) and the [comparison page](/compare/spoonacular-alternative).
---FAQ---
Q: How much does the Spoonacular API cost?
A: On 1 October 2026 the plans are Free at 50 points a day, Cook at $29 for 1,500 points a day, Culinarian at $79 for 4,500, Chef at $149 for 10,000, and Enterprise from $300. Paid plans bill extra points after the daily quota. The free plan stops with HTTP 402.
Q: Is the Spoonacular free tier 150 points a day?
A: No. The pricing page lists 50 points a day. Older articles that say 150 are out of date.
Q: What is a Spoonacular point?
A: Spoonacular says a call usually costs 1 point plus 0.01 points per result, with exceptions on each endpoint. Fifty points is not fifty requests once nutrition, images, or extra results are involved.
Q: Can I store Spoonacular nutrition in my database?
A: Their pricing FAQ allows caching user-requested data for a maximum of one hour, then you must delete it and refresh. If access ends, you must delete all data obtained from the API.
