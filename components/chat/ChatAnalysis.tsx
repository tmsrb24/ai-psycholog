import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaChartBar, FaFileAlt, FaHashtag, FaBrain, FaRegClock, FaSpinner } from 'react-icons/fa';

interface InsightData {
  messageCount: number;
  wordCount: number;
  sessionCount: number;
  averageSessionLength: number;
  commonTopics: { topic: string; count: number }[];
}

const StatCard = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) => (
  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg flex items-center">
    <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/50 mr-4">
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  </div>
);

const ChatAnalysis: React.FC = () => {
  const [data, setData] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/user/analysis');
        setData(response.data);
      } catch (err) {
        setError('Nepodařilo se načíst data analýzy.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <FaSpinner className="animate-spin text-blue-500 text-3xl" />
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-500 p-4">{error}</p>;
  }

  if (!data || data.sessionCount === 0) {
    return (
        <div className="text-center text-gray-600 dark:text-gray-400 p-4">
            <FaChartBar className="mx-auto text-4xl text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Nedostatek dat pro analýzu</h3>
            <p className="text-sm">Začněte konverzaci, abychom vám mohli poskytnout přehledy.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1">
      <div className="grid grid-cols-2 gap-4">
        <StatCard 
          icon={<FaHashtag className="text-blue-500" />} 
          label="Počet zpráv" 
          value={data.messageCount} 
        />
        <StatCard 
          icon={<FaFileAlt className="text-green-500" />} 
          label="Počet slov" 
          value={data.wordCount} 
        />
        <StatCard 
          icon={<FaRegClock className="text-yellow-500" />} 
          label="Počet sezení" 
          value={data.sessionCount} 
        />
        <StatCard 
          icon={<FaChartBar className="text-red-500" />} 
          label="Prům. délka" 
          value={`${data.averageSessionLength} zpráv`} 
        />
      </div>
      <div>
        <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center">
            <FaBrain className="mr-2 text-purple-500"/>
            Nejčastější témata
        </h3>
        {data.commonTopics.length > 0 ? (
            <ul className="space-y-2">
            {data.commonTopics.map(topic => (
                <li key={topic.topic} className="text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 p-2 rounded-md">
                {topic.topic} ({topic.count} zmínky)
                </li>
            ))}
            </ul>
        ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">Zatím nebyly identifikovány žádné hlavní témata.</p>
        )}
      </div>
    </div>
  );
};

export default ChatAnalysis;
