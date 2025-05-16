import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { FaUser, FaEnvelope, FaSave, FaCamera } from 'react-icons/fa';

const ProfilePage = () => {
  const { data: session, status } = useSession();
  const loading = status === "loading";
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !session) {
      router.push('/auth/login?callbackUrl=/profile');
    }
  }, [session, loading, router]);

  // Initialize form with user data
  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || '');
      setEmail(session.user.email || '');
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/user/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Profil byl úspěšně aktualizován' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Nastala chyba při aktualizaci profilu' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Nastala chyba při aktualizaci profilu' });
    } finally {
      setIsUpdating(false);
    }
  };

  // Show loading state or redirect if not authenticated
  if (loading || !session) {
    return (
      <Layout title="Načítání... | AI Psycholog" description="Načítání profilu">
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Můj profil | AI Psycholog" description="Správa vašeho uživatelského profilu">
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 dark:from-blue-900 dark:via-blue-800 dark:to-blue-700 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Můj profil</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Spravujte své osobní údaje a nastavení
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto my-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        {message.text && (
          <div className={`mb-6 p-4 rounded-md ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200' 
              : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <div className="flex flex-col md:flex-row items-center mb-8">
          <div className="mb-4 md:mb-0 md:mr-8">
            <div className="relative">
              {session.user?.image ? (
                <img 
                  src={session.user.image} 
                  alt={session.user.name || "Profilový obrázek"} 
                  className="h-32 w-32 rounded-full object-cover"
                />
              ) : (
                <div className="h-32 w-32 rounded-full bg-blue-500 flex items-center justify-center text-white">
                  <FaUser size={64} />
                </div>
              )}
              <button 
                className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                title="Změnit profilový obrázek"
                disabled={true} // Functionality to be implemented later
              >
                <FaCamera size={16} />
              </button>
            </div>
          </div>
          
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {session.user?.name || 'Uživatel'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              {session.user?.email}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Člen od {new Date().toLocaleDateString('cs-CZ')}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Jméno
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="text-gray-400" />
              </div>
              <input
                id="name"
                name="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Vaše jméno"
                disabled={isUpdating}
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="vas@email.cz"
                disabled={isUpdating}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Ukládání...
                </>
              ) : (
                <>
                  <FaSave className="mr-2" />
                  Uložit změny
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Nastavení účtu</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Změna hesla</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Aktualizujte své heslo pro zvýšení bezpečnosti</p>
              </div>
              <button
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => router.push('/auth/change-password')}
              >
                Změnit heslo
              </button>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Odstranění účtu</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Trvale odstraní váš účet a všechna data</p>
              </div>
              <button
                className="px-4 py-2 border border-red-300 dark:border-red-700 rounded-md shadow-sm text-sm font-medium text-red-700 dark:text-red-300 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                onClick={() => {
                  if (window.confirm('Opravdu chcete odstranit svůj účet? Tato akce je nevratná.')) {
                    // Account deletion logic to be implemented
                    alert('Tato funkce bude brzy k dispozici');
                  }
                }}
              >
                Odstranit účet
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
