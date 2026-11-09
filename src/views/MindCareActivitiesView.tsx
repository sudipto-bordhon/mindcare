import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Wind, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  CloudRain, 
  Waves, 
  Trees, 
  Radio, 
  ShieldCheck, 
  Sparkles,
  BedDouble,
  Eye,
  Hand,
  Ear,
  Smile
} from 'lucide-react';
import { WellnessActivity, Language } from '../types';
import { WELLNESS_ACTIVITIES } from '../data/initialData';
import { translations } from '../data/translations';
import { playBreathChime, startAmbientSound, stopAmbientSound } from '../utils/audioSynthesizer';

interface MindCareActivitiesViewProps {
  language: Language;
}

export const MindCareActivitiesView: React.FC<MindCareActivitiesViewProps> = ({
  language,
}) => {
  const t = translations[language];
  const isBn = language === 'bn';
  const [customActivities, setCustomActivities] = useState<WellnessActivity[]>([]);

  useEffect(() => {
    const loadLibraryContent = () => {
      try {
        const saved = localStorage.getItem('mindcare_custom_activities');
        const parsed = saved ? JSON.parse(saved) : [];
        setCustomActivities(Array.isArray(parsed) ? parsed : []);
      } catch {
        setCustomActivities([]);
      }
    };

    loadLibraryContent();
    window.addEventListener('storage', loadLibraryContent);
    window.addEventListener('mindcare-library-updated', loadLibraryContent);
    return () => {
      window.removeEventListener('storage', loadLibraryContent);
      window.removeEventListener('mindcare-library-updated', loadLibraryContent);
    };
  }, []);

  // Breathing tool state
  const [activeTechnique, setActiveTechnique] = useState<'478' | 'box'>('478');
  const [isBreathingActive, setIsBreathingActive] = useState<boolean>(false);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale' | 'holdEmpty'>('inhale');
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState<number>(4);
  const [cycleCount, setCycleCount] = useState<number>(0);

  // 5-4-3-2-1 Grounding tool state
  const [groundingStep, setGroundingStep] = useState<number>(0);

  // Ambient sound synthesizer state
  const [activeSound, setActiveSound] = useState<'rain' | 'ocean' | 'forest' | 'birds' | 'whitenoise' | null>(null);

  // Breathing timer loop
  useEffect(() => {
    let interval: any = null;

    if (isBreathingActive) {
      interval = setInterval(() => {
        setPhaseSecondsLeft((prev) => {
          if (prev > 1) {
            return prev - 1;
          }

          // Advance to next phase
          if (activeTechnique === '478') {
            if (breathPhase === 'inhale') {
              setBreathPhase('hold');
              playBreathChime('hold');
              return 7;
            } else if (breathPhase === 'hold') {
              setBreathPhase('exhale');
              playBreathChime('exhale');
              return 8;
            } else {
              setBreathPhase('inhale');
              setCycleCount(c => c + 1);
              playBreathChime('inhale');
              return 4;
            }
          } else {
            // Box breathing: 4-4-4-4
            if (breathPhase === 'inhale') {
              setBreathPhase('hold');
              playBreathChime('hold');
              return 4;
            } else if (breathPhase === 'hold') {
              setBreathPhase('exhale');
              playBreathChime('exhale');
              return 4;
            } else if (breathPhase === 'exhale') {
              setBreathPhase('holdEmpty');
              playBreathChime('hold');
              return 4;
            } else {
              setBreathPhase('inhale');
              setCycleCount(c => c + 1);
              playBreathChime('inhale');
              return 4;
            }
          }
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isBreathingActive, breathPhase, activeTechnique]);

  const handleStartBreathing = () => {
    setIsBreathingActive(true);
    setBreathPhase('inhale');
    setPhaseSecondsLeft(4);
    playBreathChime('inhale');
  };

  const handlePauseBreathing = () => {
    setIsBreathingActive(false);
  };

  const handleResetBreathing = () => {
    setIsBreathingActive(false);
    setBreathPhase('inhale');
    setPhaseSecondsLeft(4);
    setCycleCount(0);
  };

  const handleToggleSound = (type: 'rain' | 'ocean' | 'forest' | 'birds' | 'whitenoise') => {
    if (activeSound === type) {
      stopAmbientSound();
      setActiveSound(null);
    } else {
      startAmbientSound(type, 0.2);
      setActiveSound(type);
    }
  };

  // Stop sound on unmount
  useEffect(() => {
    return () => {
      stopAmbientSound();
    };
  }, []);

  const getPhaseText = () => {
    if (breathPhase === 'inhale') return t.activities.inhale;
    if (breathPhase === 'hold') return t.activities.hold;
    if (breathPhase === 'exhale') return t.activities.exhale;
    return isBn ? 'খালি অবস্থায় অপেক্ষা করুন...' : 'Rest empty lungs...';
  };

  const getCircleScaleClass = () => {
    if (!isBreathingActive) return 'scale-90';
    if (breathPhase === 'inhale') return 'scale-115 transition-transform duration-[4000ms]';
    if (breathPhase === 'hold') return 'scale-115';
    if (breathPhase === 'exhale') return 'scale-85 transition-transform duration-[8000ms]';
    return 'scale-85';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-16">
      {/* Title */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
          <Wind className="w-3.5 h-3.5" />
          <span>{isBn ? 'শ্বাস-প্রশ্বাস ও মননশীল অনুশীলন' : 'MindCare Activities & Relaxation'}</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          {t.activities.title}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {t.activities.subtitle}
        </p>
      </div>

      {/* Feature 1: Interactive Breathing Guide (Animated Breath Circle) */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-emerald-100 dark:border-slate-700 p-6 sm:p-10 shadow-sm space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-700 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Wind className="w-5 h-5 text-emerald-600" />
              <span>{t.activities.breathingTitle}</span>
            </h2>
            <p className="text-xs text-slate-500">
              {t.activities.breathingDesc}
            </p>
          </div>

          {/* Technique Picker */}
          <div className="flex bg-slate-100 dark:bg-slate-700/60 p-1 rounded-xl">
            <button
              onClick={() => { setActiveTechnique('478'); handleResetBreathing(); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTechnique === '478'
                  ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              4-7-8 Relax
            </button>
            <button
              onClick={() => { setActiveTechnique('box'); handleResetBreathing(); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTechnique === 'box'
                  ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Box 4-4-4-4
            </button>
          </div>
        </div>

        {/* Breathing Circle Visual Container (Matching Page 8 visual) */}
        <div className="py-8 flex flex-col items-center justify-center relative">
          <div className="w-64 h-64 sm:w-72 sm:h-72 rounded-full relative flex items-center justify-center">
            {/* Outer soft glowing rings */}
            <div className={`absolute inset-0 rounded-full bg-emerald-100/50 dark:bg-emerald-950/30 blur-xl ${isBreathingActive ? 'animate-pulse' : ''}`} />
            
            <div className={`w-full h-full rounded-full border-4 border-emerald-500/30 flex items-center justify-center p-4 transition-transform duration-1000 ${getCircleScaleClass()}`}>
              <div className="w-full h-full rounded-full bg-gradient-to-tr from-emerald-500 via-teal-400 to-emerald-600 shadow-2xl shadow-emerald-500/20 flex flex-col items-center justify-center text-white text-center p-4 select-none">
                <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-100">
                  {getPhaseText()}
                </span>
                <span className="text-5xl font-black mt-2 font-mono">
                  {phaseSecondsLeft}s
                </span>
                <span className="text-[11px] text-emerald-100 mt-2">
                  {isBn ? `চক্র সম্পন্ন: ${cycleCount}` : `Cycles: ${cycleCount}`}
                </span>
              </div>
            </div>
          </div>

          {/* Audio Chime Notification */}
          <div className="mt-6 text-xs text-slate-500 flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isBn ? 'প্রতিটি শ্বাস পরিবর্তনের সাথে মৃদু সাউন্ড বাজবে' : 'Soothing audio chimes accompany each breath phase'}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center items-center gap-4 pt-2">
          {!isBreathingActive ? (
            <button
              onClick={handleStartBreathing}
              className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition hover:-translate-y-0.5"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{cycleCount > 0 ? t.activities.resume : t.activities.start}</span>
            </button>
          ) : (
            <button
              onClick={handlePauseBreathing}
              className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 transition"
            >
              <Pause className="w-4 h-4 fill-slate-950" />
              <span>{t.activities.pause}</span>
            </button>
          )}

          <button
            onClick={handleResetBreathing}
            className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition"
            title="Reset Counter"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Feature 2: 5-4-3-2-1 Sensory Grounding Tool */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-600" />
            <span>{t.activities.groundingTitle}</span>
          </h2>
          <p className="text-xs text-slate-500">
            {t.activities.groundingDesc}
          </p>
        </div>

        {/* Step-by-step Grounding wizard */}
        <div className="space-y-4">
          {[
            {
              count: 5,
              icon: Eye,
              titleEn: '5 Things you can SEE',
              titleBn: '৫টি জিনিস যা আপনি চোখে দেখতে পাচ্ছেন',
              promptEn: 'Look around. Notice 5 objects: color of the wall, reflection on a glass, shadows, plants...',
              promptBn: 'চারপাশে তাকান। ৫টি বস্তু শনাক্ত করুন: দেয়ালের রং, জানালার আলো, একটি বই, ছায়া...',
            },
            {
              count: 4,
              icon: Hand,
              titleEn: '4 Things you can TOUCH',
              titleBn: '৪টি জিনিস যা আপনি স্পর্শ করতে পারেন',
              promptEn: 'Feel the texture of your clothes, cool table surface, feet firmly touching the floor...',
              promptBn: 'কাপড়ের বুনন, মেঝের ওপর পায়ের তালুর স্পর্শ, টেবিলের ঠান্ডা অংশ অনুভব করুন...',
            },
            {
              count: 3,
              icon: Ear,
              titleEn: '3 Things you can HEAR',
              titleBn: '৩টি শব্দ যা আপনি শুনতে পাচ্ছেন',
              promptEn: 'Listen past the obvious sounds. Whirring fan, distant footsteps, clock ticking...',
              promptBn: 'মনোযোগ দিয়ে শুনুন: ফ্যানের ঘুরঘুর শব্দ, দূরের পাখির ডাক, ঘড়ির কাঁটার আওয়াজ...',
            },
            {
              count: 2,
              icon: Wind,
              titleEn: '2 Things you can SMELL',
              titleBn: '২টি গন্ধ যা আপনি নিতে পারছেন',
              promptEn: 'Inhale through your nose. Scent of tea, fresh breeze, clean room air...',
              promptBn: 'নাক দিয়ে শ্বাস নিন: চায়ের গন্ধ, ঘরের বাতাস বা সাবানের সুবাস...',
            },
            {
              count: 1,
              icon: Smile,
              titleEn: '1 Thing you can TASTE',
              titleBn: '১টি স্বাদ যা আপনি অনুভব করছেন',
              promptEn: 'Take a mindful sip of water or notice the lingering clean taste in your mouth.',
              promptBn: 'এক ঢোক ঠাণ্ডা পানি পান করুন অথবা মুখের স্বাভাবিক স্বাদটি উপলব্ধি করুন।',
            },
          ].map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = groundingStep > idx;
            const isCurrent = groundingStep === idx;
            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl border transition ${
                  isCurrent
                    ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 shadow-xs'
                    : isCompleted
                    ? 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 opacity-80'
                    : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                      isCompleted ? 'bg-teal-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                    }`}>
                      {isCompleted ? <CheckCircle className="w-4 h-4" /> : step.count}
                    </div>
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                        {isBn ? step.titleBn : step.titleEn}
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                        {isBn ? step.promptBn : step.promptEn}
                      </p>
                    </div>
                  </div>

                  {isCurrent && (
                    <button
                      onClick={() => setGroundingStep(s => s + 1)}
                      className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shrink-0 ml-2"
                    >
                      {isBn ? 'পরবর্তী' : 'Next Step'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {groundingStep >= 5 && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 text-center space-y-2 animate-fade-in">
              <CheckCircle className="w-6 h-6 text-emerald-600 mx-auto" />
              <div className="font-bold text-xs sm:text-sm text-emerald-900 dark:text-emerald-200">
                {t.activities.completed}
              </div>
              <button
                onClick={() => setGroundingStep(0)}
                className="text-xs font-semibold text-emerald-700 underline"
              >
                {t.activities.reset}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Feature 3: Ambient Sound Synthesizer */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-xs space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-indigo-600" />
            <span>{t.activities.ambientTitle}</span>
          </h2>
          <p className="text-xs text-slate-500">
            {t.activities.ambientDesc}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { id: 'rain' as const, labelEn: 'Gentle Rain', labelBn: 'বৃষ্টির শব্দ', icon: CloudRain },
            { id: 'ocean' as const, labelEn: 'Ocean Waves', labelBn: 'সাগরের ঢেউ', icon: Waves },
            { id: 'forest' as const, labelEn: 'Forest Breeze', labelBn: 'বনের হাওয়া', icon: Trees },
            { id: 'birds' as const, labelEn: 'Morning Birds', labelBn: 'পাখির ডাক', icon: Smile },
            { id: 'whitenoise' as const, labelEn: 'White Noise', labelBn: 'হোয়াইট নয়েজ', icon: Radio },
          ].map((snd) => {
            const Icon = snd.icon;
            const isPlaying = activeSound === snd.id;
            return (
              <button
                key={snd.id}
                onClick={() => handleToggleSound(snd.id)}
                className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-center gap-2 transition ${
                  isPlaying
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md scale-105'
                    : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs font-bold">{isBn ? snd.labelBn : snd.labelEn}</span>
                <span className="text-[10px] font-semibold opacity-80">
                  {isPlaying ? (isBn ? 'বাজছে...' : 'Playing') : (isBn ? 'চালু করুন' : 'Tap to Play')}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Feature 4: Progressive Muscle Relaxation (PMR) Guide */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-xs space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BedDouble className="w-5 h-5 text-emerald-600" />
            <span>{isBn ? 'প্রগ্রেসিভ মাসল রিলাক্সেশন (PMR)' : 'Progressive Muscle Relaxation (PMR)'}</span>
          </h2>
          <p className="text-xs text-slate-500">
            {isBn 
              ? 'শরীরের বিভিন্ন পেশি ৫ সেকেন্ড শক্ত করে ধরে রাখুন এবং ১০ সেকেন্ডে শিথিল করুন' 
              : 'Sequentially tense muscle groups for 5 seconds, then intentionally release for 10 seconds to discharge stored stress.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {[
            {
              titleEn: '1. Face & Forehead',
              titleBn: '১. কপাল ও চোখ',
              descEn: 'Wrinkle your forehead and squeeze eyes tightly for 5s, then release completely.',
              descBn: 'কপাল কুঁচকে চোখ শক্ত করে ৫ সেকেন্ড বন্ধ রাখুন, তারপর ধীরে ধীরে ছেড়ে দিন।'
            },
            {
              titleEn: '2. Shoulders & Neck',
              titleBn: '২. ঘাড় ও কাঁধ',
              descEn: 'Raise shoulders up to your ears, hold 5s, then drop them softly with an exhale.',
              descBn: 'কাঁধ কানের কাছে উঁচু করে ৫ সেকেন্ড টানটান রাখুন, তারপর নিঃশ্বাস ফেলে ছেড়ে দিন।'
            },
            {
              titleEn: '3. Hands & Fists',
              titleBn: '৩. হাত ও মুঠো',
              descEn: 'Clench fists tightly, feel the forearm tension, then open fingers and let arms rest limp.',
              descBn: 'হাত শক্ত করে মুঠো করুন, বাহুতে টান অনুভব করুন, তারপর আঙুলগুলো সম্পূর্ণ আলগা করুন।'
            }
          ].map((item, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 space-y-1">
              <div className="font-bold text-emerald-800 dark:text-emerald-300">
                {isBn ? item.titleBn : item.titleEn}
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                {isBn ? item.descBn : item.descEn}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-xs space-y-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>{isBn ? 'আরও মননশীল অনুশীলন' : 'More Mindful Activities'}</span>
          </h2>
          <p className="text-xs text-slate-500">
            {isBn ? 'আপনার দিনের জন্য ছোট, সহজ ও বাস্তব wellness practice বেছে নিন।' : 'Choose a short, practical wellness practice for your day.'}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[...WELLNESS_ACTIVITIES.slice(4), ...customActivities].map((activity: WellnessActivity) => (
            <div key={activity.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {isBn ? activity.titleBn : activity.titleEn}
                </h3>
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 whitespace-nowrap">
                  {activity.durationMinutes} min
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                {isBn ? activity.descriptionBn : activity.descriptionEn}
              </p>
              <ol className="list-decimal list-inside space-y-1 text-[10px] text-slate-500 dark:text-slate-400">
                {(isBn ? activity.instructionsBn : activity.instructionsEn).slice(0, 3).map((instruction) => (
                  <li key={instruction}>{instruction}</li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
