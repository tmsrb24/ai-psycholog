/** @type {import('next').NextConfig} */
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
  i18n: {
    ...i18nConfig, // Rozšíření konfigurace z next-i18next.config.js
    localeDetection: false, // Vypnutí automatické detekce jazyka
  },
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
      {
        source: '/(.*)', 
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; img-src 'self' data: lh3.googleusercontent.com avatars.githubusercontent.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; object-src 'none'; frame-ancestors 'none'; connect-src 'self' https://vitals.vercel-insights.com https://generativelanguage.googleapis.com https://*.supabase.co;",
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
    return [];
  },
  // Sentry org and project for source map uploading are usually set via
  // SENTRY_ORG, SENTRY_PROJECT, and SENTRY_AUTH_TOKEN environment variables.
  // The `sentry` key is not a standard Next.js config option.
  // Options for the Sentry webpack plugin are passed in the second argument to withSentryConfig.
}

// Import Sentry webpack plugin
const { withSentryConfig } = require("@sentry/nextjs");

// Obalení konfigurace nejprve withPWA, pak withSentryConfig
module.exports = withPWA(withSentryConfig(
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
)); // Přidána chybějící uzavírací závorka pro withPWA
