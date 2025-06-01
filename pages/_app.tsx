import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '../components/ThemeProvider';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/next";
import { appWithTranslation } from 'next-i18next';
import { useRouter } from 'next/router'; // Import useRouter

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const router = useRouter(); // Get router instance
  return (
    <SessionProvider session={session}>
      <ThemeProvider>
        <Component {...pageProps} key={router.asPath} /> {/* Add key prop */}
        <Analytics />
        <SpeedInsights />
      </ThemeProvider>
    </SessionProvider>
  );
}

export default appWithTranslation(MyApp);
