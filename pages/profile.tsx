import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { FaUser, FaEnvelope, FaSave, FaCamera, FaShieldAlt, FaTrashAlt, FaKey } from 'react-icons/fa';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next'; // Změna na GetServerSideProps
import { getSession } from 'next-auth/react'; // Pro ochranu stránky

type PageProps = {}; // Může být prázdné, pokud getSSP vrací jen i18n props

const ProfilePage = (_props: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { t } = useTranslation(['profile', 'common']);
  const { data: session, status } = useSession();
  const loading = status === "loading";
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!loading && !session) {
      router.push('/auth/login?callbackUrl=/profile');
    }
  }, [session, loading, router]);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || '');
      setEmail(session.user.email || '');
    }
  }, [session]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/user/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage({ type: 'success', text: t('messages.profileUpdateSuccess', 'Profil byl úspěšně aktualizován. Změny se mohou projevit po novém přihlášení.') });
        // Optionally, update session data locally if next-auth supports it easily
        // or prompt user to re-login to see changes immediately in session.
      } else {
        setMessage({ type: 'error', text: data.message || t('messages.profileUpdateError', 'Nastala chyba při aktualizaci profilu') });
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('messages.serverError', 'Nastala chyba při komunikaci se serverem.') });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  if (loading || !session) { // Session se kontroluje v getServerSideProps, ale pro jistotu i zde
    return (
      <Layout title={t('common:loading', 'Načítání...')} description={t('pageDescriptionLoading', 'Načítání profilu')}>
        <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={t('pageTitle', 'Můj profil | AI Psycholog')} description={t('pageDescription', 'Správa vašeho uživatelského profilu')}>
      <section className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 dark:from-blue-900 dark:via-blue-800 dark:to-blue-700 text-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{t('header.title', 'Můj profil')}</h1>
          <p className="text-lg md:text-xl opacity-90">
            {t('header.subtitle', 'Spravujte své osobní údaje, bezpečnost a nastavení účtu.')}
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
        {message.text && (
          <div className={`p-4 rounded-md shadow ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-300 text-green-700 dark:bg-green-800 dark:text-green-100 dark:border-green-700' 
              : 'bg-red-50 border border-red-300 text-red-700 dark:bg-red-800 dark:text-red-100 dark:border-red-700'
          }`} role="alert">
            {message.text}
          </div>
        )}

        {/* Osobní údaje Section */}
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
          <div className="p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <FaUser className="mr-3 text-blue-500" />
              {t('personalInfo.title', 'Osobní údaje')}
            </h2>
            
            <div className="flex flex-col md:flex-row items-center mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
              <div className="mb-6 md:mb-0 md:mr-8 text-center">
                <div className="relative w-32 h-32 mx-auto">
                  {session.user?.image ? (
                    <img 
                      src={session.user.image} 
                      alt={session.user.name || t('personalInfo.avatarAlt', 'Profilový obrázek')} 
                      className="h-32 w-32 rounded-full object-cover shadow-md"
                    />
                  ) : (
                    <div className="h-32 w-32 rounded-full bg-blue-500 flex items-center justify-center text-white text-5xl shadow-md">
                      <FaUser />
                    </div>
                  )}
                  <button 
                    className="absolute bottom-1 right-1 bg-gray-700 dark:bg-gray-600 text-white p-2 rounded-full hover:bg-gray-800 dark:hover:bg-gray-500 transition-colors shadow"
                    title={t('personalInfo.changeAvatarTooltip', 'Změnit profilový obrázek (již brzy)')}
                    disabled={true} 
                  >
                    <FaCamera size={14} />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                  {session.user?.name || t('personalInfo.defaultUserName', 'Uživatel')}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {session.user?.email}
                </p>
                {/* <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                  {t('personalInfo.memberSince', 'Člen od:')} {session.user.createdAt ? new Date(session.user.createdAt).toLocaleDateString(router.locale) : t('personalInfo.unknown', 'Neznámé')}
                </p> */}
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div>
                <label htmlFor="profile-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('personalInfo.form.name.label', 'Jméno a příjmení')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    id="profile-name"
                    name="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder={t('personalInfo.form.name.placeholder', 'Vaše jméno')}
                    disabled={isUpdatingProfile}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="profile-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('personalInfo.form.email.label', 'Email')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    id="profile-email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder={t('personalInfo.form.email.placeholder', 'vas@email.cz')}
                    disabled={isUpdatingProfile}
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center justify-center px-6 py-2.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 disabled:opacity-70"
                  disabled={isUpdatingProfile}
                >
                  {isUpdatingProfile ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      {t('personalInfo.form.saving', 'Ukládání...')}
                    </>
                  ) : (
                    <>
                      <FaSave className="mr-2" />
                      {t('personalInfo.form.saveChanges', 'Uložit změny')}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Bezpečnost a správa účtu Section */}
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
          <div className="p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <FaShieldAlt className="mr-3 text-blue-500" />
              {t('security.title', 'Bezpečnost a správa účtu')}
            </h2>
            
            <div className="space-y-6">
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-md">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div className="mb-3 sm:mb-0">
                    <h4 className="text-md font-medium text-gray-800 dark:text-white flex items-center"><FaKey className="mr-2 text-gray-500 dark:text-gray-400"/>{t('security.changePassword.title', 'Změna hesla')}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('security.changePassword.description', 'Aktualizujte své heslo pro zvýšení bezpečnosti.')}</p>
                  </div>
                  <button
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 whitespace-nowrap"
                    onClick={() => router.push('/auth/change-password')}
                  >
                    {t('security.changePassword.button', 'Změnit heslo')}
                  </button>
                </div>
              </div>
              
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-md">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div className="mb-3 sm:mb-0">
                    <h4 className="text-md font-medium text-gray-800 dark:text-white flex items-center"><FaTrashAlt className="mr-2 text-red-500 dark:text-red-400"/>{t('security.deleteAccount.title', 'Odstranění účtu')}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('security.deleteAccount.description', 'Trvale odstraní váš účet a všechna související data.')}</p>
                  </div>
                  <button
                    className="px-4 py-2 border border-red-500 dark:border-red-600 rounded-md shadow-sm text-sm font-medium text-red-600 dark:text-red-300 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800 whitespace-nowrap"
                    onClick={() => {
                      if (window.confirm(t('security.deleteAccount.confirm', 'Opravdu chcete trvale odstranit svůj účet? Tato akce je nevratná.'))) {
                        // TODO: Implement account deletion API call
                        alert(t('security.deleteAccount.toBeImplemented', 'Funkce pro odstranění účtu bude brzy implementována.'));
                        // Example: await fetch('/api/user/delete-account', { method: 'POST' });
                        // router.push('/'); // Redirect after deletion
                      }
                    }}
                  >
                    {t('security.deleteAccount.button', 'Odstranit účet')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;

export const getServerSideProps: GetServerSideProps<PageProps> = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: `/auth/login?callbackUrl=${encodeURIComponent(context.resolvedUrl)}`,
        permanent: false,
      },
    };
  }

  return {
    props: {
      ...(await serverSideTranslations(context.locale ?? 'cs', ['profile', 'common'])),
    },
  };
};
