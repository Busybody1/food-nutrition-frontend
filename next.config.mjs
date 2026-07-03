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

/** @type {import('next').NextConfig} */
const nextConfig = {
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
