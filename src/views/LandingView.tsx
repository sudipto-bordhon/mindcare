import React from 'react';
import { 
  Heart, 
  Sparkles, 
  ShieldCheck, 
  Activity, 
  Bot, 
  Brain, 
  BookOpen, 
  Smile, 
  BarChart3, 
  CheckCircle2, 
  ArrowRight, 
  PhoneCall, 
  Users, 
  Compass, 
  Lock, 
  Award,
  Zap
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../data/translations';

interface LandingViewProps {
  language: Language;
  onGetStarted: () => void;
  onExploreFeature: (tab: string) => void;
  onOpenCrisis: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  language,
  onGetStarted,
  onExploreFeature,
  onOpenCrisis,
}) => {
  const t = translations[language];
  const isBn = language === 'bn';

  const featureCards = [
    {
      id: 'assessment',
      title: t.features.f1_title,
      desc: t.features.f1_desc,
      icon: Smile,
      badge: isBn ? 'দৈনিক চেক-ইন' : 'Daily Mood',
      color: 'from-emerald-500 to-teal-600',
      bgLight: 'bg-emerald-50 dark:bg-emerald-950/40',
      border: 'border-emerald-200 dark:border-emerald-800',
    },
    {
      id: 'screenings',
      title: t.features.f2_title,
      desc: t.features.f2_desc,
      icon: Activity,
      badge: 'PHQ-9 & GAD-7',
      color: 'from-blue-500 to-cyan-600',
      bgLight: 'bg-blue-50 dark:bg-blue-950/40',
      border: 'border-blue-200 dark:border-blue-800',
    },
    {
      id: 'ai-assistant',
      title: t.features.f3_title,
      desc: t.features.f3_desc,
      icon: Bot,
      badge: isBn ? 'সহানুভূতিশীল চ্যাটবট' : 'Compassionate chatbot',
      color: 'from-purple-500 to-indigo-600',
      bgLight: 'bg-purple-50 dark:bg-purple-950/40',
      border: 'border-purple-200 dark:border-purple-800',
    },
    {
      id: 'stress-analysis',
      title: t.features.f4_title,
      desc: t.features.f4_desc,
      icon: Brain,
      badge: isBn ? 'অবজেক্টিভ প্যাটার্ন' : 'Pattern Insights',
      color: 'from-amber-500 to-orange-600',
      bgLight: 'bg-amber-50 dark:bg-amber-950/40',
      border: 'border-amber-200 dark:border-amber-800',
    },
    {
      id: 'journal',
      title: t.features.f5_title,
      desc: t.features.f5_desc,
      icon: BookOpen,
      badge: isBn ? 'ব্যক্তিগত ও এনক্রিপ্টেড' : 'Private & Secure',
      color: 'from-teal-500 to-emerald-600',
      bgLight: 'bg-teal-50 dark:bg-teal-950/40',
      border: 'border-teal-200 dark:border-teal-800',
    },
    {
      id: 'activities',
      title: t.features.f6_title,
      desc: t.features.f6_desc,
      icon: Zap,
      badge: isBn ? '৪-৭-৮ ব্রিদিং ও রিলাক্স' : '4-7-8 Breathing',
      color: 'from-rose-500 to-pink-600',
      bgLight: 'bg-rose-50 dark:bg-rose-950/40',
      border: 'border-rose-200 dark:border-rose-800',
    },
    {
      id: 'reports',
      title: t.features.f7_title,
      desc: t.features.f7_desc,
      icon: BarChart3,
      badge: isBn ? 'সাপ্তাহিক ও মাসিক' : 'Visual Trends',
      color: 'from-sky-500 to-blue-600',
      bgLight: 'bg-sky-50 dark:bg-sky-950/40',
      border: 'border-sky-200 dark:border-sky-800',
    },
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 md:pt-16 pb-12 bg-gradient-to-b from-emerald-50/70 via-[#F8FAF8] to-transparent dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
                {t.hero.title}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-700">
                  {t.hero.titleHighlight}
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl font-normal">
                {t.hero.subtitle}
              </p>

              {/* Slogan Pill */}
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-emerald-200 dark:border-emerald-800 px-3.5 py-2 rounded-xl w-fit">
                <Heart className="w-4 h-4 text-emerald-500 fill-emerald-500" />
                <span>{t.subTagline}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={onGetStarted}
                  className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 flex items-center gap-2 transition hover:-translate-y-0.5"
                >
                  <span>{t.hero.getStarted}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onExploreFeature('assessment')}
                  className="px-6 py-3.5 rounded-xl border-2 border-emerald-600/30 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 font-bold text-sm transition"
                >
                  {t.hero.learnMore}
                </button>
              </div>

              {/* Trust & Ethics Disclaimer */}
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{t.hero.safeNotice}</span>
              </div>
            </div>

            {/* Right Graphic Preview Banner (Matching Page 1/14 visual) */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-3xl blur-xl opacity-20 animate-pulse" />
                <div className="relative rounded-3xl bg-white dark:bg-slate-800 border border-emerald-100 dark:border-slate-700 shadow-2xl p-6 space-y-5">
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <Smile className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-500">{isBn ? 'আজকের অনুভূতি' : 'Today’s Balance'}</div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                          {isBn ? 'সুস্থ ও শান্ত মন' : 'Centered & Peaceful'}
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      92% Optimal
                    </span>
                  </div>

                  {/* Interactive slider simulation */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300">
                      <span>{isBn ? 'মানসিক চাপ স্তর' : 'Stress Index'}</span>
                      <span className="font-bold text-emerald-600">3/10 (Low Calm)</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                      <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full w-[30%] rounded-full transition-all" />
                    </div>
                  </div>

                  {/* Quick Feature highlights inside hero preview */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700">
                      <div className="text-[11px] text-slate-500">{isBn ? 'ঘুমের মান' : 'Sleep Rest'}</div>
                      <div className="text-base font-bold text-slate-900 dark:text-white">7h 45m</div>
                      <div className="text-[10px] text-emerald-600 font-medium">Deep & Refreshing</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700">
                      <div className="text-[11px] text-slate-500">{isBn ? 'সেলফ কেয়ার' : 'Mindful Streak'}</div>
                      <div className="text-base font-bold text-slate-900 dark:text-white">6 Days 🔥</div>
                      <div className="text-[10px] text-teal-600 font-medium">4-7-8 Breathing</div>
                    </div>
                  </div>

                  {/* Prompt Box */}
                  <div className="p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 font-medium">
                      <Bot className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="truncate">{isBn ? 'মাইন্ড অ্যাসিস্ট্যান্ট শুনতে প্রস্তুত' : 'Mind Assistant is ready to listen'}</span>
                    </div>
                    <button
                      onClick={() => onExploreFeature('ai-assistant')}
                      className="px-2.5 py-1 rounded bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 transition"
                    >
                      {isBn ? 'কথা বলুন' : 'Chat'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7 Core Features Section (Page 1 & Page 14) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {t.features.title}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2">
            {t.features.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {featureCards.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.id}
                onClick={() => onExploreFeature(f.id)}
                className={`group cursor-pointer rounded-2xl p-6 bg-white dark:bg-slate-800 border ${f.border} shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${f.color} flex items-center justify-center text-white shadow-md shadow-emerald-500/10`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {f.badge}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
                  <span>{isBn ? 'ফিচারটি ব্যবহার করুন' : 'Explore Feature'}</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How MindCare Works Workflow Section (Page 1 & 15) */}
      <section className="bg-slate-50 dark:bg-slate-800/40 border-y border-slate-200/80 dark:border-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {t.workflow.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              {isBn ? 'তথ্য ইনপুট থেকে মননশীল প্রশান্তি পর্যন্ত সুষম ৪-ধাপের প্রক্রিয়া' : 'From self-reflection to mindful empowerment in 4 simple steps'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs relative">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs mb-3">1</div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-2">{t.workflow.step1_title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">{t.workflow.step1_desc}</p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs relative">
              <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-xs mb-3">2</div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-2">{t.workflow.step2_title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">{t.workflow.step2_desc}</p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs relative">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs mb-3">3</div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-2">{t.workflow.step3_title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">{t.workflow.step3_desc}</p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs relative">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs mb-3">4</div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-2">{t.workflow.step4_title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">{t.workflow.step4_desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose MindCare & Architecture highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Why MindCare */}
          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-emerald-100 dark:border-slate-700 shadow-sm space-y-6">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Heart className="w-6 h-6 text-emerald-600" />
              {t.whyUs.title}
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{t.whyUs.p1}</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{t.whyUs.p2}</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{t.whyUs.p3}</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{t.whyUs.p4}</p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onGetStarted}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md transition"
              >
                {t.hero.getStarted}
              </button>
            </div>
          </div>

          {/* Emergency Crisis Callout Banner */}
          <div className="bg-gradient-to-br from-rose-500 to-rose-700 text-white p-8 rounded-3xl shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <PhoneCall className="w-6 h-6 text-white animate-bounce" />
              </div>
              <div>
                <h4 className="text-xl font-bold">
                  {isBn ? 'জরুরি মানসিক সহায়তা হেল্পলাইন' : 'Immediate Crisis Helpline Directory'}
                </h4>
                <p className="text-xs text-rose-100">
                  {isBn ? 'সার্বক্ষণিক সরকারি ও পেশাদার সেবা বিনামূল্যে পাওয়া যায়' : '24/7 Toll-free professional emotional support is available'}
                </p>
              </div>
            </div>

            <p className="text-xs text-rose-100 leading-relaxed">
              {isBn
                ? 'মানসিক কষ্ট যখন অসহনীয় মনে হয়, তখন একা থাকা সমীচীন নয়। বাংলাদেশ জাতীয় মানসিক স্বাস্থ্য হেল্পলাইন ১৬১২২ অথবা কান পেতে রই ০১৭৭৯৫৫৪৩৯১ নম্বরে সরাসরি যোগাযোগ করুন।'
                : 'When acute distress feels unbearable, speaking with a caring trained specialist can provide vital stabilization. Toll-free support is accessible 24/7.'}
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <a
                href="tel:16122"
                className="px-4 py-2.5 bg-white text-rose-700 rounded-xl font-bold text-xs hover:bg-rose-50 transition shadow"
              >
                {isBn ? '১৬১২২ কল করুন (বাংলাদেশ)' : 'Dial 16122 (Bangladesh)'}
              </a>
              <button
                onClick={onOpenCrisis}
                className="px-4 py-2.5 bg-rose-900/60 hover:bg-rose-900/80 text-white rounded-xl font-bold text-xs transition border border-rose-400/40"
              >
                {isBn ? 'সকল জরুরি হটলাইন দেখুন' : 'View All Helplines'}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
