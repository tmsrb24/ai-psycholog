import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { FaBookMedical, FaSave, FaFilePdf, FaRegMeh, FaRegSmile, FaRegFrown, FaRegAngry, FaRegSurprise, FaSpinner, FaEdit, FaTimes, FaTrash } from 'react-icons/fa'; // Přidány FaEdit, FaTimes, FaTrash
import jsPDF from 'jspdf';

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
  id: string; 
  user_id: string;
  entry_date: string; 
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
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // Pro toast notifikace

  // Stavy pro editaci
  const [isEditing, setIsEditing] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editMoodId, setEditMoodId] = useState<DiaryMood['id'] | undefined>(undefined);
  const [editTagIds, setEditTagIds] = useState<DiaryTag['id'][]>([]);

  const entriesContainerRef = useRef<HTMLDivElement>(null);

  const fetchEntries = async () => { /* ... beze změny ... */ };
  useEffect(() => { /* ... beze změny ... */ }, [status, session]);

  const displaySuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };
  
  const handleAddEntry = async () => {
    if (!currentContent.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    const newEntryPayload = { content: currentContent, mood_id: currentMoodId, tags: currentTagIds, entry_date: new Date().toISOString() };
    try {
      const response = await fetch('/api/diary', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newEntryPayload) });
      if (!response.ok) { const errData = await response.json(); throw new Error(errData.error || 'Nepodařilo se uložit zápis.'); }
      await fetchEntries();
      setCurrentContent(''); setCurrentMoodId(undefined); setCurrentTagIds([]);
      displaySuccessMessage("Zápis úspěšně uložen!");
    } catch (err: any) { setError(err.message); } finally { setIsSubmitting(false); }
  };

  const handleOpenEditModal = (entry: DiaryEntry) => {
    setEditingEntry(entry);
    setEditContent(entry.content);
    setEditMoodId(entry.mood_id);
    setEditTagIds(entry.tags || []);
    setIsEditing(true);
    setError(null); // Vyčistit chyby z hlavního formuláře
  };

  const handleUpdateEntry = async () => {
    if (!editingEntry || !editContent.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    const updatedEntryPayload = { id: editingEntry.id, content: editContent, mood_id: editMoodId, tags: editTagIds, entry_date: editingEntry.entry_date }; // entry_date se nemění při update obsahu
    try {
      const response = await fetch(`/api/diary`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedEntryPayload) });
      if (!response.ok) { const errData = await response.json(); throw new Error(errData.error || 'Nepodařilo se aktualizovat zápis.'); }
      await fetchEntries();
      setIsEditing(false);
      setEditingEntry(null);
      displaySuccessMessage("Zápis úspěšně aktualizován!");
    } catch (err: any) { setError(err.message); } finally { setIsSubmitting(false); }
  };
  
  // TODO: Implement handleDeleteEntry
  // const handleDeleteEntry = async (entryId: string) => { ... }

  const toggleTag = (tagId: string, isEditMode: boolean = false) => {
    if (isEditMode) {
      setEditTagIds(prev => prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]);
    } else {
      setCurrentTagIds(prev => prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]);
    }
  };

  const handleExportToPdf = () => { /* ... beze změny ... */ };

  if (status === "loading") return <Layout title="Deník"><p className="text-center p-8">Načítání autentizace...</p></Layout>;
  if (!session) { if (typeof window !== 'undefined') { router.push(`/auth/login?callbackUrl=${encodeURIComponent(router.pathname)}`); } return <Layout title="Deník"><p className="text-center p-8">Pro přístup k deníku se prosím přihlaste.</p></Layout>; }

  return (
    <Layout title="Můj Deník | AI Psycholog" description="Váš osobní prostor pro myšlenky a pocity.">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-emerald-600 via-green-500 to-teal-500 dark:from-emerald-700 dark:via-green-600 dark:to-teal-600 text-white py-12 md:py-16">
        {/* ... obsah hero sekce ... */}
      </section>

      {/* Toast Notification for Success */}
      {successMessage && (
        <div className="fixed top-20 right-5 bg-green-500 text-white py-2 px-4 rounded-md shadow-lg z-[100] animate-pulse-once">
          {successMessage}
        </div>
      )}

      {/* Hlavní obsah */}
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6 md:p-8">
          {/* Formulář pro nový zápis */}
          {/* ... obsah formuláře pro nový zápis ... (používá currentContent, currentMoodId, currentTagIds, toggleTag(tagId, false)) */}
          
          {/* Seznam zápisů */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700" ref={entriesContainerRef}>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8 text-center">Moje zápisy</h3>
            {/* ... zobrazení loading, error, empty state ... */}
            {!isLoadingEntries && !error && entries.length > 0 && (
              <div className="bg-yellow-50/30 dark:bg-gray-800/30 p-4 md:p-8 rounded-lg shadow-inner">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 md:gap-x-12">
                  {entries.map(entry => {
                    const moodObj = availableMoods.find(m => m.id === entry.mood_id);
                    const entryTags = entry.tags?.map(tagId => availableTags.find(t => t.id === tagId)).filter(Boolean) as DiaryTag[];
                    return (
                      <div key={entry.id} className="bg-white dark:bg-gray-700 p-6 rounded-md shadow-lg flex flex-col min-h-[200px] border border-gray-200 dark:border-gray-600 transform transition-transform hover:scale-[1.02]">
                        {/* ... zobrazení data, nálady, štítků ... */}
                        <p className="text-gray-700 dark:text-gray-200 whitespace-pre-line flex-grow text-sm leading-relaxed">{entry.content}</p>
                        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600 flex justify-end space-x-2">
                          <button onClick={() => handleOpenEditModal(entry)} className="text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center">
                            <FaEdit className="mr-1" /> Upravit
                          </button>
                          {/* <button onClick={() => handleDeleteEntry(entry.id)} className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex items-center">
                            <FaTrash className="mr-1" /> Smazat
                          </button> */}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && editingEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4"> {/* Zvýšen z-index */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 md:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">Upravit zápis</h3>
              <button onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <FaTimes size={20} />
              </button>
            </div>
            {error && <p className="text-red-500 bg-red-100 dark:bg-red-900/30 p-3 rounded-md mb-4">{error}</p>}
            <textarea
              className="w-full h-40 p-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white mb-4"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              disabled={isSubmitting}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nálada:</label>
                <div className="flex flex-wrap gap-2">
                  {availableMoods.map(mood => (
                    <button key={mood.id} onClick={() => setEditMoodId(mood.id)} title={mood.name} disabled={isSubmitting}
                      className={`p-2 rounded-full text-2xl transition-transform hover:scale-110 ${editMoodId === mood.id ? 'ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-gray-800' : ''} ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      {mood.emoji}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Štítky:</label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map(tag => (
                    <button key={tag.id} onClick={() => toggleTag(tag.id, true)} disabled={isSubmitting}
                      className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${ editTagIds.includes(tag.id) ? `${tag.color} text-white shadow-md` : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500'} ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setIsEditing(false)} disabled={isSubmitting} className="btn bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200 disabled:opacity-50">
                Zrušit
              </button>
              <button onClick={handleUpdateEntry} disabled={!editContent.trim() || isSubmitting} className="btn bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50">
                {isSubmitting ? <FaSpinner className="animate-spin mr-2" /> : <FaSave className="mr-2" />}
                {isSubmitting ? 'Ukládání...' : 'Uložit změny'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default DiaryPage;
