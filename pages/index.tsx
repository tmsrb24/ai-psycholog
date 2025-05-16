import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Layout from '../components/Layout';
import { FaRobot, FaComments, FaLock, FaChartLine, FaUserFriends, FaMoon, FaCheck } from 'react-icons/fa';

const HomePage = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 dark:from-blue-900 dark:via-blue-800 dark:to-blue-700 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Psychologická podpora s umělou inteligencí
              </h1>
              <p className="text-xl mb-8">
                Dostupná kdykoliv a kdekoliv. Získejte okamžitou podporu pro vaši psychickou pohodu.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/chat" className="btn bg-white text-blue-600 hover:bg-gray-100 font-semibold py-3 px-6 rounded-lg shadow-md transition-colors">
                  Vyzkoušet zdarma
                </Link>
                <Link href="/pricing" className="btn bg-blue-800 hover:bg-blue-900 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors">
                  Ceník
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-72 h-72 md:w-96 md:h-96">
                <div className="absolute inset-0 bg-blue-400 dark:bg-blue-700 rounded-full opacity-20 animate-pulse"></div>
                <div className="absolute inset-4 bg-blue-300 dark:bg-blue-600 rounded-full opacity-20 animate-pulse animation-delay-300"></div>
                <div className="absolute inset-8 bg-blue-200 dark:bg-blue-500 rounded-full opacity-20 animate-pulse animation-delay-600"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <FaRobot className="text-white" size={80} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Proč AI Psycholog?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Moderní řešení pro vaši psychickou pohodu s využitím nejnovějších technologií umělé inteligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-6 transition-transform hover:scale-105">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <FaComments className="text-blue-600 dark:text-blue-300" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Okamžitá dostupnost</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Žádné čekání na termín. AI Psycholog je k dispozici 24/7, kdykoliv potřebujete podporu.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-6 transition-transform hover:scale-105">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <FaLock className="text-blue-600 dark:text-blue-300" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Naprostá diskrétnost</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Vaše konverzace jsou soukromé a bezpečné. Žádné sdílení dat s třetími stranami.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-6 transition-transform hover:scale-105">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <FaChartLine className="text-blue-600 dark:text-blue-300" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Sledování pokroku</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Analýza nálady a gamifikační prvky vám pomohou sledovat váš pokrok a motivovat vás.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-6 transition-transform hover:scale-105 border-2 border-blue-500">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <FaRobot className="text-blue-600 dark:text-blue-300" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Pokročilá znalostní báze</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Náš AI asistent využívá rozsáhlou databázi odborných psychologických znalostí pro přesné a fundované odpovědi na vaše dotazy.
              </p>
              <div className="mt-2 inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-semibold px-2 py-1 rounded-full">
                NOVINKA
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Jak to funguje?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Jednoduché kroky k získání psychologické podpory s AI Psychologem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-300">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Vytvořte si účet</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Registrace zabere jen pár vteřin. Můžete začít ihned s bezplatnou verzí.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-300">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Začněte konverzaci</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Sdílejte své myšlenky a pocity. AI Psycholog vám poskytne empatickou a podporující odpověď.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-300">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Získejte podporu</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Pravidelné konverzace vám pomohou lépe porozumět vašim emocím a najít strategie pro zvládání obtíží.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Dostupné cenové plány</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Vyberte si plán, který nejlépe vyhovuje vašim potřebám.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-8 justify-center">
            <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-8 border-t-4 border-gray-400 flex-1 max-w-md">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Základní</h3>
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
                  <span className="text-gray-600 dark:text-gray-300">Bez historie konverzací</span>
                </li>
              </ul>
              <Link href="/chat" className="block text-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors">
                Vyzkoušet zdarma
              </Link>
            </div>

            <div className="bg-white dark:bg-gray-700 rounded-lg shadow-xl p-8 border-t-4 border-blue-600 flex-1 max-w-md transform scale-105">
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                DOPORUČENO
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Premium</h3>
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
              </ul>
              <Link href="/pricing" className="block text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                Vybrat plán
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 dark:from-blue-900 dark:via-blue-800 dark:to-blue-700 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Začněte svou cestu k lepší psychické pohodě ještě dnes</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Vyzkoušejte AI Psychologa zdarma a objevte, jak vám může pomoci lépe porozumět vašim emocím a zvládat každodenní výzvy.
          </p>
          <Link href="/chat" className="btn bg-white text-blue-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg shadow-md transition-colors text-lg">
            Začít zdarma
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;
