import React from 'react';
import Link from 'next/link';
import Layout from '../../components/layouts/Layout';
import { FaTimesCircle } from 'react-icons/fa';

const CheckoutCancelPage = () => {
  return (
    <Layout title="Platba zrušena | AI Psycholog" description="Vaše platba byla zrušena.">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="flex flex-col items-center">
            <FaTimesCircle className="text-red-500 text-6xl mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Platba byla zrušena</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
              Vaše platba nebyla dokončena. Žádná částka nebyla z vašeho účtu odečtena.
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Pokud jste narazili na nějaký problém nebo máte otázky, neváhejte nás kontaktovat.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/pricing" className="btn bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                Zpět na ceník
              </Link>
              <Link href="/chat" className="btn bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                Pokračovat zdarma
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutCancelPage;
