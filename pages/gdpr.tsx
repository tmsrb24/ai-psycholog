import React from 'react';
import Layout from '../components/Layout';

const GDPRPage = () => {
  return (
    <Layout title="Zásady ochrany osobních údajů (GDPR) | AI Psycholog" description="Informace o zpracování osobních údajů a ochraně soukromí na AI Psycholog.">
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 dark:from-blue-900 dark:via-blue-800 dark:to-blue-700 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Zásady ochrany osobních údajů (GDPR)</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Vaše soukromí je pro nás prioritou. Zde se dozvíte, jak nakládáme s vašimi údaji.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md my-8">
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">1. Kdo jsme</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Jsme provozovatel online služby Psychollog.cz, která nabízí konverzaci s AI psychologickým chatbotem.
            <br />
            <strong>Správce údajů:</strong><br />
            Tomáš Srb<br />
            Přední 343/6, Praha 6, 161 00<br />
            IČO: 08217271<br />
            E-mail: <a href="mailto:privacy@psychollog.cz" className="text-blue-600 dark:text-blue-400 underline">privacy@psychollog.cz</a>
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">2. Jaké údaje zpracováváme a proč</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Vaše důvěra je pro nás zásadní. Tato služba je navržena tak, aby maximálně respektovala vaše soukromí.
            <strong> Neukládáme obsah vašich zpráv </strong> ani žádné citlivé osobní údaje bez vašeho výslovného souhlasu.
          </p>
          <ul className="list-disc list-inside mt-2 text-gray-600 dark:text-gray-300">
            <li>IP adresa – Zajištění bezpečnosti a ochrana proti zneužití</li>
            <li>Čas přístupu / typ zařízení – Zajištění kompatibility a provozu webu</li>
            <li>Anonymní statistiky – Vylepšování služby a výkonu</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">3. Právní základ zpracování</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Zpracování těchto údajů probíhá na základě oprávněného zájmu správce (provoz a bezpečnost služby)
            a v některých případech na základě vašeho souhlasu.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">4. Kdo má k údajům přístup</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Vaše data nesdílíme s žádnými třetími stranami a nevyužíváme je k reklamním účelům.
            Web běží na zabezpečené infrastruktuře poskytovatelů jako je Vercel a OpenAI/Google,
            s přístupem pouze v rozsahu nezbytném pro běh služby.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">5. Jak dlouho údaje uchováváme</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Technická data (např. IP adresa) se uchovávají po nezbytně nutnou dobu,
            většinou jen několik hodin až dní – výhradně pro detekci chyb a ochranu proti útokům.
            Obsah vašich zpráv nikdy neuchováváme.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">6. Jaká máte práva</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Máte právo:
          </p>
          <ul className="list-disc list-inside mt-2 text-gray-600 dark:text-gray-300">
            <li>Požádat o informace o tom, jaké údaje zpracováváme</li>
            <li>Požadovat opravu nebo výmaz údajů</li>
            <li>Vznést námitku proti zpracování</li>
            <li>Podat stížnost u Úřadu pro ochranu osobních údajů (www.uoou.cz)</li>
          </ul>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Pro jakékoliv dotazy nám napište na <a href="mailto:privacy@psychollog.cz" className="text-blue-600 dark:text-blue-400 underline">privacy@psychollog.cz</a>.
            Odpovíme rychle a lidsky.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">7. Závěrem</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Chápeme, že mluvit s někým o svých pocitech vyžaduje důvěru.
            Proto jsme naši službu vytvořili s respektem k vašemu soukromí.
            Nejsme dokonalí, ale děláme maximum pro to, aby byl Psychollog.cz bezpečný,
            anonymní a podpůrný prostor pro každého.
          </p>
        </section>
      </div>
    </Layout>
  );
};

export default GDPRPage;
