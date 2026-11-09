import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Moon, 
  Activity, 
  Clock, 
  ShieldCheck, 
  RefreshCw, 
  TrendingDown,
  Info,
  Database,
  Wind,
  BookOpen,
  PhoneCall,
  ArrowRight
} from 'lucide-react';
import { CheckIn, ConsentSettings, JournalEntry, Language, ScreeningAttempt } from '../types';
import { translations } from '../data/translations';

interface StressAnalysisViewProps {
  checkIns: CheckIn[];
  screenings: ScreeningAttempt[];
  journalEntries: JournalEntry[];
  consent: ConsentSettings;
  language: Language;
  onNavigate: (tab: string) => void;
  onOpenCrisis: () => void;
}

export const StressAnalysisView: React.FC<StressAnalysisViewProps> = ({
  checkIns,
  screenings,
  journalEntries,
  consent,
  language,
  onNavigate,
  onOpenCrisis,
}) => {
  const t = translations[language];
  const isBn = language === 'bn';

  const [loading, setLoading] = useState(false);
  const [patterns, setPatterns] = useState<string[]>([]);
  const [summary, setSummary] = useState<string>(() => {
    if (checkIns.length === 0) {
      return isBn
        ? 'আপনার এখনো কোনো দৈনিক চেক-ইন ডাটা নেই। বিশ্লেষণের জন্য আগে Mind Status-এ একটি check-in সংরক্ষণ করুন।'
        : 'No daily check-in data is available. Save a check-in in Mind Status before running analysis.';
    }
    return isBn
      ? 'আপনার সংরক্ষিত check-in ডাটার ভিত্তিতে বিশ্লেষণ চালাতে নিচের বাটনে চাপুন।'
      : 'Run the analysis below to review patterns based on your saved check-in data.';
  });

  const fetchAIAnalysis = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stress-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkIns,
          screenings,
          journalEntries: consent.journalAnalysisConsent
            ? journalEntries.map(entry => ({
              date: entry.date,
              title: entry.title,
              content: entry.content.slice(0, 1000),
              moodTag: entry.moodTag,
              category: entry.category,
            }))
            : [],
          language,
          journalConsented: consent.journalAnalysisConsent,
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Stress analysis request failed');
      if (data.patterns) setPatterns(data.patterns);
      if (data.summary) setSummary(data.summary);
    } catch (e) {
      console.error('Error fetching stress analysis:', e);
    } finally {
      setLoading(false);
    }
  };

  const sortedCheckIns = [...checkIns].sort((a, b) => {
    const bTime = new Date(b.updatedAt || b.createdAt || b.date).getTime();
    const aTime = new Date(a.updatedAt || a.createdAt || a.date).getTime();
    return bTime - aTime;
  });
  const latestCheckIn = sortedCheckIns[0];
  const latestStress = latestCheckIn?.stressLevel ?? 0;
  const suggestions = latestStress >= 8
    ? [
      { icon: Wind, title: isBn ? '৪-৭-৮ শ্বাস-প্রশ্বাস' : '4-7-8 breathing', text: isBn ? 'উচ্চ চাপের মুহূর্তে শরীরকে ধীরে স্থির করতে চেষ্টা করুন।' : 'Use a paced breathing exercise to settle your body during high stress.', action: () => onNavigate('activities') },
      { icon: PhoneCall, title: isBn ? 'সহায়তা নিন' : 'Reach out for support', text: isBn ? 'চাপ অসহনীয় হলে জরুরি সহায়তা available আছে।' : 'If distress feels overwhelming, connect with immediate human support.', action: onOpenCrisis },
    ]
    : [
      { icon: Wind, title: isBn ? 'শ্বাস-প্রশ্বাস অনুশীলন' : 'Breathing practice', text: isBn ? 'দৈনিক কয়েক মিনিটের mindful breathing চেষ্টা করুন।' : 'Try a few minutes of mindful breathing as a regular reset.', action: () => onNavigate('activities') },
      { icon: BookOpen, title: isBn ? 'মুড লিখে রাখুন' : 'Keep tracking', text: isBn ? 'পরবর্তী check-in-এ mood, sleep ও stress লিখুন।' : 'Continue logging mood, sleep, and stress for clearer patterns.', action: () => onNavigate('assessment') },
    ];
  const analysisInputs = [
    {
      label: isBn ? 'মুড' : 'Mood',
      value: latestCheckIn ? `${latestCheckIn.moodLabel} (${latestCheckIn.mood}/5)` : (isBn ? 'ডাটা নেই' : 'No data'),
    },
    {
      label: isBn ? 'স্ট্রেস' : 'Stress',
      value: latestCheckIn ? `${latestCheckIn.stressLevel}/10` : (isBn ? 'ডাটা নেই' : 'No data'),
    },
    {
      label: isBn ? 'ঘুম' : 'Sleep',
      value: latestCheckIn ? `${latestCheckIn.sleepHours}h • ${latestCheckIn.sleepQuality}` : (isBn ? 'ডাটা নেই' : 'No data'),
    },
    {
      label: isBn ? 'Energy, focus ও tags' : 'Energy, focus & tags',
      value: latestCheckIn
        ? `${latestCheckIn.energyLevel}/10 • ${latestCheckIn.focusLevel}/10${latestCheckIn.tags.length ? ` • ${latestCheckIn.tags.join(', ')}` : ''}`
        : (isBn ? 'ডাটা নেই' : 'No data'),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Title */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          {t.features.f4_title}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {t.features.f4_desc}
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-amber-500" />
          <h2 className="font-bold text-slate-900 dark:text-white">
            {isBn ? 'এই ফলাফল কোন তথ্যের ওপর ভিত্তি করে?' : 'What this analysis uses'}
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {analysisInputs.map(item => (
            <button
              key={item.label}
              type="button"
              onClick={() => onNavigate('assessment')}
              className="group p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 text-left text-xs text-slate-700 dark:text-slate-300 hover:bg-amber-100 dark:hover:bg-amber-950/60 transition"
            >
              <span className="font-semibold">{item.label}</span>
              <span className="mt-1 block text-[11px] text-slate-600 dark:text-slate-300 break-words">{item.value}</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => onNavigate('assessment')}
          className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 px-4 py-2 text-xs font-bold text-slate-950 transition"
        >
          {isBn ? 'চেক-ইন খুলুন' : 'Open check-in'}
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
        <p className="text-[11px] text-slate-500">
          {isBn
            ? 'এগুলো আপনার self-reported check-in ডেটা। এগুলো কোনো diagnosis বা নিশ্চিত কারণ-ফল সম্পর্ক প্রমাণ করে না।'
            : 'These are self-reported check-in signals. They do not establish a diagnosis or prove cause and effect.'}
        </p>
      </div>

      {/* Main Analysis Banner */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-amber-100 dark:border-slate-700 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-700 pb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>{isBn ? 'শনাক্তকৃত সম্ভাব্য সম্পর্ক ও প্রবণতা' : 'Identified Wellness Correlations'}</span>
            </h2>
            <p className="text-xs text-slate-500">
              {isBn ? 'আপনার দৈনিক চেক-ইন ও ঘুমের তথ্যের ভিত্তিতে প্রণীত' : 'Derived from self-reported logs; cautious non-clinical interpretation'}
            </p>
          </div>

          <button
            onClick={fetchAIAnalysis}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-xs transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{isBn ? 'পুনর্বিশ্লেষণ করুন' : 'Refresh Patterns'}</span>
          </button>
        </div>

        {/* Chatbot insight summary */}
        <div className="p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs sm:text-sm text-amber-950 dark:text-amber-200 leading-relaxed font-medium">
          {summary}
        </div>
        {/* Pattern Cards */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {isBn ? 'মূল পর্যবেক্ষণসমূহ (সতর্কতামূলক ভাষা):' : 'Key Observational Points:'}
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {patterns.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                {isBn 
                  ? 'দৈনিক চেক-ইন সম্পন্ন করার পর এখানে আপনার নিজস্ব প্যাটার্ন বিশ্লেষণ প্রদর্শিত হবে।'
                  : 'Your personalized observational patterns will appear here once you begin logging daily assessments.'}
              </div>

            ) : (
              patterns.map((pat, idx) => (
                <div 
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 flex items-start gap-3 text-xs sm:text-sm text-slate-800 dark:text-slate-200"
                >
                  <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                    {idx + 1}
                  </div>
                  <span>{pat}</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Strict Ethical Guardrail Box */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-3 text-xs text-slate-500">
        <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <p leading-relaxed>
          {isBn
            ? 'গুরুত্বপূর্ণ: MindCare কোনো মানসিক রোগ নির্ণয় করবে না। এটি কেবল ব্যবহারকারীর দেওয়া তথ্যের ভিত্তিতে সম্ভাব্য Wellness Patterns তুলে ধরবে। কোনো স্কোর বা বিশ্লেষণকে Medical Diagnosis হিসেবে বিবেচনা করা যাবে না।'
            : 'Important: MindCare never claims medical diagnosis. These indicators summarize user-logged observations to support personal awareness, not replace professional healthcare.'}
        </p>
      </div>
    </div>
  );
};
