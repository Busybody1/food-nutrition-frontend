/** S3/CDN hosts serving admin-uploaded media (testimonial avatars). */
const mediaRemotePatterns = [
  { protocol: 'https', hostname: '**.amazonaws.com' },
];
// Optional CDN in front of the shared S3 bucket (mirrors AWS_S3_PUBLIC_BASE_URL on the API).
if (process.env.NEXT_PUBLIC_MEDIA_HOSTNAME) {
  mediaRemotePatterns.push({
    protocol: 'https',
    hostname: process.env.NEXT_PUBLIC_MEDIA_HOSTNAME,
  });
}

/**
 * RFC 8288 Link header advertising agent-discoverable resources from the
 * homepage: the API catalog (RFC 9727), human docs, an LLM-friendly summary,
 * and the sitemap. Relative URLs resolve against the request origin.
 */
const agentDiscoveryLink = [
  '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"',
  '</docs>; rel="service-doc"; type="text/html"',
  '</llms.txt>; rel="describedby"; type="text/markdown"',
  '</sitemap.xml>; rel="sitemap"; type="application/xml"',
].join(', ');

/**
 * Indexable entry points that advertise the discovery links: the homepage and
 * the per-product API landing pages. Deliberately excludes app/admin/auth
 * routes, which are private and disallowed in robots.txt.
 */
const agentDiscoveryPaths = [
  '/',
  '/food-database-api',
  '/nutrition-analysis-api',
  '/barcode-nutrition-api',
  '/meal-tracking-api',
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return agentDiscoveryPaths.map((source) => ({
      source,
      headers: [{ key: 'Link', value: agentDiscoveryLink }],
    }));
  },
  async redirects() {
    return [
      { source: '/signup', destination: '/auth/register', permanent: true },
      { source: '/login', destination: '/auth/login', permanent: true },
      { source: '/register', destination: '/auth/register', permanent: true },
    ];
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  images: {
    formats: ['image/webp'],
    qualities: [70, 75],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    localPatterns: [
      {
        pathname: '/images/**',
      },
      {
        pathname: '/logos/**',
      },
    ],
    remotePatterns: mediaRemotePatterns,
  },
};

export default nextConfig;
