import React, { useState } from 'react';
import Link from 'next/link';
import Layout from '../components/layouts/Layout';
import { FaCheck, FaTimes, FaQuestionCircle, FaStar, FaUsers, FaCalendarAlt, FaFlask } from 'react-icons/fa';
import type { IconType } from 'react-icons';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps, InferGetStaticPropsType } from 'next';
import { useRouter } from 'next/router';

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
  isRecommended: boolean;
  planId: string;
}

type PageProps = {};

const PricingPage = (_props: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { t } = useTranslation(['pricing', 'common']);
  const router = useRouter();

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
      buttonText: t('common:buttons.tryForFree', 'Vyzkoušet zdarma'),
      buttonLink: '/chat',
      isRecommended: false,
      planId: 'free'
    },
    {
      name: t('plans.premium.name', 'Premium'),
      price: t('plans.premium.price', '249 Kč'),
      priceSuffix: t('common:priceSuffixMonthly', '/měsíc'),
      description: t('plans.premium.description', 'Pro pravidelnou psychologickou podporu'),
      borderColor: 'from-purple-500 to-indigo-500',
      features: [
        { text: t('plans.premium.features.0', 'Neomezené zprávy'), included: true },
        { text: t('plans.premium.features.1', 'Pokročilá analýza nálady'), included: true },
        { text: t('plans.premium.features.2', 'Všechna témata konverzace'), included: true },
        { text: t('plans.premium.features.3', 'Přístup k osobnímu deníku'), included: true },
        { text: t('plans.premium.features.4', 'Neomezená historie konverzací'), included: true },
        { text: t('plans.premium.features.5', 'Přizpůsobení osobnosti asistenta'), included: true },
        { text: t('plans.premium.features.6', 'RAG systém nové generace'), included: true, tag: t('common:tags.new', 'NOVINKA') },
        { text: t('plans.premium.features.7', 'Prioritní podpora'), included: true },
      ],
      buttonText: t('plans.premium.buttonText', 'Předplatit Premium'),
      buttonLink: '/chat',
      isRecommended: true,
      planId: 'premium'
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
      isRecommended: false,
      planId: 'company'
    }
  ];

  const faqItems = [
    { qKey: "faq.0.q", aKey: "faq.0.a", qDefault: "Jak funguje předplatné?", aDefault: "Předplatné je měsíční a automaticky se obnovuje. Můžete jej kdykoliv zrušit. Po zrušení máte přístup k prémiovým funkcím do konce aktuálního zúčtovacího období." },
    { qKey: "faq.1.q", aKey: "faq.1.a", qDefault: "Mohu změnit plán?", aDefault: "Ano, můžete kdykoliv přejít z bezplatného plánu na prémiový a naopak. Při přechodu na prémiový plán získáte okamžitý přístup ke všem funkcím." },
    { qKey: "faq.2.q", aKey: "faq.2.a", qDefault: "Je AI Psycholog náhradou za skutečného psychologa?", aDefault: "Ne, AI Psycholog není náhradou za profesionální psychologickou péči. Je to doplňkový nástroj pro podporu psychické pohody. V případě vážných problémů vždy doporučujeme vyhledat odbornou pomoc." },
    { qKey: "faq.3.q", aKey: "faq.3.a", qDefault: "Jak je zajištěna bezpečnost mých dat?", aDefault: "Vaše konverzace jsou šifrované. Pro detaily o ukládání dat se prosím podívejte na naše Zásady ochrany osobních údajů." },
    { qKey: "faq.4.q", aKey: "faq.4.a", qDefault: "Co je RAG systém nové generace?", aDefault: "Náš AI asistent využívá architekturu typu Retrieval-Augmented Generation (RAG) – propojuje jazykový model s vlastní odbornou psychologickou databází. Díky tomu poskytuje přesné, kontextově přizpůsobené odpovědi v reálném čase, které vycházejí z ověřených poznatků a vaší situace.", tagKey: "common:tags.new", tagDefault: "NOVINKA" },
  ];

  return (
    <Layout title={t('pageTitle', 'Ceník | AI Psycholog')} description={t('pageDescription', 'Cenové plány pro AI Psychologa - psychologickou podporu s umělou inteligencí.')}>
      <div className="bg-hero-gradient-dark text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('header.title', 'Cenové plány')}</h1>
          <p className="text-xl max-w-3xl mx-auto">
            {t('header.subtitle', 'Vyberte si plán, který nejlépe vyhovuje vašim potřebám.')}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {plans.map((plan) => (
            <div 
              key={plan.name} 
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
                <span className="text-4xl font-extrabold text-gray-900 dark:text-white">{plan.price}</span>
                <span className="text-md text-gray-500 dark:text-gray-400 ml-1">{plan.priceSuffix}</span>
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
                <Link href={plan.buttonLink}>
                  <a className={`block w-full text-center py-3 px-6 rounded-lg font-semibold text-white transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg bg-gradient-to-r ${plan.borderColor} hover:shadow-xl`}>
                    {plan.buttonText}
                  </a>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-10 text-center">{t('faqTitle', 'Často kladené otázky')}</h2>
          <div className="grid md:grid-cols-2 gap-x-8 gap-y-10">
            {faqItems.map((faq, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                  <FaQuestionCircle className="text-blue-500 dark:text-blue-400 mr-3 flex-shrink-0" />
                  {t(faq.qKey, faq.qDefault)}
                  {faq.tagKey && (
                    <span className="ml-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-semibold px-2 py-0.5 rounded-full">
                      {t(faq.tagKey, faq.tagDefault)}
                    </span>
                  )}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">{t(faq.aKey, faq.aDefault)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t('cta.title', 'Stále si nejste jisti?')}</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            {t('cta.subtitle', 'Vyzkoušejte AI Psychologa zdarma a rozhodněte se později. Žádná platební karta není vyžadována.')}
          </p>
          <Link href="/chat">
            <a className="btn bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-colors text-lg">
              {t('common:buttons.startForFree', 'Začít zdarma')}
            </a>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default PricingPage;

export const getStaticProps: GetStaticProps<PageProps> = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? 'cs', ['pricing', 'common'])),
  },
});
