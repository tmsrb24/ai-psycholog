import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../../components/layouts/Layout';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps, InferGetStaticPropsType } from 'next';
import { FaLock, FaArrowLeft } from 'react-icons/fa';
import { supabase } from '../../lib/supabaseClient';
import { Session } from '@supabase/supabase-js';

type PageProps = {};

const ResetPasswordPage = (_props: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { t } = useTranslation(['common']);
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Supabase client handles the session recovery from the URL hash fragment.
    // We just need to listen for the SIGNED_IN event which fires after recovery.
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSession(session);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError(t('errors.passwordsDoNotMatch'));
      return;
    }
    if (password.length < 6) {
      setError(t('errors.passwordTooShort'));
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
    } else {
      setMessage(t('resetPassword.success'));
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    }

    setLoading(false);
  };

  return (
    <Layout title={t('resetPassword.title')}>
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('resetPassword.title')}</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">{t('resetPassword.subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('newPassword')}
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-md placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 sm:text-sm bg-gray-50 dark:bg-gray-700"
                  placeholder="********"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('confirmNewPassword')}
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-md placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 sm:text-sm bg-gray-50 dark:bg-gray-700"
                  placeholder="********"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? t('loading') : t('resetPassword.submitButton')}
              </button>
            </div>
          </form>

          {message && <p className="text-center text-green-600 dark:text-green-400">{message}</p>}
          {error && <p className="text-center text-red-600 dark:text-red-400">{error}</p>}

        </div>
      </div>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps<PageProps> = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? 'cs', ['common'])),
  },
});

export default ResetPasswordPage;
