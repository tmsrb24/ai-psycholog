import React from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import { FaCheck, FaTimes, FaQuestionCircle } from 'react-icons/fa';

const PricingPage = () => {
  return (
    <Layout title="Ceník | AI Psycholog" description="Cenové plány pro AI Psychologa - psychologickou podporu s umělou inteligencí.">
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 dark:from-blue-900 dark:via-blue-800 dark:to-blue-700 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Cenové plány</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Vyberte si plán, který nejlépe vyhovuje vašim potřebám. Začněte zdarma nebo získejte plný přístup s prémiovým plánem.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col lg:flex-row gap-8 justify-center">
          {/* Free Plan */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 border-t-4 border-gray-400 flex-1 max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Základní</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">Ideální pro vyzkoušení služby</p>
            <div className="text-4xl font-bold text-gray-900 dark:text-white mb-6">Zdarma</div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <FaCheck className="text-green-500 mr-2" />
                <span className="text-gray-600 dark:text-gray-300">5 zpráv denně</span>
              </li>
              <li className="flex items-center">
                <FaCheck className="text-green-500 mr-2" />
                <span className="text-gray-600 dark:text-gray-300">Základní analýza nálady</span>
              </li>
              <li className="flex items-center">
                <FaCheck className="text-green-500 mr-2" />
                <span className="text-gray-600 dark:text-gray-300">Základní témata konverzace</span>
              </li>
              <li className="flex items-center">
                <FaTimes className="text-red-500 mr-2" />
                <span className="text-gray-500 dark:text-gray-400">Historie konverzací</span>
              </li>
              <li className="flex items-center">
                <FaTimes className="text-red-500 mr-2" />
                <span className="text-gray-500 dark:text-gray-400">Přizpůsobení osobnosti asistenta</span>
              </li>
              <li className="flex items-center">
                <FaTimes className="text-red-500 mr-2" />
                <span className="text-gray-500 dark:text-gray-400">Prioritní podpora</span>
              </li>
            </ul>
            <Link href="/chat" className="block text-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors">
              Vyzkoušet zdarma
            </Link>
          </div>

          {/* Premium Plan */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 border-t-4 border-blue-600 flex-1 max-w-md transform lg:scale-105 relative">
            <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
              DOPORUČENO
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Premium</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">Pro pravidelnou psychologickou podporu</p>
            <div className="text-4xl font-bold text-gray-900 dark:text-white mb-6">400 Kč<span className="text-xl font-normal text-gray-600 dark:text-gray-400">/měsíc</span></div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <FaCheck className="text-green-500 mr-2" />
                <span className="text-gray-600 dark:text-gray-300">Neomezené zprávy</span>
              </li>
              <li className="flex items-center">
                <FaCheck className="text-green-500 mr-2" />
                <span className="text-gray-600 dark:text-gray-300">Pokročilá analýza nálady</span>
              </li>
              <li className="flex items-center">
                <FaCheck className="text-green-500 mr-2" />
                <span className="text-gray-600 dark:text-gray-300">Všechna témata konverzace</span>
              </li>
              <li className="flex items-center">
                <FaCheck className="text-green-500 mr-2" />
                <span className="text-gray-600 dark:text-gray-300">Neomezená historie konverzací</span>
              </li>
              <li className="flex items-center">
                <FaCheck className="text-green-500 mr-2" />
                <span className="text-gray-600 dark:text-gray-300">Přizpůsobení osobnosti asistenta</span>
              </li>
              <li className="flex items-center">
                <FaCheck className="text-green-500 mr-2" />
                <span className="text-gray-600 dark:text-gray-300">Prioritní podpora</span>
              </li>
              <li className="flex items-center">
                <FaCheck className="text-green-500 mr-2" />
                <span className="text-gray-600 dark:text-gray-300">Gamifikační prvky a odznaky</span>
              </li>
              <li className="flex items-center">
                <FaCheck className="text-green-500 mr-2" />
                <span className="text-gray-600 dark:text-gray-300 font-semibold">RAG systém nové generace</span>
                <span className="ml-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-semibold px-2 py-1 rounded-full">
                  NOVINKA
                </span>
              </li>
            </ul>
            <button className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
              Předplatit
            </button>
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
              Platební brána bude brzy k dispozici
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">Často kladené otázky</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <FaQuestionCircle className="text-blue-600 dark:text-blue-400 mr-2" />
                Jak funguje předplatné?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Předplatné je měsíční a automaticky se obnovuje. Můžete jej kdykoliv zrušit. Po zrušení máte přístup k prémiovým funkcím do konce aktuálního zúčtovacího období.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <FaQuestionCircle className="text-blue-600 dark:text-blue-400 mr-2" />
                Mohu změnit plán?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Ano, můžete kdykoliv přejít z bezplatného plánu na prémiový a naopak. Při přechodu na prémiový plán získáte okamžitý přístup ke všem funkcím.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <FaQuestionCircle className="text-blue-600 dark:text-blue-400 mr-2" />
                Je AI Psycholog náhradou za skutečného psychologa?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Ne, AI Psycholog není náhradou za profesionální psychologickou péči. Je to doplňkový nástroj pro podporu psychické pohody. V případě vážných problémů vždy doporučujeme vyhledat odbornou pomoc.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <FaQuestionCircle className="text-blue-600 dark:text-blue-400 mr-2" />
                Jak je zajištěna bezpečnost mých dat?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Vaše konverzace jsou šifrované a ukládají se pouze na vašem zařízení. Neukládáme žádná data na našich serverech, pokud si to výslovně nevyžádáte. Vaše soukromí je pro nás prioritou.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-2 border-blue-500">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <FaQuestionCircle className="text-blue-600 dark:text-blue-400 mr-2" />
                Co je RAG systém nové generace?
                <span className="ml-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-semibold px-2 py-1 rounded-full">
                  NOVINKA
                </span>
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                RAG systém nové generace - Náš AI asistent využívá architekturu typu Retrieval-Augmented Generation (RAG) – propojuje jazykový model s vlastní odbornou psychologickou databází. Díky tomu poskytuje přesné, kontextově přizpůsobené odpovědi v reálném čase, které vycházejí z ověřených poznatků a vaší situace.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-50 dark:bg-gray-900 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Stále si nejste jisti?</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Vyzkoušejte AI Psychologa zdarma a rozhodněte se později. Žádná platební karta není vyžadována.
          </p>
          <Link href="/chat" className="btn bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-colors text-lg">
            Začít zdarma
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default PricingPage;
