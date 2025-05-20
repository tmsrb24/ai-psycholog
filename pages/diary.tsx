import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { FaBookMedical, FaSave, FaSmile, FaTag, FaFilePdf, FaRegMeh, FaRegSmile, FaRegFrown, FaRegAngry, FaRegSurprise } from 'react-icons/fa';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas'; // Bude potřeba pro komplexnější PDF export, zatím jen text

interface DiaryTag {
  id: string;
  name: string;
  color: string; // Tailwind color class, e.g., 'bg-blue-500'
}

interface DiaryMood {
  id: string;
  emoji: string; // Actual emoji character
  name: string; // Name of the mood
  icon?: React.ElementType; // Optional: React Icon component
}

interface DiaryEntry {
  id: string;
  date: string;
  content: string;
  mood?: DiaryMood['id']; 
  tags?: DiaryTag['id'][];
}

const availableMoods: DiaryMood[] = [
  { id: 'happy', emoji: '😄', name: 'Šťastný/á', icon: FaRegSmile },
  { id: 'sad', emoji: '😔', name: 'Smutný/á', icon: FaRegFrown },
  { id: 'neutral', emoji: '😐', name: 'Neutrální', icon: FaRegMeh },
  { id: 'angry', emoji: '😠', name: 'Naštvaný/á', icon: FaRegAngry },
  { id: 'surprised', emoji: '😮', name: 'Překvapený/á', icon: FaRegSurprise },
];

const availableTags: DiaryTag[] = [
  { id: 'work', name: 'Práce', color: 'bg-blue-500' },
  { id: 'personal', name: 'Osobní', color: 'bg-green-500' },
  { id: 'relationships', name: 'Vztahy', color: 'bg-pink-500' },
  { id: 'health', name: 'Zdraví', color: 'bg-red-500' },
  { id: 'ideas', name: 'Nápady', color: 'bg-yellow-500' },
  { id: 'other', name: 'Ostatní', color: 'bg-gray-500' },
];

const DiaryPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [currentContent, setCurrentContent] = useState('');
  const [currentMoodId, setCurrentMoodId] = useState<DiaryMood['id'] | undefined>(undefined);
  const [currentTagIds, setCurrentTagIds] = useState<DiaryTag['id'][]>([]);
  const entriesContainerRef = useRef<HTMLDivElement>(null);


  const getLocalStorageKey = () => {
    if (session?.user?.email) {
      return `diaryEntries-${session.user.email}`;
    }
    return null;
  };

  useEffect(() => {
    if (session && typeof window !== 'undefined') {
      const key = getLocalStorageKey();
      if (key) {
        const storedEntries = localStorage.getItem(key);
        if (storedEntries) {
          try {
            setEntries(JSON.parse(storedEntries));
          } catch (e) {
            console.error("Chyba při parsování deníkových zápisů z localStorage:", e);
            setEntries([]);
          }
        }
      }
    }
  }, [session]);

  useEffect(() => {
    if (session && typeof window !== 'undefined') {
      const key = getLocalStorageKey();
      if (key) {
        localStorage.setItem(key, JSON.stringify(entries));
      }
    }
  }, [entries, session]);

  if (status === "loading") {
    return <Layout title="Deník"><p className="text-center p-8">Načítání...</p></Layout>;
  }

  if (!session) {
    if (typeof window !== 'undefined') {
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(router.pathname)}`);
    }
    return <Layout title="Deník"><p className="text-center p-8">Pro přístup k deníku se prosím přihlaste.</p></Layout>;
  }
  
  const handleAddEntry = () => {
    const newEntry: DiaryEntry = {
      id: new Date().toISOString(),
      date: new Date().toLocaleString('cs-CZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      content: currentContent,
      mood: currentMoodId,
      tags: currentTagIds,
    };
    setEntries(prevEntries => [newEntry, ...prevEntries]);
    setCurrentContent('');
    setCurrentMoodId(undefined);
    setCurrentTagIds([]);
  };

  const toggleTag = (tagId: string) => {
    setCurrentTagIds(prev => 
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  const handleExportToPdf = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "normal"); // Použití standardního fontu
    doc.text("Můj Deník - Psychollog.cz", 14, 16);
    let yPos = 30;

    entries.forEach((entry, index) => {
      if (index > 0) { // Přidá mezeru mezi zápisy
        yPos += 5; 
      }
      if (yPos > 270) { // Nová stránka, pokud je potřeba
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(10);
      doc.setTextColor(100); // Šedá barva pro datum
      doc.text(entry.date, 14, yPos);
      yPos += 6;

      if (entry.mood) {
        const moodObj = availableMoods.find(m => m.id === entry.mood);
        if (moodObj) {
          doc.text(`Nálada: ${moodObj.emoji} ${moodObj.name}`, 14, yPos);
          yPos += 5;
        }
      }

      if (entry.tags && entry.tags.length > 0) {
        const tagNames = entry.tags.map(tagId => availableTags.find(t => t.id === tagId)?.name).filter(Boolean).join(', ');
        doc.text(`Štítky: ${tagNames}`, 14, yPos);
        yPos += 5;
      }
      
      doc.setFontSize(12);
      doc.setTextColor(0); // Černá barva pro text
      const splitContent = doc.splitTextToSize(entry.content, 180); // Zalomení textu na šířku 180mm
      doc.text(splitContent, 14, yPos);
      yPos += (splitContent.length * 5) + 5; // Odhad výšky textu + mezera
    });

    doc.save(`muj-denik-psychollog-cz-${new Date().toISOString().split('T')[0]}.pdf`);
  };


  return (
    <Layout title="Můj Deník | AI Psycholog" description="Váš osobní prostor pro myšlenky a pocity.">
      <section className="bg-gradient-to-r from-emerald-600 via-green-500 to-teal-500 dark:from-emerald-700 dark:via-green-600 dark:to-teal-600 text-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center justify-center">
            <FaBookMedical className="mr-3" /> Můj Deník
          </h1>
          <p className="text-lg md:text-xl opacity-90">
            Bezpečný prostor pro vaše myšlenky, pocity a každodenní reflexe.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8"> {/* Zvětšeno max-w pro "knižní" vzhled */}
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Nový zápis</h2>
          
          <textarea
            className="w-full h-48 p-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white mb-4"
            placeholder="Co máte dnes na srdci?"
            value={currentContent}
            onChange={(e) => setCurrentContent(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nálada:</label>
              <div className="flex flex-wrap gap-2">
                {availableMoods.map(mood => (
                  <button 
                    key={mood.id} 
                    onClick={() => setCurrentMoodId(mood.id)}
                    title={mood.name}
                    className={`p-2 rounded-full text-2xl transition-transform hover:scale-110 ${currentMoodId === mood.id ? 'ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-gray-800' : ''}`}
                  >
                    {mood.emoji}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Štítky:</label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <button 
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                      currentTagIds.includes(tag.id) 
                        ? `${tag.color} text-white shadow-md` 
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500'
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAddEntry}
              disabled={!currentContent.trim()}
              className="btn bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-md shadow-md flex items-center justify-center sm:w-auto disabled:opacity-50"
            >
              <FaSave className="mr-2" /> Uložit zápis
            </button>
            <button
              onClick={handleExportToPdf}
              disabled={entries.length === 0}
              className="btn bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md shadow-md flex items-center justify-center sm:w-auto disabled:opacity-50"
            >
              <FaFilePdf className="mr-2" /> Exportovat vše do PDF
            </button>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700" ref={entriesContainerRef}>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8 text-center">Moje zápisy</h3>
            {entries.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center">Zatím nemáte žádné zápisy. Vytvořte svůj první!</p>
            ) : (
              // Kontejner pro "knižní" vzhled
              <div className="bg-yellow-50/30 dark:bg-gray-800/30 p-4 md:p-8 rounded-lg shadow-inner">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 md:gap-x-12"> {/* "Knižní" layout s mezerou uprostřed */}
                  {entries.map(entry => {
                    const moodObj = availableMoods.find(m => m.id === entry.mood);
                    const entryTags = entry.tags?.map(tagId => availableTags.find(t => t.id === tagId)).filter(Boolean) as DiaryTag[];

                    return (
                      // Jednotlivá "stránka" deníku
                      <div 
                        key={entry.id} 
                        className="bg-white dark:bg-gray-700 p-6 rounded-md shadow-lg flex flex-col min-h-[200px] border border-gray-200 dark:border-gray-600 
                                   transform transition-transform hover:scale-[1.02]" // Lehký hover efekt
                      >
                        <div className="flex justify-between items-start mb-3 pb-2 border-b border-gray-200 dark:border-gray-600">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{entry.date}</span>
                          <div className="flex items-center gap-2">
                            {moodObj && <span title={moodObj.name} className="text-2xl">{moodObj.emoji}</span>}
                            <div className="flex gap-1.5">
                              {entryTags?.map(tag => (
                                <span key={tag.id} title={tag.name} className={`block w-3 h-3 rounded-full ${tag.color} shadow-sm`}></span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700 dark:text-gray-200 whitespace-pre-line flex-grow text-sm leading-relaxed">{entry.content}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DiaryPage;
