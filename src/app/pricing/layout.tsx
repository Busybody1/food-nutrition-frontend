import { SITE_NAME } from '@/lib/site';

export const metadata = {
  title: 'Pricing',
  description: `Transparent API pricing for ${SITE_NAME} — free tier, growth plans, and enterprise.`,
  alternates: { canonical: '/pricing' },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
