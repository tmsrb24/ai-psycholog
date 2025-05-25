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
              let baseMessages = historyData.messages.map((msg: Message) => ({
                ...msg,
                timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
              }));

              let messagesToSet = baseMessages;
              const twentyFourHoursInMs = 24 * 60 * 60 * 1000;
              const now = new Date();
              let addedProactiveMessage = false;

              // 1. Proaktivní zpráva po pauze (již implementováno, mírně upraveno pro kombinaci s dalšími)
              if (baseMessages.length > 1) { 
                const lastMessage = baseMessages[baseMessages.length - 1];
                if (lastMessage.timestamp && (now.getTime() - new Date(lastMessage.timestamp).getTime()) > twentyFourHoursInMs) {
                  const proactivePauseMessage: Message = {
                    role: 'assistant',
                    content: 'Vítejte zpět! Zdá se, že jsme spolu chvíli nemluvili. Chtěl/a byste navázat na naši poslední konverzaci, nebo se dnes zaměříme na něco nového?',
                    timestamp: new Date()
                  };
                  messagesToSet = [...baseMessages, proactivePauseMessage];
                  addedProactiveMessage = true;
                }
              }
              
              // 2. Načtení a zpracování user_insights pro další proaktivní zprávy
              try {
                const insightsResponse = await fetch('/api/user-insights');
                if (insightsResponse.ok) {
                  const insightsData = await insightsResponse.json();
                  if (insightsData && insightsData.proactive_flags) {
                    if (insightsData.proactive_flags.suggest_mood_discussion && !addedProactiveMessage) { // Zobrazit jen pokud už nebyla jiná proaktivní zpráva
                      const moodMessage: Message = {
                        role: 'assistant',
                        content: 'Všiml/a jsem si, že jste v poslední době v deníku zaznamenal/a náročnější pocity. Chtěl/a byste si o tom promluvit?',
                        timestamp: new Date()
                      };
                      messagesToSet = [...messagesToSet, moodMessage];
                      addedProactiveMessage = true;
                    }
                    if (insightsData.proactive_flags.offer_stress_exercise && !addedProactiveMessage) {
                       const stressMessage: Message = {
                        role: 'assistant',
                        content: 'Zdá se, že téma stresu se objevuje ve vašich konverzacích. Měl/a byste zájem o krátké cvičení na uvolnění stresu?',
                        timestamp: new Date()
                      };
                      messagesToSet = [...messagesToSet, stressMessage];
                      addedProactiveMessage = true;
                    }
                    // Zde by mohly být další podmínky pro jiné flagy
                  }
                }
              } catch (insightsError) {
                console.error("Chyba při načítání user insights:", insightsError);
              }
              setMessages(messagesToSet);
            } else { // Žádná historie chatu
              let initialMessages: Message[] = [{ role: 'system', content: 'Jsi cesky psycholog. Odpovidej klidne, empaticky, a nikdy nediagnostikuj.' }];
              try {
                const insightsResponse = await fetch('/api/user-insights');
                if (insightsResponse.ok) {
                  const insightsData = await insightsResponse.json();
                  if (insightsData && insightsData.proactive_flags && insightsData.proactive_flags.suggest_mood_discussion) {
                     const moodMessage: Message = {
                        role: 'assistant',
                        content: 'Vítejte! Všiml/a jsem si, že jste v poslední době v deníku zaznamenal/a náročnější pocity. Chtěl/a byste si o tom promluvit?',
                        timestamp: new Date()
                      };
                      initialMessages = [...initialMessages, moodMessage];
                  }
                }
              } catch (insightsError) {
                console.error("Chyba při načítání user insights (no chat history):", insightsError);
              }
              setMessages(initialMessages);
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
  }, [authStatus, session, router]); 
  
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

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
    if (!inputText || !inputText.trim()) {
      return;
    }
    if (authStatus !== "authenticated") {
      return;
    }

    const userMessage: Message = { role: 'user', content: inputText, timestamp: new Date() };
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
        userProfile, 
        sessionId: currentChatSessionId 
      };
      const res = await axios.post('/api/chat', requestData);
      
      if (res.data.sessionId && !currentChatSessionId) {
        setCurrentChatSessionId(res.data.sessionId); 
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
      setMessages(prev => [...prev, assistantMessage]); 
    } catch (error) {
      console.error('Chyba při volání API /api/chat:', error);
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
  const handleProfileChange = async (updatedProfile: UserProfileData) => { /* ... implementace ... */ };
  const TOPICS = { /* ... definice ... */ };
  const PERSONALITIES = { /* ... definice ... */ };
  const handleResetSettings = () => { /* ... implementace ... */ };

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
