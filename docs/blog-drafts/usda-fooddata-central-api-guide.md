slug: usda-fooddata-central-api-guide
title: USDA FoodData Central API: Demo Key, Rate Limits, and Search
meta_title: USDA FDC API: Demo Key, Rate Limits, Search
meta_description: Use the USDA FoodData Central API: DEMO_KEY limits, /foods/search, nutrient IDs, and what to do when you hit 429 or need barcode lookup.
excerpt: Developer guide to the USDA FoodData Central API: get a key, call search, read nutrient IDs, stay under 1,000 requests per hour, and what to do after a 429 or a barcode miss.
keywords: usda fooddata central api, fdc api key, usda food api, fooddata central api, usda fooddata central api documentation, usda nutrition database api, usda fdc api key, usda fooddata central api rate limits, usda fooddata central api search foods, fooddata central api key required

--- CONTENT ---

The USDA FoodData Central API (FDC) is a free U.S. government nutrition API. It is the right tool for a lot of work: research, internal analysis, and US generic foods. This guide is also for the two moments that send developers to a search engine: you just received HTTP 429, or you need barcode lookup and cannot find an endpoint for it.

You will get a working key, a real `/foods/search` request, the nutrient numbers that actually mean calories and protein, the documented rate limits (including `DEMO_KEY`), and an honest barcode workaround. After that, the page covers what to add if those limits are the problem, not a rewrite of the USDA docs.

## Get an API key (and what DEMO_KEY actually allows)

