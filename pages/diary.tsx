import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { FaBookMedical, FaSave, FaSmile, FaTag, FaFilePdf, FaRegMeh, FaRegSmile, FaRegFrown, FaRegAngry, FaRegSurprise, FaSpinner } from 'react-icons/fa';
import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas'; // Zatím nepoužíváme pro PDF

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

interface DiaryEntry {
  id: string; // UUID ze Supabase
  user_id: string;
  entry_date: string; // ISO string date
  content: string;
  mood_id?: DiaryMood['id']; 
  tags?: DiaryTag['id'][];
  created_at: string;
  updated_at: string;
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
  
  const [isLoadingEntries, setIsLoadingEntries] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const entriesContainerRef = useRef<HTMLDivElement>(null);

  const fetchEntries = async () => {
    if (!session) return;
    setIsLoadingEntries(true);
    setError(null);
    try {
      const response = await fetch('/api/diary');
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Nepodařilo se načíst zápisy.');
      }
      const data = await response.json();
      setEntries(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoadingEntries(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchEntries();
    }
  }, [status, session]);


  if (status === "loading") {
    return <Layout title="Deník"><p className="text-center p-8">Načítání autentizace...</p></Layout>;
  }

  if (!session) {
    if (typeof window !== 'undefined') {
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(router.pathname)}`);
    }
    return <Layout title="Deník"><p className="text-center p-8">Pro přístup k deníku se prosím přihlaste.</p></Layout>;
  }
  
  const handleAddEntry = async () => {
    if (!currentContent.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    const newEntryPayload = {
      content: currentContent,
      mood_id: currentMoodId,
      tags: currentTagIds,
      entry_date: new Date().toISOString(), // Ukládáme jako ISO string
    };

    try {
      const response = await fetch('/api/diary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntryPayload),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Nepodařilo se uložit zápis.');
      }
      // const savedEntry = await response.json(); // API vrací uložený záznam
      // setEntries(prevEntries => [savedEntry, ...prevEntries]); // Optimistické UI nebo znovu načíst
      await fetchEntries(); // Znovu načteme všechny zápisy pro konzistenci
      setCurrentContent('');
      setCurrentMoodId(undefined);
      setCurrentTagIds([]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTag = (tagId: string) => {
    setCurrentTagIds(prev => 
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  const handleExportToPdf = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "normal");
    doc.text("Můj Deník - Psychollog.cz", 14, 16);
    let yPos = 30;

    entries.slice().sort((a,b) => new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime()).forEach((entry, index) => { // Seřadit od nejstaršího
      if (index > 0) yPos += 5;
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(new Date(entry.entry_date).toLocaleString('cs-CZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }), 14, yPos);
      yPos += 6;

      if (entry.mood_id) {
        const moodObj = availableMoods.find(m => m.id === entry.mood_id);
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
      doc.setTextColor(0);
      const splitContent = doc.splitTextToSize(entry.content, 180);
      doc.text(splitContent, 14, yPos);
      yPos += (splitContent.length * 5) + 5;
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

      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Nový zápis</h2>
          
          {error && <p className="text-red-500 bg-red-100 dark:bg-red-900/30 p-3 rounded-md mb-4">{error}</p>}

          <textarea
            className="w-full h-48 p-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white mb-4"
            placeholder="Co máte dnes na srdci?"
            value={currentContent}
            onChange={(e) => setCurrentContent(e.target.value)}
            disabled={isSubmitting}
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
                    disabled={isSubmitting}
                    className={`p-2 rounded-full text-2xl transition-transform hover:scale-110 ${currentMoodId === mood.id ? 'ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-gray-800' : ''} ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                    disabled={isSubmitting}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                      currentTagIds.includes(tag.id) 
                        ? `${tag.color} text-white shadow-md` 
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500'
                    } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
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
              disabled={!currentContent.trim() || isSubmitting}
              className="btn bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-md shadow-md flex items-center justify-center sm:w-auto disabled:opacity-50"
            >
              {isSubmitting ? <FaSpinner className="animate-spin mr-2" /> : <FaSave className="mr-2" />}
              {isSubmitting ? 'Ukládání...' : 'Uložit zápis'}
            </button>
            <button
              onClick={handleExportToPdf}
              disabled={entries.length === 0 || isSubmitting}
              className="btn bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md shadow-md flex items-center justify-center sm:w-auto disabled:opacity-50"
            >
              <FaFilePdf className="mr-2" /> Exportovat vše do PDF
            </button>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700" ref={entriesContainerRef}>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8 text-center">Moje zápisy</h3>
            {isLoadingEntries && <p className="text-center text-gray-500 dark:text-gray-400"><FaSpinner className="animate-spin inline mr-2" /> Načítání zápisů...</p>}
            {!isLoadingEntries && error && <p className="text-center text-red-500 bg-red-100 dark:bg-red-900/30 p-3 rounded-md">{error}</p>}
            {!isLoadingEntries && !error && entries.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center">Zatím nemáte žádné zápisy. Vytvořte svůj první!</p>
            )}
            {!isLoadingEntries && !error && entries.length > 0 && (
              <div className="bg-yellow-50/30 dark:bg-gray-800/30 p-4 md:p-8 rounded-lg shadow-inner">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 md:gap-x-12">
                  {entries.map(entry => {
                    const moodObj = availableMoods.find(m => m.id === entry.mood_id);
                    const entryTags = entry.tags?.map(tagId => availableTags.find(t => t.id === tagId)).filter(Boolean) as DiaryTag[];

                    return (
                      <div 
                        key={entry.id} 
                        className="bg-white dark:bg-gray-700 p-6 rounded-md shadow-lg flex flex-col min-h-[200px] border border-gray-200 dark:border-gray-600 
                                   transform transition-transform hover:scale-[1.02]"
                      >
                        <div className="flex justify-between items-start mb-3 pb-2 border-b border-gray-200 dark:border-gray-600">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{new Date(entry.entry_date).toLocaleString('cs-CZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
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
