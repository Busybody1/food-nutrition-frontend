import assert from 'node:assert/strict';
import test from 'node:test';
import { buildPricingProductJsonLdFromInput } from './pricing-product-jsonld.ts';

const INPUT = {
  siteName: 'Calorie API',
  siteUrl: 'https://calorieapi.com',
  siteDescription: 'Food & nutrition REST API.',
  imageUrl: 'https://calorieapi.com/images/hero-bowl.jpg',
  pricingUrl: 'https://calorieapi.com/pricing',
  termsUrl: 'https://calorieapi.com/terms',
  plans: [
    { name: 'Free', price: '0' },
    { name: 'Basic', price: '29' },
    { name: 'Core', price: '99' },
    { name: 'Plus', price: '299' },
  ],
  priceValidUntil: '2027-12-31',
};

test('buildPricingProductJsonLdFromInput includes required Product image', () => {
  const data = buildPricingProductJsonLdFromInput(INPUT);
  assert.equal(data['@type'], 'Product');
  assert.ok(Array.isArray(data.image) && data.image.length > 0);
  assert.match(data.image[0], /^https?:\/\//);
});

test('buildPricingProductJsonLdFromInput includes complete Offer fields', () => {
  const data = buildPricingProductJsonLdFromInput(INPUT);
  assert.equal(data.offers.length, 4);

  for (const offer of data.offers) {
    assert.equal(offer['@type'], 'Offer');
    assert.equal(offer.availability, 'https://schema.org/InStock');
    assert.ok(offer.url);
    assert.ok(offer.shippingDetails);
    assert.ok(offer.hasMerchantReturnPolicy);
    assert.equal(offer.priceCurrency, 'USD');
  }

  const core = data.offers.find((o) => o.name === 'Core');
  assert.equal(core.price, '99');
});
