import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
// Removed getCsrfToken and GetServerSidePropsContext as they are no longer needed
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { FaGoogle, FaApple } from 'react-icons/fa'; // Removed unused icons

// Removed LoginProps interface

const Login = () => { // Removed csrfToken prop
  // Removed email, password, showPassword states
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { callbackUrl } = router.query;

  // Removed handleSubmit function

  const handleOAuthSignIn = (provider: string) => {
    setIsLoading(true);
    // Ensure NEXTAUTH_URL is defined or provide a default fallback for local development
    const defaultCallbackUrl = '/';
    let fullCallbackUrl = (callbackUrl as string || defaultCallbackUrl);
    if (process.env.NEXTAUTH_URL) {
        fullCallbackUrl = process.env.NEXTAUTH_URL + (fullCallbackUrl.startsWith('/') ? fullCallbackUrl : `/${fullCallbackUrl}`);
    } else if (typeof window !== 'undefined') {
        fullCallbackUrl = window.location.origin + (fullCallbackUrl.startsWith('/') ? fullCallbackUrl : `/${fullCallbackUrl}`);
    }
    console.log(`Signing in with ${provider}, callbackUrl: ${fullCallbackUrl}`);
    signIn(provider, { callbackUrl: fullCallbackUrl });
  };

  // Removed handleEmailSignIn function

  return (
    <Layout title="Přihlášení | AI Psycholog" description="Přihlaste se ke svému účtu AI Psycholog">
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 dark:from-blue-900 dark:via-blue-800 dark:to-blue-700 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Přihlášení</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Přihlaste se ke svému účtu a získejte přístup k personalizovaným funkcím
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
            <span>Přihlásit se přes Google</span>
          </button>
          
          <button
            onClick={() => handleOAuthSignIn('apple')}
            className="w-full flex items-center justify-center gap-2 p-3 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            disabled={isLoading}
          >
            <FaApple className="text-gray-800 dark:text-white" />
            <span>Přihlásit se přes Apple</span>
          </button>
        </div>

        {/* Email login form, divider, and email link sign-in button removed */}

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

// Removed getServerSideProps as csrfToken is no longer needed
// export async function getServerSideProps(context: GetServerSidePropsContext) {
//   const csrfToken = await getCsrfToken(context);
//   return {
//     props: { csrfToken: csrfToken || null },
//   };
// }

export default Login;
