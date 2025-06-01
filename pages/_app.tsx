import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '../components/ThemeProvider';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/next";
import { appWithTranslation, useTranslation } from 'next-i18next'; // Přidán useTranslation
import { useRouter } from 'next/router';
import { useEffect } from 'react'; // Přidán useEffect
import { useSession } from 'next-auth/react'; // Přidán useSession

function MyApp({ Component, pageProps: { session: initialSession, ...pageProps } }: AppProps) {
  const router = useRouter();
  const { data: session, status } = useSession({ required: false }); 
  // const { i18n } = useTranslation(); // Dočasně není potřeba, pokud neaplikujeme jazyk

  // useEffect(() => { // Dočasně zakomentováno - logika pro automatické nastavení jazyka
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
        <Component {...pageProps} key={router.asPath} />
        <Analytics />
        <SpeedInsights />
      </ThemeProvider>
    </SessionProvider>
  );
}

export default appWithTranslation(MyApp);
