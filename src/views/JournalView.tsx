import React, { useEffect, useState } from 'react';
import { jsPDF } from 'jspdf';
import bengaliFontUrl from '../assets/fonts/NotoSansBengali.ttf?url';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Trash2, 
  Download, 
  Lock, 
  Sparkles, 
  Calendar, 
  Tag, 
  X, 
  Check, 
  Smile,
  AlertCircle,
  Pencil,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { JournalEntry, ConsentSettings, Language, User } from '../types';
import { translations } from '../data/translations';

interface JournalViewProps {
  entries: JournalEntry[];
  consent: ConsentSettings;
  currentUser?: User | null;
  onSaveEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDeleteEntry: (id: string) => void;
  onUpdateEntry: (entry: JournalEntry) => void;
  language: Language;
}

export const JournalView: React.FC<JournalViewProps> = ({
  entries,
  consent,
  currentUser,
  onSaveEntry,
  onDeleteEntry,
  onUpdateEntry,
  language,
}) => {
  const t = translations[language];
  const isBn = language === 'bn';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMoodFilter, setSelectedMoodFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New entry form state
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newMoodTag, setNewMoodTag] = useState('Calm');
  const [newCategory, setNewCategory] = useState('Daily Reflection');
  const [reflectingId, setReflectingId] = useState<string | null>(null);
  const [consentWarning, setConsentWarning] = useState<string | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [newMoodName, setNewMoodName] = useState('');
  const defaultMoodOptions = ['Calm', 'Grateful', 'Anxious', 'Hopeful', 'Exhausted', 'Joyful'];
  const [moodOptions, setMoodOptions] = useState<string[]>(() => {
    if (!currentUser?.id) return defaultMoodOptions;
    try {
      const saved = localStorage.getItem(`mindcare_moods_${currentUser.id}`);
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultMoodOptions;
    } catch {
      return defaultMoodOptions;
    }
  });
  const maxEntries = 2000;
  const maxWords = 5000;
  const atEntryLimit = entries.length >= maxEntries;
  const countWords = (value: string) => value.trim() ? value.trim().split(/\s+/).length : 0;
  const currentWordCount = countWords(newContent);

  useEffect(() => {
    if (currentUser?.id) {
      localStorage.setItem(`mindcare_moods_${currentUser.id}`, JSON.stringify(moodOptions));
    }
  }, [currentUser?.id, moodOptions]);

  const addMood = (event: React.FormEvent) => {
    event.preventDefault();
    const mood = newMoodName.trim();
    if (!mood || moodOptions.some(item => item.toLowerCase() === mood.toLowerCase())) return;
    setMoodOptions(previous => [...previous, mood]);
    setNewMoodName('');
  };

  const moveMood = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= moodOptions.length) return;
    setMoodOptions(previous => {
      const reordered = [...previous];
      [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
      return reordered;
    });
  };

  const deleteMood = (mood: string) => {
    if (moodOptions.length <= 1) return;
    setMoodOptions(previous => previous.filter(item => item !== mood));
    if (selectedMoodFilter === mood) setSelectedMoodFilter('All');
    if (newMoodTag === mood) {
      setNewMoodTag(moodOptions.find(item => item !== mood) || '');
    }
  };

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMood = selectedMoodFilter === 'All' || entry.moodTag === selectedMoodFilter;
    return matchesSearch && matchesMood;
  });

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim() || currentWordCount > maxWords) return;

    if (editingEntry) {
      const updatedEntry: JournalEntry = {
        ...editingEntry,
        title: newTitle.trim(),
        content: newContent.trim(),
        moodTag: newMoodTag,
        category: newCategory,
        updatedAt: new Date().toISOString(),
        aiReflection: undefined,
      };
      onUpdateEntry(updatedEntry);
      if (consent.journalAnalysisConsent) {
        await handleRequestAIReflection(updatedEntry);
      }
    } else {
      onSaveEntry({
        userId: currentUser?.id || 'guest',
        title: newTitle.trim(),
        content: newContent.trim(),
        date: new Date().toISOString().split('T')[0],
        moodTag: newMoodTag,
        category: newCategory,
      });
    }

    setNewTitle('');
    setNewContent('');
    setEditingEntry(null);
    setIsModalOpen(false);
  };

  const openEditEntry = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setNewTitle(entry.title);
    setNewContent(entry.content);
    setNewMoodTag(entry.moodTag);
    setNewCategory(entry.category);
    setIsModalOpen(true);
  };

  const handleRequestAIReflection = async (entry: JournalEntry) => {
    if (!consent.journalAnalysisConsent) {
      setConsentWarning(
        isBn
          ? 'গোপনীয়তার সুরক্ষায় ডায়েরির ওপর এআই বিশ্লেষণ ডিফল্টভাবে বন্ধ রয়েছে। এটি চালু করতে সেটিংস থেকে "ডায়েরি এআই বিশ্লেষণের সম্মতি" এনাবল করুন।'
          : 'AI journal analysis is currently paused for your privacy. You can enable it anytime in Settings > Consent Controls.'
      );
      setTimeout(() => setConsentWarning(null), 5000);
      return;
    }

    setReflectingId(entry.id);
    try {
      const res = await fetch('/api/journal-reflection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: entry.content,
          mood: entry.moodTag,
          title: entry.title,
          category: entry.category,
          language,
          userConsented: true,
        }),
      });
      const data = await res.json();
      if (data.reflection) {
        onUpdateEntry({
          ...entry,
          aiReflection: data.reflection,
        });
      }
    } catch (err) {
      console.error('Chatbot reflection error:', err);
    } finally {
      setReflectingId(null);
    }
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(entries, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `mindcare-journal-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportPDF = async () => {
    const fontResponse = await fetch(bengaliFontUrl);
    if (!fontResponse.ok) {
      throw new Error(`Unable to load Bengali PDF font: ${fontResponse.status}`);
    }
    const fontBytes = new Uint8Array(await fontResponse.arrayBuffer());
    let fontBase64 = '';
    const chunkSize = 0x8000;
    for (let index = 0; index < fontBytes.length; index += chunkSize) {
      fontBase64 += String.fromCharCode(...fontBytes.subarray(index, index + chunkSize));
    }

    const doc = new jsPDF();
    doc.addFileToVFS('NotoSansBengali.ttf', btoa(fontBase64));
    doc.addFont('NotoSansBengali.ttf', 'NotoSansBengali', 'normal');
    doc.setFont('NotoSansBengali', 'normal');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 18;
    const contentWidth = pageWidth - margin * 2 - 16;
    const userName = currentUser?.name || 'MindCare User';
    let y = 20;

    const addHeader = () => {
      doc.setFillColor(15, 118, 110);
      doc.rect(0, 0, pageWidth, 38, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(19);
      doc.setFont('NotoSansBengali', 'normal');
      doc.text('MindCare Journal', margin, 20);
      doc.setFontSize(10);
      doc.setFont('NotoSansBengali', 'normal');
      doc.text(`User: ${userName}`, margin, 30);
      doc.setTextColor(30, 41, 59);
      y = 54;
    };

    const addEntry = (entry: JournalEntry) => {
      const timestamp = entry.createdAt ? new Date(entry.createdAt).toLocaleString() : entry.date;
      const titleLines = doc.splitTextToSize(entry.title, contentWidth);
      const contentLines = doc.splitTextToSize(entry.content, contentWidth);
      const entryHeight = 32 + titleLines.length * 6 + contentLines.length * 5;

      if (y + entryHeight > pageHeight - 18) {
        doc.addPage();
        addHeader();
      }

      doc.setFillColor(240, 253, 250);
      doc.setDrawColor(153, 246, 228);
      doc.roundedRect(margin - 3, y - 8, pageWidth - margin * 2 + 6, entryHeight, 4, 4, 'FD');
      doc.setTextColor(15, 118, 110);
      doc.setFontSize(13);
      doc.setFont('NotoSansBengali', 'normal');
      doc.text(titleLines, margin, y);
      y += titleLines.length * 6 + 4;
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(9);
      doc.setFont('NotoSansBengali', 'normal');
      doc.text(timestamp, pageWidth - margin, y, { align: 'right' });
      y += 8;
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(10);
      doc.setFont('NotoSansBengali', 'normal');
      doc.text(contentLines, margin, y);
      y += contentLines.length * 5 + 16;
    };

    addHeader();
    [...entries]
      .sort((a, b) => (b.createdAt || b.date).localeCompare(a.createdAt || a.date))
      .forEach(addEntry);
    doc.save(`mindcare-journal-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-xs font-bold mb-2">
            <Lock className="w-3.5 h-3.5" />
            <span>{isBn ? 'সুরক্ষিত সংরক্ষণ' : 'Secure Storage'}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {t.journal.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {t.journal.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPDF}
            className="px-3.5 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 transition"
            title="Export journal as PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isBn ? 'PDF ডাউনলোড' : 'Export PDF'}</span>
          </button>

          <button
            onClick={() => {
              setEditingEntry(null);
              setNewTitle('');
              setNewContent('');
              setIsModalOpen(true);
            }}
            disabled={atEntryLimit}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>{t.journal.newEntry}</span>
          </button>
        </div>
      </div>

      <div className={`text-xs font-semibold ${atEntryLimit ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'}`}>
        {entries.length} / {maxEntries} {isBn ? 'ডায়েরি এন্ট্রি' : 'journal entries'}
        {atEntryLimit && (isBn ? ' — নতুন এন্ট্রি যোগ করতে পুরোনোটি মুছুন।' : ' — delete an older entry before creating a new one.')}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.journal.searchPlaceholder}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedMoodFilter('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              selectedMoodFilter === 'All'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            {t.journal.allMoods}
          </button>
          {moodOptions.map((mood) => (
            <button
              key={mood}
              onClick={() => setSelectedMoodFilter(mood)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedMoodFilter === mood
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {mood}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              {isBn ? 'নিজের Mood যোগ ও সাজান' : 'Add and arrange your moods'}
            </h2>
            <p className="text-[11px] text-slate-500">
              {isBn ? 'Up/Down দিয়ে mood-এর ক্রম পরিবর্তন করুন।' : 'Use Up/Down to change the order shown in filters and forms.'}
            </p>
          </div>
          <form onSubmit={addMood} className="flex gap-2">
            <input
              value={newMoodName}
              onChange={(event) => setNewMoodName(event.target.value)}
              placeholder={isBn ? 'নতুন mood' : 'New mood'}
              maxLength={40}
              className="w-36 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={!newMoodName.trim()}
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold transition"
            >
              <Plus className="w-3.5 h-3.5 inline mr-1" />
              {isBn ? 'যোগ' : 'Add'}
            </button>
          </form>
        </div>
        <div className="flex flex-wrap gap-2">
          {moodOptions.map((mood, index) => (
            <div key={mood} className="inline-flex items-center gap-1 px-2 py-1 rounded-xl bg-slate-100 dark:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200">
              <span>{mood}</span>
              <button
                type="button"
                onClick={() => moveMood(index, -1)}
                disabled={index === 0}
                className="p-0.5 text-slate-400 hover:text-emerald-600 disabled:opacity-30"
                aria-label={`Move ${mood} up`}
              >
                <ChevronUp className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => moveMood(index, 1)}
                disabled={index === moodOptions.length - 1}
                className="p-0.5 text-slate-400 hover:text-emerald-600 disabled:opacity-30"
                aria-label={`Move ${mood} down`}
              >
                <ChevronDown className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => deleteMood(mood)}
                className="p-0.5 text-slate-400 hover:text-rose-600"
                aria-label={`Delete ${mood} mood`}
                title={isBn ? 'Mood মুছুন' : 'Delete mood'}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Consent Warning Banner */}
      {consentWarning && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950 border border-amber-300 dark:border-amber-800 rounded-2xl text-xs font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-2 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>{consentWarning}</span>
        </div>
      )}

      {/* Journal Cards List */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center text-slate-500">
            <BookOpen className="w-10 h-10 mx-auto mb-3 text-slate-400" />
            <p className="text-sm font-semibold">{t.journal.noEntries}</p>
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-xs space-y-4 hover:border-emerald-300 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {entry.title}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                    {entry.moodTag}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{entry.createdAt ? new Date(entry.createdAt).toLocaleString() : entry.date}</span>
                  </span>
                  {entryToDelete === entry.id ? (
                    <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950 p-1 rounded-lg">
                      <span className="text-[10px] text-rose-700 font-bold">{isBn ? 'মুছে ফেলবেন?' : 'Delete?'}</span>
                      <button
                        onClick={() => {
                          onDeleteEntry(entry.id);
                          setEntryToDelete(null);
                        }}
                        className="px-1.5 py-0.5 rounded bg-rose-600 text-white text-[10px] font-bold"
                      >
                        {isBn ? 'হ্যাঁ' : 'Yes'}
                      </button>
                      <button
                        onClick={() => setEntryToDelete(null)}
                        className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px]"
                      >
                        {isBn ? 'না' : 'No'}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditEntry(entry)}
                        className="text-slate-400 hover:text-emerald-600 p-1 transition"
                        title="Edit entry"
                        aria-label="Edit entry"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEntryToDelete(entry.id)}
                        className="text-slate-400 hover:text-rose-500 p-1 transition"
                        title="Delete Entry"
                        aria-label="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {entry.content}
              </p>

              {/* Chatbot reflection section */}
              {entry.aiReflection ? (
                <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs space-y-1 animate-fade-in">
                  <div className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isBn ? 'এআই মননশীল রিফ্লেকশন:' : 'Mindful AI Reflection:'}</span>
                  </div>
                  <p className="text-emerald-800 dark:text-emerald-300 italic leading-relaxed">
                    "{entry.aiReflection}"
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-slate-400 italic">
                    {consent.journalAnalysisConsent
                      ? (isBn ? 'ঐচ্ছিক রিফ্লেকশন পেতে পারেন' : 'Chatbot reflection ready on demand')
                      : (isBn ? 'গোপনীয়তার সুরক্ষায় এআই ডায়েরি বিশ্লেষণ স্থগিত' : 'AI Journal analysis paused by privacy preference')}
                  </span>
                  <button
                    onClick={() => handleRequestAIReflection(entry)}
                    disabled={reflectingId === entry.id}
                    className="px-3 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${reflectingId === entry.id ? 'animate-spin' : ''}`} />
                    <span>{t.journal.requestAIReflection}</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* New Journal Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                <span>{editingEntry ? (isBn ? 'এন্ট্রি সম্পাদনা' : 'Edit entry') : t.journal.newEntry}</span>
              </h2>
              <button
                onClick={() => {
                  setEditingEntry(null);
                  setIsModalOpen(false);
                }}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEntry} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.journal.entryTitle}
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={t.journal.entryTitlePlaceholder}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.journal.moodTag}
                </label>
                <div className="flex flex-wrap gap-2">
                  {moodOptions.map((mood) => (
                    <button
                      type="button"
                      key={mood}
                      onClick={() => setNewMoodTag(mood)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                        newMoodTag === mood
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {mood}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.journal.entryContent}
                </label>
                <textarea
                  required
                  rows={5}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder={t.journal.entryContentPlaceholder}
                  className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500"
                />
                <div className={`mt-1 text-right text-[11px] ${currentWordCount > maxWords ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
                  {currentWordCount.toLocaleString()} / {maxWords.toLocaleString()} {isBn ? 'শব্দ' : 'words'}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={currentWordCount > maxWords || atEntryLimit && !editingEntry}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold shadow-md shadow-emerald-600/20"
                >
                  {t.journal.saveEntry}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
