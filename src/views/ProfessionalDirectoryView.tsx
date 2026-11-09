import React, { useState } from 'react';
import { 
  Phone, 
  MapPin, 
  CheckCircle, 
  ShieldCheck, 
  Calendar, 
  ExternalLink, 
  AlertTriangle,
  Building,
  HeartHandshake,
  Stethoscope,
  Building2,
  Sparkles,
  X
} from 'lucide-react';
import { ProfessionalContact, Language } from '../types';
import { PROFESSIONAL_DIRECTORY } from '../data/initialData';
import { translations } from '../data/translations';

interface ProfessionalDirectoryViewProps {
  language: Language;
  onOpenCrisis: () => void;
}

export const ProfessionalDirectoryView: React.FC<ProfessionalDirectoryViewProps> = ({
  language,
  onOpenCrisis,
}) => {
  const t = translations[language];
  const isBn = language === 'bn';

  const [activeTab, setActiveTab] = useState<'emergency' | 'all'>('emergency');
  const [futureFeatureNotice, setFutureFeatureNotice] = useState<'specialists' | 'clinics' | null>(null);

  const emergencyContacts = PROFESSIONAL_DIRECTORY.filter(c => c.isEmergencyHelpline);
  const generalContacts = PROFESSIONAL_DIRECTORY.filter(c => !c.isEmergencyHelpline);

  const displayed = activeTab === 'emergency' ? emergencyContacts : PROFESSIONAL_DIRECTORY;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Title */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
          <HeartHandshake className="w-3.5 h-3.5" />
          <span>{isBn ? 'পেশাদার স্বাস্থ্যসেবা নেটওয়ার্ক' : 'Verified Clinical Directory'}</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          {t.professionals.title}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {t.professionals.subtitle}
        </p>
      </div>

      {/* Emergency Callout Box */}
      <div className="bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-bold">
            <Phone className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="font-bold text-sm text-rose-950 dark:text-rose-100">
              {isBn ? 'তীব্র সংকটে অবিলম্বে সাহায্য নিন' : 'In Acute Crisis or Distress?'}
            </div>
            <div className="text-xs text-rose-800 dark:text-rose-300">
              {isBn ? 'জাতীয় মানসিক স্বাস্থ্য হেল্পলাইন ১৬১২২ (টোল-ফ্রি) অথবা কান পেতে রই' : 'Call toll-free 16122 (Bangladesh) or emergency services'}
            </div>
          </div>
        </div>
        <button
          onClick={onOpenCrisis}
          className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-md transition shrink-0"
        >
          {isBn ? 'জরুরি প্রটোকল দেখুন' : 'Open Crisis Support'}
        </button>
      </div>

      {/* Future care options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          {
            id: 'specialists' as const,
            icon: Stethoscope,
            title: isBn ? 'বিশেষজ্ঞ খুঁজুন' : 'Find a Specialist',
            description: isBn ? 'যাচাইকৃত মানসিক স্বাস্থ্য বিশেষজ্ঞদের সাথে যুক্ত হন।' : 'Connect with verified mental-health specialists.',
            accent: 'violet',
          },
          {
            id: 'clinics' as const,
            icon: Building2,
            title: isBn ? 'ক্লিনিক খুঁজুন' : 'Find a Clinic',
            description: isBn ? 'আপনার কাছাকাছি উপযুক্ত ক্লিনিক ও সেবা খুঁজে নিন।' : 'Discover suitable clinics and care services near you.',
            accent: 'cyan',
          },
        ].map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setFutureFeatureNotice(item.id)}
              className={`group flex items-center gap-4 rounded-3xl border p-5 text-left shadow-xs transition hover:-translate-y-0.5 hover:shadow-md ${
                item.accent === 'violet'
                  ? 'border-violet-200 bg-violet-50/80 hover:border-violet-400 dark:border-violet-900 dark:bg-violet-950/30'
                  : 'border-cyan-200 bg-cyan-50/80 hover:border-cyan-400 dark:border-cyan-900 dark:bg-cyan-950/30'
              }`}
            >
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm ${
                item.accent === 'violet' ? 'bg-violet-500' : 'bg-cyan-500'
              }`}>
                <Icon className="h-6 w-6" />
              </span>
              <span className="min-w-0">
                <span className="mb-1 flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white">{item.title}</span>
                  <span className="rounded-full bg-white/80 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-500 dark:bg-slate-800/80 dark:text-slate-300">Soon</span>
                </span>
                <span className="block text-xs leading-5 text-slate-600 dark:text-slate-400">{item.description}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl max-w-sm">
        <button
          onClick={() => setActiveTab('emergency')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'emergency'
              ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          {t.professionals.emergencyTab}
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'all'
              ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          {t.professionals.doctorsTab}
        </button>
      </div>

      {/* Contacts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displayed.map((item) => {
          const name = isBn ? item.nameBn : item.nameEn;
          const title = isBn ? item.titleBn : item.titleEn;
          const specialty = isBn ? item.specialtyBn : item.specialtyEn;
          const loc = isBn ? item.locationBn : item.locationEn;

          return (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col justify-between shadow-xs hover:border-emerald-500 hover:shadow-md transition space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  {item.isEmergencyHelpline ? (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                      {isBn ? 'জরুরি হেল্পলাইন' : 'Crisis Hotline'}
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      {isBn ? 'ক্লিনিক্যাল প্রতিষ্ঠান' : 'Hospital / Clinic'}
                    </span>
                  )}

                  {item.verified && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{t.professionals.verified}</span>
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug">
                    {name}
                  </h3>
                  <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium mt-0.5">
                    {title}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {item.organization}
                  </div>

                  {futureFeatureNotice && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="future-care-title">
                      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900">
                        <button
                          type="button"
                          onClick={() => setFutureFeatureNotice(null)}
                          className="absolute right-4 top-4 z-10 rounded-full bg-white/20 p-2 text-white transition hover:bg-white/30"
                          aria-label={isBn ? 'বন্ধ করুন' : 'Close'}
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <div className="bg-gradient-to-br from-violet-500 via-indigo-500 to-cyan-500 px-6 pb-10 pt-7 text-white">
                          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
                            {futureFeatureNotice === 'specialists' ? <Stethoscope className="h-6 w-6" /> : <Building2 className="h-6 w-6" />}
                          </div>
                          <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/80">{isBn ? 'ভবিষ্যৎ ফিচার' : 'Coming in a future build'}</p>
                          <h2 id="future-care-title" className="mt-1 text-2xl font-black">
                            {futureFeatureNotice === 'specialists'
                              ? (isBn ? 'বিশেষজ্ঞ সেবা' : 'Specialist Care')
                              : (isBn ? 'ক্লিনিক সেবা' : 'Clinic Care')}
                          </h2>
                        </div>
                        <div className="-mt-5 mx-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                          <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                            {isBn
                              ? 'এই সেবাটি MindCare-এর পরবর্তী বিল্ডে যুক্ত হবে। যাচাইকৃত প্রোফাইল, যোগাযোগ, অ্যাপয়েন্টমেন্ট ও নিরাপদ রেফারেলের সুবিধা ধাপে ধাপে আনা হবে।'
                              : 'This service is planned for a future MindCare build. Verified profiles, contact options, appointments, and safe referrals will be introduced in stages.'}
                          </p>
                          <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
                            <Sparkles className="h-4 w-4 shrink-0" />
                            {isBn ? 'জরুরি সহায়তার জন্য ২৪/৭ হেল্পলাইন ব্যবহার করুন।' : 'For urgent support, please use the 24/7 crisis hotlines above.'}
                          </div>
                          <button type="button" onClick={() => setFutureFeatureNotice(null)} className="mt-5 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-700 dark:bg-emerald-600 dark:hover:bg-emerald-500">
                            {isBn ? 'বুঝেছি' : 'Got it'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 space-y-1 text-xs">
                  <div className="text-slate-700 dark:text-slate-300 font-medium">
                    {specialty}
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{loc}</span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400">
                  {isBn ? 'যাচাইয়ের তারিখ:' : 'Verified on:'} {item.verifiedDate}
                </div>
              </div>

              {/* Call Action */}
              <div className="pt-2">
                <a
                  href={`tel:${item.phone.replace(/\s+/g, '')}`}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>
                    {t.professionals.callNow}: {item.phone}
                  </span>
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
