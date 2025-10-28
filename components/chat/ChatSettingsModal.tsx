import React, { useState } from 'react';
import { FaCog, FaTimes, FaChartBar } from 'react-icons/fa';
import { Message } from '../../types/chat';
import { UserProfileData } from '../../types/user';

interface ChatSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  
  selectedTopic: 'anxiety' | 'relationships' | 'depression' | 'stress' | 'selfEsteem' | null;
  setSelectedTopic: React.Dispatch<React.SetStateAction<'anxiety' | 'relationships' | 'depression' | 'stress' | 'selfEsteem' | null>>;
  TOPICS: Record<string, { title: string; icon?: JSX.Element }>;
  
  selectedPersonality: 'supportive' | 'practical' | 'analytical' | 'mentor' | 'coach' | 'mediator' | null;
  setSelectedPersonality: React.Dispatch<React.SetStateAction<'supportive' | 'practical' | 'analytical' | 'mentor' | 'coach' | 'mediator' | null>>;
  PERSONALITIES: Record<string, { title: string }>;
  
  responseLength: 'short' | 'medium' | 'long';
  setResponseLength: (length: 'short' | 'medium' | 'long') => void;
  
  assistantGender: 'male' | 'female';
  setAssistantGender: (gender: 'male' | 'female') => void;
  
  assistantName: string;
  setAssistantName: (name: string) => void;
  
  saveHistory: boolean;
  setSaveHistory: (save: boolean) => void;
  
  onResetSettings: () => void;
}

const ChatSettingsModal: React.FC<ChatSettingsModalProps> = ({
  isOpen, onClose,
  selectedTopic, setSelectedTopic, TOPICS,
  selectedPersonality, setSelectedPersonality, PERSONALITIES,
  responseLength, setResponseLength,
  assistantGender, setAssistantGender,
  assistantName, setAssistantName,
  saveHistory, setSaveHistory,
  onResetSettings
}) => {
  const [activeTab, setActiveTab] = useState('settings');

  if (!isOpen) return null;

  const renderSettings = () => (
    <div className="space-y-8">
      {/* Témata */}
      <div>
        <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">Hlavní téma konverzace</h3>
        <div className="flex flex-wrap gap-3">
          {Object.entries(TOPICS).map(([key, topic]) => (
            <button
              key={key}
              onClick={() => setSelectedTopic(selectedTopic === key ? null : key as any)}
              className={`px-4 py-2 rounded-xl text-sm flex items-center transition-all duration-150 ease-in-out shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
                selectedTopic === key 
                  ? 'bg-blue-500 hover:bg-blue-600 text-white ring-2 ring-blue-300 dark:ring-blue-600' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-gray-200 border border-gray-200 dark:border-slate-600'
              }`}
            >
              {topic.icon && React.cloneElement(topic.icon, { className: "mr-2 text-current" })}
              {topic.title}
            </button>
          ))}
        </div>
      </div>
      
      {/* Osobnost asistenta */}
      <div>
        <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">Preferovaná osobnost asistenta</h3>
        <div className="flex flex-wrap gap-3">
          {Object.entries(PERSONALITIES).map(([key, personality]) => (
            <button
              key={key}
              onClick={() => setSelectedPersonality(selectedPersonality === key ? null : key as any)}
              className={`px-4 py-2 rounded-xl text-sm transition-all duration-150 ease-in-out shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
                selectedPersonality === key 
                  ? 'bg-blue-500 hover:bg-blue-600 text-white ring-2 ring-blue-300 dark:ring-blue-600' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-gray-200 border border-gray-200 dark:border-slate-600'
              }`}
            >
              {personality.title}
            </button>
          ))}
        </div>
      </div>
      
      {/* Délka odpovědí */}
      <div>
        <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">Preferovaná délka odpovědí</h3>
        <div className="flex rounded-xl shadow-md border border-gray-300 dark:border-slate-600 overflow-hidden">
          {(['short', 'medium', 'long'] as const).map((length, idx) => (
            <button
              key={length}
              onClick={() => setResponseLength(length)}
              className={`flex-1 px-3 py-2.5 text-sm transition-colors focus:z-10 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                responseLength === length 
                  ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                  : 'bg-white hover:bg-gray-50 text-gray-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-gray-200'
              } ${idx > 0 ? 'border-l border-gray-300 dark:border-slate-600' : ''}`}
            >
              {length === 'short' ? 'Krátké' : length === 'medium' ? 'Střední' : 'Dlouhé'}
            </button>
          ))}
        </div>
      </div>

      {/* Pohlaví asistenta */}
      <div>
        <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">Preferované pohlaví asistenta</h3>
        <div className="flex rounded-xl shadow-md border border-gray-300 dark:border-slate-600 overflow-hidden">
          {(['male', 'female'] as const).map((gender, idx) => (
            <button
              key={gender}
              onClick={() => setAssistantGender(gender)}
              className={`flex-1 px-3 py-2.5 text-sm transition-colors focus:z-10 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                assistantGender === gender 
                  ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                  : 'bg-white hover:bg-gray-50 text-gray-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-gray-200'
              } ${idx > 0 ? 'border-l border-gray-300 dark:border-slate-600' : ''}`}
            >
              {gender === 'male' ? 'Muž' : 'Žena'}
            </button>
          ))}
        </div>
      </div>

      {/* Jméno asistenta */}
      <div>
        <label htmlFor="assistantNameModal" className="block text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Jméno asistenta (nepovinné)</label>
        <input
          type="text"
          id="assistantNameModal"
          value={assistantName}
          onChange={(e) => setAssistantName(e.target.value)}
          placeholder="Např. David, Lucie..."
          className="block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-500 shadow-sm"
        />
      </div>
      
      {/* Ukládat historii */}
      <div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="saveHistoryModal"
            checked={saveHistory}
            onChange={(e) => setSaveHistory(e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:bg-gray-700"
          />
          <label htmlFor="saveHistoryModal" className="ml-2 block text-sm text-gray-900 dark:text-gray-200">
            Ukládat historii konverzací (lokálně)
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col border border-gray-200 dark:border-slate-700">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center space-x-2">
            <div className="px-4 py-2 rounded-lg text-sm font-medium flex items-center text-gray-600 dark:text-gray-400">
              <FaCog className="mr-2 text-blue-500" />
              Nastavení
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
            title="Zavřít"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-6 overflow-y-auto">
          {renderSettings()}
        </div>
        
        {/* Modal Footer */}
        <div className="p-4 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-slate-700 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
          <button
            onClick={() => {
              onResetSettings();
            }}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
          >
            Resetovat nastavení
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
          >
            Hotovo
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatSettingsModal;
