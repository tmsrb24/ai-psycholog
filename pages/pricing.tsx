import React, { useState } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import { FaCheck, FaTimes, FaQuestionCircle, FaStar, FaUsers, FaCalendarAlt, FaFlask } from 'react-icons/fa';
import type { IconType } from 'react-icons';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps, InferGetStaticPropsType } from 'next';

interface Feature {
  text: string;
  included: boolean;
  bold?: boolean;
  icon?: IconType; // Použij IconType pro ikony z react-icons
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
  buttonAction: () => void;
  isRecommended: boolean;
  planId: string;
}

type PageProps = {
  // Props for the page, if any, beyond what getStaticProps provides
};

const PricingPage = (_props: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { t } = useTranslation(['pricing', 'common']);
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleSubscribe = async (plan: string) => {
    if (!session) {
      router.push(`/auth/login?callbackUrl=/pricing?plan=${plan}`);
      return;
    }

    setIsLoading(true);
    setSelectedPlan(plan); // Store which plan is being subscribed to

    try {
      // TODO: Pass plan identifier to API to get correct Stripe Price ID
      const response = await fetch(`${process.env.NEXTAUTH_URL}/api/checkout/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan }), // Pass plan to backend
      });
      
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Chyba při vytváření platební relace.');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert(`Došlo k chybě při zpracování platby pro plán ${plan}. Zkuste to prosím znovu.`);
    } finally {
      setIsLoading(false);
      setSelectedPlan(null);
    }
  };

  const plans: Plan[] = [
    {
      name: t('plans.basic.name', 'Základní'),
      price: t('plans.basic.price', 'Zdarma'),
      priceSuffix: t('plans.basic.priceSuffix', ''),
      description: t('plans.basic.description', 'Ideální pro vyzkoušení služby'),
      borderColor: 'border-gray-400',
      features: [
        { text: t('plans.basic.features.0', '5 zpráv denně'), included: true },
        { text: t('plans.basic.features.1', 'Základní analýza nálady'), included: true },
        { text: t('plans.basic.features.2', 'Základní témata konverzace'), included: true },
        { text: t('plans.basic.features.3', 'Přístup k osobnímu deníku'), included: false },
        { text: t('plans.basic.features.4', 'Historie konverzací'), included: false },
        { text: t('plans.basic.features.5', 'Přizpůsobení osobnosti asistenta'), included: false },
        { text: t('plans.basic.features.6', 'RAG systém nové generace'), included: false },
        { text: t('plans.basic.features.7', 'Prioritní podpora'), included: false },
      ],
      buttonText: t('common:buttons.tryForFree', 'Vyzkoušet zdarma'),
      buttonAction: () => router.push('/chat'),
      isRecommended: false,
      planId: 'free'
    },
    {
      name: t('plans.premium.name', 'Premium'),
      price: t('plans.premium.price', '249 Kč'),
      priceSuffix: t('common:priceSuffixMonthly', '/měsíc'),
      description: t('plans.premium.description', 'Pro pravidelnou psychologickou podporu'),
      borderColor: 'border-blue-600',
      features: [
        { text: t('plans.premium.features.0', 'Neomezené zprávy'), included: true },
        { text: t('plans.premium.features.1', 'Pokročilá analýza nálady'), included: true },
        { text: t('plans.premium.features.2', 'Všechna témata konverzace'), included: true },
        { text: t('plans.premium.features.3', 'Přístup k osobnímu deníku'), included: true },
        { text: t('plans.premium.features.4', 'Neomezená historie konverzací'), included: true },
        { text: t('plans.premium.features.5', 'Přizpůsobení osobnosti asistenta'), included: true },
        { text: t('plans.premium.features.6', 'RAG systém nové generace'), included: true, tag: t('common:tags.new', 'NOVINKA') },
        { text: t('plans.premium.features.7', 'Prioritní podpora'), included: true, icon: FaStar },
      ],
      buttonText: t('plans.premium.buttonText', 'Předplatit Premium'),
      buttonAction: () => handleSubscribe('premium'),
      isRecommended: true,
      planId: 'premium'
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
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 dark:from-blue-900 dark:via-blue-800 dark:to-blue-700 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('header.title', 'Cenové plány')}</h1>
          <p className="text-xl max-w-3xl mx-auto">
            {t('header.subtitle', 'Vyberte si plán, který nejlépe vyhovuje vašim potřebám.')}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {plans.map((plan) => (
            <div 
              key={plan.name} 
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border-t-4 ${plan.borderColor} flex flex-col ${plan.isRecommended ? 'lg:scale-105 ring-2 ring-offset-2 ring-blue-500 dark:ring-blue-400' : ''} relative`}
            >
              {plan.isRecommended && (
                <div className="absolute top-0 right-0 bg-blue-600 dark:bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-lg">
                  {t('common:tags.recommended', 'DOPORUČENO')}
                </div>
              )}
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{plan.name}</h2>
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
              
              <button 
                onClick={() => plan.buttonAction()}
                disabled={isLoading && selectedPlan === plan.planId}
                className={`block w-full text-center mt-auto ${
                  isLoading && selectedPlan === plan.planId ? 'bg-gray-400 cursor-not-allowed' : 
                  plan.name === 'Základní' ? 'bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100' : 
                  plan.borderColor === 'border-blue-600' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 
                  'bg-purple-600 hover:bg-purple-700 text-white'
                } font-semibold py-3 px-6 rounded-lg transition-colors shadow-md`}
              >
                {isLoading && selectedPlan === plan.planId ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('buttons.processing', 'Zpracování...')}
                  </span>
                ) : plan.buttonText}
              </button>
              {plan.name !== t('plans.basic.name', 'Základní') && 
                <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
                  {t('safePaymentStripe', 'Bezpečná platba přes Stripe')}
                </p>
              }
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
          <Link href="/chat" className="btn bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-colors text-lg">
            {t('common:buttons.startForFree', 'Začít zdarma')}
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
