import React, { useState } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import { FaCheck, FaTimes, FaQuestionCircle, FaStar, FaUsers, FaCalendarAlt, FaFlask } from 'react-icons/fa';
import type { IconType } from 'react-icons'; // Opravený import IconType
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
// import getStripe from '../lib/stripeClient'; // Pokud se bude lišit priceId pro Ultra

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

const PricingPage = () => {
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

  const plans: Plan[] = [ // Explicitně typovat pole plans
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
      buttonAction: () => router.push('/chat'),
      isRecommended: false,
      planId: 'free'
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
      buttonText: 'Předplatit Premium',
      buttonAction: () => handleSubscribe('premium'),
      isRecommended: true,
      planId: 'premium'
    },
    {
      name: 'Ultra',
      price: '599 Kč',
      priceSuffix: '/měsíc',
      description: 'Pro nejnáročnější uživatele a rodiny',
      borderColor: 'border-purple-600',
      features: [
        { text: 'Vše z Premium plánu', included: true, bold: true },
        { text: 'Prioritní podpora', included: true, icon: FaStar },
        { text: 'Rodinné sdílení (až 3 členové)', included: true, icon: FaUsers },
        { text: 'Integrace s kalendářem', included: true, icon: FaCalendarAlt },
        { text: 'Přístup k beta verzím', included: true, icon: FaFlask },
      ],
      buttonText: 'Předplatit Ultra',
      buttonAction: () => handleSubscribe('ultra'),
      isRecommended: false,
      planId: 'ultra'
    }
  ];

  return (
    <Layout title="Ceník | AI Psycholog" description="Cenové plány pro AI Psychologa - psychologickou podporu s umělou inteligencí.">
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 dark:from-blue-900 dark:via-blue-800 dark:to-blue-700 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Cenové plány</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Vyberte si plán, který nejlépe vyhovuje vašim potřebám.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => (
            <div 
              key={plan.name} 
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border-t-4 ${plan.borderColor} flex flex-col ${plan.isRecommended ? 'lg:scale-105 ring-2 ring-offset-2 ring-blue-500 dark:ring-blue-400' : ''} relative`}
            >
              {plan.isRecommended && (
                <div className="absolute top-0 right-0 bg-blue-600 dark:bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-lg">
                  DOPORUČENO
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
                    Zpracování...
                  </span>
                ) : plan.buttonText}
              </button>
              {plan.name !== 'Základní' && 
                <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
                  Bezpečná platba přes Stripe
                </p>
              }
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-10 text-center">Často kladené otázky</h2>
          <div className="grid md:grid-cols-2 gap-x-8 gap-y-10">
            {[
              { q: "Jak funguje předplatné?", a: "Předplatné je měsíční a automaticky se obnovuje. Můžete jej kdykoliv zrušit. Po zrušení máte přístup k prémiovým funkcím do konce aktuálního zúčtovacího období." },
              { q: "Mohu změnit plán?", a: "Ano, můžete kdykoliv přejít z bezplatného plánu na prémiový a naopak. Při přechodu na prémiový plán získáte okamžitý přístup ke všem funkcím." },
              { q: "Je AI Psycholog náhradou za skutečného psychologa?", a: "Ne, AI Psycholog není náhradou za profesionální psychologickou péči. Je to doplňkový nástroj pro podporu psychické pohody. V případě vážných problémů vždy doporučujeme vyhledat odbornou pomoc." },
              { q: "Jak je zajištěna bezpečnost mých dat?", a: "Vaše konverzace jsou šifrované. Pro detaily o ukládání dat se prosím podívejte na naše Zásady ochrany osobních údajů." },
              { q: "Co je RAG systém nové generace?", a: "Náš AI asistent využívá architekturu typu Retrieval-Augmented Generation (RAG) – propojuje jazykový model s vlastní odbornou psychologickou databází. Díky tomu poskytuje přesné, kontextově přizpůsobené odpovědi v reálném čase, které vycházejí z ověřených poznatků a vaší situace.", tag: "NOVINKA" },
            ].map((faq, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                  <FaQuestionCircle className="text-blue-500 dark:text-blue-400 mr-3 flex-shrink-0" />
                  {faq.q}
                  {faq.tag && (
                    <span className="ml-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-semibold px-2 py-0.5 rounded-full">
                      {faq.tag}
                    </span>
                  )}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

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
