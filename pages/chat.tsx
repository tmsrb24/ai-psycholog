import React, { Suspense } from 'react'; 
import Layout from '../components/Layout';
import { useState, useEffect, useRef, lazy } from 'react'; 
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { 
  FaMicrophone, FaVolumeUp, FaVolumeMute, FaCog, FaHistory, 
  FaBookMedical, FaUserFriends, FaSadTear, FaRunning, FaHeart,
  FaUser, FaChartLine, FaTrophy, FaTimes, FaSpinner,
  FaRegSmile, FaRegFrown, FaRegMeh, FaRegAngry, FaRegSurprise
} from 'react-icons/fa';
import { type IconType } from 'react-icons/lib'; // Correct import for IconType
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import LoadingIndicator from '../components/LoadingIndicator';
// import UserProfile from '../components/UserProfile'; // Lazy loaded
// import SentimentAnalyzer from '../components/SentimentAnalyzer'; // Lazy loaded
// import Gamification from '../components/Gamification'; // Lazy loaded
import CrisisNotice from '../components/CrisisNotice';
import ChatSettingsModal from '../components/ChatSettingsModal';
import { Message, UserProfileData } from '../types'; 
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { getSession } from 'next-auth/react';

const UserProfile = lazy(() => import('../components/UserProfile'));
// const SentimentAnalyzer = lazy(() => import('../components/SentimentAnalyzer')); // Removed User Insights/Analytics
const Gamification = lazy(() => import('../components/Gamification'));

interface DiaryTag {
  id: string;
  name: string; 
  color: string;
}

interface DiaryMood {
  id: string;
  emoji: string;
  name: string; 
  icon?: React.ElementType;
}

type PageProps = {};

interface SidebarItem {
  labelKey: string;
  icon: IconType;
  action: () => void;
  active: boolean;
  disabled?: boolean; // Make disabled optional
}

