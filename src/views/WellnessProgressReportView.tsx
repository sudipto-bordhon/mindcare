import React, { useEffect, useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Moon, 
  Activity, 
  ClipboardCheck,
  Sparkles,
  Calendar, 
  Download, 
  AlertCircle, 
  ShieldCheck,
  Smile,
  Zap
} from 'lucide-react';
import { CheckIn, Language, ScreeningAttempt } from '../types';
import { translations } from '../data/translations';

interface WellnessProgressReportViewProps {
  checkIns: CheckIn[];
  screenings: ScreeningAttempt[];
  language: Language;
}

interface WeeklyIntegratedReport {
  period: { startDate: string; endDate: string };
  checkInCount: number;
  averages: {
    mood: number | null;
    stressLevel: number | null;
    sleepHours: number | null;
    energyLevel: number | null;
  };
  dailyCheckIns: Array<{
    date: string;
    mood: number;
    stressLevel: number;
    sleepHours: number;
    energyLevel: number;
  }>;
  screenings: Array<{
    instrumentId: string;
    instrumentTitle: string;
    date: string;
    totalScore: number;
    maxScore: number;
    band: string;
    bandColor?: string;
    recommendation?: string;
    flaggedSafetyQuestion: boolean;
  }>;
  insights: string[];
  recommendations: string[];
  aiAnalysis: {
    summary: string;
    observations: string[];
    recommendations: string[];
    source: string;
    generatedByAi: boolean;
  } | null;
  disclaimer: string;
}

