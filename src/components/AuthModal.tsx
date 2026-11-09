import React, { useState, useEffect } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  User as UserIcon, 
  ShieldCheck, 
  Sparkles, 
  AlertCircle,
  CheckCircle,
  Database,
  Key,
  Copy,
  Check
} from 'lucide-react';
import { User, Language, AgeBand } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  language: Language;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  language,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [ageBand, setAgeBand] = useState<AgeBand>('adult');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const isBn = language === 'bn';

  // Prevent background body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const demoAccounts = [
 /*    {
      name: 'Sudipto Bordhon',
      email: 'sudipto@mindcare.app',
      password: 'mindcare123',
      role: 'Regular User',
      badge: isBn ? 'রেগুলার মেম্বার' : 'Regular Member',
    },
    {
      name: 'Dr. Farhana Rahman',
      email: 'farhana@mindcare.app',
      password: 'admin123',
      role: 'Admin / Counselor',
      badge: isBn ? 'অ্যাডমিন এক্সেস' : 'Admin Role',
    } */
  ];

  const handleAutofill = (accEmail: string, accPass: string) => {
    setEmail(accEmail);
    setPassword(accPass);
    setMode('signin');
    setErrorMessage(null);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);

    if (mode === 'forgot') {
      setInfoMessage(
        isBn
          ? 'পাসওয়ার্ড রিকভারি নির্দেশিকা আপনার ইমেইলে পাঠানো হয়েছে।'
          : 'Password recovery guidelines sent to your email.'
      );
      setTimeout(() => setMode('signin'), 2000);
      return;
    }

    if (mode === 'signup' && !agreedToTerms) {
      setErrorMessage(
        isBn 
          ? 'অনুগ্রহ করে নিচে মানসিক সুস্থতা নির্দেশিকা ও গোপনীয়তা শর্তাবলীতে সম্মতি দিন।' 
          : 'Please agree to non-diagnostic wellness terms and privacy policy.'
      );
      return;
    }

    setLoading(true);

    try {
      const endpoint = mode === 'signup' ? '/api/auth/register' : '/api/auth/login';
      const payload = mode === 'signup' 
        ? { name: name.trim(), email: email.trim(), password: password.trim(), ageBand, preferredLanguage: language }
        : { email: email.trim(), password: password.trim() };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const responseText = await response.text();
      let data: { error?: string; user?: User };
      try {
        data = JSON.parse(responseText) as { error?: string; user?: User };
      } catch {
        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          throw new Error(
            isBn
              ? 'লগইন সার্ভার থেকে JSON উত্তর পাওয়া যায়নি। API সার্ভার চালু আছে কি না যাচাই করে আবার চেষ্টা করুন।'
              : 'The login server returned a webpage instead of a JSON response. Check that the API server is running and try again.'
          );
        }
        throw new Error(
          isBn
            ? 'লগইন সার্ভারের উত্তরটি পড়া যায়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।'
            : 'The login server returned an unreadable response. Please try again shortly.'
        );
      }

      if (!response.ok) {
        throw new Error(data.error || (isBn ? 'অথেনটিকেশন ব্যর্থ হয়েছে।' : 'Authentication failed.'));
      }

      if (data.user) {
        onLoginSuccess(data.user);
        onClose();
      }
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : (isBn ? 'সংযোগ সমস্যা হয়েছে।' : 'Network connection error.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-md overflow-y-auto">
      {/* Modal card container with inner scroll */}
      <div className="relative w-full max-w-md my-auto bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-emerald-100 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden animate-fade-in">
        
        {/* Header - Fixed top */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-5 sm:p-6 text-white text-center relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-emerald-100 hover:text-white p-1 rounded-full transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 mx-auto mb-2 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">MindCare</h2>
          <p className="text-xs text-emerald-100 mt-0.5">
            {isBn ? 'আপনার ব্যক্তিগত মানসিক সুস্থতা পোর্টাল' : 'Confidential Mental Wellness Sanctuary'}
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-semibold">
            <Database className="w-3 h-3 text-emerald-200" />
            
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-5 sm:p-6 space-y-5 text-xs">
          
          {/* Demo Credentials Box */}
{/*           <div className="bg-emerald-50/80 dark:bg-emerald-950/50 p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5 text-xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                
              </span>
            </div>

            <div className="space-y-2">
               {demoAccounts.map((acc, idx) => (
                <div 
                  key={idx}
                  className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900 flex items-center justify-between gap-2 shadow-2xs hover:border-emerald-400 transition"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 truncate">
                      <span>{acc.name}</span>
                      <span className="px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[9px] font-semibold shrink-0">
                        {acc.badge}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">
                      {acc.email} • Pass: <span className="font-bold text-emerald-700 dark:text-emerald-400">{acc.password}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAutofill(acc.email, acc.password)}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] shrink-0 transition"
                  >
                    {isBn ? 'ব্যবহার করুন' : 'Autofill'}
                  </button>
                </div>
              ))} 
            </div>
          </div> */}

          {/* Mode Switcher Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => { setMode('signin'); setErrorMessage(null); }}
              className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition ${
                mode === 'signin'
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-slate-50/50 dark:bg-slate-800/50'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {isBn ? 'লগইন' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setErrorMessage(null); }}
              className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition ${
                mode === 'signup'
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-slate-50/50 dark:bg-slate-800/50'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {isBn ? 'নতুন রেজিস্ট্রেশন' : 'Sign Up'}
            </button>
          </div>

          {/* Error & Info Feedback */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 rounded-xl border border-rose-200 dark:border-rose-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {infoMessage && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded-xl border border-blue-200 dark:border-blue-900 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 text-blue-600" />
              <span>{infoMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? 'আপনার পূর্ণ নাম' : 'Full Name'}
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={isBn ? 'নাম লিখুন...' : 'Enter your name...'}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'ইমেইল ঠিকানা' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    {isBn ? 'পাসওয়ার্ড' : 'Password'}
                  </label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      {isBn ? 'ভুলে গেছেন?' : 'Forgot?'}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                  />
                </div>
              </div>
            )}

            {/* Age Band Selection on Sign Up */}
            {mode === 'signup' && (
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? 'বয়স সীমা (বয়সোপযোগী সুরক্ষার জন্য)' : 'Age Group (For safeguarding policy)'}
                </label>
                <select
                  value={ageBand}
                  onChange={(e) => setAgeBand(e.target.value as AgeBand)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                >
                  <option value="child_teen">{isBn ? 'শিশু / কিশোর (১৮ বছরের নিচে)' : 'Child / Teen (<18 - Guardian Safeguards)'}</option>
                  <option value="young_adult">{isBn ? 'তরুণ প্রাপ্তবয়স্ক (১৮ - ২৪ বছর)' : 'Young Adult (18 - 24 years)'}</option>
                  <option value="adult">{isBn ? 'প্রাপ্তবয়স্ক (২৫ - ৫৯ বছর)' : 'Adult (25 - 59 years)'}</option>
                  <option value="senior">{isBn ? 'প্রবীণ (৬০+ বছর)' : 'Senior (60+ years)'}</option>
                </select>
              </div>
            )}

            {mode === 'signup' && (
              <label className="flex items-start gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
                  {isBn
                    ? 'আমি স্বীকার করছি যে MindCare একটি সুস্থতা সহায়তা প্ল্যাটফর্ম, কোনো ডাক্তারি রোগ নির্ণয়কারী সেবা নয়। আমি সম্মতি ও গোপনীয়তা শর্তে রাজি।'
                    : 'I acknowledge that MindCare is an evidence-informed self-care platform, not a medical diagnosis or emergency service.'}
                </span>
              </label>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 ${
                loading ? 'opacity-70 cursor-wait' : 'hover:-translate-y-0.5'
              }`}
            >
              {loading && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              <span>
                {mode === 'signin' 
                  ? (isBn ? 'লগইন করুন' : 'Sign In to Dashboard') 
                  : mode === 'signup' 
                  ? (isBn ? 'অ্যাকাউন্ট তৈরি করুন (MongoDB)' : 'Create Account (MongoDB)') 
                  : (isBn ? 'রিসেট লিংক পাঠান' : 'Send Reset Link')}
              </span>
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-slate-800/80 px-6 py-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 text-center shrink-0">
          {isBn ? 'সুরক্ষিত ডেটাবেস • গোপনীয়তা প্রথম' : 'Encrypted & Secure • Privacy First'}
        </div>
      </div>
    </div>
  );
};
