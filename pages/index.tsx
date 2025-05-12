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

// Define the Message type with strict role values
type MessageRole = 'user' | 'assistant' | 'system';

// Define topic and personality types
type TopicKey = 'anxiety' | 'relationships' | 'depression' | 'stress' | 'selfEsteem';
type PersonalityKey = 'supportive' | 'practical' | 'analytical' | 'mentor' | 'coach' | 'mediator';

interface Message {
  role: MessageRole;
  content: string;
  timestamp?: Date;
}

// Define the API response type
interface ApiResponse {
  role: string;
  content: string;
  isCrisis?: boolean;
  sentiment?: {
    score: number;
    comparative: number;
  };
  estimatedReadingTime?: number;
}

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

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  
  // State for messages and input
  const [messages, setMessages] = useState<Message[]>([
    { role: 'system', content: 'Jsi cesky psycholog. Odpovidej klidne, empaticky, a nikdy nediagnostikuj.' },
  ]);
  const [loading, setLoading] = useState(false);
  const [loadingEstimatedTime, setLoadingEstimatedTime] = useState(5); // seconds
  
  // State for settings
  const [showSettings, setShowSettings] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<TopicKey | null>(null);
  const [selectedPersonality, setSelectedPersonality] = useState<PersonalityKey | null>(null);
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
      
      const res = await axios.post<ApiResponse>('/api/chat', requestData);
      
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

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <header className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 text-white p-5 shadow-lg dark:from-blue-900 dark:via-blue-800 dark:to-blue-700">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <div className="mr-3 bg-white rounded-full p-2 shadow-md dark:bg-gray-800">
              <FaRobot className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">AI Psycholog</h1>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => setShowProfile(!showProfile)}
              className="p-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center dark:hover:bg-blue-800"
              title="Uživatelský profil"
            >
              <FaUser size={18} />
            </button>
            <button 
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="p-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center dark:hover:bg-blue-800"
              title="Analýza nálady"
            >
              <FaChartLine size={18} />
            </button>
            <button 
              onClick={() => setShowGamification(!showGamification)}
              className="p-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center dark:hover:bg-blue-800"
              title="Úspěchy"
            >
              <FaTrophy size={18} />
            </button>
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center dark:hover:bg-blue-800"
              title="Historie konverzací"
            >
              <FaHistory size={18} />
            </button>
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center dark:hover:bg-blue-800"
              title="Nastavení"
            >
              <FaCog size={18} />
            </button>
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center dark:hover:bg-blue-800"
              title={theme === 'dark' ? 'Přepnout na světlý režim' : 'Přepnout na tmavý režim'}
            >
              {theme === 'dark' ? <FaSun size={18} /> : <FaMoon size={18} />}
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-6xl mx-auto p-4 flex flex-col md:flex-row">
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
      </main>
    </div>
  );
}
