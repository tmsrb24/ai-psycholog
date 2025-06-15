import React, { useState, FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { FaGoogle, FaApple, FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { callbackUrl } = router.query;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        redirect: false, // Důležité pro manuální zpracování odpovědi
        email: email,
        password: password,
      });

      if (result?.error) {
        // Zobrazíme uživatelsky přívětivou chybu
        setError('Neplatný e-mail nebo heslo. Zkuste to prosím znovu.');
        console.error("Sign-in error:", result.error);
        setIsLoading(false);
      } else if (result?.ok) {
        // Přihlášení bylo úspěšné, přesměrujeme uživatele
        router.push((callbackUrl as string) || '/chat');
      } else {
        // Ostatní případy
        setError('Došlo k neočekávané chybě. Zkuste to prosím znovu.');
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Sign-in exception:", err);
      setError('Došlo k neočekávané chybě.');
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = (provider: string) => {
    setIsLoading(true);
    signIn(provider, { callbackUrl: (callbackUrl as string) || '/' });
  };

  return (
    <Layout title="Přihlášení | AI Psycholog" description="Přihlaste se ke svému účtu AI Psycholog">
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 dark:from-blue-900 dark:via-blue-800 dark:to-blue-700 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Přihlášení</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Vítejte zpět! Jsme rádi, že jste tady.
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto my-8 p-6 md:p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="relative">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Heslo</label>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 top-6">
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link href="/auth/forgot-password" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                Zapomněli jste heslo?
              </Link>
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Přihlašování...' : 'Přihlásit se'}
            </button>
          </div>
        </form>

        <div className="mt-6 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Nebo pokračujte s</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div>
            <button
              onClick={() => handleOAuthSignIn('google')}
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
              disabled={isLoading}
            >
              <span className="sr-only">Přihlásit se přes Google</span>
              <FaGoogle className="w-5 h-5" />
            </button>
          </div>
          <div>
            <button
              onClick={() => handleOAuthSignIn('apple')}
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
              disabled={isLoading}
            >
              <span className="sr-only">Přihlásit se přes Apple</span>
              <FaApple className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Nemáte účet?{' '}
            <Link href="/auth/register" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
              Zaregistrujte se
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
