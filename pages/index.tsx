import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Layout from '../components/Layout';
import { FaRobot, FaComments, FaLock, FaChartLine, FaUserFriends, FaMoon, FaCheck, FaStar, FaUsers, FaCalendarAlt, FaFlask, FaTimes } from 'react-icons/fa';
import type { IconType } from 'react-icons';

interface Feature {
  text: string;
  included: boolean;
  bold?: boolean;
  icon?: IconType;
  tag?: string;
}

interface Plan {
  name: string;
  price: string;
  priceSuffix: string;
  description: string;
  borderColor: string;
  features: Feature[];
  buttonText: string;
  buttonLink: string;
  isRecommended?: boolean;
}

const HomePage = () => {
  const plans: Plan[] = [
    {
      name: 'Základní',
      price: 'Zdarma',
      priceSuffix: '',
      description: 'Ideální pro vyzkoušení služby',
      borderColor: 'border-gray-400',
      features: [
        { text: '5 zpráv denně', included: true },
        { text: 'Základní analýza nálady', included: true },
        { text: 'Základní témata konverzace', included: true },
        { text: 'Historie konverzací', included: false },
        { text: 'Přizpůsobení osobnosti asistenta', included: false },
        { text: 'RAG systém nové generace', included: false },
        { text: 'Prioritní podpora', included: false },
        { text: 'Rodinné sdílení', included: false },
        { text: 'Integrace s kalendářem', included: false },
        { text: 'Přístup k beta verzím', included: false },
      ],
      buttonText: 'Vyzkoušet zdarma',
      buttonLink: '/chat',
    },
    {
      name: 'Premium',
      price: '349 Kč',
      priceSuffix: '/měsíc',
      description: 'Pro pravidelnou psychologickou podporu',
      borderColor: 'border-blue-600',
      features: [
        { text: 'Neomezené zprávy', included: true },
        { text: 'Pokročilá analýza nálady', included: true },
        { text: 'Všechna témata konverzace', included: true },
        { text: 'Neomezená historie konverzací', included: true },
        { text: 'Přizpůsobení osobnosti asistenta', included: true },
        { text: 'RAG systém nové generace', included: true, tag: 'NOVINKA' },
        { text: 'Prioritní podpora', included: false },
        { text: 'Rodinné sdílení', included: false },
        { text: 'Integrace s kalendářem', included: false },
        { text: 'Přístup k beta verzím', included: false },
      ],
      buttonText: 'Vybrat Premium',
      buttonLink: '/pricing',
      isRecommended: true,
    },
    {
      name: 'Ultra',
      price: '549 Kč',
      priceSuffix: '/měsíc',
      description: 'Pro nejnáročnější uživatele a rodinné sdílení',
      borderColor: 'border-purple-600',
      features: [
        { text: 'Vše z Premium plánu', included: true, bold: true },
        { text: 'Prioritní podpora', included: true, icon: FaStar },
        { text: 'Rodinné sdílení (až 3 členové)', included: true, icon: FaUsers },
        { text: 'Integrace s kalendářem', included: true, icon: FaCalendarAlt },
        { text: 'Přístup k beta verzím', included: true, icon: FaFlask },
      ],
      buttonText: 'Vybrat Ultra',
      buttonLink: '/pricing',
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 dark:from-blue-900 dark:via-blue-800 dark:to-blue-700 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Psychologická podpora s pokročilou AI
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
            {/* Avatar container - shifted right on md screens */}
            <div className="md:w-1/2 flex justify-center md:justify-end md:pr-8 lg:pr-0"> 
              {/* Increased size of the main relative container for avatar and circles */}
              <div className="relative w-80 h-80 md:w-[26rem] md:h-[26rem]"> {/* Approx w-104 for md */}
                {/* Pulsating Aura Circles - adjusted insets for larger container */}
                <div className="absolute inset-0 bg-blue-400 dark:bg-blue-700 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '0s' }}></div>
                <div className="absolute inset-5 md:inset-6 bg-blue-300 dark:bg-blue-600 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                <div className="absolute inset-10 md:inset-12 bg-blue-200 dark:bg-blue-500 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                
                {/* Main Avatar Image - slightly smaller than container to fit inside circles */}
                <div className="absolute inset-0 flex items-center justify-center z-10 p-3 md:p-4"> {/* Added padding to ensure avatar is within the outer circle */}
                  <Image 
                    src="/images/hero-avatar.png" 
                    alt="AI Psycholog Avatar" 
                    width={320} // Approx w-80, smaller than md:w-[26rem]
                    height={320} // Approx h-80
                    className="object-contain"
                    priority 
                  />
                </div>

                {/* Pulsating V on chest - SVG Overlay */}
                <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                  <svg 
                    viewBox="0 0 100 100" 
                    className="w-full h-full opacity-75 animate-pulse" 
                    style={{ animationDelay: '0.45s' }} // Staggered animation
                  >
                    {/* Approximate path for the V-shape on the chest, adjust as needed */}
                    {/* Path: M(start left) L(center point) L(start right) */}
                    <path 
                      d="M38 62 L50 72 L62 62" // Example path, needs fine-tuning
                      stroke="rgba(255, 255, 255, 0.8)" // White with some transparency
                      strokeWidth="1.5" 
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
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
              Moderní řešení pro vaši psychickou pohodu s využitím nejnovějších technologií umělé inteligence a čerpá data z databází PubMed Central, Open Psychology Journal a PsyArXiv.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                Analýza nálady vám pomůže sledovat váš pokrok a motivovat vás.
              </p>
            </div>
          </div>
          
          <div className="mt-8">
            <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-6 transition-transform hover:scale-105 border-2 border-blue-500">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full w-14 h-14 flex items-center justify-center mr-4">
                  <FaRobot className="text-blue-600 dark:text-blue-300" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">RAG systém nové generace</h3>
                <div className="ml-3 inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-semibold px-2 py-1 rounded-full">
                  NOVINKA
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Náš AI asistent využívá architekturu typu Retrieval-Augmented Generation (RAG) – propojuje jazykový model s vlastní odbornou psychologickou databází. Díky tomu poskytuje přesné, kontextově přizpůsobené odpovědi v reálném čase, které vycházejí z ověřených poznatků a vaší situace.
              </p>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Dostupné cenové plány</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Vyberte si plán, který nejlépe vyhovuje vašim potřebám.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {plans.map((plan) => (
              <div 
                key={plan.name} 
                className={`bg-white dark:bg-gray-700 rounded-xl shadow-lg p-8 border-t-4 ${plan.borderColor} flex flex-col ${plan.isRecommended ? 'lg:scale-105 ring-2 ring-offset-2 ring-blue-500 dark:ring-blue-400' : ''} relative`}
              >
                {plan.isRecommended && (
                  <div className="absolute top-0 right-0 bg-blue-600 dark:bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-lg">
                    DOPORUČENO
                  </div>
                )}
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{plan.name}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 min-h-[3em]">{plan.description}</p>
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">{plan.price}</div>
                {plan.priceSuffix && <p className="text-md text-gray-500 dark:text-gray-400 mb-6">{plan.priceSuffix}</p>}
                
                <ul className="space-y-3 mb-8 flex-grow">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      {feature.included ? 
                        (feature.icon ? <feature.icon className="text-green-500 mr-2 mt-1 flex-shrink-0" /> : <FaCheck className="text-green-500 mr-2 mt-1 flex-shrink-0" />)
                        : <FaTimes className="text-red-500 mr-2 mt-1 flex-shrink-0" />
                      }
                      <span className={`${feature.included ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500 line-through'} ${feature.bold ? 'font-semibold' : ''}`}>
                        {feature.text}
                        {feature.tag && (
                          <span className="ml-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-semibold px-2 py-0.5 rounded-full">
                            {feature.tag}
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link href={plan.buttonLink} className={`block w-full text-center mt-auto ${
                    plan.name === 'Základní' ? 'bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100' : 
                    plan.borderColor === 'border-blue-600' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 
                    'bg-purple-600 hover:bg-purple-700 text-white'
                  } font-semibold py-3 px-6 rounded-lg transition-colors shadow-md`}
                >
                  {plan.buttonText}
                </Link>
              </div>
            ))}
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
