import React, { useState } from 'react';
import { 
  Smile, 
  Moon, 
  Activity, 
  Zap, 
  Compass, 
  Tag, 
  Calendar, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Heart,
  History,
  X
} from 'lucide-react';
import { CheckIn, Language } from '../types';
import { translations } from '../data/translations';

interface MindStatusAssessmentViewProps {
  checkIns: CheckIn[];
  onSaveCheckIn: (checkIn: Omit<CheckIn, 'id'>) => void;
  language: Language;
  userId: string;
}

export const MindStatusAssessmentView: React.FC<MindStatusAssessmentViewProps> = ({
  checkIns,
  onSaveCheckIn,
  language,
  userId,
}) => {
  const t = translations[language];
  const isBn = language === 'bn';

  const [mood, setMood] = useState<number>(4);
  const [sleepHours, setSleepHours] = useState<number>(7.5);
  const [sleepQuality, setSleepQuality] = useState<'poor' | 'fair' | 'good' | 'excellent'>('good');
  const [stressLevel, setStressLevel] = useState<number>(3);
  const [energyLevel, setEnergyLevel] = useState<number>(7);
  const [focusLevel, setFocusLevel] = useState<number>(7);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Work', 'Sleep']);
  const [note, setNote] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const localDate = (() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  })();
  const todaysCheckIn = checkIns.find(checkIn => checkIn.date === localDate);
  const nextCheckInDate = (() => {
    const tomorrow = new Date();
    tomorrow.setHours(24, 0, 0, 0);
    return new Intl.DateTimeFormat(language === 'bn' ? 'bn-BD' : undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(tomorrow);
  })();
  const formatCheckInTime = (timestamp?: string) => {
    if (!timestamp) return '';
    return new Intl.DateTimeFormat(language === 'bn' ? 'bn-BD' : undefined, {
      timeStyle: 'short',
    }).format(new Date(timestamp));
  };
  const recentCheckIns = [...checkIns].sort((a, b) =>
    new Date(a.updatedAt || a.createdAt || a.date).getTime() -
    new Date(b.updatedAt || b.createdAt || b.date).getTime()
  );

  const moodEmojis = [
    { value: 1, emoji: '😢', label: isBn ? 'খুব মন খারাপ' : 'Very Sad' },
    { value: 2, emoji: '😔', label: isBn ? 'বিষণ্ণ / উদ্বিগ্ন' : 'Down / Anxious' },
    { value: 3, emoji: '😐', label: isBn ? 'স্বাভাবিক' : 'Neutral' },
    { value: 4, emoji: '🙂', label: isBn ? 'ভালো ও শান্ত' : 'Good' },
    { value: 5, emoji: '😄', label: isBn ? 'খুবই উৎফুল্ল' : 'Very Happy' },
  ];

  const availableTags = [
    { id: 'Work', label: isBn ? 'কাজের চাপ' : 'Work' },
    { id: 'Family', label: isBn ? 'পরিবার' : 'Family' },
    { id: 'Studies', label: isBn ? 'পড়াশোনা' : 'Studies' },
    { id: 'Sleep', label: isBn ? 'ঘুমের মান' : 'Sleep' },
    { id: 'Exercise', label: isBn ? 'শরীরচর্চা' : 'Exercise' },
    { id: 'Socializing', label: isBn ? 'বন্ধুবান্ধব' : 'Socializing' },
    { id: 'Finances', label: isBn ? 'আর্থিক চিন্তা' : 'Finances' },
    { id: 'Health', label: isBn ? 'শারীরিক সুস্থতা' : 'Health' },
  ];

  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(t => t !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    if (todaysCheckIn) {
      const shouldUpdate = window.confirm(
        isBn
          ? 'আজকের check-in ইতিমধ্যে সংরক্ষিত আছে। আপনি কি আগের তথ্য update করতে চান? Cancel করলে কোনো data পরিবর্তন হবে না।'
          : 'Today’s check-in is already saved. Do you want to update the existing record? Cancel to keep the current data unchanged.'
      );
      if (!shouldUpdate) return;
    }
    setIsSaving(true);
    const currentMoodLabel = moodEmojis.find(m => m.value === mood)?.label || 'Good';

    try {
      onSaveCheckIn({
        userId,
        date: localDate,
        mood,
        moodLabel: currentMoodLabel,
        sleepHours,
        sleepQuality,
        stressLevel,
        energyLevel,
        focusLevel,
        tags: selectedTags,
        optionalNote: note.trim() || undefined,
      });
      setNote('');
      setShowSuccess(true);
      setIsHistoryOpen(true);
      setTimeout(() => setShowSuccess(false), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
          <Smile className="w-3.5 h-3.5" />
          <span>{isBn ? 'দৈনিক মননশীল চেক-ইন' : 'Daily Mindful Check-in'}</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          {t.assessment.title}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {t.assessment.subtitle}
        </p>
      </div>

      {showSuccess && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs font-semibold text-emerald-800 dark:text-emerald-200 flex items-center gap-2 animate-fade-in shadow-sm">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{t.assessment.savedSuccess}</span>
        </div>
      )}

      {/* Check-in Form Card */}
      {todaysCheckIn && (
        <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl text-sm text-blue-900 dark:text-blue-200">
          <p>
            {isBn
              ? 'আজকের চেক-ইন ইতিমধ্যে সংরক্ষিত। আবার জমা দিলে একই রেকর্ড আপডেট হবে।'
              : 'Today’s check-in is already saved. Submitting again will update that record instead of creating a duplicate.'}
          </p>
          <p className="mt-1 text-xs text-blue-700 dark:text-blue-300">
            {isBn
              ? `পরের দিনের নতুন চেক-ইন ${nextCheckInDate} থেকে দেওয়া যাবে।`
              : `A new check-in can be submitted from ${nextCheckInDate}.`}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-3xl border border-emerald-100 dark:border-slate-700 shadow-sm p-6 sm:p-8 space-y-8">
        {/* 1. Mood Selection (Interactive Faces) */}
        <div className="space-y-3">
          <label className="block text-sm font-bold text-slate-900 dark:text-white">
            1. {t.assessment.howMood}
          </label>
          <div className="grid grid-cols-5 gap-2 sm:gap-4">
            {moodEmojis.map((item) => {
              const isSelected = mood === item.value;
              return (
                <button
                  type="button"
                  key={item.value}
                  onClick={() => setMood(item.value)}
                  className={`p-3 sm:p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-950/70 border-2 border-emerald-600 dark:border-emerald-500 scale-105 shadow-md'
                      : 'bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-3xl sm:text-4xl">{item.emoji}</span>
                  <span className={`text-[11px] font-bold text-center leading-tight ${
                    isSelected ? 'text-emerald-800 dark:text-emerald-200' : 'text-slate-600 dark:text-slate-400'
                  }`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Sleep Duration & Quality */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-slate-100 dark:border-slate-700/60">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Moon className="w-4 h-4 text-blue-500" />
                <span>2. {isBn ? 'ঘুমের সময়' : 'Sleep Duration'}</span>
              </label>
              <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded">
                {sleepHours} {t.assessment.hours}
              </span>
            </div>
            <input
              type="range"
              min="3"
              max="12"
              step="0.5"
              value={sleepHours}
              onChange={(e) => setSleepHours(parseFloat(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>3h (Low)</span>
              <span>7.5h (Optimal)</span>
              <span>12h</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-900 dark:text-white mb-2 block">
              {isBn ? 'ঘুমের অনুভূতি' : 'Sleep Restfulness'}
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['poor', 'fair', 'good', 'excellent'] as const).map((q) => (
                <button
                  type="button"
                  key={q}
                  onClick={() => setSleepQuality(q)}
                  className={`py-2 px-1 text-[11px] font-semibold rounded-xl border text-center transition capitalize ${
                    sleepQuality === q
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {isBn 
                    ? (q === 'poor' ? 'খারাপ' : q === 'fair' ? 'মোটামুটি' : q === 'good' ? 'ভালো' : 'চমৎকার')
                    : q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Stress Meter Slider (1 to 10) */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-500" />
              <span>3. {t.assessment.stressLabel}</span>
            </label>
            <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
              stressLevel <= 4 
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                : stressLevel <= 7
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
            }`}>
              {stressLevel}/10 {stressLevel <= 4 ? `(${t.assessment.stressLow})` : stressLevel <= 7 ? `(${t.assessment.stressMid})` : `(${t.assessment.stressHigh})`}
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={stressLevel}
            onChange={(e) => setStressLevel(parseInt(e.target.value))}
            className="w-full accent-emerald-600 cursor-pointer"
          />
        </div>

        {/* 4. Energy & Focus */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-slate-100 dark:border-slate-700/60">
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-900 dark:text-white mb-1">
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>4. {t.assessment.energyLabel}</span>
              </span>
              <span className="text-amber-600 font-bold">{energyLevel}/10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={energyLevel}
              onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-slate-900 dark:text-white mb-1">
              <span className="flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-teal-500" />
                <span>5. {t.assessment.focusLabel}</span>
              </span>
              <span className="text-teal-600 font-bold">{focusLevel}/10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={focusLevel}
              onChange={(e) => setFocusLevel(parseInt(e.target.value))}
              className="w-full accent-teal-500 cursor-pointer"
            />
          </div>
        </div>

        {/* 5. Influencing Tags */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 space-y-2">
          <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-emerald-600" />
            <span>6. {t.assessment.tagsLabel}</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => {
              const active = selectedTags.includes(tag.id);
              return (
                <button
                  type="button"
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                    active
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {tag.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 6. Optional Private Note */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 space-y-2">
          <label className="text-xs font-bold text-slate-900 dark:text-white block">
            7. {t.assessment.notesLabel}
          </label>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t.assessment.notesPlaceholder}
            className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Submit */}
        <div className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ${
          todaysCheckIn
            ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
            : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
        }`}>
          {todaysCheckIn ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle className="w-4 h-4 shrink-0" />}
          <span>
            {todaysCheckIn
              ? (isBn ? 'এই তথ্য জমা দিলে আজকের পুরোনো check-in update হবে' : 'Saving will update today’s existing check-in')
              : (isBn ? 'এটি আজকের নতুন check-in হিসেবে সংরক্ষিত হবে' : 'This will be saved as today’s new check-in')}
          </span>
        </div>
        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5"
        >
          {t.assessment.submitBtn}
        </button>
      </form>

      {/* History Log Section */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>{isBn ? 'পূর্ববর্তী চেক-ইন ইতিহাস' : 'Recent Mind Check-in History'}</span>
          </h3>
          <button
            type="button"
            onClick={() => setIsHistoryOpen(true)}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <History className="w-3.5 h-3.5" />
            <span>{isBn ? 'সব ইতিহাস' : 'History'}</span>
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {checkIns.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500">
              {isBn ? 'এখনও কোনো চেক-ইন নেই।' : 'No check-ins recorded yet.'}
            </div>
          ) : [...recentCheckIns].reverse().slice(0, 5).map((chk) => (
            <div key={chk.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-3">
                <span className="text-xl">
                  {chk.mood === 5 ? '😄' : chk.mood === 4 ? '🙂' : chk.mood === 3 ? '😐' : chk.mood === 2 ? '😔' : '😢'}
                </span>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {chk.moodLabel} • {chk.date}
                  </div>
                  {(chk.updatedAt || chk.createdAt) && (
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400">
                      {isBn ? 'সময়: ' : 'Time: '}{formatCheckInTime(chk.updatedAt || chk.createdAt)}
                    </div>
                  )}
                  {chk.optionalNote && (
                    <div className="text-[11px] text-slate-500 italic max-w-md truncate">
                      "{chk.optionalNote}"
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-slate-600 dark:text-slate-400">
                <span>{chk.sleepHours}h sleep</span>
                <span>•</span>
                <span>Stress {chk.stressLevel}/10</span>
                <span>•</span>
                <div className="flex gap-1">
                  {chk.tags.slice(0, 2).map((tg, i) => (
                    <span key={i} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-[10px]">
                      {tg}
                    </span>
                  ))}
                </div>
              </div>

              {isHistoryOpen && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="check-in-history-title"
                  onMouseDown={(event) => {
                    if (event.target === event.currentTarget) setIsHistoryOpen(false);
                  }}
                >
                  <div className="w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl">
                    <div className="flex items-center justify-between gap-3 p-5 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <h2 id="check-in-history-title" className="text-lg font-extrabold text-slate-900 dark:text-white">
                          {isBn ? 'সম্পূর্ণ চেক-ইন ইতিহাস' : 'Complete Check-in History'}
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">
                          {checkIns.length} {isBn ? 'টি রেকর্ড' : 'records'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsHistoryOpen(false)}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        aria-label={isBn ? 'বন্ধ করুন' : 'Close history'}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="max-h-[calc(85vh-96px)] overflow-y-auto p-5">
                      {checkIns.length === 0 ? (
                        <div className="py-10 text-center text-sm text-slate-500">
                          {isBn ? 'এখনও কোনো চেক-ইন নেই।' : 'No check-ins recorded yet.'}
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                          {[...recentCheckIns].reverse().map((chk) => (
                            <div key={chk.id} className="py-4 first:pt-0 last:pb-0 space-y-2">
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">
                                    {chk.mood === 5 ? '😄' : chk.mood === 4 ? '🙂' : chk.mood === 3 ? '😐' : chk.mood === 2 ? '😔' : '😢'}
                                  </span>
                                  <div>
                                    <div className="font-bold text-sm text-slate-900 dark:text-white">
                                      {chk.moodLabel}
                                    </div>
                                    <div className="text-xs text-emerald-600 dark:text-emerald-400">
                                      {chk.date}{(chk.updatedAt || chk.createdAt) ? ` • ${formatCheckInTime(chk.updatedAt || chk.createdAt)}` : ''}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                                  <span className="px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40">{chk.sleepHours}h sleep</span>
                                  <span className="px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40">Stress {chk.stressLevel}/10</span>
                                  <span className="px-2 py-1 rounded-lg bg-violet-50 dark:bg-violet-950/40">Energy {chk.energyLevel}/10</span>
                                </div>
                              </div>
                              {chk.optionalNote && (
                                <p className="pl-11 text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                                  “{chk.optionalNote}”
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
