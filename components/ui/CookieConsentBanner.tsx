import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';

const CookieConsentBanner: React.FC = () => {
  const { t } = useTranslation('common');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const consent = {
      necessary: true,
      analytics: true,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('cookie_consent', JSON.stringify(consent));
    setIsVisible(false);
    window.location.reload(); // Reload to apply analytics scripts
  };

  const handleAcceptNecessary = () => {
    const consent = {
      necessary: true,
      analytics: false,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('cookie_consent', JSON.stringify(consent));
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 shadow-lg z-50">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between">
        <p className="text-sm mb-4 sm:mb-0">
          {t('cookieConsent.bannerText')}{' '}
          <Link href="/gdpr" className="underline hover:text-gray-300">
            {t('cookieConsent.learnMore')}
          </Link>
        </p>
        <div className="flex space-x-4">
          <button onClick={handleAcceptNecessary} className="text-sm underline hover:text-gray-300">
            {t('cookieConsent.acceptNecessary')}
          </button>
          <button onClick={handleAcceptAll} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
            {t('cookieConsent.acceptAll')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentBanner;
