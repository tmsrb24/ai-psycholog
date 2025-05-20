import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { FaBookMedical, FaPlus, FaSave, FaSmile, FaTag, FaFilePdf } from 'react-icons/fa';

// TODO: Definovat typ pro deníkový zápis
interface DiaryEntry {
  id: string;
  date: string; // Nebo Date objekt
  content: string;
  mood?: string; // Emoji nebo klíč pro smajlíka
  tags?: string[]; // Pole barevných kódů nebo názvů štítků
}

const DiaryPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [entries, setEntries] = useState<DiaryEntry[]>([]); // Zatím prázdné, bude se načítat
  const [currentContent, setCurrentContent] = useState('');
  const [currentMood, setCurrentMood] = useState('');
  const [currentTags, setCurrentTags] = useState<string[]>([]);

  const getLocalStorageKey = () => {
    if (session?.user?.email) { // Použijeme email jako součást klíče pro unikátnost per uživatel
      return `diaryEntries-${session.user.email}`;
    }
    return null; // Nebo nějaký fallback, pokud by session/email nebyl dostupný
  };

  // Načítání zápisů z localStorage při prvním načtení
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
            setEntries([]); // Reset na prázdné pole v případě chyby
          }
        }
      }
    }
  }, [session]); // Závislost na session, aby se klíč aktualizoval

  // Ukládání zápisů do localStorage vždy, když se změní stav entries
  useEffect(() => {
    if (session && typeof window !== 'undefined') {
      const key = getLocalStorageKey();
      if (key) {
        localStorage.setItem(key, JSON.stringify(entries));
      }
    }
  }, [entries, session]); // Závislost na entries a session

  if (status === "loading") {
    return <Layout title="Deník"><p className="text-center p-8">Načítání...</p></Layout>;
  }

  if (!session) {
    // Přesměrování na login, pokud uživatel není přihlášen
    // Můžeme přidat callbackUrl, aby se po přihlášení vrátil sem
    if (typeof window !== 'undefined') { // Zajistí, že se router.push volá jen na klientovi
        router.push(`/auth/login?callbackUrl=${encodeURIComponent(router.pathname)}`);
    }
    return <Layout title="Deník"><p className="text-center p-8">Pro přístup k deníku se prosím přihlaste.</p></Layout>;
  }
  
  const handleAddEntry = () => {
    // TODO: Logika pro uložení zápisu na server
    // Prozatím jen ukázka přidání do lokálního stavu
    const newEntry: DiaryEntry = {
      id: new Date().toISOString(), // Dočasné ID
      date: new Date().toLocaleDateString('cs-CZ'),
      content: currentContent,
      mood: currentMood,
      tags: currentTags,
    };
    setEntries(prevEntries => [newEntry, ...prevEntries]);
    setCurrentContent('');
    setCurrentMood('');
    setCurrentTags([]);
  };

  const handleExportToPdf = () => {
    // TODO: Implementovat export do PDF
    alert('Funkce exportu do PDF bude brzy dostupná!');
  };

  return (
    <Layout title="Můj Deník | AI Psycholog" description="Váš osobní prostor pro myšlenky a pocity.">
      {/* Hero sekce pro Deník */}
      <section className="bg-gradient-to-r from-green-600 via-emerald-500 to-teal-400 dark:from-green-700 dark:via-emerald-600 dark:to-teal-500 text-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center justify-center">
            <FaBookMedical className="mr-3" /> Můj Deník
          </h1>
          <p className="text-lg md:text-xl opacity-90">
            Bezpečný prostor pro vaše myšlenky, pocity a každodenní reflexe.
          </p>
        </div>
      </section>

      {/* Hlavní obsah Deníku */}
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Nový zápis</h2>
          
          <textarea
            className="w-full h-48 p-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white mb-4"
            placeholder="Co máte dnes na srdci?"
            value={currentContent}
            onChange={(e) => setCurrentContent(e.target.value)}
          />

          <div className="flex flex-wrap items-center gap-4 mb-6">
            {/* TODO: Výběr nálady (smajlíci) */}
            <div className="flex items-center gap-2">
              <FaSmile className="text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Nálada:</span>
              {/* Placeholder pro výběr smajlíků */}
              <span className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded-full text-xs">TODO</span>
            </div>

            {/* TODO: Výběr štítků (barvy) */}
            <div className="flex items-center gap-2">
              <FaTag className="text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Štítky:</span>
              {/* Placeholder pro výběr štítků */}
              <span className="px-2 py-1 bg-blue-200 text-blue-800 rounded-full text-xs">TODO</span>
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
              className="btn bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md shadow-md flex items-center justify-center sm:w-auto"
            >
              <FaFilePdf className="mr-2" /> Exportovat vše do PDF
            </button>
          </div>

          {/* Zobrazení existujících zápisů */}
          <div className="mt-10">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Moje zápisy</h3>
            {entries.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">Zatím nemáte žádné zápisy.</p>
            ) : (
              <div className="space-y-6">
                {entries.map(entry => (
                  <div key={entry.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm bg-gray-50 dark:bg-gray-700/50">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{entry.date}</p>
                    <p className="text-gray-700 dark:text-gray-200 whitespace-pre-line">{entry.content}</p>
                    {/* TODO: Zobrazit náladu a štítky */}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DiaryPage;