FoodData Central uses the shared [api.data.gov](https://api.data.gov/signup/) key system. Sign up, confirm the email, and pass the key as the `api_key` query parameter. It is not a header.

You can explore without signing up by using `DEMO_KEY`. That key is for examples only. USDA documents these `DEMO_KEY` caps:

- 30 requests per IP address per hour
- 50 requests per IP address per day

A registered key is the one you want for any real integration. USDA's API guide states a default of **1,000 requests per hour per IP address**. Exceeding it temporarily blocks the key for an hour and returns **HTTP 429 (Too Many Requests)**.

```bash
curl "https://api.nal.usda.gov/fdc/v1/foods/search?query=banana&api_key=DEMO_KEY"
```

Replace `DEMO_KEY` with your key as soon as you are past copy-paste. Do not ship `DEMO_KEY` in a mobile app. Every user behind the same NAT shares the 30/hour bucket.

## Search foods: GET /fdc/v1/foods/search

Most apps start with full-text search, then fetch one food by FDC ID.

| Endpoint | Purpose |
|---|---|
| `GET /fdc/v1/foods/search` | Full-text search; returns `fdcId` plus a short payload |
| `GET /fdc/v1/food/{fdcId}` | Full nutrient panel for one food |
| `POST /fdc/v1/foods` | Batch fetch by a list of FDC IDs (saves quota) |
| `GET /fdc/v1/foods/list` | Paginated catalog listing |

A typical search:

```bash
curl "https://api.nal.usda.gov/fdc/v1/foods/search?query=greek%20yogurt&dataType=Foundation,SR%20Legacy&pageSize=25&api_key=YOUR_KEY"
```

Useful query parameters:

- `query`: the search string
- `dataType`: restrict to Foundation, SR Legacy, Branded, or Survey (FNDDS). Without a filter, branded hits often drown out analytical foods.
- `pageSize`: USDA allows up to 200 foods per page. Smaller pages are easier to inspect.
- `pageNumber`: 1-based pagination

The JSON envelope includes `totalHits`, `currentPage`, and a `foods` array. Each hit has `fdcId`, `description`, `dataType`, and a partial `foodNutrients` list. Treat search as an index. For a complete panel, call `/food/{fdcId}`.

### Look up one food by FDC ID

```bash
curl "https://api.nal.usda.gov/fdc/v1/food/1097473?api_key=YOUR_KEY"
```

The payload is research-shaped, not app-shaped. Macros live in `foodNutrients[]`, keyed by USDA nutrient number, not by names like `calories` or `protein_g`.

Nutrient numbers you will map on day one:

| Nutrient number | Meaning | Typical unit |
|---|---|---|
| 1008 | Energy | kcal |
| 1003 | Protein | g |
| 1005 | Carbohydrate, by difference | g |
| 1004 | Total lipid (fat) | g |
| 1079 | Fiber, total dietary | g |
| 1093 | Sodium | mg |

There is also an energy entry in kJ. Filter on `unitName` if you only want kcal. Amounts on Foundation and SR Legacy foods are per 100 g unless the record says otherwise. Scaling to "one cup" or 180 g is your code.

### Batch lookups to stay under the hourly cap

`POST /fdc/v1/foods` accepts multiple FDC IDs in one request. USDA documents up to 20 IDs per call. If you hydrate a favorites list, batching is the difference between a comfortable 1,000/hour budget and a 429 at lunch rush.

Cache by `fdcId`. IDs are stable. Re-searching "banana" on every log is how consumer apps burn the cap.

## Data types: which catalog you are actually querying

Search mixes several USDA datasets. Filter on purpose:

- **Foundation** and **SR Legacy**: analyzed generic foods. Best for whole foods and citations.
- **Branded**: manufacturer-submitted packaged foods. This is where `gtinUpc` appears.
- **Survey (FNDDS)**: foods as reported in dietary surveys, useful for population work, noisy for a barcode scanner.

If you need an apple, Foundation/SR Legacy is the default. If you need a specific yogurt UPC, you are in Branded, and you still do not get a first-class barcode endpoint.

## Rate limits in production (the 429)

Read this section if you are here because search stopped working.

1. **`DEMO_KEY`**: 30/hour and 50/day per IP. Fine for a tutorial. Not fine for a prototype with five testers on cafe Wi-Fi.
2. **Registered api.data.gov key**: about **1,000 requests per hour per IP**. USDA says this is adequate for most applications. A multi-user meal logger that hits search on every keystroke will exceed it.
3. **On exceed**: HTTP **429**, key blocked for **one hour**.
4. **Higher limits**: USDA notes you can request an increase through their contact path for legitimate research and open-source use. That is not an SLA, and it is not a barcode product.

Practical mitigations on FDC alone:

- Cache food details by `fdcId` for days, not minutes.
- Debounce search in the client. Do not call FDC on every character.
- Prefer `POST /fdc/v1/foods` when you already have IDs.
- Run suggest/typeahead against your own cache or a commercial suggest endpoint, and only call FDC when the user commits a selection.

If those mitigations are the entire backend you wanted to avoid writing, you have outgrown the free research API. That is a product decision, not a moral one. FDC is doing what it advertised.

## Barcode lookup: there is no dedicated endpoint

Branded foods include a GTIN/UPC field (`gtinUpc` in many payloads). There is **no** `GET /barcode/{upc}` on FoodData Central.

The workaround people try is full-text search with the barcode as `query` and `dataType=Branded`. That search is fuzzy. Libraries that wrap FDC document the failure mode clearly: an unknown code can still return hundreds of thousands of "hits" whose `gtinUpc` is a different product. If you take `foods[0]` you will log the wrong item.

A safe pattern if you stay on FDC:

1. Search the barcode string with `dataType=Branded` and a small `pageSize`.
2. Compare `gtinUpc` to the scanned digits after stripping leading zeros (UPC-A is 12 digits, EAN-13 is 13, and FDC zero-pads inconsistently).
3. If nothing matches, return a miss to the user. A miss is better than the wrong yogurt.
4. Then `GET /food/{fdcId}` for the nutrient array.

If that loop is the core of your scanner, you want an API that treats barcode as a first-class lookup, returns 404 on unknown codes, and does not require you to police fuzzy search.

## When FoodData Central alone is the right call

Stay on FDC when:

- You need authoritative USDA nutrient detail for research, compliance, or citations.
- US generic foods are enough and you can build your own search UX.
- Traffic is low enough that 1,000 requests per hour per IP, plus caching, holds.
- You do not need typeahead, ranked multi-word logging search, or scan-to-nutrition as a product feature.

In those cases, do not add a commercial invoice. Use the government API.

## When you just hit the rate limit or missed barcode search

Two conversion jobs, same page.

**You received 429.** You already know FDC works. The cap is per IP, so a mobile fleet behind one NAT shares one bucket. Caching and batching may be enough. If the interactive path (typeahead, live search, many users) is the load, put that path on an API with a published per-account quota and keep FDC for reference lookups.

**You need barcode.** FDC will not grow a barcode-first endpoint because you filed a GitHub issue. Either implement the fuzzy-search-plus-verify loop above, or call an API whose contract is: digits in, product or 404 out, same JSON as text search.

[Calorie API](/nutrition-api) is that productized layer for teams who still respect USDA data. Curated generics stay consistent with USDA reference numbers. `verified_only` surfaces that tier. Branded and international coverage, autocomplete, ranked search, and [barcode lookup](/barcode-nutrition-api) sit on the same key. Named fields (`calories`, `protein_g`, `carbohydrates_g`, `fat_g`) replace nutrient-number mapping. Plan quotas are documented; they are not "1,000/hour per IP and then a silent hour of 429".

```bash
# Named macros, ranked search
curl "https://api.calorieapi.com/api/v1/search/foods?q=banana" \
  -H "X-API-Key: YOUR_API_KEY"

# Barcode to nutrition in one call (Open Food Facts fallback, 404 on a true miss)
curl "https://api.calorieapi.com/api/v1/search/barcode/737628064502" \
  -H "X-API-Key: YOUR_API_KEY"
```

A common architecture keeps **FDC for citation-grade reference** and **Calorie API on the logging path** (suggest, search, barcode). You do not have to migrate historical FDC IDs on day one.

| Capability | USDA FDC API | Calorie API |
|---|---|---|
| Cost | Free (api.data.gov key) | Free development tier; paid plans for scale |
| Nutrient format | `foodNutrients[]` keyed by USDA numbers | Named `calories`, `protein_g`, `carbohydrates_g`, `fat_g` |
| Barcode lookup | Indirect: search plus verify `gtinUpc` | Dedicated `/search/barcode/{upc}`, 404 on miss |
| Typeahead | Build it yourself | `GET /search/suggest` |
| Rate limit | `DEMO_KEY` 30/hr; registered ~1,000/hr per IP; 429 then 1 hour block | Published per-plan quota and per-minute limits |
| Catalog | USDA datasets (Foundation, SR Legacy, Branded, FNDDS) | 4M+ foods plus Open Food Facts barcode fallback |

The side-by-side with "when USDA is enough" notes lives on the [USDA FoodData Central alternative](/compare/usda-fooddata-central-alternative) page. Related reading: [USDA vs a commercial food database](/blog/usda-fooddata-central-vs-commercial-food-database).

## Start building

- If FDC fits, register at [api.data.gov](https://api.data.gov/signup/) and cache by `fdcId`.
- If you hit 429 or need barcode-first lookup, [create a Calorie API key](/auth/register) (no card for development), read the [docs](/docs), and try calls in the [playground](/playground).

FAQ:
- question: Is the USDA FoodData Central API free?
  answer: Yes. It is a U.S. government API. Use DEMO_KEY only for examples (30 requests per hour and 50 per day per IP). Register a free api.data.gov key for real work.
- question: What is the FDC rate limit?
  answer: A registered key is documented at about 1,000 requests per hour per IP. Over that, you get HTTP 429 and a one-hour block. DEMO_KEY is 30 per hour and 50 per day.
- question: Does FoodData Central support barcode lookup?
  answer: Branded foods include gtinUpc, but there is no dedicated barcode endpoint. Searching a UPC as text is fuzzy. Confirm the returned gtinUpc matches, after stripping leading zeros, or treat it as a miss.
- question: How do I get calories from an FDC response?
  answer: Read foodNutrients and map USDA nutrient numbers. Energy in kcal is 1008, protein is 1003, carbohydrate is 1005, fat is 1004. Filter kJ energy rows if you only want kcal.
- question: When should I add a commercial nutrition API?
  answer: When the 1,000/hour cap, the missing barcode endpoint, or the lack of typeahead is blocking a consumer app. Keep FDC for reference if you still need USDA citations. Calorie API is the logging layer in that split.
- question: Can I use FoodData Central and Calorie API together?
  answer: Yes. A common setup uses FDC for authoritative generic lookups and Calorie API for suggest, ranked search, and barcode. Curated Calorie API generics stay consistent with USDA reference data.
