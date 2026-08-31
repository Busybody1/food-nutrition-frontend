/**
 * S3/CDN hosts serving admin-uploaded media (testimonial avatars).
 *
 * Scoped to our own bucket. A blanket '**.amazonaws.com' matches every S3
 * bucket on the internet, which turns /_next/image into an open image proxy:
 * anyone can create a bucket and have our dynos fetch, decode, and re-encode
 * their bytes — our bandwidth, and attacker-controlled input into sharp/libvips.
 *
 * Bucket name mirrors AWS_S3_BUCKET on the API; NEXT_PUBLIC_MEDIA_HOSTNAME
 * covers a CDN in front of it (mirrors AWS_S3_PUBLIC_BASE_URL). With neither
 * set, remote images are refused outright — deliberate: better to fail closed
 * and visibly than to re-open the proxy.
 */
const mediaRemotePatterns = [];

const mediaBucket = process.env.NEXT_PUBLIC_MEDIA_BUCKET?.trim();
const mediaRegion = process.env.NEXT_PUBLIC_MEDIA_REGION?.trim();
if (mediaBucket) {
  // Exact hosts only — no wildcard. Next's '*' spans multiple labels, so
  // `${bucket}.s3.*.amazonaws.com` would also match `${bucket}.s3.evil.s3.
  // amazonaws.com`, i.e. a bucket an attacker named "<bucket>.s3.evil"
  // (S3 permits dots in bucket names). These two forms mirror exactly what
  // build_public_s3_url() emits on the API.
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

/**
 * RFC 8288 Link header advertising agent-discoverable resources from the
 * homepage: the API catalog (RFC 9727), human docs, an LLM-friendly summary,
 * and the sitemap. Relative URLs resolve against the request origin.
 */
const agentDiscoveryLink = [
  '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"',
  '</openapi.json>; rel="service-desc"; type="application/json"',
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

/**
 * Baseline security headers applied to every route.
 *
 * Nothing we own embeds these pages in a frame, so framing is denied outright
 * rather than limited to same-origin. `frame-ancestors` only governs who may
 * frame *us* — pages we embed (e.g. Stripe) are unaffected. X-Frame-Options is
 * kept alongside the CSP for pre-CSP2 user agents.
 */
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    // Both rules match '/', and Next applies every matching rule, so the
    // discovery Link header survives the catch-all above it.
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
      // Blog post slug renamed in the CMS (dropped the year): the old URL now
      // 404s, so 301 it to preserve any indexed/linked equity. Audited
      // seeded-vs-live slugs 2026-07-10 — this is the only rename.
      { source: '/blog/free-food-apis-2025', destination: '/blog/free-food-apis', permanent: true },
    ];
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
    // Inline route CSS into the HTML so the initial render isn't blocked on
    // separate stylesheet requests (Lighthouse "render-blocking requests").
    inlineCss: true,
  },
  images: {
    // AVIF first (smaller than WebP at equal quality), WebP fallback.
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
