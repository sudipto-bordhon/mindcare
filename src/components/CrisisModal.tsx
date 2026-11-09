import React from 'react';
import { Phone, HeartHandshake, ShieldAlert, X, ExternalLink } from 'lucide-react';
import { Language } from '../types';

interface CrisisModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const CrisisModal: React.FC<CrisisModalProps> = ({ isOpen, onClose, language }) => {
  if (!isOpen) return null;

  const isBn = language === 'bn';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-rose-200 dark:border-rose-900 overflow-hidden flex flex-col">
        {/* Urgent header */}
        <div className="bg-rose-500 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
            <div>
              <h3 className="font-bold text-lg">
                {isBn ? 'আপনার পাশে আমরা আছি • জরুরি সহায়তা' : 'You Are Not Alone • Immediate Crisis Support'}
              </h3>
              <p className="text-xs text-rose-100">
                {isBn ? 'অনুগ্রহ করে একা থাকবেন না, মানুষের সহায়তা এখনই প্রস্তুত' : 'Please connect with someone who can support you right now'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-rose-100 hover:text-white p-1 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-slate-700 dark:text-slate-200 overflow-y-auto overscroll-contain">
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-sm flex gap-3">
            <HeartHandshake className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-900 dark:text-amber-200">
                {isBn 
                  ? 'কঠিন অনুভূতিগুলোর মধ্য দিয়ে একা একা যাওয়া খুবই কষ্টকর। পেশাদার মানসিক স্বাস্থ্য কর্মী বা কোনো বিশ্বস্ত আপনজনের সাথে কথা বললে তাৎক্ষণিক স্বস্তি মিলতে পারে।'
                  : 'Navigating overwhelming distress alone is painful. Speaking with a compassionate professional or someone you trust can bring grounding and relief.'}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {isBn ? 'বাংলাদেশ জরুরি হেল্পলাইন (সরাসরি কলযোগ্য)' : 'Bangladesh Crisis & Emergency Helplines'}
            </h4>

            {/* 16122 Helpline */}
            <a 
              href="tel:16122"
              className="flex items-center justify-between p-3.5 bg-emerald-50 hover:bg-emerald-100/80 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 rounded-xl border border-emerald-200 dark:border-emerald-800 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-emerald-950 dark:text-emerald-100 text-sm">
                    {isBn ? 'জাতীয় মানসিক স্বাস্থ্য হেল্পলাইন (১৬১২২)' : 'National Mental Health Helpline (16122)'}
                  </div>
                  <div className="text-xs text-emerald-700 dark:text-emerald-300">
                    {isBn ? 'সরকারি বিনামূল্যে ২৪ ঘণ্টা সেবা • NIMH & স্বাস্থ্য অধিদপ্তর' : 'Govt. Toll-Free 24/7 Professional Counseling • NIMH'}
                  </div>
                </div>
              </div>
              <span className="text-xs bg-emerald-600 text-white font-medium px-2.5 py-1 rounded-full group-hover:scale-105 transition-transform">
                {isBn ? 'কল করুন: ১৬১২২' : 'Dial: 16122'}
              </span>
            </a>

            {/* Kaan Pete Roi */}
            <a 
              href="tel:+8801779554391"
              className="flex items-center justify-between p-3.5 bg-blue-50 hover:bg-blue-100/80 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 rounded-xl border border-blue-200 dark:border-blue-800 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-blue-950 dark:text-blue-100 text-sm">
                    {isBn ? 'কান পেতে রই (ইমোশনাল সাপোর্ট)' : 'Kaan Pete Roi (Emotional Support Helpline)'}
                  </div>
                  <div className="text-xs text-blue-700 dark:text-blue-300">
                    {isBn ? 'সহানুভূতিশীল গোপন শ্রবণ সেবা • ০১৭৭৯৫৫৪৩৯১' : 'Confidential active listening & emotional relief'}
                  </div>
                </div>
              </div>
              <span className="text-xs bg-blue-600 text-white font-medium px-2.5 py-1 rounded-full group-hover:scale-105 transition-transform">
                {isBn ? 'কল করুন' : 'Call Now'}
              </span>
            </a>

            {/* 999 */}
            <a 
              href="tel:999"
              className="flex items-center justify-between p-3.5 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 rounded-xl border border-slate-200 dark:border-slate-700 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                    {isBn ? 'জাতীয় জরুরি সেবা (৯৯৯)' : 'National Emergency Service (999)'}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    {isBn ? 'অ্যাম্বুলেন্স ও পুলিশ জরুরি সেবা' : 'Immediate emergency dispatch & ambulance'}
                  </div>
                </div>
              </div>
              <span className="text-xs bg-slate-800 text-white font-medium px-2.5 py-1 rounded-full group-hover:scale-105 transition-transform">
                {isBn ? 'কল ৯৯৯' : 'Dial 999'}
              </span>
            </a>
          </div>

          {/* Calming ground tip */}
          <div className="text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-3">
            <p>
              {isBn 
                ? 'আন্তর্জাতিক ব্যবহারকারী: যুক্তরাষ্ট্রে ৯৮৮ নম্বরে কল বা 741741 এ HOME লিখে এসএমএস করতে পারেন।'
                : 'International users: in the US/Canada dial 988 or text HOME to 741741 for free 24/7 crisis support.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-slate-800/80 px-6 py-3 flex justify-between items-center border-t border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {isBn ? 'মাইন্ডকেয়ার সুরক্ষা প্রোটোকল' : 'MindCare Safety Governance'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition"
          >
            {isBn ? 'বন্ধ করুন' : 'Dismiss'}
          </button>
        </div>
      </div>
    </div>
  );
};
