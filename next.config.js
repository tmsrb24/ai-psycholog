/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // swcMinify is now enabled by default in Next.js 15+
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'https://psychollog.cz',
  },
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
}

module.exports = nextConfig
