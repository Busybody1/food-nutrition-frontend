---
slug: nutrition-api-for-developers
title: Nutrition API for Developers
meta_title: Nutrition API for Developers
meta_description: A nutrition API for developers: one API key, search, suggest, and barcode. Macros per 100 grams. Free tier is 1,000 calls a month.
excerpt: A nutrition API for developers is a REST lookup you can call from a weekend prototype. One header, JSON, per-100g macros, and a free tier that does not ask for a card.
keywords: nutrition api for developers, nutrition api, food api for developers, developer nutrition api
---

A nutrition API for developers is the data layer, not the app. You get JSON. You draw the screen. Calorie API is that layer: food search, autocomplete, barcode, and per-100g macros, authenticated with one header.

There is no SDK you have to adopt, and there is no GraphQL endpoint. If the search that brought you here was "GraphQL nutrition API," this is the REST alternative. Do not wait for a schema we do not ship.

## The smallest working client

```bash
curl "https://api.calorieapi.com/api/v1/search/foods?q=apple" \
  -H "X-API-Key: YOUR_API_KEY"
```

Create the key in the dashboard. The free plan does not ask for a card. The query string is `q`. A 401 means the header is missing or the key is wrong. A 402 means the month's quota is gone. A 429 means you exceeded the per-minute limit. Those three are the only failures worth handling on day one.

The calls a real client makes:

| Moment | Endpoint |
|---|---|
| Typing | `GET /api/v1/search/suggest?q=` |
| Selected a food | `GET /api/v1/foods/{id}` |
| Scanned a package | `GET /api/v1/search/barcode/{upc}` |
| Wants only curated foods | add `verified_only=true` on search |

Docs for each one live under [/docs](/docs). The playground on the site runs a public search with no key, rate limited by IP, so you can see the JSON before you create an account.

## What developers usually assume, and what is true

You do not get a recipe generator, a meal-plan object, or a parser for "two eggs and toast." Search is ranked keywords. Ingredient lists are a loop you write: one search per ingredient, then multiply per 100 grams by the grams in the recipe. [Edamam pricing](/blog/edamam-food-database-api-pricing-startup-alternative) is the vendor that will do that loop and then bill you for every recipe you analyzed, including ones you later delete.

You do not get the database as a file. Cache by food id. Plus may retain a response for 30 days under the [commercial license](/commercial-license). Scraping the catalog is prohibited.

You do not get commercial rights on the free plan. On 1 October 2026 the free plan is 1,000 calls a month and 10 per minute. Basic is $15 for 20,000 calls and is still non-commercial. The commercial plan is Plus at $150 for 1 million calls, and those requests send `X-API-Usage-Type: commercial`. The live table is [/pricing](/pricing).

Image calorie estimation is not on those plans. It is an enterprise add-on. Photo products such as LogMeal are a different category, described on the [Log Meal API](/blog/log-meal-api) page.

If you are choosing among vendors rather than integrating, start with [best nutrition API](/blog/best-food-nutrition-apis-2025). If you already know you need this one, the [nutrition API](/blog/what-is-a-nutrition-api) page is the shorter definition and this page is the integration.
---FAQ---
Q: How do I authenticate the nutrition API?
A: Send your key in the X-API-Key header. There is no OAuth handshake for the food endpoints. Dashboard JWTs are for the dashboard, not for your users' devices if you can avoid putting a shared key in a shipped app. Proxy the call from your server.
Q: Is there a free tier for developers?
A: Yes. 1,000 calls a month, no credit card, non-commercial, 20 foods per search, 10 requests a minute.
Q: Do you have GraphQL or an official SDK?
A: No. The API is REST and JSON. Call it with curl, fetch, or whatever HTTP client you already use.
Q: Can I ship a paid app on the free plan?
A: No. Commercial production is Plus or Enterprise, with the header X-API-Usage-Type: commercial.
