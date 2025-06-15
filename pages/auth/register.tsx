import React, { useState, FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { FaGoogle, FaApple, FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();
  const { callbackUrl } = router.query;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Hesla se neshodují.');
      return;
    }
    if (password.length < 8) {
      setError('Heslo musí mít alespoň 8 znaků.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post('/api/auth/register', {
        firstName,
        lastName,
        phone,
        email,
        password,
      });
      
      setSuccess(response.data.message || 'Registrace byla úspěšná. Zkontrolujte prosím svůj e-mail pro potvrzení účtu.');
      // Optionally redirect after a delay
      // setTimeout(() => {
      //   router.push('/auth/login');
      // }, 3000);

    } catch (err: any) {
      console.error("Registration error:", err);
      const errorMessage = err.response?.data?.error || 'Během registrace došlo k chybě.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = (provider: string) => {
    setIsLoading(true);
    signIn(provider, { callbackUrl: (callbackUrl as string) || '/' });
  };

  return (
    <Layout title="Registrace | AI Psycholog" description="Vytvořte si nový účet na AI Psycholog">
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 dark:from-blue-900 dark:via-blue-800 dark:to-blue-700 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Vytvořit účet</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Začněte svou cestu k duševní pohodě ještě dnes.
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto my-8 p-6 md:p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 rounded-md text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200 rounded-md text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full">
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Jméno</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="w-full">
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Příjmení</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Telefon (nepovinné)</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>
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
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 top-6">
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <div className="relative">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Potvrdit heslo</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 top-6">
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Registrace...' : 'Vytvořit účet'}
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
              <span className="sr-only">Registrovat se přes Google</span>
              <FaGoogle className="w-5 h-5" />
            </button>
          </div>
          <div>
            <button
              onClick={() => handleOAuthSignIn('apple')}
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
              disabled={isLoading}
            >
              <span className="sr-only">Registrovat se přes Apple</span>
              <FaApple className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Již máte účet?{' '}
            <Link href="/auth/login" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
              Přihlaste se
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Register;
