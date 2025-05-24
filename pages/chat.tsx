import React from 'react';
import Layout from '../components/Layout';
import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { 
  FaMicrophone, FaVolumeUp, FaVolumeMute, FaCog, FaHistory, 
  FaBookMedical, FaUserFriends, FaSadTear, FaRunning, FaHeart,
  FaSun, FaMoon, FaRobot, FaUser, FaChartLine, FaTrophy, FaTimes
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../components/ThemeProvider';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import LoadingIndicator from '../components/LoadingIndicator';
import UserProfile from '../components/UserProfile';
import { UserProfileData } from '../types';
import SentimentAnalyzer from '../components/SentimentAnalyzer';
import Gamification from '../components/Gamification';
import CrisisNotice from '../components/CrisisNotice';
import ChatSettingsModal from '../components/ChatSettingsModal';
import { Message } from '../types';

const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'system', content: 'Jsi cesky psycholog. Odpovidej klidne, empaticky, a nikdy nediagnostikuj.' },
  ]);
  const [loading, setLoading] = useState(false);
  const [loadingEstimatedTime, setLoadingEstimatedTime] = useState(5);
  const [selectedTopic, setSelectedTopic] = useState<'anxiety' | 'relationships' | 'depression' | 'stress' | 'selfEsteem' | null>(null);
  const [selectedPersonality, setSelectedPersonality] = useState<'supportive' | 'practical' | 'analytical' | 'mentor' | 'coach' | 'mediator' | null>(null);
  const [saveHistory, setSaveHistory] = useState(true);
  const [responseLength, setResponseLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [assistantGender, setAssistantGender] = useState<'male' | 'female'>('male');
  const [assistantName, setAssistantName] = useState<string>('');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [currentChatSessionId, setCurrentChatSessionId] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfileData>({
    name: 'Uživatel',
    avatar_url: null,
    preferences: {
      responseLength: 'medium',
      communicationStyle: 'casual',
      notificationFrequency: 'none',
      assistantGender: 'male',
    }
  });
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showGamification, setShowGamification] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const [lastSessionDate, setLastSessionDate] = useState<Date | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push('/auth/login?callbackUrl=/chat');
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const synth = window.speechSynthesis;
      setSpeechSynthesis(synth);
      const loadVoices = () => {
        const voices = synth.getVoices();
        if (voices.length > 0) setAvailableVoices(voices);
      };
      if (synth.getVoices().length === 0) synth.onvoiceschanged = loadVoices;
      else loadVoices();
    }

    const loadInitialData = async () => {
      if (authStatus === "authenticated" && session?.user) {
        try {
          const profileResponse = await fetch('/api/user/profile');
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            setUserProfile(profileData);
            if (profileData.preferences) {
              setResponseLength(profileData.preferences.responseLength || 'medium');
              if (profileData.preferences.assistantGender) setAssistantGender(profileData.preferences.assistantGender);
              if (profileData.preferences.assistantName) setAssistantName(profileData.preferences.assistantName);
            }
          } else {
            console.error('Nepodařilo se načíst profil uživatele:', profileResponse.statusText);
          }
        } catch (error) {
          console.error('Chyba při načítání profilu uživatele:', error);
        }
        try {
          const chatHistoryResponse = await fetch('/api/chat');
          if (chatHistoryResponse.ok) {
            const historyData = await chatHistoryResponse.json();
            if (historyData.sessionId && historyData.messages && historyData.messages.length > 0) {
              setCurrentChatSessionId(historyData.sessionId);
              const formattedMessages = historyData.messages.map((msg: Message) => ({
                ...msg,
                timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
              }));
              setMessages(formattedMessages);
            } else {
              setMessages([{ role: 'system', content: 'Jsi cesky psycholog. Odpovidej klidne, empaticky, a nikdy nediagnostikuj.' }]);
            }
          } else {
            console.error('Nepodařilo se načíst historii chatu:', chatHistoryResponse.statusText);
          }
        } catch (error) {
          console.error('Chyba při načítání historie chatu:', error);
        }
      }
    };
    loadInitialData();
  }, [authStatus, session, router]); // Přidán router do dependencies
  
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const speakText = (text: string) => { /* ... implementace ... */ };
  const stopSpeaking = () => { /* ... implementace ... */ };
  const sendMessage = async (inputText: string) => { /* ... implementace ... */ };
  const handleProfileChange = async (updatedProfile: UserProfileData) => { /* ... implementace ... */ };
  const TOPICS = { /* ... definice ... */ };
  const PERSONALITIES = { /* ... definice ... */ };
  const handleResetSettings = () => { /* ... implementace ... */ };

  // Funkce pro formátování data pro oddělovač
  const formatDateSeparator = (date: Date | undefined): string | null => {
    if (!date) return null;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const messageDateStr = date.toDateString();

    if (messageDateStr === today) return "Dnes";
    if (messageDateStr === yesterday) return "Včera";
    return date.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <Layout title="Chat | AI Psycholog" description="Chatujte s AI psychologem a získejte podporu kdykoliv potřebujete.">
      <div className="max-w-7xl mx-auto p-4 flex flex-col md:flex-row min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-5rem)]">
        {/* Levý panel */}
        <div className="w-full md:w-72 md:mr-6 mb-4 md:mb-0 flex-shrink-0">
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Profil', icon: FaUser, action: () => setShowProfile(!showProfile), active: showProfile },
                  { label: 'Analýza', icon: FaChartLine, action: () => setShowAnalytics(!showAnalytics), active: showAnalytics, disabled: messages.length <= 1 },
                  { label: 'Úspěchy', icon: FaTrophy, action: () => setShowGamification(!showGamification), active: showGamification },
                  { label: 'Nastavení', icon: FaCog, action: () => setShowSettingsModal(true), active: showSettingsModal }
                ].map(item => (
                  <button 
                    key={item.label}
                    onClick={item.action}
                    disabled={item.disabled}
                    className={`p-3 rounded-lg text-sm font-medium flex flex-col items-center justify-center space-y-1 transition-all duration-150 ease-in-out
                                ${item.active ? 'bg-blue-500 text-white shadow-md scale-105' : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'}
                                ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title={item.label}
                  >
                    <item.icon size={20} className={item.active ? 'text-white' : 'text-blue-500 dark:text-blue-400'} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
            {showProfile && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
                <UserProfile onProfileChange={handleProfileChange} />
              </div>
            )}
            {showAnalytics && messages.length > 1 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
                <SentimentAnalyzer messages={messages} />
              </div>
            )}
            {showGamification && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
                <Gamification 
                  sessionCount={sessionCount} 
                  streakDays={streakDays}
                  lastSessionDate={lastSessionDate || undefined}
                />
              </div>
            )}
          </div>
        </div>
        
        {/* Pravý panel (chat) */}
        <div className="flex-grow flex flex-col">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 flex-grow overflow-y-auto mb-4 max-h-[60vh] md:max-h-[45vh]" ref={chatContainerRef}>
            {messages.filter(msg => msg.role !== 'system').map((message, index, arr) => {
              let showDateSeparator = false;
              const currentMessageTimestamp = message.timestamp ? new Date(message.timestamp) : new Date(0);
              
              if (index === 0) {
                showDateSeparator = true;
              } else {
                const prevMessageTimestamp = arr[index - 1].timestamp ? new Date(arr[index - 1].timestamp!) : new Date(0);
                if (currentMessageTimestamp.toDateString() !== prevMessageTimestamp.toDateString()) {
                  showDateSeparator = true;
                }
              }
              
              // Použijeme message.id pokud existuje, jinak index. Pro React.Fragment přidáme sufix.
              const messageKey = message.id || index.toString();

              return (
                <React.Fragment key={`${messageKey}-fragment`}>
                  {showDateSeparator && (
                    <div className="text-center my-4">
                      <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                        {formatDateSeparator(currentMessageTimestamp)}
                      </span>
                    </div>
                  )}
                  <ChatMessage 
                    key={messageKey}
                    message={message}
                    isSpeaking={isSpeaking && index === arr.length - 1 && message.role === 'assistant'}
                    onSpeakText={speakText}
                    onStopSpeaking={stopSpeaking}
                  />
                </React.Fragment>
              );
            })}
            {loading && (
              <LoadingIndicator 
                isVisible={loading} 
                estimatedTime={loadingEstimatedTime}
              />
            )}
          </div>
          
          <ChatInput 
            onSendMessage={sendMessage}
            isLoading={loading}
          />
          
          <CrisisNotice />
        </div>
      </div>

      <ChatSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        selectedTopic={selectedTopic}
        setSelectedTopic={setSelectedTopic}
        TOPICS={TOPICS}
        selectedPersonality={selectedPersonality}
        setSelectedPersonality={setSelectedPersonality}
        PERSONALITIES={PERSONALITIES}
        responseLength={responseLength}
        setResponseLength={setResponseLength}
        assistantGender={assistantGender}
        setAssistantGender={setAssistantGender}
        assistantName={assistantName}
        setAssistantName={setAssistantName}
        saveHistory={saveHistory}
        setSaveHistory={setSaveHistory}
        onResetSettings={handleResetSettings}
      />
    </Layout>
  );
};

export default ChatPage;
