import React, { useState } from 'react';
import Layout from '../components/Layout';
import { 
  FaLock, FaUserCheck, FaDatabase, FaEnvelopeOpenText, FaUserLock, 
  FaUserSlash, FaClipboardCheck, FaBalanceScale, FaShieldAlt,
  FaBook, FaShieldVirus
} from 'react-icons/fa';

const GDPRPage = () => {
  const [activeTab, setActiveTab] = useState<'gdpr' | 'security'>('security'); // Výchozí tab je nyní 'security'

  const securityPoints = [
    { text: "Šifrované spojení HTTPS (SSL certifikát od Let's Encrypt)", icon: <FaLock className="text-green-500" /> },
    { text: "Ověřené identity uživatelů pomocí OAuth (Google)", icon: <FaUserCheck className="text-blue-500" /> },
    { text: "Ochrana dat pomocí RLS na Supabase", icon: <FaDatabase className="text-purple-500" /> },
    { text: "Šifrované e-maily přes SendGrid", icon: <FaEnvelopeOpenText className="text-orange-500" /> },
    { text: "Zabezpečené API pomocí JWT", icon: <FaUserLock className="text-red-500" /> },
    { text: "Možnost mazání účtu a historie konverzací", icon: <FaUserSlash className="text-gray-500" /> },
    { text: "Pravidelný audit bezpečnostních hlaviček (HSTS, CSP atd.)", icon: <FaClipboardCheck className="text-indigo-500" /> },
    { text: "Plná shoda s GDPR (EU 2016/679)", icon: <FaBalanceScale className="text-teal-500" /> },
  ];

  const renderGDPRContent = () => (
    <div className="space-y-6">
      <h2 className="text-3xl font-semibold mb-6 text-center text-gray-900 dark:text-white">Zásady ochrany osobních údajů (GDPR)</h2>
      <section>
        <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">1. Kdo jsme</h3>
        <p className="text-gray-600 dark:text-gray-300">
          Provozovatelem webu Psychollog.cz je [DOPLNIT JMÉNO/FIRMU A KONTAKTNÍ ÚDAJE, IČO POKUD EXISTUJE].
        </p>
      </section>
      {/* ... (ostatní GDPR sekce zkopírované z předchozí verze) ... */}
      <section><h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">2. Jaké údaje zpracováváme a proč</h3><p className="text-gray-600 dark:text-gray-300">Vaše důvěra je pro nás zásadní. Tato služba je navržena tak, aby maximálně respektovala vaše soukromí.</p><ul className="list-disc list-inside mt-2 text-gray-600 dark:text-gray-300 space-y-1"><li><strong>Identifikační údaje (při přihlášení přes Google):</strong> Jméno, emailová adresa, profilový obrázek. Tyto údaje slouží k identifikaci vašeho účtu a personalizaci služby.</li><li><strong>Obsah konverzací (Chat):</strong> Pokud povolíte ukládání historie, obsah vašich konverzací s AI se ukládá do vaší zabezpečené databáze v Supabase, abyste se k nim mohli vracet.</li><li><strong>Zápisy v Deníku:</strong> Obsah vašich deníkových zápisů se ukládá do vaší zabezpečené databáze v Supabase.</li><li><strong>Uživatelská nastavení (Profil):</strong> Vaše preference pro fungování aplikace.</li><li><strong>Technické údaje:</strong> IP adresa, čas přístupu, typ zařízení – pro zajištění bezpečnosti, kompatibility a provozu webu, a pro anonymní statistiky k vylepšování služby.</li></ul></section>
      <section><h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">3. Právní základ zpracování</h3><p className="text-gray-600 dark:text-gray-300">Zpracování probíhá na základě:<ul className="list-disc list-inside mt-1"><li>Plnění smlouvy (poskytování služeb aplikace po vaší registraci).</li><li>Oprávněného zájmu správce (provoz a bezpečnost služby, analýza pro vylepšení).</li><li>Vašeho souhlasu (např. pro ukládání historie chatu, pokud je to volitelné).</li></ul></p></section>
      <section><h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">4. Kdo má k údajům přístup</h3><p className="text-gray-600 dark:text-gray-300">K vašim osobním údajům (jméno, email, obsah konverzací a deníku) máte přístup pouze vy. My jako provozovatelé k nim standardně nepřistupujeme, pokud to není nezbytně nutné pro technickou podporu na vaši žádost nebo řešení problémů. Data jsou uložena na zabezpečené infrastruktuře Supabase (využívající AWS/Google Cloud) a Vercel. Pro odesílání emailů využíváme SendGrid.</p></section>
      <section><h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">5. Jak dlouho údaje uchováváme</h3><p className="text-gray-600 dark:text-gray-300">Vaše profilové údaje, obsah konverzací (pokud je ukládání povoleno) a deníkové zápisy uchováváme po dobu existence vašeho účtu, nebo dokud je nesmažete. Technická data se uchovávají po nezbytně nutnou dobu.</p></section>
      <section><h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">6. Jaká máte práva</h3><p className="text-gray-600 dark:text-gray-300">Máte právo na přístup, opravu, výmaz, omezení zpracování, přenositelnost údajů a vznést námitku. Můžete také podat stížnost u Úřadu pro ochranu osobních údajů (www.uoou.cz). Pro uplatnění práv nás kontaktujte na <a href="mailto:privacy@psychollog.cz" className="text-blue-600 dark:text-blue-400 underline">privacy@psychollog.cz</a>.</p></section>
      <section><h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">7. Závěrem</h3><p className="text-gray-600 dark:text-gray-300">Chápeme, že mluvit s někým o svých pocitech vyžaduje důvěru. Děláme maximum pro to, aby byl Psychollog.cz bezpečný a diskrétní prostor.</p></section>
    </div>
  );

  const renderSecurityContent = () => (
    <div className="space-y-6">
      <h2 className="text-3xl font-semibold mb-6 text-center text-gray-900 dark:text-white">🔐 Zásady zabezpečení a ochrany dat</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        Psychollog.cz bere ochranu vašich dat vážně. Používáme následující technologie a postupy k zajištění bezpečnosti:
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
        Pokud máte jakékoli dotazy ohledně bezpečnosti, kontaktujte nás na: <a href="mailto:security@psychollog.cz" className="text-blue-600 dark:text-blue-400 underline">security@psychollog.cz</a>
      </p>
    </div>
  );

  return (
    <Layout title="GDPR & Zabezpečení | AI Psycholog" description="Informace o zpracování osobních údajů, ochraně soukromí a zabezpečení na AI Psycholog.">
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 dark:from-blue-900 dark:via-blue-800 dark:to-blue-700 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">GDPR & Zabezpečení</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Vaše soukromí a bezpečnost jsou pro nás prioritou. Zde se dozvíte, jak nakládáme s vašimi údaji a jak je chráníme.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          {/* Přidáno justify-center pro vycentrování záložek */}
          <nav className="-mb-px flex space-x-8 justify-center" aria-label="Tabs">
            {/* Pořadí záložek prohozeno, Zabezpečení první */}
            <button
              onClick={() => setActiveTab('security')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-base  {/* Zvětšen text na text-base */}
                ${activeTab === 'security'
                  ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-300'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
                }`}
            >
              <FaShieldAlt className="inline-block mr-2 mb-0.5" /> Zabezpečení
            </button>
            <button
              onClick={() => setActiveTab('gdpr')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-base  {/* Zvětšen text na text-base */}
                ${activeTab === 'gdpr'
                  ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-300'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
                }`}
            >
              <FaBook className="inline-block mr-2 mb-0.5" /> GDPR
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
