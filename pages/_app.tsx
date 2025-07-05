import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '../components/ui/ThemeProvider';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/next";
import { appWithTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import Head from 'next/head'; // Přidán import Head
import { Inter } from 'next/font/google';
import { useEffect, useState } from 'react';

const inter = Inter({
  subsets: ['latin', 'latin-ext'], // Přidána podpora pro latinku-rozšířenou (české znaky)
  display: 'swap', // Zajišťuje fallback font, dokud se Inter nenačte
});

const queryClient = new QueryClient();

function MyApp({ Component, pageProps: { session: initialSession, ...pageProps } }: AppProps) {
  const router = useRouter();
  const [hasAnalyticsConsent, setHasAnalyticsConsent] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (consent) {
      const { analytics } = JSON.parse(consent);
      setHasAnalyticsConsent(analytics);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider session={initialSession}>
        <ThemeProvider>
          <Head>
            <link rel="manifest" href="/manifest.json" />
            <meta name="theme-color" content="#2563EB" /> {/* Může být také v manifestu, ale zde pro jistotu */}
          </Head>
          <main className={inter.className}>
            <Component {...pageProps} key={router.asPath} />
          </main>
          {hasAnalyticsConsent && (
            <>
              <Analytics />
              <SpeedInsights />
            </>
          )}
        </ThemeProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}

export default appWithTranslation(MyApp);
