import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '../components/layouts/Layout';
import Image from 'next/image';
import { FaUser, FaEnvelope, FaSave, FaCamera, FaShieldAlt, FaTrashAlt, FaKey, FaCog, FaSpinner, FaCrown } from 'react-icons/fa';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { getSession } from 'next-auth/react';
import { UserProfileData } from '../types/user';

type Subscription = {
  plan_id: string;
  status: string;
  end_date: string;
};

type PageProps = {};

const ProfilePage = (_props: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { t } = useTranslation(['profile', 'common']);
  const { data: session, status } = useSession();
  const loading = status === "loading";
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [preferences, setPreferences] = useState<UserProfileData['preferences']>({
    responseLength: 'medium',
    communicationStyle: 'casual',
    notificationFrequency: 'none',
    assistantGender: 'male',
  });

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

  useEffect(() => {
    const fetchProfile = async () => {
      if (session) {
        try {
          const response = await fetch('/api/user/profile');
          if (response.ok) {
            const data = await response.json();
            if (data.preferences) {
              setPreferences(data.preferences);
            }
          } else {
            console.error('Failed to fetch profile');
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      }
    };
    fetchProfile();
  }, [session]);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (session) {
        try {
          const response = await fetch('/api/user/subscription');
          if (response.ok) {
            const data = await response.json();
            setSubscription(data);
          } else {
            console.error('Failed to fetch subscription');
            setSubscription(null);
          }
        } catch (error) {
          console.error('Error fetching subscription:', error);
          setSubscription(null);
        }
      }
    };
    fetchSubscription();
  }, [session]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, preferences }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage({ type: 'success', text: t('messages.profileUpdateSuccess') });
      } else {
        setMessage({ type: 'error', text: data.message || t('messages.profileUpdateError') });
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('messages.serverError') });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm(t('security.deleteAccount.confirm'))) {
      return;
    }
    setIsDeletingAccount(true);
    setMessage({ type: '', text: '' });
    try {
      const response = await fetch('/api/user/account', {
        method: 'DELETE',
      });
      if (response.ok) {
        setMessage({ type: 'success', text: t('security.deleteAccount.deleteSuccess') });
        await signOut({ callbackUrl: '/' });
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.message || t('security.deleteAccount.deleteError') });
        setIsDeletingAccount(false);
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('messages.serverError') });
      setIsDeletingAccount(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    setIsUploadingAvatar(true);
    setMessage({ type: '', text: '' });
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        setMessage({ type: 'success', text: t('messages.avatarUpdateSuccess') });
        window.location.reload();
      } else {
        setMessage({ type: 'error', text: data.message || t('messages.avatarUpdateError') });
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('messages.serverError') });
    } finally {
      setIsUploadingAvatar(false);
      setAvatarFile(null);
    }
  };
  
  if (loading || !session) { 
    return (
      <Layout title={t('common:loading')} description={t('pageDescriptionLoading')}>
        <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={t('pageTitle', 'Můj profil | AI Psycholog')} description={t('pageDescription', 'Správa vašeho uživatelského profilu')}>
      <section className="bg-hero-gradient-dark text-white py-12 md:py-16">
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

        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
          <div className="p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <FaUser className="mr-3 text-blue-500" />
              {t('personalInfo.title')}
            </h2>
            
            <div className="flex flex-col md:flex-row items-center mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
              <div className="mb-6 md:mb-0 md:mr-8 text-center">
                <div className="relative w-32 h-32 mx-auto">
                  {session.user?.image ? (
                    <Image 
                      src={session.user.image} 
                      alt={session.user.name || t('personalInfo.avatarAlt', 'Profilový obrázek')} 
                      width={128}
                      height={128}
                      className="rounded-full object-cover shadow-md"
                      priority 
                    />
                  ) : (
                    <div className="h-32 w-32 rounded-full bg-blue-500 flex items-center justify-center text-white text-5xl shadow-md">
                      <FaUser />
                    </div>
                  )}
                  <button 
                    className="absolute bottom-1 right-1 bg-gray-700 dark:bg-gray-600 text-white p-2 rounded-full hover:bg-gray-800 dark:hover:bg-gray-500 transition-colors shadow"
                    title={t('personalInfo.changeAvatarTooltip', 'Změnit profilový obrázek')}
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                  >
                    <FaCamera size={14} />
                  </button>
                  <input
                    type="file"
                    id="avatar-upload"
                    className="hidden"
                    accept="image/png, image/jpeg"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setAvatarFile(e.target.files[0]);
                        handleAvatarUpload(e.target.files[0]);
                      }
                    }}
                  />
                </div>
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                  {session.user?.name || t('personalInfo.defaultUserName', 'Uživatel')}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {session.user?.email}
                </p>
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
                    placeholder={t('personalInfo.form.name.placeholder')}
                    disabled={isUpdatingProfile}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="profile-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('personalInfo.form.email.label')}
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
                    placeholder={t('personalInfo.form.email.placeholder')}
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
                      <FaSpinner className="animate-spin mr-2 h-4 w-4" />
                      {t('personalInfo.form.saving')}
                    </>
                  ) : (
                    <>
                      <FaSave className="mr-2" />
                      {t('personalInfo.form.saveChanges')}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
          <div className="p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <FaCrown className="mr-3 text-blue-500" />
              {t('subscription.title', 'Předplatné')}
            </h2>
            {subscription ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                  <span className="text-gray-600 dark:text-gray-300">{t('subscription.plan', 'Plán')}</span>
                  <span className="font-semibold text-gray-900 dark:text-white capitalize">{subscription.plan_id}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                  <span className="text-gray-600 dark:text-gray-300">{t('subscription.status', 'Stav')}</span>
                  <span className={`font-semibold px-2 py-1 rounded-full text-xs ${subscription.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                    {subscription.status}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                  <span className="text-gray-600 dark:text-gray-300">{t('subscription.endDate', 'Platné do')}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{new Date(subscription.end_date).toLocaleDateString('cs-CZ')}</span>
                </div>
                <div className="pt-4">
                  <button 
                    onClick={() => router.push('/pricing')}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
                  >
                    {t('subscription.manage', 'Spravovat předplatné')}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-gray-500 dark:text-gray-400 mb-4">{t('subscription.noSubscription', 'Nemáte žádné aktivní předplatné.')}</p>
                <button 
                  onClick={() => router.push('/pricing')}
                  className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
                >
                  {t('subscription.viewPlans', 'Zobrazit plány')}
                </button>
              </div>
            )}
          </div>
        </div>


        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
          <div className="p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <FaShieldAlt className="mr-3 text-blue-500" />
              {t('security.title')}
            </h2>
            
            <div className="space-y-6">
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-md">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div className="mb-3 sm:mb-0">
                    <h4 className="text-md font-medium text-gray-800 dark:text-white flex items-center"><FaKey className="mr-2 text-gray-500 dark:text-gray-400"/>{t('security.changePassword.title')}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('security.changePassword.description')}</p>
                  </div>
                  <button
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 whitespace-nowrap"
                    onClick={() => router.push('/auth/change-password')}
                  >
                    {t('security.changePassword.button')}
                  </button>
                </div>
              </div>
              
              <div className="p-4 border border-red-200 dark:border-red-700/50 rounded-md bg-red-50/30 dark:bg-red-900/10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div className="mb-3 sm:mb-0">
                    <h4 className="text-md font-medium text-red-700 dark:text-red-300 flex items-center"><FaTrashAlt className="mr-2"/>{t('security.deleteAccount.title')}</h4>
                    <p className="text-sm text-red-600/80 dark:text-red-400/80 mt-1">{t('security.deleteAccount.description')}</p>
                  </div>
                  <button
                    className="px-4 py-2 border border-red-500 dark:border-red-600 rounded-md shadow-sm text-sm font-medium text-red-600 dark:text-red-300 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800 whitespace-nowrap disabled:opacity-70"
                    onClick={handleDeleteAccount}
                    disabled={isDeletingAccount}
                  >
                    {isDeletingAccount ? (
                      <>
                        <FaSpinner className="animate-spin mr-2 h-4 w-4" />
                        {t('security.deleteAccount.deleting')}
                      </>
                    ) : (
                      t('security.deleteAccount.button')
                    )}
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
