import { SITE_NAME } from '@/lib/site';

export const metadata = {
  title: 'Contact',
  description: `Contact ${SITE_NAME} for API support, sales, and enterprise plans.`,
  alternates: { canonical: '/contact' },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
