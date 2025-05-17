/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // swcMinify is now enabled by default in Next.js 15+
  async headers() {
    return [
      {
        source: '/api/auth/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/auth/callback/google',
        destination: '/api/auth/callback/google',
      },
    ];
  },
  async redirects() {
    return [];
  },
}

module.exports = nextConfig
