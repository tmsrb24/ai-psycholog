import React from 'react';
import { FaTimes, FaCommentDots } from 'react-icons/fa'; // FaQuestionCircle nahrazena FaCommentDots pro zavřený stav

interface WidgetChatButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

const WidgetChatButton: React.FC<WidgetChatButtonProps> = ({ onClick, isOpen }) => {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-5 rounded-full shadow-xl z-50 transition-all duration-300 ease-in-out transform focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
                  ${!isOpen ? 'animate-pulse hover:scale-110' : 'hover:scale-105'}`}
      aria-label={isOpen ? "Zavřít Nápovědu" : "Otevřít Nápovědu"}
    >
      {isOpen ? (
        <div className="flex items-center">
          <FaTimes size={20} className="mr-2" /> Zavřít
        </div>
      ) : (
        <div className="flex items-center">
          <FaCommentDots size={22} className="mr-2" /> Zeptejte se
        </div>
      )}
    </button>
  );
};

export default WidgetChatButton;
