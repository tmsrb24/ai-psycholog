import React from 'react';
import Link from 'next/link';
import { FaGithub, FaTwitter, FaEnvelope, FaLanguage } from 'react-icons/fa'; // Přidána ikona FaLanguage
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const router = useRouter();
  const { t, i18n } = useTranslation('common'); // Použití namespace 'common'

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    router.push(router.pathname, router.asPath, { locale: lng });
  };

  const locales = router.locales || [];
  const currentLocale = router.locale || router.defaultLocale || 'cs';

  return (
    <footer className="bg-transparent shadow-inner mt-auto backdrop-blur-sm bg-white/70 dark:bg-gradient-dark-end/70 border-t border-accent dark:border-accent">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8"> {/* Přidán mb-8 pro oddělení od přepínače */}
          <div>
            <div className="flex items-center mb-4">
              <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white py-2 px-3 rounded-lg">
                <span className="font-bold text-xl">Psychollog.cz</span>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              {t('footer.tagline', 'Moderní psychologická podpora s využitím umělé inteligence. Dostupná kdykoliv a kdekoliv.')}
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 uppercase tracking-wider mb-4">
              {t('footer.linksTitle', 'Odkazy')}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-700 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-300">
                  {t('navbar.home', 'Domů')}
                </Link>
              </li>
              <li>
                <Link href="/chat" className="text-gray-700 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-300">
                  {t('navbar.chat', 'Chat')}
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-700 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-300">
                  {t('navbar.pricing', 'Ceník')}
                </Link>
              </li>
              <li>
                <Link href="/gdpr" className="text-gray-700 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-300">
                  {t('navbar.gdpr', 'GDPR')}
                </Link>
              </li>
              <li>
                <Link href="/kontakt" className="text-gray-700 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-300">
                  {t('navbar.contact', 'Kontakt')}
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 uppercase tracking-wider mb-4">
              {t('footer.contactTitle', 'Kontakt')}
            </h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <FaEnvelope className="text-gray-600 dark:text-gray-400 mr-2" />
                <a href="mailto:info@psychollog.cz" className="text-gray-700 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-300">
                  info@psychollog.cz
                </a>
              </li>
              <li className="flex items-center">
                <FaGithub className="text-gray-600 dark:text-gray-400 mr-2" />
                <a href="https://github.com/tmsrb24/ai-psycholog" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-300">
                  {t('footer.github', 'GitHub')}
                </a>
              </li>
              <li className="flex items-center">
                <FaTwitter className="text-gray-600 dark:text-gray-400 mr-2" />
                <a href="#" className="text-gray-700 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-300">
                  {t('footer.twitter', 'Twitter')}
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Disclaimer, Crisis Notice, and Copyright Section */}
        <div className="mt-12 pt-8 border-t border-gray-300 dark:border-gray-600 text-center space-y-6"> {/* Upraveny barvy borderu */}
          {/* Disclaimer and Crisis Notice Section */}
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">{t('footer.disclaimerTitle', 'Důležité upozornění:')}</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
                {t('footer.disclaimerText', 'AI Psycholog není náhradou za profesionální psychologickou péči. Je to doplňkový nástroj pro podporu psychické pohody. V případě vážných problémů vždy doporučujeme vyhledat odbornou pomoc.')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300 max-w-3xl mx-auto" dangerouslySetInnerHTML={{ __html: t('footer.crisisLineHtml', '<span class="font-semibold">🛟 Pokud jste v krizové situaci, zavolejte na <strong>116 123</strong> (Linka první psychické pomoci) nebo <strong>116 111</strong> (Linka bezpečí). Pomoc je anonymní a nonstop.</span>') }} />
            </div>
          </div>
          
          {/* Language Switcher - BUDE ODSTRANĚN */}
          {/* <div className="mt-6 flex justify-center items-center space-x-2">
            <FaLanguage className="text-gray-600 dark:text-gray-400 mr-2" size={20}/>
            {locales.map((locale) => (
              <button
                key={locale}
                onClick={() => changeLanguage(locale)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors
                  ${currentLocale === locale 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-slate-700'
                  }`}
              >
                {locale.toUpperCase()}
              </button>
            ))}
          </div> */}

          {/* Copyright */}
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-6">
            {t('footer.copyright', `© ${currentYear} AI Psycholog. Všechna práva vyhrazena.`)}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
