import React from 'react';
import { useTranslation } from 'next-i18next';

interface CookieSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: { analytics: boolean }) => void;
}

const CookieSettingsModal: React.FC<CookieSettingsModalProps> = ({ isOpen, onClose, onSave }) => {
  const { t } = useTranslation('common');
  const [analyticsEnabled, setAnalyticsEnabled] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      const consent = localStorage.getItem('cookie_consent');
      if (consent) {
        setAnalyticsEnabled(JSON.parse(consent).analytics);
      }
    }
  }, [isOpen]);

  const handleSave = () => {
    onSave({ analytics: analyticsEnabled });
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">{t('cookieConsent.settingsTitle')}</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">{t('cookieConsent.necessaryCookies')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('cookieConsent.necessaryDescription')}</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{t('cookieConsent.analyticsCookies')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('cookieConsent.analyticsDescription')}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={analyticsEnabled}
                onChange={() => setAnalyticsEnabled(!analyticsEnabled)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <button onClick={onClose} className="text-sm underline hover:text-gray-600 dark:hover:text-gray-400">
            {t('cookieConsent.cancel')}
          </button>
          <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
            {t('cookieConsent.saveSettings')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieSettingsModal;
