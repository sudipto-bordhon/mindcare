import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  ShieldCheck, 
  User as UserIcon, 
  Lock, 
  Download, 
  Trash2, 
  AlertTriangle, 
  Check, 
  Sparkles,
  Info
} from 'lucide-react';
import { User, ConsentSettings, Language, AgeBand } from '../types';
import { translations } from '../data/translations';

interface SettingsViewProps {
  currentUser: User | null;
  consent: ConsentSettings;
  onUpdateConsent: (updated: Partial<ConsentSettings>) => void;
  onUpdateUser: (updatedUser: Partial<User>) => void;
  onDeleteAccount: () => void;
  onExportAllData: () => void;
  language: Language;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  consent,
  onUpdateConsent,
  onUpdateUser,
  onDeleteAccount,
  onExportAllData,
  language,
}) => {
  const t = translations[language];
  const isBn = language === 'bn';

  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [ageBand, setAgeBand] = useState<AgeBand>(currentUser?.ageBand || 'adult');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showDeletePrompt, setShowDeletePrompt] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      name,
      email,
      ageBand,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Title */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold">
          <SettingsIcon className="w-3.5 h-3.5" />
          <span>{isBn ? 'গোপনীয়তা ও ডেটা অধিকার' : 'Section 6 & 7 Governance'}</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          {t.settings.title}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {t.settings.subtitle}
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-xs font-bold text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{isBn ? 'প্রোফাইল তথ্য সফলভাবে সংরক্ষিত হয়েছে।' : 'Profile settings saved successfully.'}</span>
        </div>
      )}

      {/* Section 1: Profile & Age Safeguarding Policy (Master Prompt Section 4) */}
      <form onSubmit={handleSaveProfile} className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
          <UserIcon className="w-5 h-5 text-emerald-600" />
          <h2 className="font-bold text-base text-slate-900 dark:text-white">
            {t.settings.profileSection}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t.settings.name}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t.settings.email}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t.settings.ageBand}
            </label>
            <select
              value={ageBand}
              onChange={(e) => setAgeBand(e.target.value as AgeBand)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500"
            >
              <option value="child_teen">{isBn ? 'শিশু / কিশোর (১৮ বছরের নিচে - বিশেষ সুরক্ষা)' : 'Child / Teen (<18 - Guardian Safeguards)'}</option>
              <option value="young_adult">{isBn ? 'তরুণ প্রাপ্তবয়স্ক (১৮ - ২৪ বছর)' : 'Young Adult (18 - 24 years)'}</option>
              <option value="adult">{isBn ? 'প্রাপ্তবয়স্ক (২৫ - ৫৯ বছর)' : 'Adult (25 - 59 years)'}</option>
              <option value="senior">{isBn ? 'প্রবীণ (৬০+ বছর)' : 'Senior (60+ years)'}</option>
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              {t.settings.ageNotice}
            </p>
          </div>
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition"
        >
          {t.settings.saveSettings}
        </button>
      </form>

      {/* Section 2: Chatbot & Consent Governance */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
          <ShieldCheck className="w-5 h-5 text-purple-600" />
          <h2 className="font-bold text-base text-slate-900 dark:text-white">
            {t.settings.privacySection}
          </h2>
        </div>

        <div className="space-y-4">
          {/* Chatbot Memory Consent */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-4">
            <div>
              <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                {t.settings.aiMemory}
              </div>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                {t.settings.aiMemoryDesc}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
              <input
                type="checkbox"
                checked={consent.aiMemoryConsent}
                onChange={(e) => onUpdateConsent({ aiMemoryConsent: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
            </label>
          </div>

          {/* Journal Analysis Consent (Separate, never bundled) */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-4">
            <div>
              <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                {t.settings.journalConsent}
              </div>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                {t.settings.journalConsentDesc}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
              <input
                type="checkbox"
                checked={consent.journalAnalysisConsent}
                onChange={(e) => onUpdateConsent({ journalAnalysisConsent: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
            </label>
          </div>
        </div>
      </div>

      {/* Section 3: Data Management & Export / Deletion (Section 7) */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
          <Lock className="w-5 h-5 text-blue-600" />
          <h2 className="font-bold text-base text-slate-900 dark:text-white">
            {t.settings.dataManagement}
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={onExportAllData}
            className="flex-1 py-3 px-4 rounded-2xl border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-2 transition"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>{t.settings.downloadData}</span>
          </button>

          {!showDeletePrompt ? (
            <button
              onClick={() => setShowDeletePrompt(true)}
              className="py-3 px-4 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/30 hover:bg-rose-100 text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center justify-center gap-2 transition"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>{t.settings.deleteAccount}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/80 p-2.5 rounded-2xl border border-rose-300 dark:border-rose-800 animate-fade-in">
              <span className="text-[11px] font-bold text-rose-800 dark:text-rose-200">{isBn ? 'স্থায়ীভাবে সব মুছে ফেলবেন?' : 'Erase all data permanently?'}</span>
              <button
                onClick={() => {
                  setShowDeletePrompt(false);
                  onDeleteAccount();
                }}
                className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs"
              >
                {isBn ? 'হ্যাঁ, মুছুন' : 'Confirm'}
              </button>
              <button
                onClick={() => setShowDeletePrompt(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
