import React, { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaSpinner } from 'react-icons/fa'; // FaMicrophone removed as it's not used

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading = false,
  placeholder = 'Napište zprávu...'
}) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 128)}px`; // 128px is max-h-32
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'; // Reset height after send
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      {/* The container now has more padding, rounded corners, and a focus-within ring effect */}
      <div className="flex items-end bg-gray-100 dark:bg-slate-700 rounded-xl p-2 border border-transparent focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all duration-200">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          className="flex-grow resize-none max-h-32 p-2 focus:outline-none bg-transparent dark:text-white dark:placeholder-gray-400"
          rows={1}
        />
        
        <button
          type="submit"
          disabled={!message.trim() || isLoading}
          className={`ml-2 flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 ease-in-out transform focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
            message.trim() && !isLoading
              ? 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 hover:scale-105'
              : 'bg-gray-300 text-gray-500 dark:bg-gray-600 dark:text-gray-400 cursor-not-allowed'
          }`}
          title="Odeslat zprávu"
        >
          {isLoading ? (
            <FaSpinner className="animate-spin" size={18} />
          ) : (
            <FaPaperPlane size={18} />
          )}
        </button>
      </div>
    </form>
  );
};

export default ChatInput;
