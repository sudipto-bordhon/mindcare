import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle, 
  AlertTriangle, 
  ArrowRight, 
  ArrowLeft, 
  PhoneCall, 
  BookOpen, 
  HelpCircle,
  RotateCcw
} from 'lucide-react';
import { ScreeningInstrument, ScreeningAttempt, Language, User } from '../types';
import { SCREENING_INSTRUMENTS } from '../data/initialData';
import { translations } from '../data/translations';

interface ScreeningToolsViewProps {
  screenings: ScreeningAttempt[];
  currentUser?: User | null;
  onSaveScreening: (attempt: ScreeningAttempt) => void;
  onOpenCrisis: () => void;
  refreshToken: number;
  language: Language;
  onRequireAuth: () => void;
}

export const ScreeningToolsView: React.FC<ScreeningToolsViewProps> = ({
  screenings,
  currentUser,
  onSaveScreening,
  onOpenCrisis,
  refreshToken,
  language,
  onRequireAuth,
}) => {
  const t = translations[language];
  const isBn = language === 'bn';
  const [availableInstruments, setAvailableInstruments] = useState<ScreeningInstrument[]>(() => {
    try {
      const saved = localStorage.getItem('mindcare_screening_instruments');
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) && parsed.length ? parsed : SCREENING_INSTRUMENTS;
    } catch {
      return SCREENING_INSTRUMENTS;
    }
  });

  const [selectedInstrument, setSelectedInstrument] = useState<ScreeningInstrument | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentResult, setCurrentResult] = useState<ScreeningAttempt | null>(null);
  const [refreshUnlocked, setRefreshUnlocked] = useState(false);
  const [refreshedInstrumentIds, setRefreshedInstrumentIds] = useState<ScreeningInstrument['id'][]>([]);

  useEffect(() => {
    const syncInstruments = () => {
      try {
        const parsed = JSON.parse(localStorage.getItem('mindcare_screening_instruments') || 'null');
        if (Array.isArray(parsed) && parsed.length) setAvailableInstruments(parsed);
      } catch {
        setAvailableInstruments(SCREENING_INSTRUMENTS);
      }
    };
    window.addEventListener('storage', syncInstruments);
    return () => window.removeEventListener('storage', syncInstruments);
  }, []);

  useEffect(() => {
    if (refreshToken === 0) return;
    setSelectedInstrument(null);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setCurrentResult(null);
    setRefreshUnlocked(true);
    setRefreshedInstrumentIds([]);
  }, [refreshToken]);

  const getCooldownDays = (_instrumentId: ScreeningInstrument['id']) => 7;

  const getLatestAttempt = (instrumentId: ScreeningInstrument['id']) =>
    screenings
      .filter(screening => screening.instrumentId === instrumentId)
      .sort((a, b) => b.date.localeCompare(a.date))[0];

  const getNextAvailableDate = (instrumentId: ScreeningInstrument['id']) => {
    const latestAttempt = screenings
      .filter(screening => screening.instrumentId === instrumentId)
      .sort((a, b) => b.date.localeCompare(a.date))[0];
    if (!latestAttempt) return null;

    const cycleAnchorDate = latestAttempt.cycleAnchorDate || latestAttempt.date;
    const nextDate = new Date(`${cycleAnchorDate}T00:00:00`);
    nextDate.setDate(nextDate.getDate() + getCooldownDays(instrumentId));
    return nextDate;
  };

  const isRetakeAvailable = (instrumentId: ScreeningInstrument['id']) => {
    const nextDate = getNextAvailableDate(instrumentId);
    return !nextDate || new Date() >= nextDate;
  };

  const formatAvailableDate = (date: Date) =>
    new Intl.DateTimeFormat(language === 'bn' ? 'bn-BD' : undefined, {
      dateStyle: 'medium',
    }).format(date);

  const startInstrument = (inst: ScreeningInstrument) => {
    if (!currentUser) {
      onRequireAuth();
      return;
    }
    const refreshAvailable = refreshUnlocked && !refreshedInstrumentIds.includes(inst.id);
    if (!refreshAvailable && !isRetakeAvailable(inst.id)) return;
    setSelectedInstrument(inst);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setCurrentResult(null);
  };

  const handleSelectAnswer = (questionId: number, score: number) => {
    setAnswers({
      ...answers,
      [questionId]: score,
    });
  };

  const handleNext = () => {
    if (!selectedInstrument) return;
    if (currentQuestionIndex < selectedInstrument.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      calculateResult();
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const calculateResult = () => {
    if (!selectedInstrument) return;

    let total = 0;
    let safetyTriggered = false;

    selectedInstrument.questions.forEach((q) => {
      const score = answers[q.id] || 0;
      total += score;
      // Item 9 of PHQ-9 (thoughts of being better off dead or hurting oneself)
      if (selectedInstrument.id === 'phq9' && q.id === 9 && score > 0) {
        safetyTriggered = true;
      }
    });

    const maxScore = selectedInstrument.questions.length * 3;
    const band = selectedInstrument.scoringBands.find(
      b => total >= b.min && total <= b.max
    ) || selectedInstrument.scoringBands[selectedInstrument.scoringBands.length - 1];

    const resultAttempt: ScreeningAttempt = {
      id: 'scr_' + Date.now(),
      userId: currentUser?.id || 'guest',
      instrumentId: selectedInstrument.id,
      instrumentTitle: isBn ? selectedInstrument.titleBn : selectedInstrument.titleEn,
      date: new Date().toISOString().split('T')[0],
      answers,
      totalScore: total,
      maxScore,
      band: isBn ? band.bandBn : band.bandEn,
      bandColor: band.color,
      recommendation: isBn ? band.recommendationBn : band.recommendationEn,
      flaggedSafetyQuestion: safetyTriggered,
      isManualRefresh: refreshUnlocked,
      cycleAnchorDate: refreshUnlocked
        ? (getLatestAttempt(selectedInstrument.id)?.cycleAnchorDate || getLatestAttempt(selectedInstrument.id)?.date)
        : undefined,
    };

    setCurrentResult(resultAttempt);
    onSaveScreening(resultAttempt);
    if (refreshUnlocked) {
      setRefreshedInstrumentIds(previous => {
        const updated = previous.includes(selectedInstrument.id)
          ? previous
          : [...previous, selectedInstrument.id];
        if (updated.length === availableInstruments.length) {
          setRefreshUnlocked(false);
        }
        return updated;
      });
    }

    if (safetyTriggered) {
      // Auto-trigger crisis alert modal as per Master prompt Section 15 safety requirement
      onOpenCrisis();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          {t.screenings.title}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {t.screenings.subtitle}
        </p>
      </div>

      {/* View Mode 1: Select Instrument Cards */}
      {!selectedInstrument && (
        <div className="space-y-6">
          {refreshUnlocked && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40 px-4 py-3 text-xs text-emerald-800 dark:text-emerald-200">
              {isBn
                ? 'All test refresh চালু হয়েছে। একই সপ্তাহে তিনটি test আবার পূরণ করলে নতুন result পুরোনো result replace করবে। মূল ৭ দিনের cycle পরিবর্তন হবে না।'
                : 'All test refresh is active. Retaking the three tests this week will replace their previous results. The original 7-day cycle will not change.'}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {availableInstruments.map((inst) => {
              const title = isBn ? inst.titleBn : inst.titleEn;
              const desc = isBn ? inst.descriptionBn : inst.descriptionEn;
              const latestAttempt = getLatestAttempt(inst.id);
              const nextAvailableDate = getNextAvailableDate(inst.id);
              const canRetake = (refreshUnlocked && !refreshedInstrumentIds.includes(inst.id)) || isRetakeAvailable(inst.id);
              return (
                <div
                  key={inst.id}
                  className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col justify-between shadow-xs hover:-translate-y-1 hover:border-emerald-500 hover:shadow-lg transition-all duration-200 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                        {inst.code}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {inst.questions.length} {isBn ? 'টি প্রশ্ন' : 'Questions'}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-emerald-600 transition">
                      {title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {desc}
                    </p>

                    <div className="text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-700/60 pt-2">
                      {inst.licenseInfo}
                    </div>
                    {latestAttempt && (
                      <div className={`rounded-xl px-3 py-2 text-[11px] font-semibold ${
                        canRetake
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                      }`}>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>{isBn ? 'Done' : 'Done'}</span>
                        </div>
                        {nextAvailableDate && (
                          <div className="mt-1 font-normal">
                            {canRetake
                              ? (isBn ? 'আবার এখন করা যাবে' : 'Ready to retake now')
                              : (isBn
                                ? `${formatAvailableDate(nextAvailableDate)} থেকে আবার করা যাবে`
                                : `Available again from ${formatAvailableDate(nextAvailableDate)}`)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => startInstrument(inst)}
                    disabled={!canRetake}
                    className={`mt-6 w-full py-2.5 px-4 rounded-xl text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 ${
                      canRetake
                        ? 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg'
                        : 'bg-slate-300 dark:bg-slate-600 cursor-not-allowed shadow-none'
                    }`}
                  >
                    <span>{latestAttempt && !canRetake ? (isBn ? 'পরে আবার চেষ্টা করুন' : 'Available later') : latestAttempt ? t.screenings.retakeTest : t.screenings.startTest}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Past Screening History */}
          {screenings.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 space-y-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {isBn ? 'আপনার পূর্ববর্তী স্ক্রিনিং রেকর্ড' : 'Your Previous Screening Attempts'}
              </h3>
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {screenings.map((sc) => (
                  <div key={sc.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{sc.instrumentTitle}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {sc.band}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {isBn ? 'তারিখ:' : 'Date:'} {sc.date} • {sc.recommendation}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                        {sc.totalScore}
                      </span>
                      <span className="text-slate-400 text-xs">/{sc.maxScore}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* View Mode 2: Interactive Question-by-Question Flow */}
      {selectedInstrument && !currentResult && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-emerald-100 dark:border-slate-700 p-6 sm:p-8 shadow-sm space-y-6">
          {/* Header of Test */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4">
            <div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                {selectedInstrument.code}
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {isBn ? selectedInstrument.titleBn : selectedInstrument.titleEn}
              </h2>
            </div>
            <button
              onClick={() => setSelectedInstrument(null)}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline"
            >
              {isBn ? 'বাতিল করুন' : 'Cancel'}
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-500">
              <span>
                {t.screenings.questionOf} {currentQuestionIndex + 1} {t.screenings.of} {selectedInstrument.questions.length}
              </span>
              <span>
                {Math.round(((currentQuestionIndex + 1) / selectedInstrument.questions.length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-600 h-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / selectedInstrument.questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Current Question */}
          {(() => {
            const q = selectedInstrument.questions[currentQuestionIndex];
            const qText = isBn ? q.textBn : q.textEn;
            const currentSelected = answers[q.id];
            const options = isBn ? selectedInstrument.optionsBn : selectedInstrument.optionsEn;

            return (
              <div className="space-y-6 py-4">
                <div className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white leading-relaxed">
                  {currentQuestionIndex + 1}. {qText}
                </div>

                {/* Options List */}
                <div className="space-y-3">
                  {options.map((opt, optIndex) => {
                    const isSelected = currentSelected === optIndex;
                    return (
                      <button
                        type="button"
                        key={optIndex}
                        onClick={() => handleSelectAnswer(q.id, optIndex)}
                        className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm font-medium flex items-center justify-between transition ${
                          isSelected
                            ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-600 dark:border-emerald-500 text-emerald-950 dark:text-emerald-100 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 hover:text-slate-900 dark:hover:bg-slate-700 dark:hover:text-white'
                              + ' hover:-translate-y-0.5 hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-sm'
                        }`}
                      >
                        <span>{opt}</span>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'
                        }`}>
                          {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Bottom Action Navigation */}
          <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-700 pt-4">
            <button
              onClick={handlePrev}
              disabled={currentQuestionIndex === 0}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                currentQuestionIndex === 0
                  ? 'opacity-30 cursor-not-allowed text-slate-400'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t.screenings.prevBtn}</span>
            </button>

            <button
              onClick={handleNext}
              disabled={answers[selectedInstrument.questions[currentQuestionIndex].id] === undefined}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold text-white transition flex items-center gap-1.5 shadow ${
                answers[selectedInstrument.questions[currentQuestionIndex].id] === undefined
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
              }`}
            >
              <span>
                {currentQuestionIndex === selectedInstrument.questions.length - 1
                  ? t.screenings.submitBtn
                  : t.screenings.nextBtn}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* View Mode 3: Result Summary Screen */}
      {currentResult && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-emerald-100 dark:border-slate-700 p-6 sm:p-8 shadow-md space-y-6 animate-fade-in">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              {currentResult.instrumentTitle}
            </span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              {t.screenings.resultTitle}
            </h2>
          </div>

          {/* Score Band Display */}
          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 text-center space-y-3">
            <div className="text-xs text-slate-500">{t.screenings.scoreText}</div>
            <div className="text-5xl font-black text-emerald-600 dark:text-emerald-400">
              {currentResult.totalScore}
              <span className="text-xl text-slate-400">/{currentResult.maxScore}</span>
            </div>
            <div className="inline-block px-4 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {currentResult.band}
            </div>
          </div>

          {/* Safety Flag Alert (Item 9 trigger) */}
          {currentResult.flaggedSafetyQuestion && (
            <div className="p-5 bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 rounded-2xl text-xs space-y-3">
              <div className="flex items-center gap-2 text-rose-800 dark:text-rose-200 font-bold text-sm">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span>{isBn ? 'জরুরি সুরক্ষা বিজ্ঞপ্তি' : 'Immediate Safety Notification'}</span>
              </div>
              <p className="text-rose-700 dark:text-rose-300 leading-relaxed">
                {t.screenings.safetyAlert}
              </p>
              <button
                onClick={onOpenCrisis}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold flex items-center gap-2 shadow"
              >
                <PhoneCall className="w-4 h-4" />
                <span>{t.screenings.safetyBtn} (16122 / 999)</span>
              </button>
            </div>
          )}

          {/* Recommendations */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t.screenings.recommendationsTitle}
            </h4>
            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800 text-xs text-emerald-950 dark:text-emerald-200 leading-relaxed">
              {currentResult.recommendation}
            </div>
          </div>

          {/* Disclaimer (Master prompt Page 4, 12, 13) */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 leading-relaxed">
            {t.screenings.disclaimer}
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => {
                setSelectedInstrument(null);
                setCurrentResult(null);
              }}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs text-center transition"
            >
              {isBn ? 'অন্যান্য টেস্ট দেখুন' : 'Return to Screeners'}
            </button>
            <button
              disabled={selectedInstrument
                ? !((refreshUnlocked && !refreshedInstrumentIds.includes(selectedInstrument.id)) || isRetakeAvailable(selectedInstrument.id))
                : true}
              onClick={() => {
                if (selectedInstrument) startInstrument(selectedInstrument);
              }}
              className="py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw className="w-4 h-4" />
              <span>
                {selectedInstrument
                  && !(refreshUnlocked && !refreshedInstrumentIds.includes(selectedInstrument.id))
                  && !isRetakeAvailable(selectedInstrument.id)
                  ? (isBn
                    ? `${formatAvailableDate(getNextAvailableDate(selectedInstrument.id)!)} থেকে আবার করা যাবে`
                    : `Available from ${formatAvailableDate(getNextAvailableDate(selectedInstrument.id)!)}`)
                  : t.screenings.retakeTest}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
