import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Layout from '../components/Layout';
import { FaRobot, FaComments, FaLock, FaChartLine, FaUserFriends, FaMoon, FaCheck, FaStar, FaUsers, FaCalendarAlt, FaFlask, FaTimes, FaUserMd, FaLightbulb, FaHandHoldingHeart, FaSeedling, FaUserShield } from 'react-icons/fa'; // Přidány nové ikony
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
        { text: 'Přístup k osobnímu deníku', included: false },
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
        { text: 'Přístup k osobnímu deníku', included: true },
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
        { text: 'Vše z Premium plánu', included: true, bold: true }, // Implicitně zahrnuje Deník
        { text: 'Prioritní podpora', included: true, icon: FaStar },
        { text: 'Rodinné sdílení (až 3 členové)', included: true, icon: FaUsers },
        { text: 'Integrace s kalendářem', included: true, icon: FaCalendarAlt },
        { text: 'Přístup k beta verzím', included: true, icon: FaFlask },
      ],
      buttonText: 'Vybrat Ultra',
      buttonLink: '/pricing',
    }
  ];

  const testimonials = [
    {
      name: 'Dr. Eva Novotná, PhD.',
      specialization: 'Kognitivně-behaviorální terapie (KBT)',
      quote: "Psychollog.cz představuje inovativní most k dostupnější duševní péči. Oceňuji jeho schopnost poskytnout okamžitou, daty podloženou podporu, která může být skvělým prvním krokem nebo doplňkem tradiční terapie.",
      avatar: '/images/psychologist-avatar.png' 
    },
    {
      name: 'Mgr. Petr Dvořák',
      specialization: 'Rodinná a párová terapie',
      quote: "V dnešní uspěchané době je klíčové mít nástroje, které pomáhají lidem reflektovat a pracovat na svých vztazích. Psychollog.cz nabízí diskrétní prostor pro první seznámení s psychologickými koncepty.",
      avatar: '/images/psychologist-avatar.png'
    },
    {
      name: 'MUDr. Jana Svobodová',
      specialization: 'Psychiatrie a psychosomatika',
      quote: "Propojení moderních technologií s ověřenými psychologickými přístupy, jaké vidíme u Psychollog.cz, má velký potenciál v destigmatizaci péče o duševní zdraví a v poskytování včasné intervence.",
      avatar: '/images/psychologist-avatar.png'
    }
  ];


  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 dark:from-blue-800 dark:via-blue-700 dark:to-blue-600 text-white py-24 md:py-28"> {/* Upraven padding a gradient */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> {/* max-w-7xl pro konzistenci */}
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-12 md:mb-0 text-center md:text-left">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight"> {/* Větší písmo, upraven margin a leading */}
                Psychologická podpora s pokročilou AI
              </h1>
              <p className="text-xl sm:text-2xl mb-10 text-blue-100 dark:text-blue-200"> {/* Větší písmo, upraven margin a barva */}
                Dostupná kdykoliv a kdekoliv. Získejte okamžitou podporu pro vaši psychickou pohodu.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6"> {/* Větší gap */}
                <Link href="/chat" className="btn bg-white text-blue-600 hover:bg-gray-100 font-semibold py-3 px-6 rounded-lg shadow-md transition-colors">
                  Vyzkoušet zdarma
                </Link>
                <Link href="/pricing" className="btn bg-blue-800 hover:bg-blue-900 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors">
                  Ceník
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center md:justify-end md:pr-8 lg:pr-0">
              {/* Zmenšení obrázku a kruhů na mobilu */}
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-[26rem] md:h-[26rem]">
                <div className="absolute inset-0 bg-blue-400 dark:bg-blue-700 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '0s' }}></div>
                <div className="absolute inset-3 sm:inset-5 md:inset-6 bg-blue-300 dark:bg-blue-600 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                <div className="absolute inset-6 sm:inset-10 md:inset-12 bg-blue-200 dark:bg-blue-500 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                <div className="absolute inset-0 flex items-center justify-center z-10 p-2 sm:p-3 md:p-4">
                  <Image 
                    src="/images/hero-avatar.png" 
                    alt="AI Psycholog Avatar" 
                    width={280} // Menší výchozí šířka
                    height={280} // Menší výchozí výška
                    className="object-contain"
                    priority 
                    sizes="(max-width: 640px) 256px, (max-width: 768px) 320px, 416px" // Pro next/image optimalizaci
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                  <svg 
                    viewBox="0 0 100 100" 
                    className="w-full h-full opacity-75 animate-pulse" 
                    style={{ animationDelay: '0.45s' }}
                  >
                    <path 
                      d="M38 62 L50 72 L62 62" 
                      stroke="rgba(255, 255, 255, 0.8)" 
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

      {/* Features Section (Proč AI Psycholog?) */}
      <section className="py-16 sm:py-20 bg-gray-50 dark:bg-gray-800"> {/* Větší padding */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> {/* max-w-7xl */}
          <div className="text-center mb-12 sm:mb-16"> {/* Větší margin */}
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-5">Proč AI Psycholog?</h2> {/* Větší písmo */}
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed"> {/* Přidáno leading-relaxed */}
              Malé rozhovory, které mohou změnit hodně.<br />
V prostoru, kde vás nikdo nesoudí a kde můžete mluvit tak, jak to právě cítíte.<br />
Psychollog je tu pro vás kdykoli – klidně jen na pár vět, nebo i na hlubší zamyšlení.<br />
Zastavte se. Popovídejte si. Ulevte si.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10"> {/* Větší gap */}
            <div className="bg-white dark:bg-gray-700 rounded-xl shadow-lg p-8 transition-transform hover:scale-105"> {/* Větší padding, rounded-xl, shadow-lg */}
              <div className="bg-blue-100 dark:bg-blue-800/30 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6"> {/* Větší ikona a margin, upraveno pozadí ikony */}
                <FaComments className="text-blue-500 dark:text-blue-300" size={30} /> {/* Upravena barva ikony */}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Okamžitá dostupnost</h3> {/* Větší mb */}
              <p className="text-gray-600 dark:text-gray-300 text-base"> {/* text-base pro konzistenci */}
                Žádné čekání na termín. AI Psycholog je k dispozici 24/7, kdykoliv potřebujete podporu.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-xl shadow-lg p-8 transition-transform hover:scale-105">
              <div className="bg-blue-100 dark:bg-blue-800/30 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <FaLock className="text-blue-500 dark:text-blue-300" size={30} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Naprostá diskrétnost</h3>
              <p className="text-gray-600 dark:text-gray-300 text-base">
                Vaše konverzace jsou soukromé a bezpečné. Žádné sdílení dat s třetími stranami.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-xl shadow-lg p-8 transition-transform hover:scale-105">
              <div className="bg-blue-100 dark:bg-blue-800/30 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <FaChartLine className="text-blue-500 dark:text-blue-300" size={30} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Sledování pokroku</h3>
              <p className="text-gray-600 dark:text-gray-300 text-base">
                Analýza nálady vám pomůže sledovat váš pokrok a motivovat vás.
              </p>
            </div>
          </div>
          <div className="mt-10 lg:mt-12"> {/* Větší margin */}
            <div className="bg-white dark:bg-gray-700 rounded-xl shadow-xl p-8 transition-transform hover:scale-105 border-2 border-blue-500 dark:border-blue-400"> {/* Větší padding, shadow-xl, upraven border */}
              <div className="flex flex-col sm:flex-row items-center mb-5"> {/* Větší mb, flex-col pro mobil */}
                <div className="bg-blue-100 dark:bg-blue-800/30 p-4 rounded-full w-16 h-16 flex items-center justify-center mr-0 sm:mr-5 mb-4 sm:mb-0 flex-shrink-0"> {/* Větší ikona, upraven margin */}
                  <FaRobot className="text-blue-500 dark:text-blue-300" size={30} />
                </div>
                <h3 className="text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white text-center sm:text-left">RAG systém nové generace</h3> {/* Větší písmo na lg */}
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

      {/* Testimonials Section */}
      <section className="py-16 sm:py-20 bg-white dark:bg-gray-900"> {/* Větší padding, konzistentní pozadí */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> {/* max-w-7xl */}
          <div className="text-center mb-12 sm:mb-16"> {/* Větší margin */}
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-5">Názory odborníků</h2> {/* Větší písmo */}
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed"> {/* Přidáno leading-relaxed */}
              Co o Psychollog.cz říkají profesionálové z oboru psychologie a psychiatrie.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10"> {/* Větší gap */}
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-700 p-8 rounded-xl shadow-xl text-center flex flex-col"> {/* Větší padding, rounded-xl, shadow-xl, flex-col */}
                <div className="w-28 h-28 rounded-full mx-auto mb-6 overflow-hidden relative bg-gray-200 dark:bg-gray-600 flex-shrink-0"> {/* Větší avatar a margin */}
                  <Image 
                    src={testimonial.avatar} 
                    alt={`Fotografie ${testimonial.name}`} 
                    layout="fill" 
                    objectFit="cover" 
                    className="rounded-full"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">{testimonial.name}</h3>
                <p className="text-sm text-blue-500 dark:text-blue-400 mb-4">{testimonial.specialization}</p> {/* Větší mb */}
                <p className="text-gray-600 dark:text-gray-300 text-base italic flex-grow">"{testimonial.quote}"</p> {/* text-base, flex-grow */}
              </div>
            ))}
          </div>
          <div className="mt-16 text-center"> {/* Větší margin */}
            <h3 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white mb-4">Proč je naše služba unikátní?</h3> {/* Větší písmo a mb */}
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed"> {/* Přidáno leading-relaxed */}
            Naše platforma Psychollog.cz je unikátní díky kombinaci pokročilé umělé inteligence, která čerpá z ověřených psychologických databází (PubMed Central, Open Psychology Journal, PsyArXiv), a vize spolupráce s odborníky z praxe. Tím zajišťujeme, že poskytovaná podpora je nejen okamžitě dostupná a diskrétní, ale také informačně hodnotná a založená na vědeckých poznatcích. Naším cílem je zpřístupnit kvalitní nástroje pro sebepoznání a duševní pohodu co nejširšímu okruhu lidí.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 sm:py-20 bg-gray-50 dark:bg-gray-800"> {/* Větší padding */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> {/* max-w-7xl */}
          <div className="text-center mb-12 sm:mb-16"> {/* Větší margin */}
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-5">Jak to funguje?</h2> {/* Větší písmo */}
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed"> {/* Přidáno leading-relaxed */}
              Jednoduché kroky k získání psychologické podpory s AI Psychologem.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10"> {/* Větší gap */}
            <div className="text-center bg-white dark:bg-gray-700 p-8 rounded-xl shadow-lg"> {/* Přidáno pozadí, padding, shadow */}
              <div className="bg-blue-100 dark:bg-blue-800/30 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6"> {/* Větší mb, upraveno pozadí */}
                <span className="text-3xl font-bold text-blue-500 dark:text-blue-300">1</span> {/* Větší písmo, upravena barva */}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Vytvořte si účet</h3> {/* Větší mb */}
              <p className="text-gray-600 dark:text-gray-300 text-base"> {/* text-base */}
                Registrace zabere jen pár vteřin. Můžete začít ihned s bezplatnou verzí.
              </p>
            </div>
            <div className="text-center bg-white dark:bg-gray-700 p-8 rounded-xl shadow-lg">
              <div className="bg-blue-100 dark:bg-blue-800/30 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-blue-500 dark:text-blue-300">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Začněte konverzaci</h3>
              <p className="text-gray-600 dark:text-gray-300 text-base">
                Sdílejte své myšlenky a pocity. AI Psycholog vám poskytne empatickou a podporující odpověď.
              </p>
            </div>
            <div className="text-center bg-white dark:bg-gray-700 p-8 rounded-xl shadow-lg">
              <div className="bg-blue-100 dark:bg-blue-800/30 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-blue-500 dark:text-blue-300">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Získejte podporu</h3>
              <p className="text-gray-600 dark:text-gray-300 text-base">
                Pravidelné konverzace vám pomohou lépe porozumět vašim emocím a najít strategie pro zvládání obtíží.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Proactive AI Assistant Section */}
      <section className="py-16 sm:py-20 bg-white dark:bg-gray-900"> {/* Větší padding, konzistentní pozadí */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> {/* max-w-7xl */}
          <div className="text-center mb-12 sm:mb-16"> {/* Větší margin */}
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-5">Náš AI Asistent Myslí Dopředu – Proaktivní Péče o Vaši Duši</h2> {/* Větší písmo */}
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed"> {/* Přidáno leading-relaxed */}
              Představte si podporu, která nejen reaguje, ale aktivně vám pomáhá na vaší cestě k duševní pohodě. Náš Proaktivní AI Asistent je navržen tak, aby se učil rozumět vašim potřebám. S vaším svolením citlivě analyzuje trendy ve vašich konverzacích a deníkových zápiscích.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 text-center"> {/* Větší gap, sm:grid-cols-2 */}
            <div className="flex flex-col items-center bg-gray-50 dark:bg-gray-800 p-6 rounded-xl shadow-lg"> {/* Přidáno pozadí, padding, shadow */}
              <div className="bg-blue-100 dark:bg-blue-800/30 p-4 rounded-full mb-6"> {/* Větší mb, upraveno pozadí */}
                <FaLightbulb className="text-blue-500 dark:text-blue-300" size={32} /> {/* Upravena barva */}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Personalizované Návrhy</h3> {/* Větší mb */}
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed"> {/* Přidáno leading-relaxed */}
                Relevantní témata k zamyšlení, deníkové výzvy nebo cvičení šitá na míru.
              </p>
            </div>
            <div className="flex flex-col items-center bg-gray-50 dark:bg-gray-800 p-6 rounded-xl shadow-lg">
              <div className="bg-blue-100 dark:bg-blue-800/30 p-4 rounded-full mb-6">
                <FaHandHoldingHeart className="text-blue-500 dark:text-blue-300" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Jemná Podpora</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                Pokud procházíte náročnějším obdobím, asistent vám citlivě nabídne rozhovor nebo připomene osvědčené techniky.
              </p>
            </div>
            <div className="flex flex-col items-center bg-gray-50 dark:bg-gray-800 p-6 rounded-xl shadow-lg">
              <div className="bg-blue-100 dark:bg-blue-800/30 p-4 rounded-full mb-6">
                <FaSeedling className="text-blue-500 dark:text-blue-300" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Podpora Růstu</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                Aktivně podporujeme vaši cestu k lepší pohodě relevantními nástroji a podněty k sebereflexi.
              </p>
            </div>
            <div className="flex flex-col items-center bg-gray-50 dark:bg-gray-800 p-6 rounded-xl shadow-lg">
              <div className="bg-blue-100 dark:bg-blue-800/30 p-4 rounded-full mb-6">
                <FaUserShield className="text-blue-500 dark:text-blue-300" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Vaše Soukromí</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                Vždy máte plnou kontrolu nad sdílením informací a využíváním proaktivních návrhů.
              </p>
            </div>
          </div>
           <p className="text-center text-md text-gray-500 dark:text-gray-400 mt-12 sm:mt-16"> {/* Větší margin */}
            Tato unikátní funkce vám pomáhá nezůstat na své starosti sami a aktivně pracovat na svém well-beingu.
          </p>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section className="py-16 sm:py-20 bg-gray-50 dark:bg-gray-800"> {/* Větší padding */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16"> {/* Větší margin */}
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-5">Dostupné cenové plány</h2> {/* Větší písmo */}
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed"> {/* Přidáno leading-relaxed */}
              Vyberte si plán, který nejlépe vyhovuje vašim potřebám.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {plans.map((plan) => (
              <div 
                key={plan.name} 
                className={`bg-white dark:bg-gray-700 rounded-2xl shadow-xl p-8 border-t-4 ${plan.borderColor} flex flex-col ${plan.isRecommended ? 'lg:scale-105 ring-2 ring-offset-4 ring-blue-500 dark:ring-blue-400 dark:ring-offset-gray-800' : ''} relative transition-transform hover:shadow-2xl`}
              >
                {plan.isRecommended && (
                  <div className="absolute -top-3 -right-3 bg-blue-500 dark:bg-blue-400 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg transform rotate-6">
                    DOPORUČENO
                  </div>
                )}
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{plan.name}</h3> {/* Větší mb */}
                <p className="text-gray-600 dark:text-gray-300 mb-8 min-h-[3em] text-base">{plan.description}</p> {/* Větší mb, text-base */}
                <div className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-2">{plan.price}</div> {/* Větší písmo na lg, větší mb */}
                {plan.priceSuffix && <p className="text-md text-gray-500 dark:text-gray-400 mb-8">{plan.priceSuffix}</p>} {/* Větší mb */}
                <ul className="space-y-4 mb-10 flex-grow"> {/* Větší space-y a mb */}
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-base"> {/* text-base */}
                      {feature.included ? 
                        (feature.icon ? <feature.icon className="text-green-500 dark:text-green-400 mr-3 mt-1 flex-shrink-0" /> : <FaCheck className="text-green-500 dark:text-green-400 mr-3 mt-1 flex-shrink-0" />) // Větší mr, upravena barva ikony
                        : <FaTimes className="text-red-500 dark:text-red-400 mr-3 mt-1 flex-shrink-0" />
                      }
                      <span className={`${feature.included ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500 line-through'} ${feature.bold ? 'font-semibold' : ''}`}>
                        {feature.text}
                        {feature.tag && (
                          <span className="ml-2 bg-blue-100 dark:bg-blue-800/50 text-blue-700 dark:text-blue-200 text-xs font-semibold px-2 py-0.5 rounded-full"> {/* Upraveno pozadí tagu */}
                            {feature.tag}
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link href={plan.buttonLink} className={`block w-full text-center mt-auto ${
                    plan.name === 'Základní' ? 'bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100' : 
                    plan.borderColor === 'border-blue-600' ? 'bg-blue-500 hover:bg-blue-600 text-white' : // Použita světlejší modrá pro konzistenci
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
      <section className="py-20 md:py-28 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 dark:from-blue-800 dark:via-blue-700 dark:to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight">Začněte svou cestu k lepší psychické pohodě ještě dnes</h2>
          <p className="text-xl sm:text-2xl mb-10 text-blue-100 dark:text-blue-200 max-w-3xl mx-auto">
            Vyzkoušejte AI Psychologa zdarma a objevte, jak vám může pomoci lépe porozumět vašim emocím a zvládat každodenní výzvy.
          </p>
          <Link href="/chat" className="btn bg-white text-blue-600 hover:bg-gray-100 font-semibold py-4 px-10 rounded-lg shadow-lg transition-colors text-xl transform hover:scale-105">
            Začít zdarma
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;
