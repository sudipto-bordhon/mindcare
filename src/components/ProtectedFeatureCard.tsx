import React from 'react';
import { Lock, ArrowRight, ShieldCheck, Heart, User } from 'lucide-react';
import { Language } from '../types';

interface ProtectedFeatureCardProps {
  featureName: string;
  onOpenAuth: () => void;
  language: Language;
}

export const ProtectedFeatureCard: React.FC<ProtectedFeatureCardProps> = ({
  featureName,
  onOpenAuth,
  language,
}) => {
  const isBn = language === 'bn';

  return (
    <div className="max-w-xl mx-auto my-12 p-8 bg-white dark:bg-slate-800 rounded-3xl border border-emerald-100 dark:border-slate-700 shadow-xl text-center space-y-6 animate-fade-in">
      <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
        <Lock className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{isBn ? 'ব্যক্তিগত ও সুরক্ষিত ফিচার' : 'Protected Member Sanctuary'}</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">
          {featureName}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          {isBn
            ? 'আপনার মানসিক সুস্থতা ও ব্যক্তিগত তথ্য নিরাপদ ও এনক্রিপ্ট রাখতে এই ফিচারটি শুধুমাত্র লগইন করা সদস্যদের জন্য উন্মুক্ত।'
            : 'To ensure your personal reflections and wellness tracking remain confidential and encrypted, sign in is required to access this feature.'}
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 max-w-sm mx-auto">
        <p className="font-semibold text-slate-800 dark:text-slate-200">
          {isBn ? 'লগইন ছাড়া যেসব দেখা যাবে:' : 'Publicly accessible without login:'}
        </p>
        <p className="mt-1">
          {isBn ? 'হোম পেজ • জরুরি হটলাইন ও ডাক্তার ডিরেক্টরি' : 'Home Overview • Emergency Helplines & Doctors'}
        </p>
      </div>

      <div className="pt-2">
        <button
          onClick={onOpenAuth}
          className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 mx-auto transition hover:-translate-y-0.5"
        >
          <User className="w-4 h-4" />
          <span>{isBn ? 'লগইন বা সাইন আপ করুন' : 'Sign In or Create Account'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
