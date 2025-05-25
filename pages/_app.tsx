import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '../components/ThemeProvider';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/next"; // Přidán import

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider>
        <Component {...pageProps} />
        <Analytics />
        <SpeedInsights /> {/* Přidána komponenta */}
      </ThemeProvider>
    </SessionProvider>
  );
}

export default MyApp;
