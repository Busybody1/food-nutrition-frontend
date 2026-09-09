
const mediaRemotePatterns = [];

const mediaBucket = process.env.NEXT_PUBLIC_MEDIA_BUCKET?.trim();
const mediaRegion = process.env.NEXT_PUBLIC_MEDIA_REGION?.trim();
if (mediaBucket) {

  mediaRemotePatterns.push({
    protocol: 'https',
    hostname: `${mediaBucket}.s3.amazonaws.com`,
  });
  if (mediaRegion && mediaRegion !== 'us-east-1') {
    mediaRemotePatterns.push({
      protocol: 'https',
      hostname: `${mediaBucket}.s3.${mediaRegion}.amazonaws.com`,
    });
  }
}

if (process.env.NEXT_PUBLIC_MEDIA_HOSTNAME) {
  mediaRemotePatterns.push({
    protocol: 'https',
    hostname: process.env.NEXT_PUBLIC_MEDIA_HOSTNAME.trim(),
  });
}

const agentDiscoveryLink = [
  '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"',
  '</openapi.json>; rel="service-desc"; type="application/json"',
  '</docs>; rel="service-doc"; type="text/html"',
  '</llms.txt>; rel="describedby"; type="text/markdown"',
  '</sitemap.xml>; rel="sitemap"; type="application/xml"',
].join(', ');

const agentDiscoveryPaths = [
  '/',
  '/food-database-api',
  '/nutrition-analysis-api',
  '/barcode-nutrition-api',
  '/meal-tracking-api',
];

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
];

const nextConfig = {
  async headers() {

    return [
      { source: '/:path*', headers: securityHeaders },
      ...agentDiscoveryPaths.map((source) => ({
        source,
        headers: [{ key: 'Link', value: agentDiscoveryLink }],
      })),
    ];
  },
  async redirects() {
    return [
      { source: '/signup', destination: '/auth/register', permanent: true },
      { source: '/login', destination: '/auth/login', permanent: true },
      { source: '/register', destination: '/auth/register', permanent: true },

      { source: '/blog/free-food-apis-2025', destination: '/blog/free-food-apis', permanent: true },
    ];
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],

    inlineCss: true,
  },
  images: {

    formats: ['image/avif', 'image/webp'],
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
