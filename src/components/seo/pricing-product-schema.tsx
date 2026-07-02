import { buildPricingProductJsonLdAsync } from '@/lib/seo-jsonld'
import { JsonLdScript } from '@/components/seo/structured-data'

/** SSR JSON-LD with plan prices loaded from the billing API. */
export async function PricingProductSchema() {
  const data = await buildPricingProductJsonLdAsync()
  return <JsonLdScript id="structured-data-product" data={data} />
}
