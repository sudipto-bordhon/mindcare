import React, { useState, useEffect } from 'react';
import { 
  User, 
  Language, 
  Theme, 
  ConsentSettings, 
  CheckIn, 
  JournalEntry, 
  ScreeningAttempt 
} from './types';
import { 
  DEMO_USERS, 
  DEFAULT_CONSENT, 
  INITIAL_CHECKINS, 
  INITIAL_JOURNAL_ENTRIES, 
  INITIAL_SCREENINGS 
} from './data/initialData';
import { translations } from './data/translations';

// Components
import { Navbar } from './components/Navbar';
import { CrisisModal } from './components/CrisisModal';
import { AuthModal } from './components/AuthModal';
import { ProtectedFeatureCard } from './components/ProtectedFeatureCard';

// Views
import { LandingView } from './views/LandingView';
import { DashboardView } from './views/DashboardView';
import { MindStatusAssessmentView } from './views/MindStatusAssessmentView';
import { ScreeningToolsView } from './views/ScreeningToolsView';
import { AIAssistantView } from './views/AIAssistantView';
import { StressAnalysisView } from './views/StressAnalysisView';
import { JournalView } from './views/JournalView';
import { MindCareActivitiesView } from './views/MindCareActivitiesView';
import { WellnessProgressReportView } from './views/WellnessProgressReportView';
import { ProfessionalDirectoryView } from './views/ProfessionalDirectoryView';
import { SettingsView } from './views/SettingsView';
import { AdminPanelView } from './views/AdminPanelView';
import { EducationView } from './views/EducationView';

import { Heart, ShieldCheck, PhoneCall, Globe } from 'lucide-react';

