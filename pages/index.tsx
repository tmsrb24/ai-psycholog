import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Layout from '../components/layouts/Layout';
import { FaRobot, FaComments, FaLock, FaChartLine, FaUserFriends, FaMoon, FaCheck, FaStar, FaUsers, FaCalendarAlt, FaFlask, FaTimes, FaUserMd, FaLightbulb, FaHandHoldingHeart, FaSeedling, FaUserShield, FaFileMedical } from 'react-icons/fa';
import type { IconType } from 'react-icons';
import { motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps, InferGetStaticPropsType } from 'next';
import { Card } from 'flowbite-react';

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
    },
    {
      name: t('plans.company.name', 'Pro Firmy'),
      price: t('plans.company.price', 'Na dotaz'),
      priceSuffix: '',
      description: t('plans.company.description', 'Podpořte duševní pohodu svých zaměstnanců'),
      borderColor: 'from-green-500 to-teal-500',
      features: [
        { text: t('plans.company.features.0', 'Neomezený přístup pro zaměstnance'), included: true },
        { text: t('plans.company.features.1', '100% Anonymita a soukromí'), included: true },
        { text: t('plans.company.features.2', 'Snadná implementace'), included: true },
        { text: t('plans.company.features.3', 'Přednostní podpora'), included: true },
      ],
      buttonText: t('plans.company.buttonText', 'Kontaktujte nás'),
      buttonLink: '/kontakt',
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
      <section className="bg-white dark:bg-gray-900">
        <div className="grid max-w-screen-xl px-4 py-8 mx-auto lg:gap-8 xl:gap-0 lg:py-16 lg:grid-cols-12">
            <div className="mr-auto place-self-center lg:col-span-7">
                <h1 className="max-w-2xl mb-4 text-4xl font-extrabold tracking-tight leading-none md:text-5xl xl:text-6xl dark:text-white">{t('hero.titleLine1', 'Psychologická podpora')} {t('hero.titleLine2', 's pokročilou AI')}</h1>
                <p className="max-w-2xl mb-6 font-light text-gray-500 lg:mb-8 md:text-lg lg:text-xl dark:text-gray-400">{t('hero.subtitle', 'Dostupná kdykoliv a kdekoliv. Získejte okamžitou podporu pro vaši psychickou pohodu.')}</p>
                <Link href="/chat" className="inline-flex items-center justify-center px-5 py-3 mr-3 text-base font-medium text-center text-white rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-900">
                    {tCommon('buttons.tryForFree', 'Vyzkoušet zdarma')}
                    <svg className="w-5 h-5 ml-2 -mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                </Link>
                <Link href="/pricing" className="inline-flex items-center justify-center px-5 py-3 text-base font-medium text-center text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 dark:focus:ring-gray-800">
                    {tCommon('buttons.pricing', 'Ceník')}
                </Link> 
            </div>
            <div className="hidden lg:mt-0 lg:col-span-5 lg:flex">
                <Image src="/images/hero-avatar.png" alt="mockup" width={500} height={500} />
            </div>                
        </div>
      </section>

      <section className="bg-white dark:bg-gray-900">
        <div className="py-8 px-4 mx-auto max-w-screen-xl sm:py-16 lg:px-6">
            <div className="max-w-screen-md mb-8 lg:mb-16">
                <h2 className="mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white">{t('features.title', 'Proč AI Psycholog?')}</h2>
                <p className="text-gray-500 sm:text-xl dark:text-gray-400">{t('features.subtitleLine1', 'Malé rozhovory, které mohou změnit hodně.')}</p>
            </div>
            <div className="space-y-8 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-12 md:space-y-0">
                <div>
                    <div className="flex justify-center items-center mb-4 w-10 h-10 rounded-full bg-primary-100 lg:h-12 lg:w-12 dark:bg-primary-900">
                        <FaComments className="w-5 h-5 text-primary-600 lg:w-6 lg:h-6 dark:text-primary-300" />
                    </div>
                    <h3 className="mb-2 text-xl font-bold dark:text-white">{t('features.cards.0.title', 'Okamžitá dostupnost')}</h3>
                    <p className="text-gray-500 dark:text-gray-400">{t('features.cards.0.text', 'Žádné čekání na termín. AI Psycholog je k dispozici 24/7, kdykoliv potřebujete podporu.')}</p>
                </div>
                <div>
                    <div className="flex justify-center items-center mb-4 w-10 h-10 rounded-full bg-primary-100 lg:h-12 lg:w-12 dark:bg-primary-900">
                        <FaLock className="w-5 h-5 text-primary-600 lg:w-6 lg:h-6 dark:text-primary-300" />
                    </div>
                    <h3 className="mb-2 text-xl font-bold dark:text-white">{t('features.cards.1.title', 'Naprostá diskrétnost')}</h3>
                    <p className="text-gray-500 dark:text-gray-400">{t('features.cards.1.text', 'Vaše konverzace jsou soukromé a bezpečné. Žádné sdílení dat s třetími stranami.')}</p>
                </div>
                <div>
                    <div className="flex justify-center items-center mb-4 w-10 h-10 rounded-full bg-primary-100 lg:h-12 lg:w-12 dark:bg-primary-900">
                        <FaChartLine className="w-5 h-5 text-primary-600 lg:w-6 lg:h-6 dark:text-primary-300" />
                    </div>
                    <h3 className="mb-2 text-xl font-bold dark:text-white">{t('features.cards.2.title', 'Sledování pokroku')}</h3>
                    <p className="text-gray-500 dark:text-gray-400">{t('features.cards.2.text', 'Analýza nálady vám pomůže sledovat váš pokrok a motivovat vás.')}</p>
                </div>
            </div>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-900">
        <div className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
            <div className="mx-auto max-w-screen-md text-center mb-8 lg:mb-12">
                <h2 className="mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white">{t('pricingPreview.title', 'Dostupné cenové plány')}</h2>
                <p className="mb-5 font-light text-gray-500 sm:text-xl dark:text-gray-400">{t('pricingPreview.subtitle', 'Vyberte si plán, který nejlépe vyhovuje vašim potřebám.')}</p>
            </div>
            <div className="space-y-8 lg:grid lg:grid-cols-3 sm:gap-6 xl:gap-10 lg:space-y-0">
                {plans.map((plan) => (
                  <Card key={plan.name}>
                    <h3 className="mb-4 text-2xl font-semibold">{plan.name}</h3>
                    <p className="font-light text-gray-500 sm:text-lg dark:text-gray-400">{plan.description}</p>
                    <div className="flex justify-center items-baseline my-8">
                        <span className="mr-2 text-5xl font-extrabold">{plan.price}</span>
                        <span className="text-gray-500 dark:text-gray-400">{plan.priceSuffix}</span>
                    </div>
                    <ul role="list" className="mb-8 space-y-4 text-left">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center space-x-3">
                          <svg className={`flex-shrink-0 w-5 h-5 ${feature.included ? 'text-green-500' : 'text-gray-400'} dark:${feature.included ? 'text-green-400' : 'text-gray-500'}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                          <span>{feature.text}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href={plan.buttonLink} className="text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:ring-primary-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:text-white  dark:focus:ring-primary-900">{plan.buttonText}</Link>
                  </Card>
                ))}
            </div>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-900">
        <div className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
            <div className="mx-auto max-w-screen-sm text-center">
                <h2 className="mb-4 text-4xl tracking-tight font-extrabold leading-tight text-gray-900 dark:text-white">{t('cta.title', 'Začněte svou cestu k lepší psychické pohodě ještě dnes')}</h2>
                <p className="mb-6 font-light text-gray-500 dark:text-gray-400 md:text-lg">{t('cta.subtitle', 'Vyzkoušejte AI Psychologa zdarma a objevte, jak vám může pomoci lépe porozumět vašim emocím a zvládat každodenní výzvy.')}</p>
                <Link href="/chat" className="text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800">{tCommon('buttons.startForFree', 'Začít zdarma')}</Link>
            </div>
        </div>
      </section>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps<Props> = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? 'cs', ['homepage', 'common'])),
  },
});

export default HomePage;
