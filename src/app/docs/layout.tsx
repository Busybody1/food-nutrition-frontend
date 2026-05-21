import { SITE_NAME } from '@/lib/site';

export const metadata = {
  title: 'API Documentation',
  description: `Integrate ${SITE_NAME}: authentication, search, barcode lookup, rate limits, and code examples.`,
  alternates: { canonical: '/docs' },
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