export const WellnessProgressReportView: React.FC<WellnessProgressReportViewProps> = ({
  checkIns,
  screenings,
  language,
}) => {
  const t = translations[language];
  const isBn = language === 'bn';

  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');
  const [weeklyReport, setWeeklyReport] = useState<WeeklyIntegratedReport | null>(null);
  const [weeklyReportLoading, setWeeklyReportLoading] = useState(true);
  const [weeklyReportError, setWeeklyReportError] = useState(false);

  useEffect(() => {
    const now = new Date();
    const asOfDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const controller = new AbortController();
    const loadWeeklyReport = async () => {
      setWeeklyReportLoading(true);
      setWeeklyReportError(false);
      try {
        const response = await fetch('/api/weekly-integrated-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            asOfDate,
            language,
            checkIns: checkIns.map(({ date, mood, stressLevel, sleepHours, energyLevel }) => ({
              date,
              mood,
              stressLevel,
              sleepHours,
              energyLevel,
            })),
            screenings: screenings.map(({
              instrumentId,
              instrumentTitle,
              date,
              totalScore,
              maxScore,
              band,
              bandColor,
              recommendation,
              flaggedSafetyQuestion,
            }) => ({
              instrumentId,
              instrumentTitle,
              date,
              totalScore,
              maxScore,
              band,
              bandColor,
              recommendation,
              flaggedSafetyQuestion,
            })),
          }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Unable to load weekly integrated report');
        if (
          !data.period ||
          typeof data.period.startDate !== 'string' ||
          typeof data.period.endDate !== 'string' ||
          !data.averages ||
          !Array.isArray(data.dailyCheckIns) ||
          !Array.isArray(data.screenings) ||
          !Array.isArray(data.insights) ||
          !Array.isArray(data.recommendations) ||
          (data.aiAnalysis != null && (
            typeof data.aiAnalysis?.summary !== 'string' ||
            !Array.isArray(data.aiAnalysis?.observations) ||
            !Array.isArray(data.aiAnalysis?.recommendations)
          )) ||
          typeof data.disclaimer !== 'string'
        ) {
          throw new Error('Weekly integrated report response is invalid');
        }
        setWeeklyReport({ ...data, aiAnalysis: data.aiAnalysis ?? null });
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return;
        setWeeklyReportError(true);
      } finally {
        if (!controller.signal.aborted) setWeeklyReportLoading(false);
      }
    };

    void loadWeeklyReport();
    return () => controller.abort();
  }, [checkIns, screenings, language]);

  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const shiftDate = (date: string, days: number) => {
    const shifted = new Date(`${date}T00:00:00`);
    shifted.setDate(shifted.getDate() + days);
    return `${shifted.getFullYear()}-${String(shifted.getMonth() + 1).padStart(2, '0')}-${String(shifted.getDate()).padStart(2, '0')}`;
  };
  const sortedCheckIns = [...checkIns].sort((a, b) => a.date.localeCompare(b.date));
  const getRange = (days: number, endDate: string) => {
    const startDate = shiftDate(endDate, -(days - 1));
    return sortedCheckIns.filter(checkIn => checkIn.date >= startDate && checkIn.date <= endDate);
  };
  const weeklyCheckIns = getRange(7, todayKey);
  const monthlyCheckIns = getRange(30, todayKey);
  const rangeDays = timeRange === '7d' ? 7 : 30;
  const rangeStart = shiftDate(todayKey, -(rangeDays - 1));
  const previousEnd = shiftDate(rangeStart, -1);
  const recent = getRange(rangeDays, todayKey);
  const previous = getRange(rangeDays, previousEnd);

  // Calculate averages
  const calcAvg = (arr: CheckIn[], key: 'mood' | 'stressLevel' | 'sleepHours' | 'energyLevel') => {
    if (!arr.length) return 0;
    const sum = arr.reduce((acc, c) => acc + (c[key] || 0), 0);
    return Number((sum / arr.length).toFixed(1));
  };
  const calcReportAvg = (arr: CheckIn[], key: 'mood' | 'stressLevel' | 'sleepHours' | 'energyLevel') =>
    arr.length ? calcAvg(arr, key) : null;
  const periodReports = [
    { key: '7d', label: isBn ? 'গত ৭ দিনের রিপোর্ট' : 'Last 7 Days Report', days: 7, entries: weeklyCheckIns },
    { key: '30d', label: isBn ? 'গত ৩০ দিনের রিপোর্ট' : 'Last 30 Days Report', days: 30, entries: monthlyCheckIns },
  ].map(report => ({
    ...report,
    startDate: shiftDate(todayKey, -(report.days - 1)),
    endDate: todayKey,
    averages: {
      mood: calcReportAvg(report.entries, 'mood'),
      stress: calcReportAvg(report.entries, 'stressLevel'),
      sleep: calcReportAvg(report.entries, 'sleepHours'),
      energy: calcReportAvg(report.entries, 'energyLevel'),
    },
  }));
  const reportAnalysis = weeklyReport?.aiAnalysis ?? (
    weeklyReport && weeklyReport.screenings.length > 0
      ? {
          summary: isBn
            ? `আপনার ${weeklyReport.screenings.map(result => `${result.instrumentTitle} ${result.totalScore}/${result.maxScore} (${result.band})`).join(', ')} ফল এবং গত ৭ দিনের ${weeklyReport.checkInCount}টি check-in একসঙ্গে পর্যালোচনা করা হয়েছে।`
            : `Your ${weeklyReport.screenings.map(result => `${result.instrumentTitle} score ${result.totalScore}/${result.maxScore} (${result.band})`).join(', ')} result${weeklyReport.screenings.length === 1 ? ' was' : 's were'} reviewed alongside ${weeklyReport.checkInCount} check-in${weeklyReport.checkInCount === 1 ? '' : 's'} from the last 7 days.`,
          observations: weeklyReport.insights,
          recommendations: weeklyReport.recommendations,
          source: 'local-report-analysis',
          generatedByAi: false,
        }
      : null
  );

  const currentMoodAvg = calcAvg(recent, 'mood');
  const prevMoodAvg = calcAvg(previous, 'mood');
  const moodDiff = Number((currentMoodAvg - prevMoodAvg).toFixed(1));

  const currentStressAvg = calcAvg(recent, 'stressLevel');
  const currentSleepAvg = calcAvg(recent, 'sleepHours');
  const hasPreviousPeriod = previous.length > 0;
  const periodLabel = timeRange === '7d' ? (isBn ? '৭ দিন' : '7 days') : (isBn ? '৩০ দিন' : '30 days');

  const [showExportModal, setShowExportModal] = useState(false);

  const handleExportReport = () => {
    setShowExportModal(true);
  };

  const handleDownloadSummaryFile = () => {
    const summaryText = `MINDCARE WELLNESS SUMMARY REPORT
Date Generated: ${new Date().toLocaleDateString()}
============================================
${periodLabel} Mood Average: ${currentMoodAvg} / 5
Previous ${periodLabel} Mood Baseline: ${hasPreviousPeriod ? `${prevMoodAvg} / 5` : 'Not available'}
Average Stress Index: ${currentStressAvg} / 10
Average Sleep Duration: ${currentSleepAvg} hours

DAILY BREAKDOWN:
${recent.map(c => `- ${c.date}: Mood ${c.mood}/5 | Stress ${c.stressLevel}/10 | Sleep ${c.sleepHours}h (${c.sleepQuality})`).join('\n')}

DATA GOVERNANCE & PRIVACY:
This summary is for non-clinical observational wellness tracking only.
Not intended as a clinical diagnosis.`;

    const blob = new Blob([summaryText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mindcare-summary-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-7 pb-16">
      {/* Top Header */}
      <div className="rounded-3xl border border-emerald-100 dark:border-emerald-900/60 bg-gradient-to-br from-white via-emerald-50/60 to-teal-50/70 dark:from-slate-800 dark:via-slate-800 dark:to-emerald-950/30 p-5 sm:p-7 shadow-sm">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100/80 dark:bg-emerald-900/50 px-3 py-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            {isBn ? 'আপনার সুস্থতার অগ্রগতি' : 'YOUR WELLNESS AT A GLANCE'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {t.reports.title}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1.5 max-w-2xl">
            {t.reports.subtitle}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="space-y-1.5">
            <span className="block text-[10px] font-bold uppercase tracking-wide text-slate-500">
              {isBn ? 'চার্টের সময়সীমা' : 'CHART PERIOD'}
            </span>
            <div className="flex bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 p-1 rounded-xl">
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                timeRange === '7d'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {t.reports.last7Days}
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                timeRange === '30d'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {t.reports.last30Days}
            </button>
            </div>
          </div>

          <button
            onClick={handleExportReport}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition"
          >
            <Download className="w-4 h-4" />
            <span>{t.reports.exportReport}</span>
          </button>
        </div>
        </div>
      </div>

      <section className="relative overflow-hidden bg-white dark:bg-slate-800 rounded-3xl border border-indigo-200 dark:border-indigo-900/70 p-5 sm:p-7 shadow-sm space-y-5">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
              {isBn ? 'সাপ্তাহিক সমন্বিত অন্তর্দৃষ্টি' : 'Weekly Integrated Insights'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {isBn
                ? 'গত ৭ দিনের Mind Status এবং সাম্প্রতিক ৩০ দিনের টেস্টের ফল'
                : 'Last 7 days of Mind Status check-ins and screening results from the last 30 days'}
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1.5 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">
          <Calendar className="w-3.5 h-3.5" />
          {isBn ? '৭ দিন + সাম্প্রতিক টেস্ট' : '7 days + recent tests'}
        </span>
        </div>

        {weeklyReportLoading ? (
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/60 p-6 text-center text-sm text-slate-500">
            {isBn ? 'সাপ্তাহিক রিপোর্ট তৈরি হচ্ছে…' : 'Preparing your weekly report…'}
          </div>
        ) : weeklyReportError || !weeklyReport ? (
          <p role="alert" className="rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 p-4 text-sm text-rose-700 dark:text-rose-300">
            {isBn ? 'সমন্বিত রিপোর্ট লোড করা যায়নি। পরে আবার চেষ্টা করুন।' : 'The integrated report could not be loaded. Please try again later.'}
          </p>
        ) : (
          <>
            <p className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 px-3 py-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
              <Calendar className="w-3.5 h-3.5" />
              {weeklyReport.period.startDate} – {weeklyReport.period.endDate}
              {' • '}
              {weeklyReport.checkInCount} {isBn ? 'টি check-in' : 'check-ins'}
            </p>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: isBn ? 'গড় চাপ' : 'Average stress', value: weeklyReport.averages.stressLevel, suffix: '/10', color: 'text-rose-600 dark:text-rose-400', icon: Activity, track: 'bg-rose-500', max: 10 },
                { label: isBn ? 'গড় ঘুম' : 'Average sleep', value: weeklyReport.averages.sleepHours, suffix: isBn ? ' ঘণ্টা' : 'h', color: 'text-blue-600 dark:text-blue-400', icon: Moon, track: 'bg-blue-500', max: 10 },
                { label: isBn ? 'গড় মেজাজ' : 'Average mood', value: weeklyReport.averages.mood, suffix: '/5', color: 'text-emerald-600 dark:text-emerald-400', icon: Smile, track: 'bg-emerald-500', max: 5 },
                { label: isBn ? 'গড় শক্তি' : 'Average energy', value: weeklyReport.averages.energyLevel, suffix: '/10', color: 'text-amber-600 dark:text-amber-400', icon: Zap, track: 'bg-amber-500', max: 10 },
              ].map(metric => (
                <div key={metric.label} className="rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/60 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{metric.label}</div>
                    <metric.icon className={`w-4 h-4 ${metric.color}`} />
                  </div>
                  <div className={`mt-2 text-2xl font-extrabold tracking-tight ${metric.color}`}>
                    {metric.value === null ? '—' : metric.value}{metric.value === null ? '' : metric.suffix}
                  </div>
                  <div className="mt-3 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div className={`h-full rounded-full ${metric.track}`} style={{ width: `${metric.value === null ? 0 : Math.min(100, Math.max(0, metric.value / metric.max * 100))}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-5">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5 space-y-3">
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200">
                  <TrendingUp className="w-4 h-4 text-indigo-500" />
                  {isBn ? 'দৈনিক প্রবণতা' : 'Daily trends'}
                </h3>
                {weeklyReport.dailyCheckIns.length === 0 ? (
                  <p className="rounded-xl bg-slate-50 dark:bg-slate-900/60 p-4 text-xs text-slate-500">
                    {isBn ? 'এই সপ্তাহে কোনো check-in নেই।' : 'No check-ins recorded in the last 7 days.'}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {weeklyReport.dailyCheckIns.map(entry => (
                      <div key={entry.date} className="rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700/70 px-3 py-3 text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-slate-700 dark:text-slate-300">
                          <span className="font-bold">{new Date(`${entry.date}T00:00:00`).toLocaleDateString(isBn ? 'bn-BD' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                          <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/70 px-2 py-1 font-semibold text-emerald-800 dark:text-emerald-300">{isBn ? 'মুড' : 'Mood'} {entry.mood}/5</span>
                          <span className="rounded-full bg-rose-100 dark:bg-rose-950/70 px-2 py-1 font-semibold text-rose-800 dark:text-rose-300">{isBn ? 'চাপ' : 'Stress'} {entry.stressLevel}/10</span>
                          <span className="rounded-full bg-blue-100 dark:bg-blue-950/70 px-2 py-1 font-semibold text-blue-800 dark:text-blue-300">{isBn ? 'ঘুম' : 'Sleep'} {entry.sleepHours}{isBn ? 'ঘ.' : 'h'}</span>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden" title={`${isBn ? 'চাপ' : 'Stress'} ${entry.stressLevel}/10`}>
                            <div className="h-full rounded-full bg-rose-500" style={{ width: `${Math.min(100, Math.max(0, entry.stressLevel * 10))}%` }} />
                          </div>
                          <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden" title={`${isBn ? 'ঘুম' : 'Sleep'} ${entry.sleepHours}h`}>
                            <div className="h-full rounded-full bg-blue-500" style={{ width: `${Math.min(100, Math.max(0, entry.sleepHours / 10 * 100))}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5 space-y-3">
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200">
                  <ClipboardCheck className="w-4 h-4 text-violet-500" />
                  {isBn ? 'সাম্প্রতিক মানসিক স্বাস্থ্য টেস্ট' : 'Recent mental health screenings'}
                </h3>
                {weeklyReport.screenings.length === 0 ? (
                  <p className="rounded-xl bg-slate-50 dark:bg-slate-900/60 p-4 text-xs text-slate-500">
                    {isBn ? 'সাম্প্রতিক ৩০ দিনে কোনো টেস্টের ফল নেই।' : 'No screening results from the last 30 days.'}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {weeklyReport.screenings.map(result => {
                      const badgeClass = result.bandColor === 'rose' || result.bandColor === 'orange'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : result.bandColor === 'amber'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : result.bandColor === 'blue'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
                      return (
                        <div key={result.instrumentId} className="rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700/70 p-4 space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{result.instrumentTitle}</span>
                            <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${badgeClass}`}>{result.band}</span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {isBn ? 'স্কোর' : 'Score'}: <strong className="text-slate-800 dark:text-slate-200">{result.totalScore}/{result.maxScore}</strong> • {result.date}
                          </p>
                          <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                            <div className={`h-full rounded-full ${result.bandColor === 'rose' || result.bandColor === 'orange' ? 'bg-rose-500' : result.bandColor === 'amber' ? 'bg-amber-500' : result.bandColor === 'blue' ? 'bg-blue-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, Math.max(0, result.totalScore / Math.max(1, result.maxScore) * 100))}%` }} />
                          </div>
                          {result.recommendation && (
                            <p className="text-[11px] text-slate-600 dark:text-slate-400">{result.recommendation}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <section className="rounded-2xl bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-900/60 p-4 sm:p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-300" />
                <h3 className="text-sm font-bold text-violet-950 dark:text-violet-200">
                  {isBn ? 'টেস্ট ও সাপ্তাহিক রিপোর্টের চ্যাটবট বিশ্লেষণ' : 'Chatbot Analysis of Your Test & Weekly Report'}
                </h3>
              </div>
              {weeklyReport.screenings.length === 0 ? (
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {isBn
                    ? 'চ্যাটবট বিশ্লেষণ পেতে Mental Health Test থেকে একটি টেস্ট সম্পন্ন করুন।'
                    : 'Complete a test in Mental Health Test to get a chatbot analysis of your result and weekly report.'}
                </p>
              ) : reportAnalysis ? (
                <div className="space-y-2.5">
                  <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                    {reportAnalysis.summary}
                  </p>
                  {reportAnalysis.observations.length > 0 && (
                    <ul className="list-disc pl-5 space-y-1 text-xs text-slate-700 dark:text-slate-300">
                      {reportAnalysis.observations.map((observation, index) => (
                        <li key={`ai-observation-${index}`}>{observation}</li>
                      ))}
                    </ul>
                  )}
                  {reportAnalysis.recommendations.length > 0 && (
                    <div className="pt-2 border-t border-violet-200 dark:border-violet-900/70">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                        {isBn ? 'আপনার জন্য করণীয়' : 'Suggested next steps'}
                      </h4>
                      <ul className="list-disc pl-5 space-y-1 text-xs text-slate-700 dark:text-slate-300">
                        {reportAnalysis.recommendations.map((recommendation, index) => (
                          <li key={`ai-recommendation-${index}`}>{recommendation}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <p className="text-[10px] text-slate-500">
                    {reportAnalysis.generatedByAi
                      ? (isBn ? 'চ্যাটবট বিশ্লেষণ' : 'Chatbot-generated analysis')
                      : (isBn
                        ? 'স্থানীয় রিপোর্ট সারসংক্ষেপ — চ্যাটবট সেবা উপলভ্য নয়। সার্ভার restart ও API quota যাচাই করুন।'
                        : 'Local report summary — chatbot service unavailable. Restart the server and check API quota.')}
                    {' • '}
                    {weeklyReport.disclaimer}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {isBn ? 'এই রিপোর্টের জন্য চ্যাটবট বিশ্লেষণ পাওয়া যায়নি। পরে আবার চেষ্টা করুন।' : 'Chatbot analysis is not available for this report. Please try again later.'}
                </p>
              )}
            </section>

            {(weeklyReport.insights.length > 0 || weeklyReport.recommendations.length > 0) && (
              <div className="rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 p-4 space-y-3">
                <h3 className="text-sm font-bold text-indigo-950 dark:text-indigo-200">
                  {isBn ? 'সমন্বিত পর্যবেক্ষণ ও করণীয়' : 'Combined observations and next steps'}
                </h3>
                <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  {[...weeklyReport.insights, ...weeklyReport.recommendations].map((item, index) => (
                    <li key={`${index}-${item}`}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            <p className="text-[10px] leading-relaxed text-slate-500">{weeklyReport.disclaimer}</p>
          </>
        )}
      </section>

      {/* Comparison Snapshot or Zero-Data Empty State */}
      {checkIns.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 p-8 sm:p-12 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <BarChart3 className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {isBn ? 'এখনো কোনো চেক-ইন তথ্য রেকর্ড নেই' : 'No Check-in Data Recorded Yet'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              {isBn
                ? 'আপনার মেজাজ, ঘুম ও মানসিক চাপের ৭ ও ৩০ দিনের তুলনামূলক রিপোর্ট পেতে প্রতিদিনের "অ্যাসেসমেন্ট" বা চেক-ইন সম্পন্ন করুন।'
                : 'Complete daily assessments to generate your personalized wellness rhythm reports and comparison trajectories.'}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {periodReports.map(report => (
              <section key={report.key} className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-5 sm:p-6 shadow-sm space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${report.key === '7d' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300'}`}>
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-bold text-base text-slate-900 dark:text-white">{report.label}</h2>
                      <p className="text-[11px] text-slate-500 mt-1">{report.startDate} – {report.endDate}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-full whitespace-nowrap">
                    {report.entries.length} {isBn ? 'টি check-in' : 'check-ins'}
                  </span>
                </div>
                {report.entries.length === 0 ? (
                  <p className="rounded-xl bg-slate-50 dark:bg-slate-900/60 p-4 text-xs text-slate-500">
                    {isBn ? 'এই সময়সীমায় কোনো check-in নেই।' : 'No check-ins recorded in this period.'}
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: isBn ? 'গড় মেজাজ' : 'Average mood', value: report.averages.mood, suffix: '/5', color: 'text-emerald-600 dark:text-emerald-400', icon: Smile },
                      { label: isBn ? 'গড় চাপ' : 'Average stress', value: report.averages.stress, suffix: '/10', color: 'text-rose-600 dark:text-rose-400', icon: Activity },
                      { label: isBn ? 'গড় ঘুম' : 'Average sleep', value: report.averages.sleep, suffix: isBn ? ' ঘণ্টা' : 'h', color: 'text-blue-600 dark:text-blue-400', icon: Moon },
                      { label: isBn ? 'গড় শক্তি' : 'Average energy', value: report.averages.energy, suffix: '/10', color: 'text-amber-600 dark:text-amber-400', icon: Zap },
                    ].map(metric => (
                      <div key={metric.label} className="rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/60 p-3.5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-[11px] font-semibold text-slate-500">{metric.label}</div>
                          <metric.icon className={`w-4 h-4 ${metric.color}`} />
                        </div>
                        <div className={`mt-1 text-xl font-extrabold ${metric.color}`}>
                          {metric.value}{metric.suffix}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>

      {/* Chart 1: Daily Mood & Sleep Trend (Master prompt Page 9 layout) */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-5 sm:p-7 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              {t.reports.moodTrends}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {isBn ? `${periodLabel} এর দৈনিক মেজাজ ও ঘুম ঘণ্টা` : `Daily self-reported mood and sleep duration (${periodLabel})`}
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              {isBn ? 'মেজাজ' : 'Mood (1-5)'}
            </span>
            <span className="flex items-center gap-1.5 text-blue-600 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              {isBn ? 'ঘুম (ঘণ্টা)' : 'Sleep (hrs)'}
            </span>
          </div>
        </div>

        {/* Visual Bar Chart */}
        {recent.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/60 p-8 text-center text-sm text-slate-500">
            {isBn ? 'এই সময়সীমায় চার্ট দেখানোর মতো কোনো check-in নেই।' : 'No check-ins available to chart for this period.'}
          </div>
        ) : <div className="h-60 pt-6">
          <div className="flex items-end justify-between h-44 gap-3 border-b border-slate-200 dark:border-slate-700 pb-2 px-3">
            {recent.map((c, i) => {
              const day = new Date(c.date).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', { weekday: 'short' });
              const moodHeight = (c.mood / 5) * 100;
              const sleepHeight = (c.sleepHours / 10) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="flex items-end gap-1 h-36">
                    {/* Mood Bar */}
                    <div 
                      style={{ height: `${moodHeight}%` }}
                      className="w-3.5 sm:w-5 bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-md transition-all group-hover:brightness-110"
                      title={`Mood: ${c.mood}/5`}
                    />
                    {/* Sleep Bar */}
                    <div 
                      style={{ height: `${sleepHeight}%` }}
                      className="w-3.5 sm:w-5 bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t-md transition-all group-hover:brightness-110"
                      title={`Sleep: ${c.sleepHours} hrs`}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    {day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>}
      </div>

      {/* Chart 2: Stress vs Energy Level (Master prompt Page 9 layout) */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-5 sm:p-7 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
              {t.reports.stressVsEnergy}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {isBn ? 'মানসিক চাপ বনাম শারীরিক শক্তি' : 'Comparison of reported stress tension and vitality'}
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-rose-500 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              {isBn ? 'চাপ (Stress)' : 'Stress'}
            </span>
            <span className="flex items-center gap-1.5 text-amber-500 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              {isBn ? 'শক্তি (Energy)' : 'Energy'}
            </span>
          </div>
        </div>

        {/* Visual Line / Bar comparison */}
        {recent.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/60 p-8 text-center text-sm text-slate-500">
            {isBn ? 'এই সময়সীমায় চার্ট দেখানোর মতো কোনো check-in নেই।' : 'No check-ins available to chart for this period.'}
          </div>
        ) : <div className="space-y-3">
          {recent.map((c, i) => {
            const dateStr = new Date(c.date).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', { month: 'short', day: 'numeric', weekday: 'short' });
            return (
              <div key={i} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300 w-28 shrink-0">
                  {dateStr}
                </span>

                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 w-12">Stress: {c.stressLevel}</span>
                    <div className="flex-1 bg-slate-200 dark:bg-slate-600 rounded-full h-2 overflow-hidden">
                      <div 
                        style={{ width: `${c.stressLevel * 10}%` }}
                        className="bg-rose-500 h-full rounded-full"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 w-12">Energy: {c.energyLevel}</span>
                    <div className="flex-1 bg-slate-200 dark:bg-slate-600 rounded-full h-2 overflow-hidden">
                      <div 
                        style={{ width: `${c.energyLevel * 10}%` }}
                        className="bg-amber-500 h-full rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>}
      </div>
    </>
  )}

      {/* Mandatory Data-Gap Explanation Note (Master prompt Page 9 & 12 requirement) */}
      <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3 text-xs text-slate-500">
        <AlertCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-slate-800 dark:text-slate-200">
            {isBn ? 'তথ্য স্বচ্ছতা ও ডেটা-গ্যাপ নীতি:' : 'Data Gap Transparency Principle:'}
          </div>
          <p className="leading-relaxed">
            {t.reports.dataGapNote}
          </p>
        </div>
      </div>

      {/* Export Summary Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-600" />
                <span>{isBn ? 'সুস্থতা সারসংক্ষেপ রিপোর্ট' : 'Wellness Summary Report'}</span>
              </h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2 font-mono">
              <div className="font-bold text-slate-800 dark:text-slate-200">
                {periodLabel} Average Mood: <span className="text-emerald-600">{currentMoodAvg}/5</span>
              </div>
              <div className="text-slate-600 dark:text-slate-400">
                Average Stress Level: {currentStressAvg}/10
              </div>
              <div className="text-slate-600 dark:text-slate-400">
                Average Sleep: {currentSleepAvg} hrs
              </div>
              <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-700">
                Includes {recent.length} logged self-care check-ins.
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300"
              >
                {isBn ? 'বাতিল' : 'Close'}
              </button>
              <button
                onClick={handleDownloadSummaryFile}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isBn ? 'টেক্সট ফাইল ডাউনলোড করুন' : 'Download .txt Summary'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
