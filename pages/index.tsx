import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  FaMicrophone, FaVolumeUp, FaVolumeMute, FaCog, FaHistory, 
  FaBookMedical, FaUserFriends, FaSadTear, FaRunning, FaHeart 
} from 'react-icons/fa';

// Define the Message type with strict role values
type MessageRole = 'user' | 'assistant' | 'system';

// Define topic and personality types
type TopicKey = 'anxiety' | 'relationships' | 'depression' | 'stress' | 'selfEsteem';
type PersonalityKey = 'supportive' | 'practical' | 'analytical';

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
  }
};

export default function Home() {
  // State for messages and input
  const [messages, setMessages] = useState<Message[]>([
    { role: 'system', content: 'Jsi cesky psycholog. Odpovidej klidne, empaticky, a nikdy nediagnostikuj.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  // State for settings
  const [showSettings, setShowSettings] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<TopicKey | null>(null);
  const [selectedPersonality, setSelectedPersonality] = useState<PersonalityKey | null>(null);
  const [saveHistory, setSaveHistory] = useState(false);
  
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
    }
  }, []);
  
  // Save conversation history to localStorage
  const saveConversationHistory = (newHistory: typeof conversationHistory) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('conversationHistory', JSON.stringify(newHistory));
    }
  };
  
  // Function to speak text using TTS
  const speakText = (text: string) => {
    if (speechSynthesis) {
      // Stop any current speech
      speechSynthesis.cancel();
      
      // Create a new utterance
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set language to Czech
      utterance.lang = 'cs-CZ';
      
      // Start speaking
      speechSynthesis.speak(utterance);
      setIsSpeaking(true);
      
      // Event listener for when speech ends
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
  
  // Function to save current conversation to history
  const saveCurrentConversation = () => {
    if (messages.length > 1) {
      const userMessages = messages.filter(msg => msg.role === 'user');
      const title = userMessages.length > 0 
        ? userMessages[0].content.substring(0, 30) + (userMessages[0].content.length > 30 ? '...' : '')
        : 'Nová konverzace';
      
      const newConversation = {
        id: Date.now().toString(),
        title,
        date: new Date(),
        messages: messages.map(msg => ({
          ...msg,
          timestamp: new Date()
        }))
      };
      
      const newHistory = [...conversationHistory, newConversation];
      setConversationHistory(newHistory);
      saveConversationHistory(newHistory);
    }
  };
  
  // Function to load a conversation from history
  const loadConversation = (id: string) => {
    const conversation = conversationHistory.find(conv => conv.id === id);
    if (conversation) {
      setMessages(conversation.messages);
      setShowHistory(false);
    }
  };
  
  // Function to delete a conversation from history
  const deleteConversation = (id: string) => {
    const newHistory = conversationHistory.filter(conv => conv.id !== id);
    setConversationHistory(newHistory);
    saveConversationHistory(newHistory);
  };
  
  // Function to start a new conversation
  const startNewConversation = () => {
    setMessages([
      { role: 'system', content: 'Jsi cesky psycholog. Odpovidej klidne, empaticky, a nikdy nediagnostikuj.' }
    ]);
    setSelectedTopic(null);
    setSelectedPersonality(null);
  };

  // Function to send a message
  const sendMessage = async () => {
    if (!input.trim()) return;
    
    // Create a new user message with the correct type
    const userMessage: Message = { 
      role: 'user', 
      content: input,
      timestamp: new Date()
    };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      console.log("Odesílám zprávu na API:", input);
      
      // Prepare request data
      const requestData = {
        messages: newMessages,
        topic: selectedTopic,
        personality: selectedPersonality,
        saveHistory
      };
      
      console.log("Request data:", JSON.stringify(requestData, null, 2));
      
      const res = await axios.post<ApiResponse>('/api/chat', requestData);
      
      console.log("API odpověď:", res.data);
      
      // Create a properly typed assistant message
      const assistantMessage: Message = {
        role: 'assistant',
        content: res.data.content || 'Omlouvám se, nastala chyba.',
        timestamp: new Date()
      };
      
      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);
      
      // If saveHistory is enabled, save the conversation
      if (saveHistory) {
        // Auto-save conversation after each message
        const userMessages = updatedMessages.filter(msg => msg.role === 'user');
        const title = userMessages.length > 0 
          ? userMessages[0].content.substring(0, 30) + (userMessages[0].content.length > 30 ? '...' : '')
          : 'Nová konverzace';
        
        const newConversation = {
          id: Date.now().toString(),
          title,
          date: new Date(),
          messages: updatedMessages
        };
        
        const newHistory = [...conversationHistory.filter(conv => 
          // Remove any previous auto-saves of the current conversation
          conv.messages.length !== updatedMessages.length - 2
        ), newConversation];
        
        setConversationHistory(newHistory);
        saveConversationHistory(newHistory);
      }
    } catch (error) {
      console.error('Chyba:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 text-white p-5 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <div className="mr-3 bg-white rounded-full p-2 shadow-md">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" fill="#3B82F6"/>
                <path d="M12 6C9.79 6 8 7.79 8 10C8 11.2 8.54 12.27 9.38 12.97C7.96 13.79 7 15.3 7 17H9C9 15.35 10.35 14 12 14C13.65 14 15 15.35 15 17H17C17 15.3 16.04 13.79 14.62 12.97C15.46 12.27 16 11.2 16 10C16 7.79 14.21 6 12 6Z" fill="white"/>
              </svg>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">AI Psycholog</h1>
          </div>
          <div className="flex space-x-4">
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              title="Historie konverzací"
            >
              <FaHistory size={18} className="mr-1" />
              <span className="hidden sm:inline">Historie</span>
            </button>
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              title="Nastavení"
            >
              <FaCog size={18} className="mr-1" />
              <span className="hidden sm:inline">Nastavení</span>
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-6xl mx-auto p-4 flex">
        {/* Sidebar for topics */}
        <div className="w-64 mr-6 hidden md:block">
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <h2 className="text-lg font-bold mb-3">Témata</h2>
            <ul className="space-y-2">
              {Object.entries(TOPICS).map(([key, topic]) => (
                <li key={key}>
                  <button
                    onClick={() => setSelectedTopic(key as TopicKey)}
                    className={`w-full text-left p-2 rounded-md flex items-center ${
                      selectedTopic === key ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    {topic.icon}
                    <span>{topic.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-bold mb-3">Osobnost asistenta</h2>
            <ul className="space-y-2">
              {Object.entries(PERSONALITIES).map(([key, personality]) => (
                <li key={key}>
                  <button
                    onClick={() => setSelectedPersonality(key as PersonalityKey)}
                    className={`w-full text-left p-2 rounded-md ${
                      selectedPersonality === key ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-medium">{personality.title}</div>
                    <div className="text-sm text-gray-600">{personality.description}</div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Main chat area */}
        <div className="flex-1">
          {/* Settings panel */}
          {showSettings && (
            <div className="bg-white rounded-lg shadow-md p-4 mb-4">
              <h2 className="text-lg font-bold mb-3">Nastavení</h2>
              
              <div className="mb-4">
                <h3 className="font-medium mb-2">Témata</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(TOPICS).map(([key, topic]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedTopic(key as TopicKey)}
                      className={`p-2 rounded-md flex items-center ${
                        selectedTopic === key ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {topic.icon}
                      <span>{topic.title}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mb-4">
                <h3 className="font-medium mb-2">Osobnost asistenta</h3>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(PERSONALITIES).map(([key, personality]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedPersonality(key as PersonalityKey)}
                      className={`p-2 rounded-md text-center ${
                        selectedPersonality === key ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {personality.title}
                    </button>
                  ))}
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
                <label htmlFor="saveHistory">Ukládat historii konverzací</label>
              </div>
              
              <div className="flex justify-between">
                <button
                  onClick={() => {
                    setSelectedTopic(null);
                    setSelectedPersonality(null);
                    setSaveHistory(false);
                  }}
                  className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Resetovat
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Zavřít
                </button>
              </div>
            </div>
          )}
          
          {/* History panel */}
          {showHistory && (
            <div className="bg-white rounded-lg shadow-md p-4 mb-4">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-bold">Historie konverzací</h2>
                <button
                  onClick={() => setShowHistory(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              {conversationHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Žádné uložené konverzace</p>
              ) : (
                <ul className="space-y-2 max-h-60 overflow-y-auto">
                  {conversationHistory.map((conv) => (
                    <li key={conv.id} className="border-b pb-2">
                      <div className="flex justify-between items-center">
                        <button
                          onClick={() => loadConversation(conv.id)}
                          className="text-left hover:text-blue-600"
                        >
                          <div className="font-medium">{conv.title}</div>
                          <div className="text-xs text-gray-500">
                            {conv.date.toLocaleDateString()} {conv.date.toLocaleTimeString()}
                          </div>
                        </button>
                        <button
                          onClick={() => deleteConversation(conv.id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Smazat
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              
              <div className="mt-4 flex justify-between">
                <button
                  onClick={startNewConversation}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Nová konverzace
                </button>
                <button
                  onClick={() => saveCurrentConversation()}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  disabled={messages.length <= 1}
                >
                  Uložit aktuální konverzaci
                </button>
              </div>
            </div>
          )}
          
          {/* Selected topic/personality info */}
          {(selectedTopic || selectedPersonality) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-center">
              {selectedTopic && (
                <div className="mr-4 flex items-center">
                  <span className="font-medium mr-2">Téma:</span>
                  <span className="bg-blue-100 px-2 py-1 rounded-md flex items-center">
                    {TOPICS[selectedTopic].icon}
                    {TOPICS[selectedTopic].title}
                  </span>
                </div>
              )}
              
              {selectedPersonality && (
                <div className="flex items-center">
                  <span className="font-medium mr-2">Osobnost:</span>
                  <span className="bg-blue-100 px-2 py-1 rounded-md">
                    {PERSONALITIES[selectedPersonality].title}
                  </span>
                </div>
              )}
              
              <button
                onClick={() => {
                  setSelectedTopic(null);
                  setSelectedPersonality(null);
                }}
                className="ml-auto text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
          )}
          
          {/* Chat container */}
          <div 
            ref={chatContainerRef}
            className="chat-container bg-white rounded-lg shadow-md p-4 h-[calc(100vh-300px)] overflow-y-auto mb-4"
          >
            {messages.slice(1).map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
                <div className={`max-w-[80%] ${msg.role === 'user' ? 'user-message' : 'assistant-message'}`}>
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-medium">{msg.role === 'user' ? 'Vy' : 'AI Psycholog'}</p>
                    {msg.role === 'assistant' && (
                      <button
                        onClick={() => isSpeaking ? stopSpeaking() : speakText(msg.content)}
                        className="text-gray-500 hover:text-blue-600"
                        title={isSpeaking ? "Zastavit předčítání" : "Přečíst nahlas"}
                      >
                        {isSpeaking ? <FaVolumeMute size={16} /> : <FaVolumeUp size={16} />}
                      </button>
                    )}
                  </div>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  {msg.timestamp && (
                    <p className="text-xs text-gray-500 mt-1 text-right">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-center">
                <div className="bg-gray-100 rounded-lg p-3 inline-block">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Input area */}
          <div className="flex">
            <input
              className="flex-grow border border-gray-300 p-3 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Napište svou zprávu..."
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button
              className="bg-gray-200 hover:bg-gray-300 p-3 transition-colors"
              title="Hlasový vstup (brzy k dispozici)"
              disabled
            >
              <FaMicrophone />
            </button>
            <button 
              onClick={sendMessage} 
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium p-3 rounded-r-lg transition-colors"
            >
              Odeslat
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