export default function App() {
  // App state with defensive local persistence
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('mindcare_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [language, setLanguage] = useState<Language>(() => {
    try {
      return (localStorage.getItem('mindcare_lang') as Language) || 'bn';
    } catch {
      return 'bn';
    }
  });

  const [theme, setTheme] = useState<Theme>(() => {
    try {
      return (localStorage.getItem('mindcare_theme') as Theme) || 'light';
    } catch {
      return 'light';
    }
  });

  const [currentTab, setCurrentTab] = useState<string>(() => {
    try {
      const savedUser = localStorage.getItem('mindcare_user');
      const savedTab = localStorage.getItem('mindcare_current_tab');
      if (!savedUser) {
        return savedTab === 'professionals' ? 'professionals' : 'home';
      }

      const validTabs = [
        'home',
        'dashboard',
        'assessment',
        'screenings',
        'ai-assistant',
        'stress-analysis',
        'journal',
        'activities',
        'education',
        'reports',
        'professionals',
        'settings',
        'admin',
      ];
      return savedTab && validTabs.includes(savedTab) ? savedTab : 'dashboard';
    } catch {
      return 'home';
    }
  });
  const [screeningRefreshToken, setScreeningRefreshToken] = useState(0);

  const [consent, setConsent] = useState<ConsentSettings>(() => {
    try {
      const saved = localStorage.getItem('mindcare_consent');
      return saved ? JSON.parse(saved) : DEFAULT_CONSENT;
    } catch {
      return DEFAULT_CONSENT;
    }
  });

  // Calculate streak based strictly on real consecutive check-in dates
  const calculateStreak = (entries: CheckIn[]): number => {
    if (!entries || entries.length === 0) return 0;
    const uniqueDates = Array.from(new Set(entries.map(c => c.date))).sort().reverse();
    if (uniqueDates.length === 0) return 0;

    const today = getLocalDate();
    const yesterday = getLocalDate(Date.now() - 86400000);

    // Streak is only active if the latest check-in is today or yesterday
    if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) {
      return 0;
    }

    let streak = 1;
    let currDate = new Date(uniqueDates[0]);

    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(uniqueDates[i]);
      const diffTime = currDate.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 3600 * 24));
      if (diffDays === 1) {
        streak++;
        currDate = prevDate;
      } else {
        break;
      }
    }
    return streak;
  };

  const getLocalDate = (timestamp = Date.now()): string => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // State initialized clean (empty array for logged in users until they check in or create entries)
  const [checkIns, setCheckIns] = useState<CheckIn[]>(() => {
    try {
      const savedUserStr = localStorage.getItem('mindcare_user');
      const uId = savedUserStr ? JSON.parse(savedUserStr)?.id : null;
      if (uId) {
        const saved = localStorage.getItem(`mindcare_checkins_${uId}`);
        return saved ? JSON.parse(saved) : [];
      }
      return [];
    } catch {
      return [];
    }
  });

  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => {
    try {
      const savedUserStr = localStorage.getItem('mindcare_user');
      const uId = savedUserStr ? JSON.parse(savedUserStr)?.id : null;
      if (uId) {
        const saved = localStorage.getItem(`mindcare_journal_${uId}`);
        return saved ? JSON.parse(saved) : [];
      }
      return [];
    } catch {
      return [];
    }
  });

  const [screenings, setScreenings] = useState<ScreeningAttempt[]>(() => {
    try {
      const savedUserStr = localStorage.getItem('mindcare_user');
      const uId = savedUserStr ? JSON.parse(savedUserStr)?.id : null;
      if (uId) {
        const saved = localStorage.getItem(`mindcare_screenings_${uId}`);
        return saved ? JSON.parse(saved) : [];
      }
      return [];
    } catch {
      return [];
    }
  });

  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Sync theme
  useEffect(() => {
    localStorage.setItem('mindcare_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Sync language
  useEffect(() => {
    localStorage.setItem('mindcare_lang', language);
    if (language === 'bn') {
      document.body.classList.add('lang-bn');
    } else {
      document.body.classList.remove('lang-bn');
    }
  }, [language]);

  // When currentUser changes, reload their personal data and sync streak
  useEffect(() => {
    if (currentUser?.id) {
      localStorage.setItem('mindcare_user', JSON.stringify(currentUser));
      try {
        const uId = currentUser.id;
        const savedChk = localStorage.getItem(`mindcare_checkins_${uId}`);
        const userCheckIns: CheckIn[] = savedChk ? JSON.parse(savedChk) : [];
        setCheckIns(userCheckIns);

        const savedJrn = localStorage.getItem(`mindcare_journal_${uId}`);
        setJournalEntries(savedJrn ? JSON.parse(savedJrn) : []);

        const savedScr = localStorage.getItem(`mindcare_screenings_${uId}`);
        setScreenings(savedScr ? JSON.parse(savedScr) : []);

        // Real streak calculation
        const realStreak = calculateStreak(userCheckIns);
        if (currentUser.streakDays !== realStreak) {
          setCurrentUser(prev => prev ? { ...prev, streakDays: realStreak } : null);
        }
      } catch {
        setCheckIns([]);
        setJournalEntries([]);
        setScreenings([]);
      }
    } else {
      localStorage.removeItem('mindcare_user');
      setCheckIns([]);
      setJournalEntries([]);
      setScreenings([]);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    localStorage.setItem('mindcare_consent', JSON.stringify(consent));
  }, [consent]);

  useEffect(() => {
    localStorage.setItem('mindcare_current_tab', currentTab);
  }, [currentTab]);

  // Persist data under user-specific storage keys
  useEffect(() => {
    if (currentUser?.id) {
      localStorage.setItem(`mindcare_checkins_${currentUser.id}`, JSON.stringify(checkIns));
    }
  }, [checkIns, currentUser?.id]);

  useEffect(() => {
    if (currentUser?.id) {
      localStorage.setItem(`mindcare_journal_${currentUser.id}`, JSON.stringify(journalEntries));
    }
  }, [journalEntries, currentUser?.id]);

  useEffect(() => {
    if (currentUser?.id) {
      localStorage.setItem(`mindcare_screenings_${currentUser.id}`, JSON.stringify(screenings));
    }
  }, [screenings, currentUser?.id]);

  // Toggle helpers
  const handleToggleLanguage = () => {
    setLanguage(l => l === 'bn' ? 'en' : 'bn');
  };

  const handleToggleTheme = () => {
    setTheme(t => t === 'light' ? 'dark' : 'light');
  };

  const handleLoginSuccess = (user: User) => {
    // Load existing user records or start completely fresh
    const uId = user.id;
    let userChk: CheckIn[] = [];
    try {
      const savedChk = localStorage.getItem(`mindcare_checkins_${uId}`);
      userChk = savedChk ? JSON.parse(savedChk) : [];
    } catch {
      userChk = [];
    }
    const realStreak = calculateStreak(userChk);
    const updatedUser = { ...user, streakDays: realStreak };

    setCurrentUser(updatedUser);
    setCheckIns(userChk);
    try {
      const savedJrn = localStorage.getItem(`mindcare_journal_${uId}`);
      setJournalEntries(savedJrn ? JSON.parse(savedJrn) : []);
      const savedScr = localStorage.getItem(`mindcare_screenings_${uId}`);
      setScreenings(savedScr ? JSON.parse(savedScr) : []);
    } catch {
      setJournalEntries([]);
      setScreenings([]);
    }

    const isAdmin = user.role === 'admin' || user.role === 'super_admin';
    const destination = currentTab === 'home' || (currentTab === 'admin' && !isAdmin)
      ? (isAdmin ? 'admin' : 'dashboard')
      : currentTab;
    setCurrentTab(destination);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCheckIns([]);
    setJournalEntries([]);
    setScreenings([]);
    setCurrentTab('home');
  };

  // Check-in save handler - updates streak dynamically based on real dates
  const handleSaveCheckIn = (newChk: Omit<CheckIn, 'id'>) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    const now = new Date().toISOString();
    const userId = currentUser?.id || 'guest';
    const existing = checkIns.find(checkIn => checkIn.userId === userId && checkIn.date === newChk.date);
    const updated = existing
      ? checkIns.map(checkIn => checkIn.id === existing.id
        ? { ...checkIn, ...newChk, userId, updatedAt: now }
        : checkIn)
      : [...checkIns, {
        ...newChk,
        id: 'chk_' + Date.now(),
        userId,
        createdAt: now,
        updatedAt: now,
      }];
    setCheckIns(updated);

    if (currentUser) {
      const realStreak = calculateStreak(updated);
      const updatedUser: User = {
        ...currentUser,
        streakDays: realStreak,
      };
      setCurrentUser(updatedUser);
      localStorage.setItem('mindcare_user', JSON.stringify(updatedUser));
    }
  };

  // Journal handlers
  const handleSaveJournalEntry = (newEntry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    if (journalEntries.length >= 2000) return;
    const created: JournalEntry = {
      ...newEntry,
      id: 'jrn_' + Date.now(),
      userId: currentUser?.id || 'guest',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setJournalEntries(prev => [created, ...prev]);
  };

  const handleDeleteJournalEntry = (id: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setJournalEntries(prev => prev.filter(j => j.id !== id));
  };

  const handleUpdateJournalEntry = (updated: JournalEntry) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setJournalEntries(prev => prev.map(j => j.id === updated.id ? updated : j));
  };

  // Screening handler
  const handleSaveScreening = (attempt: ScreeningAttempt) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setScreenings(prev => {
      if (!attempt.isManualRefresh || !attempt.cycleAnchorDate) {
        return [attempt, ...prev];
      }

      const cycleRecordsRemoved = prev.filter(screening => !(
        screening.instrumentId === attempt.instrumentId
        && (screening.date === attempt.cycleAnchorDate || screening.cycleAnchorDate === attempt.cycleAnchorDate)
      ));
      return [attempt, ...cycleRecordsRemoved];
    });
  };

  // Consent update
  const handleUpdateConsent = (updated: Partial<ConsentSettings>) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setConsent(prev => ({
      ...prev,
      ...updated,
      lastUpdated: new Date().toISOString(),
    }));
  };

  // User profile update
  const handleUpdateUser = (updatedUser: Partial<User>) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setCurrentUser({ ...currentUser, ...updatedUser });
  };

  // Delete account & full reset
  const handleDeleteAccount = () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    try {
      localStorage.clear();
    } catch {
      // ignore
    }
    setCurrentUser(null);
    setCheckIns([]);
    setJournalEntries([]);
    setScreenings([]);
    setCurrentTab('home');
  };

  // Export full archive
  const handleExportAllData = () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    const fullBackup = {
      user: currentUser,
      consent,
      checkIns,
      journalEntries,
      screenings,
      exportDate: new Date().toISOString(),
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `mindcare-complete-backup-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const t = translations[language];
  const isBn = language === 'bn';

  return (
    <div className="min-h-screen bg-[#F2F8F5] dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        language={language}
        onToggleLanguage={handleToggleLanguage}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenCrisis={() => setIsCrisisModalOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {!currentUser && currentTab !== 'home' && currentTab !== 'professionals' && currentTab !== 'admin' && (
          <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-900/60 dark:bg-emerald-950/30 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-medium text-emerald-900 dark:text-emerald-200">
              {isBn
                ? 'আপনি গেস্ট হিসেবে ব্রাউজ করছেন। ব্যক্তিগত তথ্য সংরক্ষণ করতে লগইন করুন।'
                : 'You are browsing as a guest. Sign in to save personal data.'}
            </p>
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="shrink-0 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-700"
            >
              {isBn ? 'লগইন / সাইন আপ' : 'Sign in / Sign up'}
            </button>
          </div>
        )}
        {/* Public Route: Home */}
        {currentTab === 'home' && (
          <LandingView
            language={language}
            onGetStarted={() => {
              if (currentUser) {
                setCurrentTab('dashboard');
              } else {
                setIsAuthModalOpen(true);
              }
            }}
            onExploreFeature={(tab) => {
              setCurrentTab(tab);
            }}
            onOpenCrisis={() => setIsCrisisModalOpen(true)}
          />
        )}

        {/* Public Route: Professionals & Helplines */}
        {currentTab === 'professionals' && (
          <ProfessionalDirectoryView
            language={language}
            onOpenCrisis={() => setIsCrisisModalOpen(true)}
          />
        )}

        {/* Only the administrative console requires authentication just to view it. */}
        {!currentUser && currentTab === 'admin' && (
          <ProtectedFeatureCard
            featureName={isBn ? 'অ্যাডমিন ড্যাশবোর্ড' : 'Administrative Console'}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            language={language}
          />
        )}

        {/* Wellness views are readable without an account; submit actions require sign-in. */}
        {currentTab === 'dashboard' && (
          <DashboardView
            currentUser={currentUser}
            checkIns={checkIns}
            screenings={screenings}
            onNavigate={setCurrentTab}
            onRefreshScreenings={() => {
              setScreeningRefreshToken(token => token + 1);
              setCurrentTab('screenings');
            }}
            language={language}
          />
        )}

        {currentTab === 'assessment' && (
          <MindStatusAssessmentView
            checkIns={checkIns}
            onSaveCheckIn={handleSaveCheckIn}
            language={language}
            userId={currentUser?.id || 'guest'}
            onRequireAuth={() => setIsAuthModalOpen(true)}
          />
        )}

        {currentTab === 'screenings' && (
          <ScreeningToolsView
            screenings={screenings}
            currentUser={currentUser}
            onSaveScreening={handleSaveScreening}
            onOpenCrisis={() => setIsCrisisModalOpen(true)}
            refreshToken={screeningRefreshToken}
            language={language}
            onRequireAuth={() => setIsAuthModalOpen(true)}
          />
        )}

        {currentTab === 'ai-assistant' && (
          <AIAssistantView
            currentUser={currentUser}
            consent={consent}
            onUpdateConsent={handleUpdateConsent}
            language={language}
            onOpenCrisis={() => setIsCrisisModalOpen(true)}
            onRequireAuth={() => setIsAuthModalOpen(true)}
          />
        )}

        {currentTab === 'stress-analysis' && (
          <StressAnalysisView
            checkIns={checkIns}
            screenings={screenings}
            journalEntries={journalEntries}
            consent={consent}
            language={language}
            onNavigate={setCurrentTab}
            onOpenCrisis={() => setIsCrisisModalOpen(true)}
          />
        )}

        {currentTab === 'journal' && (
          <JournalView
            entries={journalEntries}
            consent={consent}
            currentUser={currentUser}
            onSaveEntry={handleSaveJournalEntry}
            onDeleteEntry={handleDeleteJournalEntry}
            onUpdateEntry={handleUpdateJournalEntry}
            language={language}
            onRequireAuth={() => setIsAuthModalOpen(true)}
          />
        )}

        {currentTab === 'activities' && (
          <MindCareActivitiesView
            language={language}
          />
        )}

        {currentTab === 'education' && (
          <EducationView
            language={language}
          />
        )}

        {currentTab === 'reports' && (
          <WellnessProgressReportView
            checkIns={checkIns}
            screenings={screenings}
            language={language}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsView
            currentUser={currentUser}
            consent={consent}
            onUpdateConsent={handleUpdateConsent}
            onUpdateUser={handleUpdateUser}
            onDeleteAccount={handleDeleteAccount}
            onExportAllData={handleExportAllData}
            language={language}
            onRequireAuth={() => setIsAuthModalOpen(true)}
          />
        )}

        {currentUser && (currentUser.role === 'admin' || currentUser.role === 'super_admin') && currentTab === 'admin' && (
          <AdminPanelView
            currentUser={currentUser}
            language={language}
          />
        )}
      </main>

      {/* Footer (Master prompt Section 20) */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                <Heart className="w-4 h-4 fill-white/20" />
              </div>
              <div>
                <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                  MindCare
                </span>
                <span className="text-slate-400 mx-1.5">•</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                  {t.subTagline}
                </span>
              </div>
            </div>

            <div className="text-center text-slate-500 max-w-md">
              {isBn 
                ? 'মাইন্ডকেয়ার একটি সুস্থতা ও সেলফ-কেয়ার সহায়তা প্ল্যাটফর্ম, এটি কোনো ডাক্তারি প্রেসক্রিপশন বা ইমার্জেন্সি সার্ভিস নয়।'
                : 'MindCare is an evidence-informed self-care companion. Non-diagnostic wellness support.'}
            </div>

            <div className="flex items-center gap-4 text-slate-500 font-medium">
              <button onClick={() => setCurrentTab('professionals')} className="hover:text-emerald-600">
                {isBn ? 'জরুরি হেল্পলাইন: ১৬১২২' : 'Helpline: 16122'}
              </button>
              <span>•</span>
              <button onClick={() => setCurrentTab('settings')} className="hover:text-emerald-600">
                {t.nav.settings}
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Crisis Emergency Modal */}
      <CrisisModal
        isOpen={isCrisisModalOpen}
        onClose={() => setIsCrisisModalOpen(false)}
        language={language}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        language={language}
      />
    </div>
  );
}
