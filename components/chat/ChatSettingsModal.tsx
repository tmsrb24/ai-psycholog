import React, { useState, useEffect } from 'react';
import { FaCog, FaTimes, FaSave, FaSpinner } from 'react-icons/fa';
import { UserProfileData } from '../../types/user';
import { useTranslation } from 'next-i18next';

interface ChatSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfileData | null;
  onProfileUpdate: (data: UserProfileData) => void;
}

const ChatSettingsModal: React.FC<ChatSettingsModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onProfileUpdate,
}) => {
  const { t } = useTranslation(['profile', 'chat']);
  const [preferences, setPreferences] = useState<UserProfileData['preferences']>({
    responseLength: 'medium',
    communicationStyle: 'casual',
    notificationFrequency: 'none',
    assistantGender: 'male',
    assistantName: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (userProfile?.preferences) {
      setPreferences(userProfile.preferences);
    }
  }, [userProfile]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage({ type: 'success', text: t('messages.profileUpdateSuccess', { ns: 'profile' }) });
        if (userProfile) {
            onProfileUpdate({ ...userProfile, preferences: data.preferences });
        }
        setTimeout(() => {
            setMessage({ type: '', text: '' });
            onClose();
        }, 2000);
      } else {
        setMessage({ type: 'error', text: data.message || t('messages.profileUpdateError', { ns: 'profile' }) });
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('messages.serverError', { ns: 'profile' }) });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col border border-gray-200 dark:border-slate-700">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <FaCog className="mr-3 text-blue-500" />
            {t('settingsModal.title', { ns: 'chat' })}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
            title="Zavřít"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-6 overflow-y-auto space-y-6">
          {message.text && (
            <div className={`p-3 rounded-md text-sm ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-300 text-green-700 dark:bg-green-800 dark:text-green-100 dark:border-green-700' 
                : 'bg-red-50 border border-red-300 text-red-700 dark:bg-red-800 dark:text-red-100 dark:border-red-700'
            }`} role="alert">
              {message.text}
            </div>
          )}
          {/* Response Length */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('chatbotSettings.responseLength.label', { ns: 'profile' })}</label>
            <div className="mt-2 flex space-x-4">
              <label className="inline-flex items-center">
                <input type="radio" className="form-radio" name="responseLength" value="short" checked={preferences.responseLength === 'short'} onChange={(e) => setPreferences({ ...preferences, responseLength: e.target.value as any })} />
                <span className="ml-2">{t('chatbotSettings.responseLength.short', { ns: 'profile' })}</span>
              </label>
              <label className="inline-flex items-center">
                <input type="radio" className="form-radio" name="responseLength" value="medium" checked={preferences.responseLength === 'medium'} onChange={(e) => setPreferences({ ...preferences, responseLength: e.target.value as any })} />
                <span className="ml-2">{t('chatbotSettings.responseLength.medium', { ns: 'profile' })}</span>
              </label>
              <label className="inline-flex items-center">
                <input type="radio" className="form-radio" name="responseLength" value="long" checked={preferences.responseLength === 'long'} onChange={(e) => setPreferences({ ...preferences, responseLength: e.target.value as any })} />
                <span className="ml-2">{t('chatbotSettings.responseLength.long', { ns: 'profile' })}</span>
              </label>
            </div>
          </div>
          {/* Communication Style */}
          <div>
            <label htmlFor="communicationStyle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('chatbotSettings.communicationStyle.label', { ns: 'profile' })}</label>
            <select id="communicationStyle" name="communicationStyle" value={preferences.communicationStyle} onChange={(e) => setPreferences({ ...preferences, communicationStyle: e.target.value as any })} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white">
              <option value="casual">{t('chatbotSettings.communicationStyle.casual', { ns: 'profile' })}</option>
              <option value="formal">{t('chatbotSettings.communicationStyle.formal', { ns: 'profile' })}</option>
            </select>
          </div>
          {/* Assistant Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('chatbotSettings.assistantGender.label', { ns: 'profile' })}</label>
            <div className="mt-2 flex space-x-4">
              <label className="inline-flex items-center">
                <input type="radio" className="form-radio" name="assistantGender" value="male" checked={preferences.assistantGender === 'male'} onChange={(e) => setPreferences({ ...preferences, assistantGender: e.target.value as any })} />
                <span className="ml-2">{t('chatbotSettings.assistantGender.male', { ns: 'profile' })}</span>
              </label>
              <label className="inline-flex items-center">
                <input type="radio" className="form-radio" name="assistantGender" value="female" checked={preferences.assistantGender === 'female'} onChange={(e) => setPreferences({ ...preferences, assistantGender: e.target.value as any })} />
                <span className="ml-2">{t('chatbotSettings.assistantGender.female', { ns: 'profile' })}</span>
              </label>
            </div>
          </div>
          {/* Assistant Name */}
          <div>
            <label htmlFor="assistantName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('chatbotSettings.assistantName.label', { ns: 'profile' })}</label>
            <input type="text" name="assistantName" id="assistantName" value={preferences.assistantName || ''} onChange={(e) => setPreferences({ ...preferences, assistantName: e.target.value })} className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" />
          </div>
        </div>
        
        {/* Modal Footer */}
        <div className="p-4 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-slate-700 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
          >
            {t('common:buttons.cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center justify-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 disabled:opacity-70"
          >
            {isSaving ? (
              <>
                <FaSpinner className="animate-spin mr-2 h-4 w-4" />
                {t('personalInfo.form.saving', { ns: 'profile' })}
              </>
            ) : (
              <>
                <FaSave className="mr-2" />
                {t('personalInfo.form.saveChanges', { ns: 'profile' })}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatSettingsModal;
