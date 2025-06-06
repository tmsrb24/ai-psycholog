import React, { useState } from 'react';
import { FaVolumeUp, FaVolumeMute, FaCopy, FaCheck } from 'react-icons/fa';
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
  const [copied, setCopied] = useState(false);
  
  const formatContent = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br />');
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} // Slightly reduced y for a subtler entry
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`} // Reduced mb
    >
      <div 
        className={`max-w-[80%] p-3 rounded-xl shadow ${ // Added padding and base rounding
          isUser 
            ? 'bg-blue-500 text-white rounded-bl-xl' // User: blue bg, white text, tail bottom-left (visual right)
            : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-br-xl' // Assistant: gray bg, tail bottom-right (visual left)
        }`}
      >
        <div 
          className={`prose prose-sm dark:prose-invert break-words ${isUser ? 'text-white' : ''}`} // Ensure prose text color contrasts with bubble
          dangerouslySetInnerHTML={{ __html: formatContent(message.content) }}
        />
        
        <div className="flex items-center mt-1.5 space-x-2 justify-end"> {/* Adjusted spacing and alignment */}
          {!isUser && onSpeakText && onStopSpeaking && (
            <button
              onClick={() => isSpeaking ? onStopSpeaking() : onSpeakText(message.content)}
              className={`hover:opacity-75 ${isUser ? 'text-blue-100 hover:text-white' : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'}`}
              title={isSpeaking ? 'Zastavit předčítání' : 'Přečíst zprávu nahlas'}
            >
              {isSpeaking ? <FaVolumeMute size={14} /> : <FaVolumeUp size={14} />}
            </button>
          )}
          <button
            onClick={() => {
              navigator.clipboard.writeText(message.content);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className={`hover:opacity-75 ${isUser ? 'text-blue-100 hover:text-white' : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'}`}
            title="Kopírovat zprávu"
          >
            {copied ? <FaCheck size={14} className="text-green-400" /> : <FaCopy size={14} />}
          </button>
        </div>
        
        {message.timestamp && (
          <div className={`text-xs mt-1 text-right ${isUser ? 'text-blue-200' : 'text-gray-400 dark:text-gray-500'}`}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ChatMessage;
