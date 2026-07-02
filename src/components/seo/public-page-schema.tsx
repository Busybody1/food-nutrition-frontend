import { JsonLdScript } from '@/components/seo/structured-data'
import { PricingProductSchema } from '@/components/seo/pricing-product-schema'
import {
  buildBreadcrumbJsonLd,
  buildWebPageJsonLd,
  type BreadcrumbItem,
} from '@/lib/seo-jsonld'
import type { PublicPagePath } from '@/lib/public-page-seo'
import { getPublicPageSeo } from '@/lib/public-page-seo'

type PublicPageSchemaProps = {
  path: PublicPagePath
  pageName: string
  extraJsonLd?: unknown[]
  includeProduct?: boolean
}

function breadcrumbsFor(path: PublicPagePath, pageName: string): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [{ name: 'Home', path: '/' }]
  if (path !== '/') items.push({ name: pageName, path })
  return items
}

export function PublicPageSchema({
  path,
  pageName,
  extraJsonLd = [],
  includeProduct = false,
}: PublicPageSchemaProps) {
  const seo = getPublicPageSeo(path)
  const webPage = buildWebPageJsonLd({
    name: pageName,
    description: seo.description,
    path,
  })
  const breadcrumb = buildBreadcrumbJsonLd(breadcrumbsFor(path, pageName))

  return (
    <>
      <JsonLdScript id={`breadcrumb-${path.replace(/\//g, '-') || 'home'}`} data={breadcrumb} />
      <JsonLdScript id={`webpage-${path.replace(/\//g, '-') || 'home'}`} data={webPage} />
      {extraJsonLd.map((data, i) => (
        <JsonLdScript
          key={`extra-${path}-${i}`}
          id={`extra-jsonld-${path.replace(/\//g, '-')}-${i}`}
          data={data}
        />
      ))}
      {includeProduct && <PricingProductSchema />}
    </>
  )
}
