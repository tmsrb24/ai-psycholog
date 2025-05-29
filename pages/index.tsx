import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Layout from '../components/Layout';
import { FaRobot, FaComments, FaLock, FaChartLine, FaUserFriends, FaMoon, FaCheck, FaStar, FaUsers, FaCalendarAlt, FaFlask, FaTimes, FaUserMd, FaLightbulb, FaHandHoldingHeart, FaSeedling, FaUserShield } from 'react-icons/fa';
import type { IconType } from 'react-icons';
import { motion } from 'framer-motion'; // Import Framer Motion

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
      {/* Hero Section - tuto sekci nebudeme animovat při skrolování, je vidět hned */}
      <section className="bg-hero-gradient-light dark:bg-hero-gradient-dark text-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0 text-center md:text-left">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4"> {/* Menší text na mobilu */}
                Psychologická podpora s pokročilou AI
              </h1>
              <p className="text-lg sm:text-xl mb-8"> {/* Menší text na mobilu */}
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
      <motion.section 
        className="py-12 sm:py-16 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-xl my-8 mx-auto max-w-7xl shadow-xl"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Proč AI Psycholog?</h2>
            <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto"> {/* Upravena barva textu pro kontrast */}
              Malé rozhovory, které mohou změnit hodně.<br />
V prostoru, kde vás nikdo nesoudí a kde můžete mluvit tak, jak to právě cítíte.<br />
Psychollog je tu pro vás kdykoli – klidně jen na pár vět, nebo i na hlubší zamyšlení.<br />
Zastavte se. Popovídejte si. Ulevte si.
            </p>
          </div>
          {/* Stávající features (Okamžitá dostupnost, atd.) zůstávají zde, ale pro přehlednost je vynechávám z tohoto diffu */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature Card 1 */}
            <div className="bg-white/70 dark:bg-slate-700/70 backdrop-blur-sm rounded-lg shadow-lg p-6 transition-all duration-300 ease-in-out hover:shadow-2xl border-2 border-transparent hover:border-blue-400 dark:hover:border-blue-500"> {/* Vrácen hover rámeček */}
              <div className="bg-blue-100 dark:bg-blue-800/50 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4"> {/* Odstraněn trvalý rámeček z kolečka */}
                <FaComments className="text-blue-600 dark:text-blue-300" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Okamžitá dostupnost</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Žádné čekání na termín. AI Psycholog je k dispozici 24/7, kdykoliv potřebujete podporu.
              </p>
            </div>
            {/* Feature Card 2 */}
            <div className="bg-white/70 dark:bg-slate-700/70 backdrop-blur-sm rounded-lg shadow-lg p-6 transition-all duration-300 ease-in-out hover:shadow-2xl border-2 border-transparent hover:border-blue-400 dark:hover:border-blue-500"> {/* Vrácen hover rámeček */}
              <div className="bg-blue-100 dark:bg-blue-800/50 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4"> {/* Odstraněn trvalý rámeček z kolečka */}
                <FaLock className="text-blue-600 dark:text-blue-300" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Naprostá diskrétnost</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Vaše konverzace jsou soukromé a bezpečné. Žádné sdílení dat s třetími stranami.
              </p>
            </div>
            {/* Feature Card 3 */}
            <div className="bg-white/70 dark:bg-slate-700/70 backdrop-blur-sm rounded-lg shadow-lg p-6 transition-all duration-300 ease-in-out hover:shadow-2xl border-2 border-transparent hover:border-blue-400 dark:hover:border-blue-500"> {/* Vrácen hover rámeček */}
              <div className="bg-blue-100 dark:bg-blue-800/50 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4"> {/* Odstraněn trvalý rámeček z kolečka */}
                <FaChartLine className="text-blue-600 dark:text-blue-300" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Sledování pokroku</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Analýza nálady vám pomůže sledovat váš pokrok a motivovat vás.
              </p>
            </div>
          </div>
          <div className="mt-8">
            {/* Karta RAG systému - ponecháme výraznější, ale sjednocujeme stín a hover */}
            <div className="bg-white/70 dark:bg-slate-700/70 backdrop-blur-md rounded-lg shadow-xl p-6 transition-all duration-300 ease-in-out hover:shadow-2xl border-2 border-blue-500 dark:border-blue-400"> {/* Odstraněn hover:scale-105 */}
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 dark:bg-blue-800/50 p-3 rounded-full w-14 h-14 flex items-center justify-center mr-4"> {/* Rámeček zde nebyl, ponecháno */}
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
      </motion.section>

      {/* Testimonials Section - NOVÁ SEKCE */}
      <motion.section 
        className="py-16 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-xl my-8 mx-auto max-w-7xl shadow-xl"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Názory odborníků</h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto"> {/* Upravena barva textu */}
              Co o Psychollog.cz říkají profesionálové z oboru psychologie a psychiatrie.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-100/70 dark:bg-slate-700/70 backdrop-blur-sm p-6 rounded-lg shadow-lg text-center transition-all duration-300 ease-in-out hover:shadow-2xl border-2 border-transparent hover:border-blue-400 dark:hover:border-blue-500"> {/* Odstraněn hover:scale-105, upraven border */}
                <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden relative bg-gray-200 dark:bg-gray-600"> {/* Odstraněn trvalý rámeček */}
                  <Image 
                    src={testimonial.avatar} 
                    alt={`Fotografie ${testimonial.name}`} 
                    layout="fill" 
                    objectFit="cover" 
                    className="rounded-full"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">{testimonial.name}</h3>
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-3">{testimonial.specialization}</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm italic">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">Proč je naše služba unikátní?</h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
            Naše platforma Psychollog.cz je unikátní díky kombinaci pokročilé umělé inteligence, která čerpá z ověřených psychologických databází (PubMed Central, Open Psychology Journal, PsyArXiv), a vize spolupráce s odborníky z praxe. Tím zajišťujeme, že poskytovaná podpora je nejen okamžitě dostupná a diskrétní, ale také informačně hodnotná a založená na vědeckých poznatcích. Naším cílem je zpřístupnit kvalitní nástroje pro sebepoznání a duševní pohodu co nejširšímu okruhu lidí.
            </p>
          </div>
        </div>
      </motion.section>

      {/* How It Works Section */}
      <motion.section 
        className="py-16 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-xl my-8 mx-auto max-w-7xl shadow-xl"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Jak to funguje?</h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto"> {/* Upravena barva textu */}
              Jednoduché kroky k získání psychologické podpory s AI Psychologem.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Krok 1 */}
            <div className="text-center p-4 bg-white/30 dark:bg-slate-700/30 backdrop-blur-sm rounded-lg shadow-md transition-all duration-300 ease-in-out hover:shadow-xl border-2 border-blue-300 dark:border-blue-500"> {/* Trvalý rámeček pro kartu */}
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-800/50"> {/* Odstraněn trvalý rámeček z kolečka */}
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-300">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Vytvořte si účet</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Registrace zabere jen pár vteřin. Můžete začít ihned s bezplatnou verzí.
              </p>
            </div>
            {/* Krok 2 */}
            <div className="text-center p-4 bg-white/30 dark:bg-slate-700/30 backdrop-blur-sm rounded-lg shadow-md transition-all duration-300 ease-in-out hover:shadow-xl border-2 border-blue-300 dark:border-blue-500"> {/* Trvalý rámeček pro kartu */}
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-800/50"> {/* Odstraněn trvalý rámeček z kolečka */}
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-300">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Začněte konverzaci</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Sdílejte své myšlenky a pocity. AI Psycholog vám poskytne empatickou a podporující odpověď.
              </p>
            </div>
            {/* Krok 3 */}
            <div className="text-center p-4 bg-white/30 dark:bg-slate-700/30 backdrop-blur-sm rounded-lg shadow-md transition-all duration-300 ease-in-out hover:shadow-xl border-2 border-blue-300 dark:border-blue-500"> {/* Trvalý rámeček pro kartu */}
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-800/50"> {/* Odstraněn trvalý rámeček z kolečka */}
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-300">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Získejte podporu</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Pravidelné konverzace vám pomohou lépe porozumět vašim emocím a najít strategie pro zvládání obtíží.
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Proactive AI Assistant Section - NOVÁ SEKCE */}
      <motion.section 
        className="py-16 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-xl my-8 mx-auto max-w-7xl shadow-xl"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Náš AI Asistent Myslí Dopředu – Proaktivní Péče o Vaši Duši</h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto"> {/* Upravena barva textu */}
              Představte si podporu, která nejen reaguje, ale aktivně vám pomáhá na vaší cestě k duševní pohodě. Náš Proaktivní AI Asistent je navržen tak, aby se učil rozumět vašim potřebám. S vaším svolením citlivě analyzuje trendy ve vašich konverzacích a deníkových zápiscích.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div className="flex flex-col items-center p-4 bg-white/30 dark:bg-slate-700/30 backdrop-blur-sm rounded-lg shadow-md transition-all duration-300 ease-in-out hover:shadow-xl border-2 border-transparent hover:border-blue-400 dark:hover:border-blue-500"> {/* Odstraněn hover:scale-105, upraven border */}
              <div className="bg-blue-100 dark:bg-blue-800/50 p-4 rounded-full mb-4"> {/* Odstraněn trvalý rámeček */}
                <FaLightbulb className="text-blue-600 dark:text-blue-300" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Personalizované Návrhy</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Relevantní témata k zamyšlení, deníkové výzvy nebo cvičení šitá na míru.
              </p>
            </div>
            <div className="flex flex-col items-center p-4 bg-white/30 dark:bg-slate-700/30 backdrop-blur-sm rounded-lg shadow-md transition-all duration-300 ease-in-out hover:shadow-xl border-2 border-transparent hover:border-blue-400 dark:hover:border-blue-500"> {/* Odstraněn hover:scale-105, upraven border */}
              <div className="bg-blue-100 dark:bg-blue-800/50 p-4 rounded-full mb-4"> {/* Odstraněn trvalý rámeček */}
                <FaHandHoldingHeart className="text-blue-600 dark:text-blue-300" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Jemná Podpora</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Pokud procházíte náročnějším obdobím, asistent vám citlivě nabídne rozhovor nebo připomene osvědčené techniky.
              </p>
            </div>
            <div className="flex flex-col items-center p-4 bg-white/30 dark:bg-slate-700/30 backdrop-blur-sm rounded-lg shadow-md transition-all duration-300 ease-in-out hover:shadow-xl border-2 border-transparent hover:border-blue-400 dark:hover:border-blue-500"> {/* Odstraněn hover:scale-105, upraven border */}
              <div className="bg-blue-100 dark:bg-blue-800/50 p-4 rounded-full mb-4"> {/* Odstraněn trvalý rámeček */}
                <FaSeedling className="text-blue-600 dark:text-blue-300" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Podpora Růstu</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Aktivně podporujeme vaši cestu k lepší pohodě relevantními nástroji a podněty k sebereflexi.
              </p>
            </div>
            <div className="flex flex-col items-center p-4 bg-white/30 dark:bg-slate-700/30 backdrop-blur-sm rounded-lg shadow-md transition-all duration-300 ease-in-out hover:shadow-xl border-2 border-transparent hover:border-blue-400 dark:hover:border-blue-500"> {/* Odstraněn hover:scale-105, upraven border */}
              <div className="bg-blue-100 dark:bg-blue-800/50 p-4 rounded-full mb-4"> {/* Odstraněn trvalý rámeček */}
                <FaUserShield className="text-blue-600 dark:text-blue-300" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Vaše Soukromí</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Vždy máte plnou kontrolu nad sdílením informací a využíváním proaktivních návrhů.
              </p>
            </div>
          </div>
           <p className="text-center text-md text-gray-500 dark:text-gray-400 mt-10">
            Tato unikátní funkce vám pomáhá nezůstat na své starosti sami a aktivně pracovat na svém well-beingu.
          </p>
        </div>
      </motion.section>

      {/* Pricing Preview Section */}
      <motion.section 
        className="py-16 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-xl my-8 mx-auto max-w-7xl shadow-xl"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Dostupné cenové plány</h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto"> {/* Upravena barva textu */}
              Vyberte si plán, který nejlépe vyhovuje vašim potřebám.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {plans.map((plan) => (
              <div 
                key={plan.name} 
                className={`bg-white dark:bg-gray-700 rounded-xl shadow-lg p-8 border-t-4 ${plan.borderColor} flex flex-col ${plan.isRecommended ? 'lg:scale-105 ring-2 ring-offset-2 ring-blue-500 dark:ring-blue-400' : 'hover:shadow-xl hover:lg:scale-[1.02] transition-all duration-300 ease-in-out'} relative`}
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
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        className="py-16 bg-cta-gradient-light dark:bg-cta-gradient-dark text-white"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Začněte svou cestu k lepší psychické pohodě ještě dnes</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Vyzkoušejte AI Psychologa zdarma a objevte, jak vám může pomoci lépe porozumět vašim emocím a zvládat každodenní výzvy.
          </p>
          <Link href="/chat" className="btn bg-white text-blue-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg shadow-md transition-colors text-lg">
            Začít zdarma
          </Link>
        </div>
      </motion.section> {/* Chybějící uzavírací tag pro motion.section z Pricing Preview byl zde, ale CTA potřebuje vlastní */}
    </Layout>
  );
};

export default HomePage;

</final_file_content>

IMPORTANT: For any future changes to this file, use the final_file_content shown above as your reference. This content reflects the current state of the file, including any auto-formatting (e.g., if you used single quotes but the formatter converted them to double quotes). Always base your SEARCH/REPLACE operations on this final version to ensure accuracy.

<environment_details>
# VSCode Visible Files
ai-psycholog/pages/index.tsx

# VSCode Open Tabs
ai-psycholog/pages/admin/users.tsx
ai-psycholog/components/UserProfile.tsx
ai-psycholog/lib/supabaseClient.ts
ai-psycholog/pages/api/widget-chat.ts
ai-psycholog/components/WidgetChatWindow.tsx
ai-psycholog/components/Layout.tsx
ai-psycholog/components/WidgetChatButton.tsx
ai-psycholog/components/ThemeProvider.tsx
ai-psycholog/components/ChatMessage.tsx
ai-psycholog/types.ts
ai-psycholog/pages/api/diary/index.ts
ai-psycholog/pages/api/chat.ts
ai-psycholog/pages/api/user-insights.ts
ai-psycholog/pages/api/cron/process-user-insights.ts
ai-psycholog/vercel.json
ai-psycholog/pages/api/auth/[...nextauth].ts
ai-psycholog/next-auth.d.ts
ai-psycholog/next-i18next.config.js
ai-psycholog/public/locales/cs/common.json
ai-psycholog/public/locales/en/common.json
ai-psycholog/public/locales/uk/common.json
ai-psycholog/public/locales/cs/homepage.json
ai-psycholog/public/locales/en/homepage.json
ai-psycholog/public/locales/uk/homepage.json
ai-psycholog/pages/diary.tsx
ai-psycholog/public/locales/cs/diary.json
ai-psycholog/public/locales/en/diary.json
ai-psycholog/public/locales/uk/diary.json
ai-psycholog/public/locales/cs/pricing.json
ai-psycholog/public/locales/en/pricing.json
ai-psycholog/public/locales/uk/pricing.json
ai-psycholog/pages/gdpr.tsx
ai-psycholog/public/locales/cs/gdpr.json
ai-psycholog/public/locales/en/gdpr.json
ai-psycholog/public/locales/uk/gdpr.json
ai-psycholog/pages/kontakt.tsx
ai-psycholog/public/locales/cs/contact.json
ai-psycholog/public/locales/en/contact.json
ai-psycholog/public/locales/uk/contact.json
ai-psycholog/public/locales/cs/chat.json
ai-psycholog/public/locales/en/chat.json
ai-psycholog/public/locales/uk/chat.json
ai-psycholog/pages/pricing.tsx
ai-psycholog/next.config.js
ai-psycholog/pages/_app.tsx
ai-psycholog/pages/chat.tsx
ai-psycholog/components/Footer.tsx
ai-psycholog/components/Navbar.tsx
ai-psycholog/tailwind.config.js
ai-psycholog/components/ChatSettingsModal.tsx
ai-psycholog/styles/globals.css
ai-psycholog/pages/index.tsx
ai-psycholog/pages/api/user/profile.ts
ai-psycholog/pages/api/admin/users.ts
ai-psycholog/lib/emailService.ts
ai-psycholog/pages/api/contact.ts
ai-psycholog/postcss.config.js
ai-psycholog/components/CrisisNotice.tsx

# Current Time
5/29/2025, 8:32:09 PM (Europe/Prague, UTC+2:00)

# Context Window Usage
452,199 / 1,048.576K tokens used (43%)

# Current Mode
ACT MODE
</environment_details>
