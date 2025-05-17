import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { FaCheckCircle } from 'react-icons/fa';
import { useSession } from 'next-auth/react';

const CheckoutSuccessPage = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { session_id } = router.query;

  useEffect(() => {
    if (!session) {
      // If not logged in, redirect to login page
      router.push('/auth/login');
      return;
    }

    if (session_id) {
      // Here you could verify the session with Stripe
      // and update the user's subscription status in your database
      setLoading(false);
    }
  }, [session, session_id, router]);

  if (!session) {
    return null; // Will redirect to login
  }

  return (
    <Layout title="Platba úspěšná | AI Psycholog" description="Vaše předplatné bylo úspěšně aktivováno.">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          {loading ? (
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Zpracováváme vaši platbu...</p>
            </div>
          ) : error ? (
            <div className="text-red-500">
              <p>{error}</p>
              <Link href="/pricing" className="mt-4 inline-block text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                Zpět na ceník
              </Link>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <FaCheckCircle className="text-green-500 text-6xl mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Platba byla úspěšná!</h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
                Děkujeme za předplatné AI Psychologa. Vaše prémiové funkce jsou nyní aktivní.
              </p>
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg mb-6 w-full max-w-md">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Shrnutí objednávky</h2>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-300">Plán:</span>
                  <span className="font-medium text-gray-900 dark:text-white">AI Psycholog Premium</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-300">Cena:</span>
                  <span className="font-medium text-gray-900 dark:text-white">400 Kč / měsíc</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Stav:</span>
                  <span className="font-medium text-green-600 dark:text-green-400">Aktivní</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/chat" className="btn bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                  Začít konverzaci
                </Link>
                <Link href="/profile" className="btn bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                  Správa předplatného
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutSuccessPage;
