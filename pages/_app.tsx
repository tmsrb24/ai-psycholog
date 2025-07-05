import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '../components/ui/ThemeProvider';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/next";
import { appWithTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Nunito_Sans } from 'next/font/google';
import { useEffect, useState } from 'react';

const nunito = Nunito_Sans({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
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
          <main className={nunito.className}>
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
