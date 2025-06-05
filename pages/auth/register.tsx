import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { FaGoogle, FaApple } from 'react-icons/fa'; // Removed unused icons

const Register = () => {
  // Removed states related to email/password form: name, email, password, confirmPassword, showPassword, showConfirmPassword
  // Removed password validation logic: hasMinLength, hasUpperCase, etc.
  // Removed isFormValid and related logic
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // Removed agreeTerms state as it was part of the email form
  const router = useRouter();
  const { callbackUrl } = router.query;

  // Removed handleSubmit function as it was for email/password registration

  const handleOAuthSignIn = (provider: string) => {
    setIsLoading(true);
    // Ensure NEXTAUTH_URL is defined or provide a default fallback for local development
    const defaultCallbackUrl = '/';
    let fullCallbackUrl = (callbackUrl as string || defaultCallbackUrl);
    if (process.env.NEXTAUTH_URL) {
        // Ensure no double slashes if callbackUrl already starts with /
        fullCallbackUrl = process.env.NEXTAUTH_URL + (fullCallbackUrl.startsWith('/') ? fullCallbackUrl : `/${fullCallbackUrl}`);
    } else if (typeof window !== 'undefined') {
        // Fallback for client-side if NEXTAUTH_URL is not set (e.g. local dev without .env)
        fullCallbackUrl = window.location.origin + (fullCallbackUrl.startsWith('/') ? fullCallbackUrl : `/${fullCallbackUrl}`);
    }
    console.log(`Signing in with ${provider}, callbackUrl: ${fullCallbackUrl}`);
    signIn(provider, { callbackUrl: fullCallbackUrl });
  };

  return (
    <Layout title="Registrace | AI Psycholog" description="Vytvořte si nový účet na AI Psycholog">
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 dark:from-blue-900 dark:via-blue-800 dark:to-blue-700 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Registrace</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Vytvořte si účet a získejte přístup k personalizovaným funkcím
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto my-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 rounded-md">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-6">
          <button
            onClick={() => handleOAuthSignIn('google')}
            className="w-full flex items-center justify-center gap-2 p-3 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            disabled={isLoading}
          >
            <FaGoogle className="text-red-500" />
            <span>Registrovat se přes Google</span>
          </button>
          
          <button
            onClick={() => handleOAuthSignIn('apple')}
            className="w-full flex items-center justify-center gap-2 p-3 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            disabled={isLoading}
          >
            <FaApple className="text-gray-800 dark:text-white" />
            <span>Registrovat se přes Apple</span>
          </button>
        </div>

        {/* Email registration form and divider removed */}

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
