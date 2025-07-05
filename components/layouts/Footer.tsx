import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaGithub, FaTwitter, FaEnvelope, FaLanguage } from 'react-icons/fa';
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
    <footer className="bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm mt-auto border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link href="/" className="flex items-center space-x-3 mb-4">
              <Image
                src="/images/hero-avatar.png"
                alt={t('appName', 'Psychollog Logo')}
                width={32}
                height={32}
                className="h-8 w-auto rounded-full"
              />
              <span className="font-bold text-xl text-text-light dark:text-text-dark">Psychollog</span>
            </Link>
            <p className="text-text-light/80 dark:text-text-dark/80 text-sm">
              {t('footer.tagline', 'Moderní psychologická podpora s využitím umělé inteligence. Dostupná kdykoliv a kdekoliv.')}
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-text-light dark:text-text-dark uppercase tracking-wider mb-4">
              {t('footer.linksTitle', 'Odkazy')}
            </h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-text-light/80 hover:text-primary-light dark:text-text-dark/80 dark:hover:text-primary-dark">{t('navbar.home', 'Domů')}</Link></li>
              <li><Link href="/chat" className="text-text-light/80 hover:text-primary-light dark:text-text-dark/80 dark:hover:text-primary-dark">{t('navbar.chat', 'Chat')}</Link></li>
              <li><Link href="/pricing" className="text-text-light/80 hover:text-primary-light dark:text-text-dark/80 dark:hover:text-primary-dark">{t('navbar.pricing', 'Ceník')}</Link></li>
              <li><Link href="/gdpr" className="text-text-light/80 hover:text-primary-light dark:text-text-dark/80 dark:hover:text-primary-dark">{t('navbar.gdpr', 'GDPR')}</Link></li>
              <li><Link href="/kontakt" className="text-text-light/80 hover:text-primary-light dark:text-text-dark/80 dark:hover:text-primary-dark">{t('navbar.contact', 'Kontakt')}</Link></li>
              <li><Link href="/obchodni-podminky" className="text-text-light/80 hover:text-primary-light dark:text-text-dark/80 dark:hover:text-primary-dark">{t('footer.terms', 'Obchodní podmínky')}</Link></li>
              <li><Link href="/reklamacni-rad" className="text-text-light/80 hover:text-primary-light dark:text-text-dark/80 dark:hover:text-primary-dark">{t('footer.complaints', 'Reklamační řád')}</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-text-light dark:text-text-dark uppercase tracking-wider mb-4">
              {t('footer.contactTitle', 'Kontakt')}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center">
                <FaEnvelope className="text-text-light/60 dark:text-text-dark/60 mr-3" />
                <a href="mailto:info@psychollog.cz" className="text-text-light/80 hover:text-primary-light dark:text-text-dark/80 dark:hover:text-primary-dark">info@psychollog.cz</a>
              </li>
              <li className="flex items-center">
                <FaGithub className="text-text-light/60 dark:text-text-dark/60 mr-3" />
                <a href="https://github.com/tmsrb24/ai-psycholog" target="_blank" rel="noopener noreferrer" className="text-text-light/80 hover:text-primary-light dark:text-text-dark/80 dark:hover:text-primary-dark">{t('footer.github', 'GitHub')}</a>
              </li>
              <li className="flex items-center">
                <FaTwitter className="text-text-light/60 dark:text-text-dark/60 mr-3" />
                <a href="#" className="text-text-light/80 hover:text-primary-light dark:text-text-dark/80 dark:hover:text-primary-dark">{t('footer.twitter', 'Twitter')}</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 text-center space-y-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-text-light dark:text-text-dark mb-1">{t('footer.disclaimerTitle', 'Důležité upozornění:')}</h4>
              <p className="text-sm text-text-light/80 dark:text-text-dark/80 max-w-3xl mx-auto">
                {t('footer.disclaimerText', 'AI Psycholog není náhradou za profesionální psychologickou péči. Je to doplňkový nástroj pro podporu psychické pohody. V případě vážných problémů vždy doporučujeme vyhledat odbornou pomoc.')}
              </p>
            </div>
            <div>
              <p className="text-sm text-text-light/80 dark:text-text-dark/80 max-w-3xl mx-auto" dangerouslySetInnerHTML={{ __html: t('footer.crisisLineHtml', '<span class="font-semibold">🛟 Pokud jste v krizové situaci, zavolejte na <strong>116 123</strong> (Linka první psychické pomoci) nebo <strong>116 111</strong> (Linka bezpečí). Pomoc je anonymní a nonstop.</span>') }} />
            </div>
          </div>
          
          <p className="text-sm text-text-light/60 dark:text-text-dark/60 mt-6">
            © {currentYear} Psychollog.cz. Všechna práva vyhrazena.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
