import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Layout from '../components/Layout';
import { FaRobot, FaComments, FaLock, FaChartLine, FaUserFriends, FaMoon, FaCheck, FaStar, FaUsers, FaCalendarAlt, FaFlask, FaTimes, FaUserMd, FaLightbulb, FaHandHoldingHeart, FaSeedling, FaUserShield, FaFileMedical } from 'react-icons/fa';
import type { IconType } from 'react-icons';
import { motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps, InferGetStaticPropsType } from 'next';

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

type Props = {};

const HomePage = (_props: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { t } = useTranslation('homepage'); 
  const { t: tCommon } = useTranslation('common'); 

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const featureContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const featureCardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };
  
  const heroTextContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };

  const heroTextItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const plans: Plan[] = [
    {
      name: t('plans.basic.name', 'Základní'),
      price: t('plans.basic.price', 'Zdarma'),
      priceSuffix: '',
      description: t('plans.basic.description', 'Ideální pro vyzkoušení služby'),
      borderColor: 'from-pink-500 to-orange-500',
      features: [
        { text: t('plans.basic.features.0', '5 zpráv denně'), included: true },
        { text: t('plans.basic.features.1', 'Základní analýza nálady'), included: true },
        { text: t('plans.basic.features.2', 'Základní témata konverzace'), included: true },
        { text: t('plans.basic.features.3', 'Přístup k osobnímu deníku'), included: false },
        { text: t('plans.basic.features.4', 'Historie konverzací'), included: false },
        { text: t('plans.basic.features.5', 'Přizpůsobení osobnosti asistenta'), included: false },
      ],
      buttonText: tCommon('buttons.tryForFree', 'Vyzkoušet zdarma'),
      buttonLink: '/chat',
    },
    {
      name: t('plans.premium.name', 'Premium'),
      price: t('plans.premium.price', '249 Kč'),
      priceSuffix: tCommon('priceSuffixMonthly', '/měsíc'),
      description: t('plans.premium.description', 'Pro pravidelnou psychologickou podporu'),
      borderColor: 'from-purple-500 to-indigo-500',
      features: [
        { text: t('plans.premium.features.0', 'Neomezené zprávy'), included: true },
        { text: t('plans.premium.features.1', 'Pokročilá analýza nálady'), included: true },
        { text: t('plans.premium.features.2', 'Všechna témata konverzace'), included: true },
        { text: t('plans.premium.features.3', 'Přístup k osobnímu deníku'), included: true },
        { text: t('plans.premium.features.4', 'Neomezená historie konverzací'), included: true },
        { text: t('plans.premium.features.5', 'Přizpůsobení osobnosti asistenta'), included: true },
        { text: t('plans.premium.features.6', 'RAG systém nové generace'), included: true, tag: tCommon('tags.new', 'NOVINKA') },
        { text: t('plans.premium.features.7', 'Prioritní podpora'), included: true },
      ],
      buttonText: t('plans.premium.buttonText', 'Vybrat Premium'),
      buttonLink: '/pricing',
      isRecommended: true,
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
      <section className="bg-hero-gradient-light dark:bg-hero-gradient-dark text-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center">
            <motion.div 
              className="md:w-1/2 mb-10 md:mb-0 text-center md:text-left"
              variants={heroTextContainerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.h1 
                variants={heroTextItemVariants}
                className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-bold mb-4"
              >
                {t('hero.titleLine1', 'Psychologická podpora')} {t('hero.titleLine2', 's pokročilou AI')}
              </motion.h1>
              <motion.p 
                variants={heroTextItemVariants}
                className="text-lg sm:text-xl mb-8"
              >
                {t('hero.subtitle', 'Dostupná kdykoliv a kdekoliv. Získejte okamžitou podporu pro vaši psychickou pohodu.')}
              </motion.p>
              <motion.div 
                variants={heroTextItemVariants}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link href="/chat" className="btn bg-white text-blue-600 hover:bg-gray-100 font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-200 ease-in-out hover:scale-105 focus:scale-105 transform">
                  {tCommon('buttons.tryForFree', 'Vyzkoušet zdarma')}
                </Link>
                <Link href="/pricing" className="btn bg-blue-800 hover:bg-blue-900 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-200 ease-in-out hover:scale-105 focus:scale-105 transform">
                  {tCommon('buttons.pricing', 'Ceník')}
                </Link>
              </motion.div>
            </motion.div>
            <div className="md:w-1/2 flex justify-center md:justify-end md:pr-8 lg:pr-0">
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-[26rem] md:h-[26rem]">
                <div className="absolute inset-0 bg-blue-400 dark:bg-blue-700 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '0s' }}></div>
                <div className="absolute inset-3 sm:inset-5 md:inset-6 bg-blue-300 dark:bg-blue-600 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                <div className="absolute inset-6 sm:inset-10 md:inset-12 bg-blue-200 dark:bg-blue-500 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                <div className="absolute inset-0 flex items-center justify-center z-10 p-8 sm:p-10 md:p-12">
                  <Image 
                    src="/images/hero-avatar.png" 
                    alt="AI Psycholog Avatar" 
                    width={280} 
                    height={280} 
                    className="object-contain w-full h-full" 
                    priority 
                    sizes="(max-width: 640px) 256px, (max-width: 768px) 320px, 416px"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <motion.section 
        className="py-12 sm:py-16 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-xl my-8 mx-auto max-w-7xl shadow-xl"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">{t('features.title', 'Proč AI Psycholog?')}</h2>
            <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              {t('features.subtitleLine1', 'Malé rozhovory, které mohou změnit hodně.')}<br />
              {t('features.subtitleLine2', 'V prostoru, kde vás nikdo nesoudí a kde můžete mluvit tak, jak to právě cítíte.')}<br />
              {t('features.subtitleLine3', 'Zastavte se. Popovídejte si. Ulevte si.')}
            </p>
          </div>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={featureContainerVariants}
          >
            <motion.div 
              variants={featureCardVariants}
              className="bg-white/70 dark:bg-slate-700/70 backdrop-blur-sm rounded-lg shadow-lg p-6 transition-all duration-300 ease-in-out hover:shadow-2xl border-2 border-transparent hover:border-blue-400 dark:hover:border-blue-500 hover:scale-105 transform"
            >
              <div className="bg-blue-100 dark:bg-blue-800/50 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <FaComments className="text-blue-600 dark:text-blue-300" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('features.cards.0.title', 'Okamžitá dostupnost')}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('features.cards.0.text', 'Žádné čekání na termín. AI Psycholog je k dispozici 24/7, kdykoliv potřebujete podporu.')}
              </p>
            </motion.div>
            <motion.div 
              variants={featureCardVariants}
              className="bg-white/70 dark:bg-slate-700/70 backdrop-blur-sm rounded-lg shadow-lg p-6 transition-all duration-300 ease-in-out hover:shadow-2xl border-2 border-transparent hover:border-blue-400 dark:hover:border-blue-500 hover:scale-105 transform"
            >
              <div className="bg-blue-100 dark:bg-blue-800/50 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <FaLock className="text-blue-600 dark:text-blue-300" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('features.cards.1.title', 'Naprostá diskrétnost')}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('features.cards.1.text', 'Vaše konverzace jsou soukromé a bezpečné. Žádné sdílení dat s třetími stranami.')}
              </p>
            </motion.div>
            <motion.div 
              variants={featureCardVariants}
              className="bg-white/70 dark:bg-slate-700/70 backdrop-blur-sm rounded-lg shadow-lg p-6 transition-all duration-300 ease-in-out hover:shadow-2xl border-2 border-transparent hover:border-blue-400 dark:hover:border-blue-500 hover:scale-105 transform"
            >
              <div className="bg-blue-100 dark:bg-blue-800/50 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <FaChartLine className="text-blue-600 dark:text-blue-300" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('features.cards.2.title', 'Sledování pokroku')}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('features.cards.2.text', 'Analýza nálady vám pomůže sledovat váš pokrok a motivovat vás.')}
              </p>
            </motion.div>
          </motion.div>
          <div className="mt-8">
            <motion.div 
              variants={featureCardVariants} 
              initial="hidden" 
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="bg-white/70 dark:bg-slate-700/70 backdrop-blur-md rounded-lg shadow-xl p-6 transition-all duration-300 ease-in-out hover:shadow-2xl border-2 border-blue-500 dark:border-blue-400 hover:scale-105 transform"
            >
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 dark:bg-blue-800/50 p-3 rounded-full w-14 h-14 flex items-center justify-center mr-4">
                  <FaRobot className="text-blue-600 dark:text-blue-300" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{t('features.rag.title', 'RAG systém nové generace')}</h3>
                <div className="ml-3 inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-semibold px-2 py-1 rounded-full">
                  {tCommon('tags.new', 'NOVINKA')}
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                {t('features.rag.text', 'Náš AI asistent využívá architekturu typu Retrieval-Augmented Generation (RAG) – propojuje jazykový model s vlastní odbornou psychologickou databází. Díky tomu poskytuje přesné, kontextově přizpůsobené odpovědi v reálném čase, které vycházejí z ověřených poznatků a vaší situace.')}
              </p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      <motion.section 
        className="py-16 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-xl my-8 mx-auto max-w-7xl shadow-xl"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t('testimonials.title', 'Názory odborníků')}</h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              {t('testimonials.subtitle', 'Co o Psychollog.cz říkají profesionálové z oboru psychologie a psychiatrie.')}
            </p>
          </div>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={featureContainerVariants}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div 
                key={index} 
                variants={featureCardVariants}
                className="bg-gray-100/70 dark:bg-slate-700/70 backdrop-blur-sm p-6 rounded-lg shadow-lg text-center transition-all duration-300 ease-in-out hover:shadow-2xl border-2 border-transparent hover:border-blue-400 dark:hover:border-blue-500 hover:scale-105 transform"
              >
                <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden relative bg-gray-200 dark:bg-gray-600">
                  <Image 
                    src={testimonial.avatar} 
                    alt={t('testimonials.avatarAlt', { name: testimonial.name })} 
                    layout="fill" 
                    objectFit="cover" 
                    className="rounded-full"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">{testimonial.name}</h3>
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-3">{testimonial.specialization}</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm italic">"{testimonial.quote}"</p>
              </motion.div>
            ))}
          </motion.div>
          <div className="mt-12 text-center">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">{t('testimonials.uniqueServiceTitle', 'Proč je naše služba unikátní?')}</h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
            {t('testimonials.uniqueServiceText', 'Naše platforma Psychollog.cz je unikátní díky kombinaci pokročilé umělé inteligence, která čerpá z ověřených psychologických databází (PubMed Central, Open Psychology Journal, PsyArXiv), a vize spolupráce s odborníky z praxe. Tím zajišťujeme, že poskytovaná podpora je nejen okamžitě dostupná a diskrétní, ale také informačně hodnotná a založená na vědeckých poznatcích. Naším cílem je zpřístupnit kvalitní nástroje pro sebepoznání a duševní pohodu co nejširšímu okruhu lidí.')}
            </p>
          </div>
        </div>
      </motion.section>

      <motion.section 
        className="py-16 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-xl my-8 mx-auto max-w-7xl shadow-xl"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t('howItWorks.title', 'Jak to funguje?')}</h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              {t('howItWorks.subtitle', 'Naše odpovědi nejsou náhodné. Každá zpráva prochází třístupňovým procesem pro zajištění bezpečnosti a relevance.')}
            </p>
          </div>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={featureContainerVariants}
          >
            <motion.div 
              variants={featureCardVariants}
              className="bg-white/70 dark:bg-slate-700/70 backdrop-blur-sm rounded-lg shadow-lg p-6 transition-all duration-300 ease-in-out hover:shadow-2xl border-2 border-transparent hover:border-blue-400 dark:hover:border-blue-500 hover:scale-105 transform"
            >
              <div className="bg-blue-100 dark:bg-blue-800/50 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <FaFileMedical className="text-blue-600 dark:text-blue-300" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('howItWorks.steps.0.title', 'Kontext z ověřených zdrojů')}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('howItWorks.steps.0.text', 'Váš dotaz je automaticky obohacen o relevantní informace z odborné databáze PubMed, aby odpověď byla co nejpřesnější.')}
              </p>
            </motion.div>
            <motion.div 
              variants={featureCardVariants}
              className="bg-white/70 dark:bg-slate-700/70 backdrop-blur-sm rounded-lg shadow-lg p-6 transition-all duration-300 ease-in-out hover:shadow-2xl border-2 border-transparent hover:border-blue-400 dark:hover:border-blue-500 hover:scale-105 transform"
            >
              <div className="bg-blue-100 dark:bg-blue-800/50 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <FaUserShield className="text-blue-600 dark:text-blue-300" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('howItWorks.steps.1.title', 'Bezpečnostní neuronová síť')}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('howItWorks.steps.1.text', 'Speciální "hlídací" neuronová síť kontroluje dotaz i odpověď, aby se předešlo škodlivým nebo nebezpečným radám.')}
              </p>
            </motion.div>
            <motion.div 
              variants={featureCardVariants}
              className="bg-white/70 dark:bg-slate-700/70 backdrop-blur-sm rounded-lg shadow-lg p-6 transition-all duration-300 ease-in-out hover:shadow-2xl border-2 border-transparent hover:border-blue-400 dark:hover:border-blue-500 hover:scale-105 transform"
            >
              <div className="bg-blue-100 dark:bg-blue-800/50 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <FaComments className="text-blue-600 dark:text-blue-300" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('howItWorks.steps.2.title', 'Generování odpovědi')}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('howItWorks.steps.2.text', 'Teprve po těchto kontrolách je dotaz odeslán velkému jazykovému modelu, který vytvoří empatickou a kontextuálně vhodnou odpověď.')}
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      <motion.section 
        className="py-16 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-xl my-8 mx-auto max-w-7xl shadow-xl"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t('pricingPreview.title', 'Dostupné cenové plány')}</h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              {t('pricingPreview.subtitle', 'Vyberte si plán, který nejlépe vyhovuje vašim potřebám.')}
            </p>
          </div>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start max-w-4xl mx-auto"
            variants={featureContainerVariants}
          >
            {plans.map((plan) => (
              <motion.div 
                key={plan.name} 
                variants={featureCardVariants}
                className={`relative bg-white/60 dark:bg-slate-800/50 backdrop-blur-lg rounded-3xl p-8 shadow-lg border border-white/30 dark:border-slate-700 flex flex-col h-full transition-all duration-300 hover:shadow-2xl ${
                  plan.isRecommended ? 'shadow-blue-500/20' : ''
                }`}
              >
                {/* Header */}
                <div className="flex-shrink-0">
                  <h3 className={`text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${plan.borderColor}`}>{plan.name}</h3>
                  <div className={`h-1 w-20 mt-2 mb-6 rounded-full bg-gradient-to-r ${plan.borderColor}`}></div>
                  <p className="text-gray-600 dark:text-gray-400 min-h-[3rem]">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="my-8 flex-shrink-0">
                  <span className="text-5xl font-extrabold text-gray-900 dark:text-white">{plan.price}</span>
                  <span className="text-lg text-gray-500 dark:text-gray-400 ml-1">{plan.priceSuffix}</span>
                </div>

                {/* Features */}
                <ul className="space-y-4 flex-grow">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <div className="flex-shrink-0">
                        {feature.included ? 
                          <FaCheck className="text-green-500 h-5 w-5" />
                          : <FaTimes className="text-red-500 h-5 w-5" />
                        }
                      </div>
                      <p className={`ml-3 text-sm ${feature.included ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400 line-through'}`}>
                        {feature.text}
                        {feature.tag && (
                          <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full dark:bg-blue-900/50 dark:text-blue-300">
                            {feature.tag}
                          </span>
                        )}
                      </p>
                    </li>
                  ))}
                </ul>

                {/* Button */}
                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-slate-700 flex-shrink-0">
                  <Link href={plan.buttonLink} className={`block w-full text-center py-3 px-6 rounded-lg font-semibold text-white transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg bg-gradient-to-r ${plan.borderColor} hover:shadow-xl`}>
                    {plan.buttonText}
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      <motion.section 
        className="py-16 bg-cta-gradient-light dark:bg-cta-gradient-dark text-white"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">{t('cta.title', 'Začněte svou cestu k lepší psychické pohodě ještě dnes')}</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            {t('cta.subtitle', 'Vyzkoušejte AI Psychologa zdarma a objevte, jak vám může pomoci lépe porozumět vašim emocím a zvládat každodenní výzvy.')}
          </p>
          <Link href="/chat" className="btn bg-white text-blue-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg shadow-md transition-all duration-200 ease-in-out hover:scale-105 focus:scale-105 transform text-lg">
            {tCommon('buttons.startForFree', 'Začít zdarma')}
          </Link>
        </div>
      </motion.section>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps<Props> = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? 'cs', ['homepage', 'common'])),
  },
});

export default HomePage;
