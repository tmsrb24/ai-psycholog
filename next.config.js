/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // swcMinify is now enabled by default in Next.js 15+
  env: {
    NEXTAUTH_URL: 'https://www.psychollog.cz',
    // Sentry DSN will be automatically injected by Vercel or can be set here
    // NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  },
  async headers() {
    return [
      {
        source: '/api/auth/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
        ],
      },
      // Přidání nových bezpečnostních hlaviček
      {
        source: '/(.*)', // Aplikovat na všechny cesty
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            // Upravená CSP pro povolení Google avatarů a fungování Next.js
            value: "default-src 'self'; img-src 'self' data: lh3.googleusercontent.com; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; object-src 'none'; frame-ancestors 'none';",
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY', // frame-ancestors 'none' v CSP dělá totéž
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: "camera=(), microphone=(), geolocation=(), payment=()", // Přidáno payment=() jako dobrá praxe
          },
        ],
      },
    ];
  },
  async redirects() {
    return [];
  },
  // Sentry org and project for source map uploading are usually set via
  // SENTRY_ORG, SENTRY_PROJECT, and SENTRY_AUTH_TOKEN environment variables.
  // The `sentry` key is not a standard Next.js config option.
  // Options for the Sentry webpack plugin are passed in the second argument to withSentryConfig.
}

// Import Sentry webpack plugin
const { withSentryConfig } = require("@sentry/nextjs");

module.exports = withSentryConfig(
  nextConfig,
  {
    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload source maps to Sentry
    widenClientFileUpload: true,

    // Transpiles SDK to be compatible with IE11 (increases bundle size)
    transpileClientSDK: false,

    // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
    tunnelRoute: "/monitoring",

    // Hides source maps from generated client bundles
    hideSourceMaps: true,

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,

    // Enables automatic instrumentation of Vercel Cron Monitors.
    // See the following for more information:
    // https://docs.sentry.io/ zowelplatforms/javascript/guides/nextjs/configuration/ Optionen/ #automatic-instrumentation-of-vercel-cron-monitors
    automaticVercelMonitors: true,
  }
);