const ChatPage = (_props: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { t, i18n } = useTranslation(['chat', 'common']);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [initialDataLoading, setInitialDataLoading] = useState(true); 
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
  const [userProfileData, setUserProfileData] = useState<UserProfileData>({
    name: t('common:userProfile.defaultName', 'Uživatel'),
    avatar_url: null,
    preferences: {
      responseLength: 'medium',
      communicationStyle: 'casual',
      notificationFrequency: 'none',
      assistantGender: 'male',
    }
  });
  // const [showAnalytics, setShowAnalytics] = useState(false); // Removed User Insights/Analytics
  const [showGamification, setShowGamification] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const [lastSessionDate, setLastSessionDate] = useState<Date | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  useEffect(() => {
    const loadInitialData = async () => {
      if (!(authStatus === "authenticated" && session?.user)) {
        setInitialDataLoading(false);
        return;
      }
      setInitialDataLoading(true);

      let systemMessageContent = t('systemPrompt.default');
      if (i18n.language === 'en') systemMessageContent = t('systemPrompt.en');
      else if (i18n.language === 'uk') systemMessageContent = t('systemPrompt.uk');
      const systemMessage: Message = { role: 'system', content: systemMessageContent };
      
      setMessages([systemMessage, {role: 'assistant', content: t('loadingMessages', 'Načítám zprávy...'), timestamp: new Date()}]);

      try {
        // const [profileRes, chatHistoryRes, insightsRes] = await Promise.all([
        const [profileRes, chatHistoryRes] = await Promise.all([ // Temporarily remove insightsRes
          fetch('/api/user/profile'),
          fetch('/api/chat'), 
          // fetch('/api/user-insights') // Temporarily commented out
        ]);

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setUserProfileData(profileData);
          if (profileData.preferences) {
            setResponseLength(profileData.preferences.responseLength || 'medium');
            if (profileData.preferences.assistantGender) setAssistantGender(profileData.preferences.assistantGender);
            if (profileData.preferences.assistantName) setAssistantName(profileData.preferences.assistantName);
          }
        } else {
          console.error(t('errors.profileLoadFailedConsole'), profileRes.statusText);
        }

        let baseMessages = [systemMessage];
        if (chatHistoryRes.ok) {
          const historyData = await chatHistoryRes.json();
          if (historyData.sessionId && historyData.messages && historyData.messages.length > 0) {
            setCurrentChatSessionId(historyData.sessionId);
            baseMessages = [
              systemMessage,
              ...historyData.messages.map((msg: Message) => ({
                ...msg,
                timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
              }))
            ];
          }
        } else {
          console.error(t('errors.chatHistoryLoadFailedConsole'), chatHistoryRes.statusText);
        }
        
        let messagesToSet = baseMessages;
        const twentyFourHoursInMs = 24 * 60 * 60 * 1000;
        const now = new Date();
        let addedProactiveMessage = false;

        const lastUserOrAssistantMessage = [...baseMessages].reverse().find(msg => msg.role === 'user' || msg.role === 'assistant');
        if (lastUserOrAssistantMessage && lastUserOrAssistantMessage.timestamp && (now.getTime() - new Date(lastUserOrAssistantMessage.timestamp).getTime()) > twentyFourHoursInMs) {
          messagesToSet = [...messagesToSet, { role: 'assistant', content: t('proactiveMessages.welcomeBack'), timestamp: new Date() }];
          addedProactiveMessage = true;
        }
        
        // Temporarily comment out insights processing
        // if (insightsRes.ok) {
        //   try {
        //     const insightsData = await insightsRes.json();
        //     if (insightsData && insightsData.proactive_flags) {
        //       if (insightsData.proactive_flags.suggest_mood_discussion && !addedProactiveMessage) {
        //         messagesToSet = [...messagesToSet, { role: 'assistant', content: t('proactiveMessages.moodSuggestion'), timestamp: new Date() }];
        //         addedProactiveMessage = true;
        //       }
        //       if (insightsData.proactive_flags.offer_stress_exercise && !addedProactiveMessage) {
        //          messagesToSet = [...messagesToSet, { role: 'assistant', content: t('proactiveMessages.stressExerciseSuggestion'), timestamp: new Date() }];
        //       }
        //     }
        //   } catch (insightsParseError) {
        //      console.error(t('errors.userInsightsParseErrorConsole'), insightsParseError);
        //   }
        // } else {
        //     console.warn(t('errors.userInsightsLoadFailedConsoleWarn'), insightsRes.statusText);
        // }
        
        setMessages(messagesToSet);

      } catch (error) {
        console.error(t('errors.initialDataLoadErrorConsole'), error);
        setMessages([systemMessage, {role: 'assistant', content: t('errors.chatHistoryLoadError'), timestamp: new Date()}]);
      } finally {
        setInitialDataLoading(false);
      }
    };

    if (authStatus === "unauthenticated") {
      router.push('/auth/login?callbackUrl=/chat');
    } else if (authStatus === "authenticated") {
      loadInitialData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authStatus, i18n.language]); 

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const synth = window.speechSynthesis;
      setSpeechSynthesis(synth);
      const loadVoices = () => {
        const voices = synth.getVoices();
        if (voices.length > 0) setAvailableVoices(voices);
      };
      if (synth.getVoices().length === 0) {
        synth.onvoiceschanged = loadVoices;
      } else {
        loadVoices();
      }
      return () => {
        if (synth) synth.onvoiceschanged = null;
      };
    }
  }, []);
  
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const speakText = (text: string) => { 
    if (speechSynthesis) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const currentLang = i18n.language;
      let targetLangForTTS = 'cs-CZ';
      if (currentLang === 'en') targetLangForTTS = 'en-US';
      else if (currentLang === 'uk') targetLangForTTS = 'uk-UA';
      
      utterance.lang = targetLangForTTS;
      const voice = availableVoices.find(v => v.lang === targetLangForTTS);
      if (voice) utterance.voice = voice;
      else console.warn(t('errors.ttsVoiceNotFound', { lang: targetLangForTTS }));
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
    if (!inputText || !inputText.trim() || authStatus !== "authenticated") return;

    const userMessage: Message = { role: 'user', content: inputText, timestamp: new Date() };
    
    const currentSystemMessage = messages.find(msg => msg.role === 'system') || { role: 'system', content: t('systemPrompt.default') };
    const messagesWithSystem = messages.length > 0 ? messages : [currentSystemMessage];

    const newMessages = [...messagesWithSystem, userMessage];
    setMessages(newMessages);
    setLoading(true); 
    try {
      const requestData = {
        messages: newMessages, 
        topic: selectedTopic,
        personality: selectedPersonality,
        saveHistory, 
        responseLength,
        userProfile: userProfileData,
        sessionId: currentChatSessionId,
        chatLanguage: i18n.language 
      };
      const res = await axios.post('/api/chat', requestData);
      
      if (res.data.sessionId && !currentChatSessionId) setCurrentChatSessionId(res.data.sessionId); 
      if (res.data.estimatedReadingTime) setLoadingEstimatedTime(prev => Math.round((prev * 0.7) + (res.data.estimatedReadingTime || 5) * 0.3));
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: res.data.content || t('errors.apiResponseError'),
        timestamp: new Date(),
        isCrisis: res.data.isCrisis
      };
      setMessages(prev => [...prev, assistantMessage]); 
    } catch (error) {
      console.error(t('errors.apiCallFailedConsole'), error);
      setMessages(prev => [...prev, { role: 'assistant', content: t('errors.apiCommunicationError'), timestamp: new Date() }]);
    } finally {
      setLoading(false); 
    }
  };

  const handleProfileChange = async (updatedProfile: UserProfileData) => { setUserProfileData(updatedProfile); };
  
  const availableMoods: DiaryMood[] = [
    { id: 'happy', emoji: '😄', name: t('common:moods.happy'), icon: FaRegSmile },
    { id: 'sad', emoji: '😔', name: t('common:moods.sad'), icon: FaRegFrown },
    { id: 'neutral', emoji: '😐', name: t('common:moods.neutral'), icon: FaRegMeh },
    { id: 'angry', emoji: '😠', name: t('common:moods.angry'), icon: FaRegAngry },
    { id: 'surprised', emoji: '😮', name: t('common:moods.surprised'), icon: FaRegSurprise },
  ];

  const availableTags: DiaryTag[] = [
    { id: 'work', name: t('common:tags.work'), color: 'bg-blue-500' },
    { id: 'personal', name: t('common:tags.personal'), color: 'bg-green-500' },
    { id: 'relationships', name: t('common:tags.relationships'), color: 'bg-pink-500' },
    { id: 'health', name: t('common:tags.health'), color: 'bg-red-500' },
    { id: 'ideas', name: t('common:tags.ideas'), color: 'bg-yellow-500' },
    { id: 'other', name: t('common:tags.other'), color: 'bg-gray-500' },
  ];
  
  const TOPICS = {
    anxiety: { title: t('topics.anxiety'), icon: <FaSadTear /> },
    relationships: { title: t('topics.relationships'), icon: <FaUserFriends /> },
    depression: { title: t('topics.depression'), icon: <FaSadTear /> },
    stress: { title: t('topics.stress'), icon: <FaRunning /> },
    selfEsteem: { title: t('topics.selfEsteem'), icon: <FaHeart /> },
  };
  
  const PERSONALITIES = {
    supportive: { title: t('personalities.supportive') },
    practical: { title: t('personalities.practical') },
    analytical: { title: t('personalities.analytical') },
    mentor: { title: t('personalities.mentor') },
    coach: { title: t('personalities.coach') },
    mediator: { title: t('personalities.mediator') },
  };

  const handleResetSettings = () => {
    setSelectedTopic(null);
    setSelectedPersonality(null);
    setResponseLength('medium');
    setAssistantGender('male');
    setAssistantName('');
    setSaveHistory(true);
    console.log(t('settingsModal.resetMessageConsole'));
  };

  const formatDateSeparator = (date: Date | undefined): string | null => {
    if (!date) return null;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const messageDateStr = date.toDateString();

    if (messageDateStr === today) return t('dateSeparators.today');
    if (messageDateStr === yesterday) return t('dateSeparators.yesterday');
    return date.toLocaleDateString(i18n.language, { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const sidebarItems: SidebarItem[] = [
    { labelKey: 'sidebar.profile', icon: FaUser, action: () => setShowProfile(!showProfile), active: showProfile },
    // { labelKey: 'sidebar.analysis', icon: FaChartLine, action: () => setShowAnalytics(!showAnalytics), active: showAnalytics, disabled: messages.filter((m: Message) => m.role !== 'system').length < 2 }, // Removed User Insights/Analytics
    { labelKey: 'sidebar.achievements', icon: FaTrophy, action: () => setShowGamification(!showGamification), active: showGamification },
    { labelKey: 'sidebar.settings', icon: FaCog, action: () => setShowSettingsModal(true), active: showSettingsModal }
  ];

  const SidebarFallback = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 flex justify-center items-center h-32">
      <FaSpinner className="animate-spin text-blue-500 text-2xl" />
    </div>
  );

  if (authStatus === "loading") return <Layout title={t('common:loading')}><p className="text-center p-8">{t('loadingAuth')}</p></Layout>;
  
  return (
    <Layout title={t('pageTitle')} description={t('pageDescription')}>
      <div className="max-w-7xl mx-auto p-4 flex flex-col md:flex-row min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-5rem)]">
        {/* Sidebar */}
        <div className="w-full md:w-72 md:mr-6 mb-4 md:mb-0 flex-shrink-0">
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
              <div className="grid grid-cols-2 gap-3">
                {sidebarItems.map(item => (
                  <button 
                    key={item.labelKey}
                    onClick={item.action}
                    disabled={item.disabled}
                    className={`p-3 rounded-lg text-sm font-medium flex flex-col items-center justify-center space-y-1 transition-all duration-150 ease-in-out
                                ${item.active ? 'bg-blue-500 text-white shadow-md scale-105' : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'}
                                ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title={t(item.labelKey)}
                  >
                    <item.icon size={20} className={item.active ? 'text-white' : 'text-blue-500 dark:text-blue-400'} />
                    <span>{t(item.labelKey)}</span>
                  </button>
                ))}
              </div>
            </div>
            <Suspense fallback={<SidebarFallback />}>
              {showProfile && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
                  <UserProfile onProfileChange={handleProfileChange} />
                </div>
              )}
              {/* Removed User Insights/Analytics
              {showAnalytics && messages.filter((m: Message) => m.role !== 'system').length >= 2 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
                  <SentimentAnalyzer messages={messages} />
                </div>
              )}
              */}
              {showGamification && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
                  <Gamification 
                    sessionCount={sessionCount} 
                    streakDays={streakDays}
                    lastSessionDate={lastSessionDate || undefined}
                  />
                </div>
              )}
            </Suspense>
          </div>
        </div>
        
        {/* Main Chat Area */}
        <div className="flex-grow flex flex-col">
          {/* Message Display Area */}
          <div 
            className="bg-gray-50 dark:bg-slate-800/50 rounded-xl shadow-inner p-4 sm:p-6 flex-grow overflow-y-auto mb-4 max-h-[60vh] md:max-h-[calc(100vh-22rem)]"
            ref={chatContainerRef}
          >
            {(initialDataLoading && messages.length <=1 ) ? ( 
                 <div className="flex justify-center items-center h-full">
                   <FaSpinner className="animate-spin text-blue-500 text-3xl" />
                   <p className="ml-2 text-gray-500 dark:text-gray-400">{t('loadingChatHistory', 'Načítám historii chatu...')}</p>
                 </div>
            ) : messages.filter((msg: Message) => msg.role !== 'system').map((message, index, arr) => {
              const prevMessage = arr[index - 1];
              const isSameSpeakerAsPrevious = prevMessage ? prevMessage.role === message.role : false;

              let showDateSeparator = false;
              const currentMessageTimestamp = message.timestamp ? new Date(message.timestamp) : new Date(0);
              
              if (index === 0) {
                showDateSeparator = true;
              } else if (prevMessage) {
                const prevMessageTimestamp = prevMessage.timestamp ? new Date(prevMessage.timestamp) : new Date(0);
                if (currentMessageTimestamp.toDateString() !== prevMessageTimestamp.toDateString()) {
                    showDateSeparator = true;
                }
              }
              
              const messageKey = message.id || index.toString();

              return (
                <React.Fragment key={`${messageKey}-fragment`}>
                  {showDateSeparator && (
                    <div className="text-center my-4">
                      <span className="text-xs text-gray-500 dark:text-gray-400 bg-white/60 dark:bg-slate-700/50 px-2 py-1 rounded-full">
                        {formatDateSeparator(currentMessageTimestamp)}
                      </span>
                    </div>
                  )}
                  <ChatMessage 
                    key={messageKey}
                    message={message}
                    userAvatarUrl={session?.user?.image}
                    isSameSpeakerAsPrevious={isSameSpeakerAsPrevious}
                    isSpeaking={isSpeaking && index === arr.length - 1 && message.role === 'assistant'}
                    onSpeakText={speakText}
                    onStopSpeaking={stopSpeaking}
                  />
                </React.Fragment>
              );
            })}
            {loading && !initialDataLoading && ( 
              <LoadingIndicator 
                isVisible={loading} 
                estimatedTime={loadingEstimatedTime}
              />
            )}
          </div>
          
          <ChatInput 
            onSendMessage={sendMessage}
            isLoading={loading} 
            placeholder={t('chatInputPlaceholder', 'Napište zprávu...')}
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

export const getServerSideProps: GetServerSideProps<PageProps> = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: `/auth/login?callbackUrl=${encodeURIComponent(context.resolvedUrl)}`,
        permanent: false,
      },
    };
  }

  return {
    props: {
      ...(await serverSideTranslations(context.locale ?? 'cs', ['chat', 'common'])),
    },
  };
};
