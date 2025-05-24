import React from 'react';
import { FaQuestionCircle, FaTimes } from 'react-icons/fa'; // Nebo jiná ikona, např. FaCommentDots

interface WidgetChatButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

const WidgetChatButton: React.FC<WidgetChatButtonProps> = ({ onClick, isOpen }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg z-50 transition-transform duration-300 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      aria-label={isOpen ? "Zavřít FAQ chat" : "Otevřít FAQ chat"}
    >
      {isOpen ? <FaTimes size={24} /> : <FaQuestionCircle size={24} />}
    </button>
  );
};

export default WidgetChatButton;
