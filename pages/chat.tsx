import React, { Suspense } from 'react'; 
import Layout from '../components/layouts/Layout';
import { useState, useEffect, useRef, lazy } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { 
  FaCog, FaChartLine, FaTimes, FaSpinner
} from 'react-icons/fa';
import { type IconType } from 'react-icons/lib';
import ChatMessage from '../components/chat/ChatMessage';
import ChatInput from '../components/chat/ChatInput';
import LoadingIndicator from '../components/ui/LoadingIndicator';
import CrisisNotice from '../components/ui/CrisisNotice';
import ChatSettingsModal from '../components/chat/ChatSettingsModal';
import { MoodCheck } from '../components/mood/MoodCheck';
import { Message } from '../types/chat';
import { UserProfileData } from '../types/user';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { getSession } from 'next-auth/react';

const ChatAnalysis = lazy(() => import('../components/chat/ChatAnalysis'));

type PageProps = {};

interface SidebarItem {
  labelKey: string;
  icon: IconType;
  action: () => void;
  active: boolean;
  disabled?: boolean;
}

const ChatPage = (_props: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { t, i18n } = useTranslation(['chat', 'common']);
  
  const [messages, setMessages] = useState<Message[]>([]);
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
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [userProfileData, setUserProfileData] = useState<UserProfileData | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  const { data: profileData, isLoading: isProfileLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => fetch('/api/user/profile').then(res => res.json()),
    enabled: authStatus === 'authenticated',
  });

  const { data: chatHistoryData, isLoading: isHistoryLoading } = useQuery({
    queryKey: ['chatHistory'],
    queryFn: () => fetch('/api/chat').then(res => res.json()),
    enabled: authStatus === 'authenticated',
  });

  const { data: moodData, refetch: refetchMoodData } = useQuery({
    queryKey: ['moodData'],
    queryFn: () => fetch('/api/mood?range=1').then(res => res.json()),
    enabled: authStatus === 'authenticated',
  });

  useEffect(() => {
    if (authStatus === "authenticated") {
      axios.post('/api/user/track-session');
    }
  }, [authStatus]);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push('/auth/login?callbackUrl=/chat');
    }
  }, [authStatus, router]);

  useEffect(() => {
    if (profileData) {
      setUserProfileData(profileData);
      if (profileData.preferences) {
        setResponseLength(profileData.preferences.responseLength || 'medium');
        if (profileData.preferences.assistantGender) setAssistantGender(profileData.preferences.assistantGender);
        if (profileData.preferences.assistantName) setAssistantName(profileData.preferences.assistantName);
      }
    }
  }, [profileData]);

  useEffect(() => {
    const systemMessage: Message = { role: 'system', content: t('systemPrompt.default') };
    if (chatHistoryData) {
      if (chatHistoryData.sessionId && chatHistoryData.messages) {
        setCurrentChatSessionId(chatHistoryData.sessionId);
        setMessages([
          systemMessage,
          ...chatHistoryData.messages.map((msg: Message) => ({
            ...msg,
            timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
          }))
        ]);
      }
    } else {
      setMessages([systemMessage]);
    }
  }, [chatHistoryData, t]);

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
  
  const TOPICS = {
    anxiety: { title: t('topics.anxiety') },
    relationships: { title: t('topics.relationships') },
    depression: { title: t('topics.depression') },
    stress: { title: t('topics.stress') },
    selfEsteem: { title: t('topics.selfEsteem') },
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
    { labelKey: 'sidebar.analysis', icon: FaChartLine, action: () => setShowAnalysis(!showAnalysis), active: showAnalysis },
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
                    <item.icon size={20} className={item.active ? 'text-white' : 'text-yellow-500 dark:text-yellow-400'} />
                    <span>{t(item.labelKey)}</span>
                  </button>
                ))}
              </div>
            </div>
            <Suspense fallback={<SidebarFallback />}>
              {showAnalysis && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
                  <ChatAnalysis />
                </div>
              )}
            </Suspense>
          </div>
        </div>
        
        {/* Main Chat Area */}
        <div className="flex-grow flex flex-col">
          {/* Message Display Area */}
          <div
            className="bg-gray-50 dark:bg-slate-800/50 rounded-xl shadow-inner p-4 sm:p-6 flex-grow overflow-y-auto mb-4 max-h-[60vh] md:max-h-[45vh]"
            ref={chatContainerRef}
          >
            {(isProfileLoading || isHistoryLoading) ? (
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
            {loading && (
              <LoadingIndicator
                isVisible={loading}
                estimatedTime={loadingEstimatedTime}
              />
            )}
          </div>
          
          {moodData && moodData.length === 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-4">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">{t('mood.dailyCheckin', 'Jak se dnes cítíte?')}</h3>
              <MoodCheck todayScore={undefined} refetch={refetchMoodData} />
            </div>
          )}

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
