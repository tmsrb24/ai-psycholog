import React, { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaSpinner } from 'react-icons/fa';
import { Message } from '../types'; // Předpokládáme existenci typu Message

interface WidgetChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

const WidgetChatWindow: React.FC<WidgetChatWindowProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    // Přivítací zpráva při prvním otevření (pokud je okno otevřené a nejsou žádné zprávy)
    if (isOpen && messages.length === 0) {
      setMessages([
        { role: 'assistant', content: 'Dobrý den! Jak vám mohu pomoci s informacemi o webu Psychollog.cz?', timestamp: new Date() }
      ]);
    }
  }, [isOpen]);


  const handleSendMessage = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = { role: 'user', content: inputValue, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/widget-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }), // Posíláme historii pro kontext
      });
      
      const data = await response.json();

      if (response.ok && data.content) {
        const assistantMessage: Message = { role: 'assistant', content: data.content, timestamp: new Date() };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        console.error("Error from /api/widget-chat:", data.error || 'Neznámá chyba API');
        const errorMessage: Message = { role: 'assistant', content: data.content || 'Omlouvám se, došlo k chybě při zpracování vašeho dotazu.', timestamp: new Date() };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Error sending widget message to API:", error);
      const errorMessage: Message = { role: 'assistant', content: 'Omlouvám se, došlo k chybě.', timestamp: new Date() };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-6 w-80 sm:w-96 h-[70vh] max-h-[500px] bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col z-40 border border-gray-300 dark:border-gray-700">
      <header className="bg-blue-600 text-white p-3 flex justify-between items-center rounded-t-lg">
        <h3 className="font-semibold text-lg">Potřebujete poradit?</h3>
        {/* Tlačítko pro zavření je nyní v WidgetChatButton */}
      </header>

      <div className="flex-grow overflow-y-auto p-4 space-y-3">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] p-2.5 rounded-lg shadow ${
                msg.role === 'user' 
                  ? 'bg-blue-500 text-white rounded-br-none' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
              }`}
            >
              <p className="text-sm">{msg.content}</p>
              {/* <span className="text-xs opacity-70 block mt-1 text-right">
                {msg.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span> */}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Napište svůj dotaz..."
            className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="bg-blue-500 hover:bg-blue-600 text-white p-2.5 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WidgetChatWindow;
