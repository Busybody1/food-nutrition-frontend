---
slug: fatsecret-api-pricing
title: FatSecret API Pricing
meta_title: FatSecret API Pricing
meta_description: FatSecret API pricing is not per call. Basic is 5,000 calls a day, US only. Premier is quoted by country. Compared with a $15 plan.
excerpt: FatSecret prices by country dataset, not by request volume. Basic is free at 5,000 calls a day on US foods. Here is how that compares with a plan that publishes a monthly call quota.
keywords: fatsecret api pricing, fatsecret api, fatsecret platform api pricing, fatsecret premier free
---

FatSecret does not sell API calls. It sells country datasets. That is the whole pricing model, and it is why a quote request comes back as "which markets" instead of "how many requests."

Checked on the [fatsecret Platform editions page](https://platform.fatsecret.com/api-editions) on 1 October 2026. Their numbers move. Re-read that page before you sign.

## The three editions

| Edition | Price | Calls | Data | Attribution |
|---|---|---|---|---|
| Basic | Free, self sign-up | 5,000 a day | US only | Required |
| Premier Free | Free after they verify you | Unlimited | US only | Required |
| Premier | Quoted | Unlimited | More than 58 countries | Not required on the paid edition |

Premier Free is for startups, non-profits, and students. Eligibility is their decision, not a checkbox. Non-US data for those groups is a discount off Premier, not included. Image recognition and natural language are add-ons on top, priced by market and by monthly volume. They are not in the base edition.

Paid Premier is white-label: you can drop the credit. Basic and Premier Free cannot.

They are explicit that there is no volume price per API call. A US-only hobby app and a US-only app doing millions of searches can sit on the same edition. The bill changes when you add the UK, or barcodes in Japan, or the photo add-on.

## What you integrate

Auth is OAuth request signing with a consumer key and secret, not one header. The diary and weight endpoints are part of the platform, which is useful if you want them to store the user's log. It is also a larger surface than a food lookup.

Calorie API, for the comparison, is one header, `X-API-Key`, and it does not store the diary. You do.

| | FatSecret Basic | Calorie API Free | Calorie API Plus |
|---|---|---|---|
| Price | $0 | $0, 1,000 calls / month | $150, 1,000,000 calls / month |
| Geography | US dataset | Not limited to US foods | Same |
| Commercial app | Premier, quoted | Not on Free | Yes, with `X-API-Usage-Type: commercial` |
| Auth | OAuth signing | API key | API key |

Our figures are from [pricing](/pricing) on the same date. Free needs no card and is non-commercial. Basic at $15 for 20,000 calls is also non-commercial. A commercial app is Plus or Enterprise, even if the call count would have fit in Basic.

## When FatSecret is the better invoice

Stay if you need their diary stored on their side, or a specific non-US catalog they already license, or the photo add-on in a country you have a quote for. Five thousand US calls a day is a larger free bucket than our 1,000 a month, and for a US student project that number wins.

Leave if the app is outside the US and you do not want a sales cycle to find out the price, or if OAuth signing is the thing slowing the first demo. Search, suggest, and barcode on an API key are the path described in the [FatSecret alternative](/blog/fatsecret-api-alternative-for-developers). The [best nutrition API](/blog/best-food-nutrition-apis-2025) page is the wider comparison if Edamam or Nutritionix are also on the shortlist.
---FAQ---
Q: How much does the FatSecret API cost?
A: Basic is free at 5,000 calls a day on the US dataset, with attribution. Premier Free is unlimited on the US dataset for eligible startups, non-profits, and students, also with attribution. Premier is quoted from the countries you need, not from call volume.
Q: Does FatSecret charge per API request?
A: No. Their editions page says pricing is based on market access. Image recognition and natural language are separate add-ons, quoted by market and volume.
Q: Is FatSecret API pricing public for international data?
A: The US free tiers are public. Datasets beyond the US are "upon request." There is no published monthly price for Premier.
Q: What is the alternative if I want a published call quota?
A: Calorie API lists the quota on the pricing page. Free is 1,000 calls a month. Plus is $150 for 1 million calls and is the commercial plan.
