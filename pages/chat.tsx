import React from 'react';
import Layout from '../components/Layout';
import { useState, useEffect, useRef } from 'react';
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
import ChatSettingsModal from '../components/ChatSettingsModal'; // Import nového modálu
import { Message } from '../types';

const ChatPage = () => {
  const { theme, toggleTheme } = useTheme();
  
  const [messages, setMessages] = useState<Message[]>([
    { role: 'system', content: 'Jsi cesky psycholog. Odpovidej klidne, empaticky, a nikdy nediagnostikuj.' },
  ]);
  const [loading, setLoading] = useState(false);
  const [loadingEstimatedTime, setLoadingEstimatedTime] = useState(5);
  
  // Stavy pro nastavení chatu (budou předány do modálu)
  const [selectedTopic, setSelectedTopic] = useState<'anxiety' | 'relationships' | 'depression' | 'stress' | 'selfEsteem' | null>(null);
  const [selectedPersonality, setSelectedPersonality] = useState<'supportive' | 'practical' | 'analytical' | 'mentor' | 'coach' | 'mediator' | null>(null);
  const [saveHistory, setSaveHistory] = useState(false);
  const [responseLength, setResponseLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [assistantGender, setAssistantGender] = useState<'male' | 'female'>('male');
  const [assistantName, setAssistantName] = useState<string>('');
  
  const [showSettingsModal, setShowSettingsModal] = useState(false); // Stav pro zobrazení modálu
  
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);
  
  const [showHistory, setShowHistory] = useState(false); // Tento stav zůstává pro panel historie
  const [conversationHistory, setConversationHistory] = useState<{
    id: string;
    title: string;
    date: Date;
    messages: Message[];
  }[]>([]);
  
  const [showProfile, setShowProfile] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfileData>({
    name: 'Uživatel',
    avatar: null,
    preferences: {
      responseLength: 'medium',
      communicationStyle: 'casual',
      notificationFrequency: 'none'
    }
  });
  
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showGamification, setShowGamification] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const [lastSessionDate, setLastSessionDate] = useState<Date | null>(null);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSpeechSynthesis(window.speechSynthesis);
    }
  }, []);
  
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedHistoryData = localStorage.getItem('conversationHistory');
      if (savedHistoryData) {
        try {
          const parsedHistory = JSON.parse(savedHistoryData);
          const formattedHistory = parsedHistory.map((conv: any) => ({
            ...conv,
            date: new Date(conv.date),
            messages: conv.messages.map((msg: any) => ({
              ...msg,
              timestamp: msg.timestamp ? new Date(msg.timestamp) : undefined
            }))
          }));
          setConversationHistory(formattedHistory);
        } catch (error) {
          console.error('Chyba při načítání historie:', error);
        }
      }
      const savedSessionCountData = localStorage.getItem('sessionCount');
      if (savedSessionCountData) setSessionCount(parseInt(savedSessionCountData, 10));
      const savedStreakDaysData = localStorage.getItem('streakDays');
      if (savedStreakDaysData) setStreakDays(parseInt(savedStreakDaysData, 10));
      const savedLastSessionDateData = localStorage.getItem('lastSessionDate');
      if (savedLastSessionDateData) setLastSessionDate(new Date(savedLastSessionDateData));
    }
  }, []);
  
  const speakText = (text: string) => {
    if (speechSynthesis) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'cs-CZ';
      speechSynthesis.speak(utterance);
      setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
    }
  };
  
  const stopSpeaking = () => {
    if (speechSynthesis) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };
  
  const sendMessage = async (inputText: string) => {
    if (!inputText.trim()) return;
    const userMessage: Message = { role: 'user', content: inputText, timestamp: new Date() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setLoading(true);
    try {
      const updatedUserProfile = {
        ...userProfile,
        preferences: {
          ...userProfile.preferences,
          assistantGender,
          assistantName: assistantName.trim() || undefined
        }
      };
      const requestData = {
        messages: newMessages,
        topic: selectedTopic,
        personality: selectedPersonality,
        saveHistory,
        responseLength,
        userProfile: updatedUserProfile
      };
      const res = await axios.post('/api/chat', requestData);
      if (res.data.estimatedReadingTime) {
        setLoadingEstimatedTime(prev => Math.round((prev * 0.7) + (res.data.estimatedReadingTime || 5) * 0.3));
      }
      const assistantMessage: Message = {
        role: 'assistant',
        content: res.data.content || 'Omlouvám se, nastala chyba.',
        timestamp: new Date()
      };
      setMessages([...newMessages, assistantMessage]);
    } catch (error) {
      console.error('Chyba při volání API:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Omlouvám se, nastala chyba při komunikaci se serverem. Zkuste to prosím znovu za chvíli.',
        timestamp: new Date()
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (profile: UserProfileData) => {
    setUserProfile(profile);
    setResponseLength(profile.preferences.responseLength);
  };

  const TOPICS = {
    anxiety: { title: 'Úzkost', icon: <FaSadTear /> },
    relationships: { title: 'Vztahy', icon: <FaUserFriends /> },
    depression: { title: 'Deprese', icon: <FaBookMedical /> },
    stress: { title: 'Stres', icon: <FaRunning /> },
    selfEsteem: { title: 'Sebevědomí', icon: <FaHeart /> }
  };

  const PERSONALITIES = {
    supportive: { title: 'Podporující' },
    practical: { title: 'Praktický' },
    analytical: { title: 'Analytický' },
    mentor: { title: 'Mentor' },
    coach: { title: 'Kouč' },
    mediator: { title: 'Mediátor' }
  };

  const handleResetSettings = () => {
    setSelectedTopic(null);
    setSelectedPersonality(null);
    setSaveHistory(false);
    setResponseLength('medium');
    setAssistantGender('male');
    setAssistantName('');
  };

  return (
    <Layout title="Chat | AI Psycholog" description="Chatujte s AI psychologem a získejte podporu kdykoliv potřebujete.">
      <div className="max-w-7xl mx-auto p-4 flex flex-col md:flex-row min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-5rem)]"> {/* Adjusted max-width and min-height */}
        {/* Sidebar */}
        <div className="w-full md:w-72 md:mr-6 mb-4 md:mb-0 flex-shrink-0"> {/* Increased width of sidebar */}
          <div className="space-y-4"> {/* Use space-y for consistent spacing */}
            
            {/* Controls - always visible */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Profil', icon: FaUser, action: () => setShowProfile(!showProfile), active: showProfile },
                  { label: 'Analýza', icon: FaChartLine, action: () => setShowAnalytics(!showAnalytics), active: showAnalytics, disabled: messages.length <= 1 },
                  { label: 'Úspěchy', icon: FaTrophy, action: () => setShowGamification(!showGamification), active: showGamification },
                  { label: 'Nastavení', icon: FaCog, action: () => setShowSettingsModal(true), active: showSettingsModal } // Otevírá modál
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

            {/* Dynamically shown panels (Profil, Analýza, Úspěchy) */}
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
            {/* Původní panel nastavení byl odstraněn */}
          </div>
        </div>
        
        {/* Chat area */}
        <div className="flex-grow flex flex-col h-[calc(100vh-10rem)] md:h-auto"> {/* Adjusted height for mobile */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 flex-grow overflow-y-auto mb-4" ref={chatContainerRef}>
            {messages.filter(msg => msg.role !== 'system').map((message, index) => (
              <ChatMessage 
                key={index}
                message={message}
                isSpeaking={isSpeaking && index === messages.filter(m => m.role !== 'system').length - 1 && message.role === 'assistant'}
                onSpeakText={speakText}
                onStopSpeaking={stopSpeaking}
              />
            ))}
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

      {/* Modál pro nastavení chatu */}
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
