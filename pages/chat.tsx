import React from 'react';
import Layout from '../components/Layout';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  FaMicrophone, FaVolumeUp, FaVolumeMute, FaCog, FaHistory, 
  FaBookMedical, FaUserFriends, FaSadTear, FaRunning, FaHeart,
  FaSun, FaMoon, FaRobot, FaUser, FaChartLine, FaTrophy
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
import { Message } from '../types';

const ChatPage = () => {
  const { theme, toggleTheme } = useTheme();
  
  // State for messages and input
  const [messages, setMessages] = useState<Message[]>([
    { role: 'system', content: 'Jsi cesky psycholog. Odpovidej klidne, empaticky, a nikdy nediagnostikuj.' },
  ]);
  const [loading, setLoading] = useState(false);
  const [loadingEstimatedTime, setLoadingEstimatedTime] = useState(5); // seconds
  
  // State for settings
  const [showSettings, setShowSettings] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<'anxiety' | 'relationships' | 'depression' | 'stress' | 'selfEsteem' | null>(null);
  const [selectedPersonality, setSelectedPersonality] = useState<'supportive' | 'practical' | 'analytical' | 'mentor' | 'coach' | 'mediator' | null>(null);
  const [saveHistory, setSaveHistory] = useState(false);
  const [responseLength, setResponseLength] = useState<'short' | 'medium' | 'long'>('medium');
  
  // State for TTS
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);
  
  // State for history
  const [showHistory, setShowHistory] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<{
    id: string;
    title: string;
    date: Date;
    messages: Message[];
  }[]>([]);
  
  // State for user profile
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
  
  // State for analytics
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  // State for gamification
  const [showGamification, setShowGamification] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const [lastSessionDate, setLastSessionDate] = useState<Date | null>(null);
  
  // Refs
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSpeechSynthesis(window.speechSynthesis);
    }
  }, []);
  
  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  // Load conversation history from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load conversation history
      const savedHistory = localStorage.getItem('conversationHistory');
      if (savedHistory) {
        try {
          const parsedHistory = JSON.parse(savedHistory);
          // Convert string dates back to Date objects
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
      
      // Load session stats
      const savedSessionCount = localStorage.getItem('sessionCount');
      if (savedSessionCount) {
        setSessionCount(parseInt(savedSessionCount, 10));
      }
      
      const savedStreakDays = localStorage.getItem('streakDays');
      if (savedStreakDays) {
        setStreakDays(parseInt(savedStreakDays, 10));
      }
      
      const savedLastSessionDate = localStorage.getItem('lastSessionDate');
      if (savedLastSessionDate) {
        setLastSessionDate(new Date(savedLastSessionDate));
      }
    }
  }, []);
  
  // Function to speak text using TTS
  const speakText = (text: string) => {
    if (speechSynthesis) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'cs-CZ';
      speechSynthesis.speak(utterance);
      setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
      };
    }
  };
  
  // Function to stop speaking
  const stopSpeaking = () => {
    if (speechSynthesis) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };
  
  // Function to send a message
  const sendMessage = async (inputText: string) => {
    if (!inputText.trim()) return;
    
    const userMessage: Message = { 
      role: 'user', 
      content: inputText,
      timestamp: new Date()
    };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setLoading(true);

    try {
      const requestData = {
        messages: newMessages,
        topic: selectedTopic,
        personality: selectedPersonality,
        saveHistory,
        responseLength,
        userProfile
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
      console.error('Chyba:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle profile change
  const handleProfileChange = (profile: UserProfileData) => {
    setUserProfile(profile);
    setResponseLength(profile.preferences.responseLength);
  };

  // Define the topics data
  const TOPICS = {
    anxiety: {
      title: 'Úzkost',
      description: 'Průvodce pro zvládání úzkosti a úzkostných stavů',
      icon: <FaSadTear className="mr-2" />
    },
    relationships: {
      title: 'Vztahy',
      description: 'Průvodce pro řešení vztahových problémů',
      icon: <FaUserFriends className="mr-2" />
    },
    depression: {
      title: 'Deprese',
      description: 'Průvodce pro zvládání depresivních stavů',
      icon: <FaBookMedical className="mr-2" />
    },
    stress: {
      title: 'Stres',
      description: 'Průvodce pro zvládání stresu',
      icon: <FaRunning className="mr-2" />
    },
    selfEsteem: {
      title: 'Sebevědomí',
      description: 'Průvodce pro budování zdravého sebevědomí',
      icon: <FaHeart className="mr-2" />
    }
  };

  // Define the personalities data
  const PERSONALITIES = {
    supportive: {
      title: 'Podporující',
      description: 'Empatický a chápavý přístup'
    },
    practical: {
      title: 'Praktický',
      description: 'Zaměřený na konkrétní řešení'
    },
    analytical: {
      title: 'Analytický',
      description: 'Hloubkový a reflektivní přístup'
    },
    mentor: {
      title: 'Mentor',
      description: 'Průvodce osobním rozvojem'
    },
    coach: {
      title: 'Kouč',
      description: 'Zaměřený na dosahování cílů'
    },
    mediator: {
      title: 'Mediátor',
      description: 'Pomáhá s řešením konfliktů'
    }
  };

  return (
    <Layout title="Chat | AI Psycholog" description="Chatujte s AI psychologem a získejte podporu kdykoliv potřebujete.">
      <div className="max-w-6xl mx-auto p-4 flex flex-col md:flex-row">
        {/* Sidebar */}
        <div className="w-full md:w-64 md:mr-6 mb-4 md:mb-0">
          <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
            {/* User profile panel */}
            {showProfile && (
              <div className="col-span-2">
                <UserProfile onProfileChange={handleProfileChange} />
              </div>
            )}
            
            {/* Analytics panel */}
            {showAnalytics && messages.length > 1 && (
              <div className="col-span-2">
                <SentimentAnalyzer messages={messages} />
              </div>
            )}
            
            {/* Gamification panel */}
            {showGamification && (
              <div className="col-span-2">
                <Gamification 
                  sessionCount={sessionCount} 
                  streakDays={streakDays}
                  lastSessionDate={lastSessionDate || undefined}
                />
              </div>
            )}

            {/* Controls */}
            <div className="col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setShowProfile(!showProfile)}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors flex items-center"
                  title="Uživatelský profil"
                >
                  <FaUser size={18} className="text-blue-600 dark:text-blue-400" />
                  <span className="ml-2">Profil</span>
                </button>
                <button 
                  onClick={() => setShowAnalytics(!showAnalytics)}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors flex items-center"
                  title="Analýza nálady"
                  disabled={messages.length <= 1}
                >
                  <FaChartLine size={18} className="text-blue-600 dark:text-blue-400" />
                  <span className="ml-2">Analýza</span>
                </button>
                <button 
                  onClick={() => setShowGamification(!showGamification)}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors flex items-center"
                  title="Úspěchy"
                >
                  <FaTrophy size={18} className="text-blue-600 dark:text-blue-400" />
                  <span className="ml-2">Úspěchy</span>
                </button>
                <button 
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors flex items-center"
                  title="Nastavení"
                >
                  <FaCog size={18} className="text-blue-600 dark:text-blue-400" />
                  <span className="ml-2">Nastavení</span>
                </button>
              </div>
            </div>

            {/* Settings panel */}
            {showSettings && (
              <div className="col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
                <h2 className="text-lg font-bold mb-3 dark:text-white">Nastavení</h2>
                
                <div className="mb-4">
                  <h3 className="font-medium mb-2 dark:text-white">Témata</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(TOPICS).map(([key, topic]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedTopic(key as any)}
                        className={`p-2 rounded-md flex items-center ${
                          selectedTopic === key ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white'
                        }`}
                      >
                        {topic.icon}
                        <span>{topic.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="mb-4">
                  <h3 className="font-medium mb-2 dark:text-white">Osobnost asistenta</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(PERSONALITIES).map(([key, personality]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedPersonality(key as any)}
                        className={`p-2 rounded-md text-center ${
                          selectedPersonality === key ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white'
                        }`}
                      >
                        {personality.title}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="mb-4">
                  <h3 className="font-medium mb-2 dark:text-white">Délka odpovědí</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setResponseLength('short')}
                      className={`p-2 rounded-md text-center ${
                        responseLength === 'short' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white'
                      }`}
                    >
                      Krátké
                    </button>
                    <button
                      onClick={() => setResponseLength('medium')}
                      className={`p-2 rounded-md text-center ${
                        responseLength === 'medium' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white'
                      }`}
                    >
                      Střední
                    </button>
                    <button
                      onClick={() => setResponseLength('long')}
                      className={`p-2 rounded-md text-center ${
                        responseLength === 'long' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white'
                      }`}
                    >
                      Dlouhé
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="saveHistory"
                    checked={saveHistory}
                    onChange={(e) => setSaveHistory(e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="saveHistory" className="dark:text-white">Ukládat historii konverzací</label>
                </div>
                
                <div className="flex justify-between">
                  <button
                    onClick={() => {
                      setSelectedTopic(null);
                      setSelectedPersonality(null);
                      setSaveHistory(false);
                      setResponseLength('medium');
                    }}
                    className="btn btn-secondary"
                  >
                    Resetovat
                  </button>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="btn btn-primary"
                  >
                    Zavřít
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Chat area */}
        <div className="flex-grow">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4 h-[60vh] overflow-y-auto" ref={chatContainerRef}>
            {messages.filter(msg => msg.role !== 'system').map((message, index) => (
              <ChatMessage 
                key={index}
                message={message}
                isSpeaking={isSpeaking && index === messages.length - 1 && message.role === 'assistant'}
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
        </div>
      </div>
    </Layout>
  );
};

export default ChatPage;
