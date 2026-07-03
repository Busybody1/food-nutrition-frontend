import { buildOgImage, OG_SIZE } from '@/lib/og-template'
import { getCapabilityPage } from '@/lib/capability-pages-data'

export const size = OG_SIZE
export const contentType = 'image/png'
export const alt = 'Barcode Nutrition API'

export default function OgImage() {
  const page = getCapabilityPage('barcode-nutrition-api')!
  return buildOgImage({ label: 'Product', title: page.h1, subtitle: page.summary })
}
