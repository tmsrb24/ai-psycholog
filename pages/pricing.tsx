import React, { useState } from 'react';
import Link from 'next/link';
import Layout from '../components/layouts/Layout';
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
  buttonAction: () => void;
  isRecommended: boolean;
  planId: string;
}

type PageProps = {};

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
    setSelectedPlan(plan);

    try {
      const response = await fetch(`${process.env.NEXTAUTH_URL}/api/checkout/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
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
      buttonAction: () => router.push('/chat'),
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
      buttonAction: () => handleSubscribe('premium'),
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
      buttonAction: () => router.push('/kontakt'),
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
      <section className="bg-white dark:bg-gray-900">
        <div className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
            <div className="mx-auto max-w-screen-md text-center mb-8 lg:mb-12">
                <h2 className="mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white">{t('header.title', 'Cenové plány')}</h2>
                <p className="mb-5 font-light text-gray-500 sm:text-xl dark:text-gray-400">{t('header.subtitle', 'Vyberte si plán, který nejlépe vyhovuje vašim potřebám.')}</p>
            </div>
            <div className="space-y-8 lg:grid lg:grid-cols-3 sm:gap-6 xl:gap-10 lg:space-y-0">
                {plans.map((plan) => (
                  <div key={plan.name} className={`card shadow-xl ${plan.isRecommended ? 'border-2 border-primary' : 'border border-gray-200 dark:border-gray-700'}`}>
                    <div className="card-body">
                      <h3 className="card-title text-2xl font-semibold">{plan.name}</h3>
                      <p className="text-gray-500 sm:text-lg dark:text-gray-400">{plan.description}</p>
                      <div className="flex justify-center items-baseline my-8">
                          <span className="mr-2 text-5xl font-extrabold">{plan.price}</span>
                          <span className="text-gray-500 dark:text-gray-400">{plan.priceSuffix}</span>
                      </div>
                      <ul role="list" className="mb-8 space-y-4 text-left">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center space-x-3">
                            <svg className={`flex-shrink-0 w-5 h-5 ${feature.included ? 'text-green-500' : 'text-gray-400'} dark:${feature.included ? 'text-green-400' : 'text-gray-500'}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                            <span>{feature.text}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="card-actions">
                        <button 
                          onClick={() => plan.buttonAction()}
                          disabled={isLoading && selectedPlan === plan.planId}
                          className="btn btn-primary w-full"
                        >
                          {isLoading && selectedPlan === plan.planId ? t('buttons.processing', 'Zpracování...') : plan.buttonText}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-900">
        <div className="py-8 px-4 mx-auto max-w-screen-xl sm:py-16 lg:px-6">
            <div className="mx-auto max-w-screen-md text-center">
                <h2 className="mb-4 text-3xl tracking-tight font-extrabold text-gray-900 dark:text-white">{t('faqTitle', 'Často kladené otázky')}</h2>
            </div>
            <div className="mx-auto max-w-screen-md">
              <div id="accordion-flush" data-accordion="collapse" data-active-classes="bg-white dark:bg-gray-900 text-gray-900 dark:text-white" data-inactive-classes="text-gray-500 dark:text-gray-400">
                {faqItems.map((faq, index) => (
                  <div key={index}>
                    <h2 id={`accordion-flush-heading-${index}`}>
                      <button type="button" className="flex items-center justify-between w-full py-5 font-medium text-left text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400" data-accordion-target={`#accordion-flush-body-${index}`} aria-expanded="false" aria-controls={`accordion-flush-body-${index}`}>
                        <span>{t(faq.qKey, faq.qDefault)}</span>
                        <svg data-accordion-icon className="w-6 h-6 shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                      </button>
                    </h2>
                    <div id={`accordion-flush-body-${index}`} className="hidden" aria-labelledby={`accordion-flush-heading-${index}`}>
                      <div className="py-5 border-b border-gray-200 dark:border-gray-700">
                        <p className="mb-2 text-gray-500 dark:text-gray-400">{t(faq.aKey, faq.aDefault)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
        </div>
      </section>
    </Layout>
  );
};

export default PricingPage;

export const getStaticProps: GetStaticProps<PageProps> = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? 'cs', ['pricing', 'common'])),
  },
});
