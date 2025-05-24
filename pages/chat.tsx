import React from 'react';
import Layout from '../components/Layout';
import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router'; // Přidán import pro useRouter
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
  const { theme, toggleTheme } = useTheme();
  
  const [messages, setMessages] = useState<Message[]>([
    { role: 'system', content: 'Jsi cesky psycholog. Odpovidej klidne, empaticky, a nikdy nediagnostikuj.' },
  ]);
  const [loading, setLoading] = useState(false);
  const [loadingEstimatedTime, setLoadingEstimatedTime] = useState(5);
  
  const [selectedTopic, setSelectedTopic] = useState<'anxiety' | 'relationships' | 'depression' | 'stress' | 'selfEsteem' | null>(null);
  const [selectedPersonality, setSelectedPersonality] = useState<'supportive' | 'practical' | 'analytical' | 'mentor' | 'coach' | 'mediator' | null>(null);
  const [saveHistory, setSaveHistory] = useState(true); // Výchozí ukládání historie pro Supabase
  const [responseLength, setResponseLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [assistantGender, setAssistantGender] = useState<'male' | 'female'>('male');
  const [assistantName, setAssistantName] = useState<string>('');
  
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  const [currentChatSessionId, setCurrentChatSessionId] = useState<string | null>(null);
  // Odstranění stavů pro localStorage historii
  // const [showHistory, setShowHistory] = useState(false); 
  // const [conversationHistory, setConversationHistory] = useState<...>([]);
  
  const [showProfile, setShowProfile] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfileData>({
    name: 'Uživatel',
    avatar_url: null, // Změněno z avatar na avatar_url
    preferences: {
      responseLength: 'medium',
      communicationStyle: 'casual',
      notificationFrequency: 'none',
      assistantGender: 'male', // Výchozí hodnota
    }
  });
  
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showGamification, setShowGamification] = useState(false);
  const [sessionCount, setSessionCount] = useState(0); // Toto bude potřeba načítat z DB
  const [streakDays, setStreakDays] = useState(0); // Toto bude potřeba načítat z DB
  const [lastSessionDate, setLastSessionDate] = useState<Date | null>(null); // Toto bude potřeba načítat z DB
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const { data: session, status: authStatus } = useSession();
  const router = useRouter(); // Přidáno pro přesměrování

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push('/auth/login?callbackUrl=/chat'); // Přesměrování nepřihlášených
    }
    // Inicializace SpeechSynthesis
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
        // Načtení profilu uživatele
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

        // Načtení poslední chatovací seance
        try {
          const chatHistoryResponse = await fetch('/api/chat'); // GET request
          if (chatHistoryResponse.ok) {
            const historyData = await chatHistoryResponse.json();
            if (historyData.sessionId && historyData.messages && historyData.messages.length > 0) {
              setCurrentChatSessionId(historyData.sessionId);
              // Převod timestampů zpět na Date objekty, pokud je potřeba (API by mělo vracet stringy)
              const formattedMessages = historyData.messages.map((msg: Message) => ({
                ...msg,
                timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
              }));
              setMessages(formattedMessages);
            } else {
              // Žádná historie, nebo prázdná, začínáme s výchozí systémovou zprávou
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
    // TODO: Načíst sessionCount, streakDays, lastSessionDate z DB (až bude API)
  }, [authStatus, session]);
  
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  // Odstraněn useEffect pro načítání historie z localStorage

  const speakText = (text: string) => {
    if (speechSynthesis) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'cs-CZ';
      const czechVoice = availableVoices.find(voice => voice.lang === 'cs-CZ');
      if (czechVoice) utterance.voice = czechVoice;
      else console.warn('Český hlas pro TTS nebyl nalezen.');
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
      const requestData = {
        messages: newMessages, // Posíláme celou historii pro kontext AI
        topic: selectedTopic,
        personality: selectedPersonality,
        saveHistory, // I když je true, API rozhodne o uložení
        responseLength,
        userProfile, // Posíláme celý userProfile
        sessionId: currentChatSessionId // Posíláme aktuální ID seance
      };
      const res = await axios.post('/api/chat', requestData);
      
      if (res.data.sessionId && !currentChatSessionId) {
        setCurrentChatSessionId(res.data.sessionId); // Uložíme nové ID seance
      }
      if (res.data.estimatedReadingTime) {
        setLoadingEstimatedTime(prev => Math.round((prev * 0.7) + (res.data.estimatedReadingTime || 5) * 0.3));
      }
      const assistantMessage: Message = {
        role: 'assistant',
        content: res.data.content || 'Omlouvám se, nastala chyba.',
        timestamp: new Date(),
        isCrisis: res.data.isCrisis
      };
      setMessages(prev => [...prev, assistantMessage]); // Použijeme funkční update pro messages
    } catch (error) {
      console.error('Chyba při volání API:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Omlouvám se, nastala chyba při komunikaci se serverem. Zkuste to prosím znovu za chvíli.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = async (updatedProfile: UserProfileData) => {
    setUserProfile(updatedProfile); // Optimistické UI
    setResponseLength(updatedProfile.preferences.responseLength);
    if (updatedProfile.preferences.assistantGender) {
      setAssistantGender(updatedProfile.preferences.assistantGender);
    }
    if (updatedProfile.preferences.assistantName) {
      setAssistantName(updatedProfile.preferences.assistantName);
    }

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProfile), // Posíláme celý profil, API si vezme, co potřebuje
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Nepodařilo se uložit profil:', errorData.error || response.statusText);
        // TODO: Možná vrátit UI do původního stavu nebo zobrazit chybu uživateli
      } else {
        console.log('Profil úspěšně uložen.');
      }
    } catch (error) {
      console.error('Chyba při ukládání profilu:', error);
      // TODO: Zobrazit chybu uživateli
    }
  };

  const TOPICS = { /* ... beze změny ... */ };
  const PERSONALITIES = { /* ... beze změny ... */ };
  const handleResetSettings = () => { /* ... beze změny ... */ };

  return (
    <Layout title="Chat | AI Psycholog" description="Chatujte s AI psychologem a získejte podporu kdykoliv potřebujete.">
      {/* ... zbytek JSX beze změny, kromě odstranění panelu historie, pokud byl ... */}
      {/* Pokud byl panel historie, jeho zobrazení bude záviset na nové logice načítání z DB */}
      <div className="max-w-7xl mx-auto p-4 flex flex-col md:flex-row min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-5rem)]">
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
        
        <div className="flex-grow flex flex-col">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 flex-grow overflow-y-auto mb-4 max-h-[60vh] md:max-h-[45vh]" ref={chatContainerRef}>
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
