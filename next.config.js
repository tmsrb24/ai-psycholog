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
  async rewrites() {
    return [
      {
        source: '/api/auth/callback/google',
        destination: '/api/auth/callback/google',
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/',
        has: [
          {
            type: 'host',
            value: 'www.psychollog.cz',
          },
        ],
        destination: 'https://psychollog.cz',
        permanent: true,
      },
    ];
  },
}

module.exports = nextConfig
