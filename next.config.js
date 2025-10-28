/** @type {import('next').NextConfig} */
// Trigger Vercel build after re-linking GitHub account
const { i18n: i18nConfig } = require('./next-i18next.config.js');
const { cache: runtimeCaching } = require("next-pwa"); // Upravený import

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // Vypne PWA ve vývojovém prostředí
  runtimeCaching,
  buildExcludes: [/middleware-manifest.json$/], // Vyloučení souboru, který může způsobovat problémy
});

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['lh3.googleusercontent.com', 'images.unsplash.com', 'i.imgur.com'],
  },
  i18n: {
    ...i18nConfig, // Rozšíření konfigurace z next-i18next.config.js
    localeDetection: false, // Vypnutí automatické detekce jazyka
  },
  // swcMinify is now enabled by default in Next.js 15+
  env: {
    NEXTAUTH_URL: 'https://www.psychollog.cz',
  },
  async headers() { 
    return [
      {
        source: '/api/auth/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
        ],
      },
      {
        source: '/(.*)', 
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; img-src 'self' data: lh3.googleusercontent.com avatars.githubusercontent.com images.unsplash.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; object-src 'none'; frame-ancestors 'none'; connect-src 'self' https://vitals.vercel-insights.com https://generativelanguage.googleapis.com https://*.supabase.co;",
            // Povoleno: Google Avatars, GitHub Avatars (pokud by se používaly)
            // Vercel Analytics/Speed Insights (va.vercel-scripts.com, vitals.vercel-insights.com)
            // Google Fonts (fonts.googleapis.com, fonts.gstatic.com)
            // Gemini API (generativelanguage.googleapis.com)
            // Supabase (supabase.co)
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
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
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // HTTP to HTTPS redirect
      {
        source: '/:path*',
        has: [
          {
            type: 'header',
            key: 'x-forwarded-proto',
            value: 'http',
          },
        ],
        destination: 'https://www.psychollog.cz/:path*',
        permanent: true,
      },
      // /index redirect
      {
        source: '/index',
        destination: '/',
        permanent: true,
      },
    ];
  },
  // Sentry org and project for source map uploading are usually set via
  // SENTRY_ORG, SENTRY_PROJECT, and SENTRY_AUTH_TOKEN environment variables.
  // The `sentry` key is not a standard Next.js config option.
  // Options for the Sentry webpack plugin are passed in the second argument to withSentryConfig.
}

module.exports = withPWA(nextConfig);
