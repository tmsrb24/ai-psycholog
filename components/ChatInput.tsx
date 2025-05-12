import React, { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaMicrophone, FaSpinner } from 'react-icons/fa';

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

  // Auto-resize textarea as content grows
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="flex items-end bg-white dark:bg-gray-800 rounded-lg shadow-md p-3">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          className="flex-grow resize-none max-h-32 p-2 focus:outline-none bg-transparent dark:text-white"
          rows={1}
        />
        
        <button
          type="submit"
          disabled={!message.trim() || isLoading}
          className={`ml-2 p-2 rounded-full ${
            message.trim() && !isLoading
              ? 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800'
              : 'bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
          } transition-colors`}
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
