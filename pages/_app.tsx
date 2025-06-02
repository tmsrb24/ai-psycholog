import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '../components/ThemeProvider';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/next";
import { appWithTranslation } from 'next-i18next'; // Odebrán useTranslation, pokud se nepoužívá zde
import { useRouter } from 'next/router';
// import { useEffect } from 'react'; // Odebrán useEffect, pokud se nepoužívá zde
// import { useSession } from 'next-auth/react'; // Odebrán useSession, pokud se nepoužívá zde
import { Inter } from 'next/font/google'; // Přidán import Inter

const inter = Inter({ 
  subsets: ['latin', 'latin-ext'], // Přidána podpora pro latinku-rozšířenou (české znaky)
  display: 'swap', // Zajišťuje fallback font, dokud se Inter nenačte
});

function MyApp({ Component, pageProps: { session: initialSession, ...pageProps } }: AppProps) {
  const router = useRouter();
  // const { data: session, status } = useSession({ required: false }); 
  // const { i18n } = useTranslation(); 

  // useEffect(() => { 
  //   // Pokud by se tato logika vrátila, musela by získat session jinak, nebo být vnořena hlouběji
  //   if (status === "authenticated" && session?.user) {
  //     const userPreferredLang = (session.user as any)?.preferences?.uiLanguage;
  //     if (userPreferredLang && router.locales?.includes(userPreferredLang) && router.locale !== userPreferredLang) {
  //       if (router.isReady) {
  //         console.log(`_app.tsx: Setting UI language to user preference: ${userPreferredLang}`);
  //         i18n.changeLanguage(userPreferredLang);
  //         router.push(router.pathname, router.asPath, { locale: userPreferredLang });
  //       }
  //     }
  //   }
  // }, [status, session, router, i18n]);

  return (
    <SessionProvider session={initialSession}>
      <ThemeProvider>
        <main className={inter.className}> {/* Aplikace třídy fontu na hlavní kontejner */}
          <Component {...pageProps} key={router.asPath} />
        </main>
        <Analytics />
        <SpeedInsights />
      </ThemeProvider>
    </SessionProvider>
  );
}

export default appWithTranslation(MyApp);
