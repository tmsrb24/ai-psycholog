import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import CookieSettingsModal from './CookieSettingsModal';

const CookieConsentBanner: React.FC = () => {
  const { t } = useTranslation('common');
  const [isVisible, setIsVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleSaveSettings = (settings: { analytics: boolean }) => {
    const consent = {
      necessary: true,
      analytics: settings.analytics,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('cookie_consent', JSON.stringify(consent));
    setIsVisible(false);
    if (settings.analytics) {
      window.location.reload();
    }
  };

  const handleAcceptAll = () => {
    handleSaveSettings({ analytics: true });
  };

  const handleAcceptNecessary = () => {
    handleSaveSettings({ analytics: false });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 shadow-lg z-50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between">
          <p className="text-sm mb-4 sm:mb-0">
            {t('cookieConsent.bannerText')}{' '}
            <button onClick={() => setIsModalOpen(true)} className="underline hover:text-gray-300">
              {t('cookieConsent.settings')}
            </button>
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
      <CookieSettingsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSettings}
      />
    </>
  );
};

export default CookieConsentBanner;
