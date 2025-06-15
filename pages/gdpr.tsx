import React, { useState } from 'react';
import Layout from '../components/Layout';
import { 
  FaLock, FaUserCheck, FaDatabase, FaEnvelopeOpenText, FaUserLock, 
  FaUserSlash, FaClipboardCheck, FaBalanceScale, FaShieldAlt,
  FaBook, FaChevronDown, FaChevronUp
} from 'react-icons/fa';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps, InferGetStaticPropsType } from 'next';

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactElement;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ title, children, icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <h2>
        <button
          type="button"
          className="flex items-center justify-between w-full py-4 px-1 font-medium text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
        >
          <span className="flex items-center">
            {icon && <span className="mr-3 text-blue-500 dark:text-blue-400">{React.cloneElement(icon, { size: 20 })}</span>}
            {title}
          </span>
          {isOpen ? <FaChevronUp className="w-4 h-4" /> : <FaChevronDown className="w-4 h-4" />}
        </button>
      </h2>
      {isOpen && (
        <div className="py-4 px-1">
          <div className="text-gray-600 dark:text-gray-300 space-y-2">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

type PageProps = {
  // Přidejte další props, které vaše stránka může přijímat
}

const GDPRPage = (_props: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { t } = useTranslation(['gdpr', 'common']); // Načtení namespaces 'gdpr' a 'common'
  const [activeTab, setActiveTab] = useState<'gdpr' | 'security'>('security');

  const securityPoints = [
    { text: t('security.points.0', "Šifrované spojení HTTPS (SSL certifikát od Let's Encrypt)"), icon: <FaLock className="text-green-500" /> },
    { text: t('security.points.1', "Ověřené identity uživatelů pomocí OAuth (Google)"), icon: <FaUserCheck className="text-blue-500" /> },
    { text: t('security.points.2', "Ochrana dat pomocí RLS na Supabase"), icon: <FaDatabase className="text-purple-500" /> },
    { text: t('security.points.3', "Šifrované e-maily přes SendGrid"), icon: <FaEnvelopeOpenText className="text-orange-500" /> },
    { text: t('security.points.4', "Zabezpečené API pomocí JWT"), icon: <FaUserLock className="text-red-500" /> },
    { text: t('security.points.5', "Možnost mazání účtu a historie konverzací"), icon: <FaUserSlash className="text-gray-500" /> },
    { text: t('security.points.6', "Pravidelný audit bezpečnostních hlaviček (HSTS, CSP atd.)"), icon: <FaClipboardCheck className="text-indigo-500" /> },
    { text: t('security.points.7', "Plná shoda s GDPR (EU 2016/679)"), icon: <FaBalanceScale className="text-teal-500" /> },
  ];

  // Pro jednoduchost ponecháme gdprSections jako statický obsah, překlad by byl velmi komplexní
  // V reálné aplikaci by se i tento obsah načítal z překladových souborů, možná jako Markdown nebo HTML
  const gdprSections = [
    { title: t('gdprContent.sections.0.title', "1. Kdo jsme"), content: <p>{t('gdprContent.sections.0.content', "Provozovatelem webu Psychollog.cz je [DOPLNIT JMÉNO/FIRMU A KONTAKTNÍ ÚDAJE, IČO POKUD EXISTUJE].")}</p> },
    { title: t('gdprContent.sections.1.title', "2. Jaké údaje zpracováváme a proč"), content: <><p>{t('gdprContent.sections.1.paragraph1', "Vaše důvěra je pro nás zásadní. Tato služba je navržena tak, aby maximálně respektovala vaše soukromí.")}</p><ul className="list-disc list-inside mt-2 space-y-1"><li><strong>{t('gdprContent.sections.1.listItem1.title', "Identifikační údaje (při přihlášení přes Google):")}</strong> {t('gdprContent.sections.1.listItem1.text', "Jméno, emailová adresa, profilový obrázek. Tyto údaje slouží k identifikaci vašeho účtu a personalizaci služby.")}</li><li><strong>{t('gdprContent.sections.1.listItem2.title', "Obsah konverzací (Chat):")}</strong> {t('gdprContent.sections.1.listItem2.text', "Pokud povolíte ukládání historie, obsah vašich konverzací s AI se ukládá do vaší zabezpečené databáze v Supabase, abyste se k nim mohli vracet.")}</li><li><strong>{t('gdprContent.sections.1.listItem3.title', "Zápisy v Deníku:")}</strong> {t('gdprContent.sections.1.listItem3.text', "Obsah vašich deníkových zápisů se ukládá do vaší zabezpečené databáze v Supabase.")}</li><li><strong>{t('gdprContent.sections.1.listItem4.title', "Uživatelská nastavení (Profil):")}</strong> {t('gdprContent.sections.1.listItem4.text', "Vaše preference pro fungování aplikace.")}</li><li><strong>{t('gdprContent.sections.1.listItem5.title', "Technické údaje:")}</strong> {t('gdprContent.sections.1.listItem5.text', "IP adresa, čas přístupu, typ zařízení – pro zajištění bezpečnosti, kompatibility a provozu webu, a pro anonymní statistiky k vylepšování služby.")}</li></ul></> },
    { title: t('gdprContent.sections.2.title', "3. Právní základ zpracování"), content: <><p>{t('gdprContent.sections.2.paragraph1', "Zpracování probíhá na základě:")}</p><ul className="list-disc list-inside mt-1"><li>{t('gdprContent.sections.2.listItem1', "Plnění smlouvy (poskytování služeb aplikace po vaší registraci).")}</li><li>{t('gdprContent.sections.2.listItem2', "Oprávněného zájmu správce (provoz a bezpečnost služby, analýza pro vylepšení).")}</li><li>{t('gdprContent.sections.2.listItem3', "Vašeho souhlasu (např. pro ukládání historie chatu, pokud je to volitelné).")}</li></ul></> },
    { title: t('gdprContent.sections.3.title', "4. Kdo má k údajům přístup"), content: <p>{t('gdprContent.sections.3.content', "K vašim osobním údajům (jméno, email, obsah konverzací a deníku) máte přístup pouze vy. My jako provozovatelé k nim standardně nepřistupujeme, pokud to není nezbytně nutné pro technickou podporu na vaši žádost nebo řešení problémů. Data jsou uložena na zabezpečené infrastruktuře Supabase (využívající AWS/Google Cloud) a Vercel. Pro odesílání emailů využíváme SendGrid.")}</p> },
    { title: t('gdprContent.sections.4.title', "5. Jak dlouho údaje uchováváme"), content: <p>{t('gdprContent.sections.4.content', "Vaše profilové údaje, obsah konverzací (pokud je ukládání povoleno) a deníkové zápisy uchováváme po dobu existence vašeho účtu, nebo dokud je nesmažete. Technická data se uchovávají po nezbytně nutnou dobu.")}</p> },
    { title: t('gdprContent.sections.5.title', "6. Jaká máte práva"), content: <><p>{t('gdprContent.sections.5.paragraph1', "Máte právo na přístup, opravu, výmaz, omezení zpracování, přenositelnost údajů a vznést námitku. Můžete také podat stížnost u Úřadu pro ochranu osobních údajů (www.uoou.cz). Pro uplatnění práv nás kontaktujte na")} <a href="mailto:privacy@psychollog.cz" className="text-blue-600 dark:text-blue-400 underline">privacy@psychollog.cz</a>.</p></> },
    { title: t('gdprContent.sections.6.title', "7. Závěrem"), content: <p>{t('gdprContent.sections.6.content', "Chápeme, že mluvit s někým o svých pocitech vyžaduje důvěru. Děláme maximum pro to, aby byl Psychollog.cz bezpečný a diskrétní prostor.")}</p> },
  ];


  const renderGDPRContent = () => (
    <div className="space-y-6">
      <h2 className="text-3xl font-semibold mb-6 text-center text-gray-900 dark:text-white">{t('gdprContent.mainTitle', 'Zásady ochrany osobních údajů (GDPR)')}</h2>
      {/* Desktop: plný text */}
      <div className="hidden md:block space-y-6">
        {gdprSections.map((section, index) => ( // Přidán index pro klíče překladů
          <section key={section.title}>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{section.title}</h3>
            <div className="text-gray-600 dark:text-gray-300">{section.content}</div>
          </section>
        ))}
      </div>
      {/* Mobile: accordion */}
      <div className="md:hidden">
        {gdprSections.map((section, index) => ( // Přidán index pro klíče překladů
          <AccordionItem key={section.title} title={section.title}>
            {section.content}
          </AccordionItem>
        ))}
      </div>
    </div>
  );

  const renderSecurityContent = () => (
    <div className="space-y-6">
      <h2 className="text-3xl font-semibold mb-6 text-center text-gray-900 dark:text-white">{t('security.mainTitle', '🔐 Zásady zabezpečení a ochrany dat')}</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        {t('security.intro', 'Psychollog.cz bere ochranu vašich dat vážně. Používáme následující technologie a postupy k zajištění bezpečnosti:')}
      </p>
      <ul className="space-y-3">
        {securityPoints.map((point, index) => (
          <li key={index} className="flex items-start">
            <span className="flex-shrink-0 w-6 h-6 mr-3 mt-1">{point.icon}</span>
            <span className="text-gray-700 dark:text-gray-300">{point.text}</span>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
        {t('security.contactPrefix', 'Pokud máte jakékoli dotazy ohledně bezpečnosti, kontaktujte nás na:')} <a href="mailto:security@psychollog.cz" className="text-blue-600 dark:text-blue-400 underline">security@psychollog.cz</a>
      </p>
    </div>
  );

  return (
    <Layout title={t('pageTitle', 'GDPR & Zabezpečení | AI Psycholog')} description={t('pageDescription', 'Informace o zpracování osobních údajů, ochraně soukromí a zabezpečení na AI Psycholog.')}>
      <div className="bg-hero-gradient-dark text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('header.title', 'GDPR & Zabezpečení')}</h1>
          <p className="text-xl max-w-3xl mx-auto">
            {t('header.subtitle', 'Vaše soukromí a bezpečnost jsou pro nás prioritou. Zde se dozvíte, jak nakládáme s vašimi údaji a jak je chráníme.')}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 justify-center" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('security')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-base
                ${activeTab === 'security'
                  ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-300'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
                }`}
            >
              <FaShieldAlt className="inline-block mr-2 mb-0.5" /> {t('tabs.security', 'Zabezpečení')}
            </button>
            <button
              onClick={() => setActiveTab('gdpr')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-base
                ${activeTab === 'gdpr'
                  ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-300'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
                }`}
            >
              <FaBook className="inline-block mr-2 mb-0.5" /> {t('tabs.gdpr', 'GDPR')}
            </button>
          </nav>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
          <div className="p-6 md:p-8">
            {activeTab === 'gdpr' && renderGDPRContent()}
            {activeTab === 'security' && renderSecurityContent()}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default GDPRPage;

export const getStaticProps: GetStaticProps<PageProps> = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? 'cs', ['gdpr', 'common'])),
  },
});
