import React, { useEffect, useState } from 'react';
import { 
  Smile, 
  Moon, 
  Activity, 
  Flame, 
  Sparkles, 
  BookOpen, 
  Bot, 
  BarChart3, 
  ArrowRight, 
  CheckCircle, 
  Calendar, 
  ShieldAlert, 
  Heart,
  TrendingUp,
  Brain,
  RefreshCw,
  Info
} from 'lucide-react';
import { User, CheckIn, Language, ScreeningAttempt } from '../types';
import { translations } from '../data/translations';

interface DashboardViewProps {
  currentUser: User | null;
  checkIns: CheckIn[];
  screenings: ScreeningAttempt[];
  onNavigate: (tab: string) => void;
  onRefreshScreenings: () => void;
  language: Language;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  checkIns,
  screenings,
  onNavigate,
  onRefreshScreenings,
  language,
}) => {
  const t = translations[language];
  const isBn = language === 'bn';
  const [showScreeningInfo, setShowScreeningInfo] = useState(false);
  const [guidance, setGuidance] = useState<{ summary: string; recommendations: string[]; source?: string } | null>(null);
  const [guidanceLoading, setGuidanceLoading] = useState(false);
  const [guidanceError, setGuidanceError] = useState(false);

  const getCheckInTimestamp = (checkIn: CheckIn) =>
    new Date(checkIn.updatedAt || checkIn.createdAt || checkIn.date).getTime();
  const sortedCheckIns = [...checkIns].sort((a, b) => getCheckInTimestamp(a) - getCheckInTimestamp(b));
  const latestCheckIn = sortedCheckIns.length > 0 ? sortedCheckIns[sortedCheckIns.length - 1] : null;
  const hasCheckIn = !!latestCheckIn;
  const moodScore = latestCheckIn ? latestCheckIn.mood : 0;
  const stressScore = latestCheckIn ? latestCheckIn.stressLevel : 0;
  const sleepHours = latestCheckIn ? latestCheckIn.sleepHours : 0;

  useEffect(() => {
    if (checkIns.length === 0 && screenings.length === 0) {
      setGuidance(null);
      setGuidanceError(false);
      return;
    }

    const controller = new AbortController();
    const loadGuidance = async () => {
      setGuidanceLoading(true);
      setGuidanceError(false);
      try {
        const response = await fetch('/api/stress-analysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            checkIns: sortedCheckIns.slice(-10).reverse().map(({ date, mood, moodLabel, sleepHours: hours, sleepQuality, stressLevel: stress, energyLevel, focusLevel, tags, createdAt, updatedAt }) => ({
              date,
              mood,
              moodLabel,
              sleepHours: hours,
              sleepQuality,
              stressLevel: stress,
              energyLevel,
              focusLevel,
              tags,
              createdAt,
              updatedAt,
            })),
            screenings: [...screenings]
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 10)
              .map(({ instrumentTitle, date, totalScore, maxScore, band, recommendation, flaggedSafetyQuestion }) => ({
                instrumentTitle,
                date,
                totalScore,
                maxScore,
                band,
                recommendation,
                flaggedSafetyQuestion,
              })),
            language,
            journalConsented: false,
          }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Unable to load dashboard guidance');
        if (typeof data.summary !== 'string' || !Array.isArray(data.recommendations)) {
          throw new Error('Dashboard guidance response is invalid');
        }
        setGuidance({
          summary: data.summary,
          recommendations: data.recommendations.filter((item: unknown): item is string => typeof item === 'string'),
          source: data.source,
        });
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return;
        setGuidanceError(true);
      } finally {
        if (!controller.signal.aborted) setGuidanceLoading(false);
      }
    };

    void loadGuidance();
    return () => controller.abort();
  }, [checkIns, screenings, language]);

  const getMoodEmoji = (val: number) => {
    switch (val) {
      case 5: return '😄';
      case 4: return '🙂';
      case 3: return '😐';
      case 2: return '😔';
      case 1: return '😢';
      default: return '🌱';
    }
  };

  const getMoodText = (val: number) => {
    switch (val) {
      case 5: return isBn ? 'খুবই উৎফুল্ল' : 'Very Happy';
      case 4: return isBn ? 'ভালো ও শান্ত' : 'Good & Balanced';
      case 3: return isBn ? 'স্বাভাবিক' : 'Neutral';
      case 2: return isBn ? 'বিষণ্ণ / ক্লান্ত' : 'Down / Fatigued';
      case 1: return isBn ? 'কষ্টদায়ক' : 'Struggling';
      default: return isBn ? 'চেক-ইন হয়নি' : 'Not recorded';
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner & Greeting */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
              <span>{isBn ? 'আপনার ব্যক্তিগত পোর্টাল' : 'Personal MindCare Space'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {t.dashboard.welcome} {currentUser?.name || (isBn ? 'বন্ধু' : 'Friend')}! 💚
            </h1>
            <p className="text-emerald-100 text-sm max-w-xl">
              {t.dashboard.greetingSub}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-3 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-900 flex items-center justify-center font-black">
                <Flame className="w-5 h-5 fill-slate-900" />
              </div>
              <div>
                <div className="text-xs text-emerald-100 font-medium">{t.dashboard.streak}</div>
                <div className="text-xl font-bold">{currentUser?.streakDays ?? 0} {isBn ? 'দিন' : 'Days'}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowScreeningInfo(previous => !previous)}
              className="bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-3 rounded-2xl text-left transition"
              aria-expanded={showScreeningInfo}
              title={isBn ? 'টেস্ট রিফ্রেশ সম্পর্কে জানুন' : 'Learn about test refresh'}
            >
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{isBn ? 'টেস্ট রিফ্রেশ' : 'Test refresh'}</span>
              </div>
              <div className="text-[10px] text-emerald-100 mt-1">
                {isBn ? 'কী হবে?' : 'What happens?'}
              </div>
            </button>
          </div>
        </div>
        {showScreeningInfo && (
          <div className="relative z-10 mt-5 max-w-xl ml-auto rounded-2xl bg-white/95 text-slate-700 p-4 shadow-lg text-xs">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                {isBn
                  ? 'এই অপশনে ক্লিক করলে Mental Health Tests পেজ খুলবে। All test refresh চাপলে একই সপ্তাহে তিনটি test আবার দেওয়া যাবে এবং নতুন result পুরোনো result replace করবে। পরের সপ্তাহের ৭ দিনের cycle ঠিক থাকবে।'
                  : 'This option opens the Mental Health Tests page. Refresh all tests lets you retake all three tests in the same week and replaces their previous results. The next 7-day cycle remains unchanged.'}
              </p>
            </div>
            <button
              type="button"
              onClick={onRefreshScreenings}
              className="mt-3 ml-6 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 text-[11px] font-bold text-emerald-700 transition"
            >
              {isBn ? 'All test refresh করুন' : 'Refresh all tests'}
            </button>
            <div className="mt-3 ml-6 flex flex-wrap gap-2">
              {[
                { label: 'PHQ-9', labelBn: 'PHQ-9' },
                { label: 'GAD-7', labelBn: 'GAD-7' },
                { label: 'Burnout', labelBn: 'বার্নআউট' },
              ].map((test) => (
                <button
                  key={test.label}
                  type="button"
                  onClick={onRefreshScreenings}
                  className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-[11px] font-bold text-white transition"
                >
                  {isBn ? test.labelBn : test.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3 Overview Indicator Cards (Based on user actual logs) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Mood Card */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-emerald-100 dark:border-slate-700 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              {t.dashboard.currentMood}
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {hasCheckIn ? (
                <>
                  <span className="text-2xl">{getMoodEmoji(moodScore)}</span>
                  <span>{getMoodText(moodScore)}</span>
                </>
              ) : (
                <span className="text-slate-400 text-base font-medium">{isBn ? 'চেক-ইন করা হয়নি' : 'No check-in'}</span>
              )}
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-medium">
              <TrendingUp className="w-3 h-3" />
              <span>
                {hasCheckIn
                  ? (isBn ? 'সর্বশেষ চেক-ইন অনুযায়ী' : 'From your latest log')
                  : (isBn ? 'আজকের অনুভূতি লগ করুন' : 'Record today’s feeling')}
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <Smile className="w-6 h-6" />
          </div>
        </div>

        {/* Stress Card */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-emerald-100 dark:border-slate-700 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              {t.dashboard.stressLevel}
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {hasCheckIn ? (
                <>
                  <span>{stressScore}/10</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    stressScore <= 4
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                      : stressScore <= 7
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                        : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                  }`}>
                    {stressScore <= 4
                      ? (isBn ? 'কম চাপ' : 'Low Stress')
                      : stressScore <= 7
                        ? (isBn ? 'মাঝারি' : 'Moderate')
                        : (isBn ? 'উচ্চ চাপ' : 'High Stress')}
                  </span>
                </>
              ) : (
                <span className="text-slate-400 text-base font-medium">—/10</span>
              )}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {hasCheckIn
                ? (isBn ? 'স্বাভাবিক স্বস্তিময় অবস্থা' : 'Self-reported tone')
                : (isBn ? 'মানসিক চাপ পরীক্ষা করুন' : 'Assess your stress')}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        {/* Sleep Card */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-emerald-100 dark:border-slate-700 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              {t.dashboard.sleepLastNight}
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {hasCheckIn ? (
                <>
                  <span>{sleepHours} {isBn ? 'ঘণ্টা' : 'Hours'}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                    {sleepHours >= 7 ? (isBn ? 'পর্যাপ্ত' : 'Restful') : (isBn ? 'স্বল্প ঘুম' : 'Short')}
                  </span>
                </>
              ) : (
                <span className="text-slate-400 text-base font-medium">{isBn ? 'লগ করা হয়নি' : 'Not logged'}</span>
              )}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {hasCheckIn
                ? (isBn ? 'ঘুমের মান ট্র্যাক করা হয়েছে' : 'Circadian recovery logged')
                : (isBn ? 'ঘুমের সময় যোগ করুন' : 'Log sleep duration')}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <Moon className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Quick Actions + 7-Day Trend Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 7-Day Trend Preview (Left 7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-800 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {isBn ? 'গত ৭ দিনের মেজাজ ও ঘুমের ধারা' : '7-Day Wellness & Mood Rhythm'}
              </h3>
              <p className="text-xs text-slate-500">
                {isBn ? 'স্বাভাবিক পরিবর্তন ও দৈনন্দিন ভারসাম্য' : 'Recent self-reported check-in trajectory'}
              </p>
            </div>
            <button
              onClick={() => onNavigate('reports')}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>{isBn ? 'পূর্ণ রিপোর্ট' : 'Full Analytics'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Clean Custom SVG Bar/Line Chart or Empty Onboarding Card */}
          {checkIns.length === 0 ? (
            <div className="h-48 w-full flex flex-col items-center justify-center text-center p-6 bg-slate-50/70 dark:bg-slate-900/50 rounded-2xl border border-dashed border-emerald-200 dark:border-slate-700 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">
                  {isBn ? 'এখনো কোনো চেক-ইন রেকর্ড নেই' : 'No Check-in Records Yet'}
                </h4>
                <p className="text-[11px] text-slate-500 max-w-sm">
                  {isBn 
                    ? 'আপনার মেজাজ, ঘুম ও মানসিক চাপ লগ করতে প্রথম চেক-ইন সম্পন্ন করুন।'
                    : 'Log your daily mood, sleep, and stress to unlock your dynamic trends.'}
                </p>
              </div>
              <button
                onClick={() => onNavigate('assessment')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5"
              >
                <span>{isBn ? 'প্রথম চেক-ইন শুরু করুন' : 'Take First Check-In'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="h-48 w-full pt-4">
              <div className="flex items-end justify-between h-36 gap-2 border-b border-slate-200 dark:border-slate-700 pb-2 px-2">
                {sortedCheckIns.slice(-7).map((c, idx) => {
                  const dayName = new Date(c.date).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', { weekday: 'short' });
                  const heightPercent = (c.mood / 5) * 100;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                      <div className="text-[10px] font-bold text-slate-400 group-hover:text-emerald-600 transition">
                        {c.mood}/5
                      </div>
                      <div className="w-full max-w-[32px] bg-emerald-100 dark:bg-emerald-950 rounded-t-lg relative h-32 flex items-end overflow-hidden">
                        <div 
                          style={{ height: `${heightPercent}%` }}
                          className="w-full bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-lg transition-all duration-500 group-hover:brightness-110"
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                        {dayName}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600 inline-block" />
                  {isBn ? 'মেজাজের সূচক (Mood)' : 'Mood Score (1-5)'}
                </span>
                <span>{isBn ? 'প্রতিদিনের চেক-ইনের ভিত্তিতে সংগৃহীত' : 'Self-reported check-ins'}</span>
              </div>
            </div>
          )}

          <section className="p-5 sm:p-6 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/60 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-sm text-purple-950 dark:text-purple-200">
                  {isBn ? 'আপনার তথ্য অনুযায়ী এখন কী করবেন' : 'What to do next, based on your results'}
                </h3>
                <p className="text-[11px] text-purple-800 dark:text-purple-300 mt-1">
                  {isBn
                    ? 'সর্বশেষ Mind Status check-in ও মানসিক স্বাস্থ্য টেস্টের ফল দেখে তৈরি'
                    : 'Based on your latest Mind Status check-in and mental wellness test results'}
                </p>
              </div>
            </div>
            {guidanceLoading ? (
              <p className="text-xs text-slate-600 dark:text-slate-300 pl-12">
                {isBn ? 'আপনার তথ্য বিশ্লেষণ করা হচ্ছে…' : 'Reviewing your results…'}
              </p>
            ) : guidanceError ? (
              <p role="alert" className="text-xs text-rose-700 dark:text-rose-300 pl-12">
                {isBn ? 'এই মুহূর্তে পরামর্শ আনা যাচ্ছে না। পরে আবার চেষ্টা করুন।' : 'Guidance is unavailable right now. Please try again later.'}
              </p>
            ) : guidance ? (
              <div className="pl-12 space-y-2">
                <p className="text-xs text-slate-700 dark:text-slate-200">{guidance.summary}</p>
                {guidance.recommendations.length > 0 && (
                  <ul className="list-disc pl-4 space-y-1 text-xs text-slate-700 dark:text-slate-200">
                    {guidance.recommendations.map((recommendation, index) => (
                      <li key={`${index}-${recommendation}`}>{recommendation}</li>
                    ))}
                  </ul>
                )}
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {isBn ? 'এটি স্ব-প্রতিবেদিত তথ্যভিত্তিক সহায়ক পরামর্শ, রোগ নির্ণয় নয়।' : 'Supportive guidance from self-reported data, not a diagnosis.'}
                  {guidance.source && guidance.source !== 'local-check-in-summary' && guidance.source !== 'mindcare_compassionate_engine'
                    ? (isBn ? ' চ্যাটবট বিশ্লেষণ ব্যবহার করা হয়েছে।' : ' Chatbot analysis was used.')
                    : ''}
                </p>
              </div>
            ) : (
              <div className="pl-12 flex flex-wrap items-center gap-3">
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {isBn ? 'ব্যক্তিগত পরামর্শ পেতে একটি Mind Status check-in বা মানসিক স্বাস্থ্য টেস্ট সম্পন্ন করুন।' : 'Complete a Mind Status check-in or a mental wellness test to get personalized guidance.'}
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate(checkIns.length === 0 ? 'screenings' : 'assessment')}
                  className="text-xs font-bold text-purple-700 dark:text-purple-300 hover:underline"
                >
                  {isBn ? 'শুরু করুন →' : 'Get started →'}
                </button>
              </div>
            )}
          </section>

          {/* Today's Prompt Banner */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Heart className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-xs text-emerald-950 dark:text-emerald-200">
                  {isBn ? 'আজকের শ্বাস-প্রশ্বাস অনুশীলন' : 'Today’s Calming Moment'}
                </div>
                <div className="text-[11px] text-emerald-700 dark:text-emerald-400">
                  {isBn ? '৪-৭-৮ ব্রিদিং অনুশীলনে মাত্র ৩ মিনিটে মন শান্ত করুন' : 'Spend 3 minutes on 4-7-8 breathing to regulate cortisol'}
                </div>
              </div>
            </div>
            <button
              onClick={() => onNavigate('activities')}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition shrink-0"
            >
              {isBn ? 'শুরু করুন' : 'Start'}
            </button>
          </div>
        </div>

        {/* Quick Actions (Right 5 Cols - Matching Master Prompt Page 1/10) */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            {t.dashboard.quickActions}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
            {/* Action 1: Check-in */}
            <button
              onClick={() => onNavigate('assessment')}
              className="w-full p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:shadow-md transition text-left flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                  <Smile className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-emerald-600 transition">
                    {t.dashboard.takeAssessment}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {isBn ? 'দৈনিক মেজাজ, ঘুম ও চাপ নির্ধারণ' : 'Log mood, stress & sleep'}
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition" />
            </button>

            {/* Action 2: Chat with the chatbot */}
            <button
              onClick={() => onNavigate('ai-assistant')}
              className="w-full p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:shadow-md transition text-left flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-purple-600 transition">
                    {t.dashboard.chatWithAI}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {isBn ? 'সহানুভূতিশীল পরামর্শ নিন' : 'Empathetic wellness guidance'}
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition" />
            </button>

            {/* Action 3: Write Journal */}
            <button
              onClick={() => onNavigate('journal')}
              className="w-full p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:shadow-md transition text-left flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-teal-600 transition">
                    {t.dashboard.writeJournal}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {isBn ? 'মন খুলে ব্যক্তিগত ডায়েরি লিখুন' : 'Private thoughts & gratitude'}
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-1 transition" />
            </button>

            {/* Action 4: Screenings */}
            <button
              onClick={() => onNavigate('screenings')}
              className="w-full p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:shadow-md transition text-left flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-blue-600 transition">
                    {isBn ? 'মানসিক স্বাস্থ্য টেস্ট (PHQ-9/GAD-7)' : 'Mental Health Tests (PHQ-9/GAD-7)'}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {isBn ? 'বৈজ্ঞানিক নন-ডায়াগনস্টিক টেস্ট' : 'Evidence-informed self screener'}
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition" />
            </button>
          </div>
        </div>
      </div>

      {/* Non-Diagnostic Disclaimer Card (Master prompt core principle) */}
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-3">
        <Heart className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-800 dark:text-slate-200">
            {isBn ? 'গোপনীয়তা ও স্বাস্থ্যনীতি:' : 'Privacy & Safety Principle:'}
          </span>{' '}
          {t.dashboard.disclaimerNotice}
        </div>
      </div>
    </div>
  );
};
