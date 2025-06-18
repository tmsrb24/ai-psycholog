import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Message } from '../types';
import Image from 'next/image';
import { FaUserCircle, FaVolumeUp, FaVolumeMute, FaCopy, FaCheck } from 'react-icons/fa';

export interface ChatMessageProps {
  message: Message;
  userAvatarUrl?: string | null;
  isSameSpeakerAsPrevious: boolean;
  isSpeaking?: boolean;
  onSpeakText?: (text: string) => void;
  onStopSpeaking?: () => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  userAvatarUrl,
  isSameSpeakerAsPrevious,
  isSpeaking = false,
  onSpeakText,
  onStopSpeaking
}) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const formatContent = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br />');
  };

  const avatarSize = 32; // consistent avatar size

  const Avatar = () => {
    if (isSameSpeakerAsPrevious) {
      return <div style={{ width: avatarSize }} className="flex-shrink-0" />;
    }
    
    const avatarSrc = isUser ? userAvatarUrl : '/images/hero-avatar.png';

    return (
      <div style={{ width: avatarSize, height: avatarSize }} className="flex-shrink-0 rounded-full overflow-hidden">
        {avatarSrc ? (
          <Image src={avatarSrc} alt={isUser ? "User Avatar" : "Assistant Avatar"} width={avatarSize} height={avatarSize} className="object-cover" />
        ) : (
          <FaUserCircle size={avatarSize} className="text-gray-400" />
        )}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'} ${isSameSpeakerAsPrevious ? 'mt-1' : 'mt-4'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {!isUser && <Avatar />}
      
      <div 
        className={`group relative max-w-[85%] sm:max-w-[75%] p-3 rounded-2xl shadow-sm ${
          isUser 
            ? 'bg-blue-500 text-white rounded-br-lg'
            : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-100 rounded-bl-lg'
        }`}
      >
        <div 
          className="prose prose-sm dark:prose-invert break-words"
          dangerouslySetInnerHTML={{ __html: formatContent(message.content) }}
        />
        
        {message.timestamp && (
          <div className={`text-xs pt-1.5 text-right opacity-70 ${isUser ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'}`}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}

        {/* Action buttons on hover */}
        <div className={`absolute -bottom-3 ${isUser ? '-left-10' : '-right-10'} flex items-center space-x-1 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          {!isUser && onSpeakText && onStopSpeaking && (
            <button
              onClick={() => isSpeaking ? onStopSpeaking() : onSpeakText(message.content)}
              className="p-1.5 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500"
              title={isSpeaking ? 'Zastavit' : 'Přečíst'}
            >
              {isSpeaking ? <FaVolumeMute size={12} /> : <FaVolumeUp size={12} />}
            </button>
          )}
          <button
            onClick={() => {
              navigator.clipboard.writeText(message.content);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="p-1.5 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500"
            title="Kopírovat"
          >
            {copied ? <FaCheck size={12} className="text-green-500" /> : <FaCopy size={12} />}
          </button>
        </div>
      </div>

      {isUser && <Avatar />}
    </motion.div>
  );
};

export default ChatMessage;
