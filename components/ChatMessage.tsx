import React from 'react';
import { FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Message } from '../types';

export interface ChatMessageProps {
  message: Message;
  isSpeaking?: boolean;
  onSpeakText?: (text: string) => void;
  onStopSpeaking?: () => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isSpeaking = false,
  onSpeakText,
  onStopSpeaking
}) => {
  const isUser = message.role === 'user';
  
  // Format message content with Markdown
  const formatContent = (content: string) => {
    // Simple Markdown formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
      .replace(/\n/g, '<br />'); // Line breaks
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`max-w-[80%] ${isUser ? 'user-message' : 'assistant-message'}`}>
        <div 
          className="prose prose-sm dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: formatContent(message.content) }}
        />
        
        {!isUser && onSpeakText && onStopSpeaking && (
          <div className="flex justify-end mt-2">
            <button
              onClick={() => isSpeaking ? onStopSpeaking() : onSpeakText(message.content)}
              className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
              title={isSpeaking ? 'Zastavit předčítání' : 'Přečíst zprávu nahlas'}
            >
              {isSpeaking ? <FaVolumeMute size={16} /> : <FaVolumeUp size={16} />}
            </button>
          </div>
        )}
        
        {message.timestamp && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ChatMessage;
