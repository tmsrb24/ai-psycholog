import React from 'react';
import { useTranslation } from 'next-i18next';
import { FaTimes } from 'react-icons/fa';
import Image from 'next/image';

interface WidgetChatButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

const WidgetChatButton: React.FC<WidgetChatButtonProps> = ({ onClick, isOpen }) => {
  const { t } = useTranslation('common'); // Assuming 'common' namespace for these general UI texts

  return (
    <button
      onClick={onClick}
      className={`fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-5 rounded-full shadow-xl z-50 transition-all duration-300 ease-in-out transform focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
                  ${!isOpen ? 'animate-pulse hover:scale-110' : 'hover:scale-105'}`}
      aria-label={isOpen ? t('widgetChat.closeHelp', 'Zavřít Nápovědu') : t('widgetChat.openHelp', 'Otevřít Nápovědu')}
    >
      {isOpen ? (
        <div className="flex items-center">
          <FaTimes size={20} className="mr-2" /> {t('widgetChat.close', 'Zavřít')}
        </div>
      ) : (
        <div className="flex items-center">
          <Image src="/images/faq.png" alt="FAQ Icon" width={24} height={24} className="mr-2" /> {t('widgetChat.askUs', 'Zeptejte se')}
        </div>
      )}
    </button>
  );
};

export default WidgetChatButton;
