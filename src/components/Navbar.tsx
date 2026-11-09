import React, { useState } from 'react';
import { 
  Heart, 
  Sparkles, 
  Moon, 
  Sun, 
  Globe, 
  PhoneCall, 
  Menu, 
  X, 
  User as UserIcon, 
  LogOut, 
  Shield, 
  Activity, 
  ClipboardCheck, 
  Bot, 
  BookOpen, 
  BarChart2, 
  Settings as SettingsIcon,
  Flame,
  Lock,
  ChevronDown
} from 'lucide-react';
import { User, Language, Theme } from '../types';
import { translations } from '../data/translations';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  language: Language;
  onToggleLanguage: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  onOpenCrisis: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onOpenAuth,
  onLogout,
  language,
  onToggleLanguage,
  theme,
  onToggleTheme,
  onOpenCrisis,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const t = translations[language];
  const isBn = language === 'bn';

  const navItems = [
    { id: 'home', label: t.nav.home, isPublic: true },
    { id: 'dashboard', label: t.nav.dashboard, requireAuth: true },
    { id: 'assessment', label: t.nav.assessment, requireAuth: true },
    { id: 'screenings', label: t.nav.screenings, requireAuth: true },
    { id: 'ai-assistant', label: t.nav.aiAssistant, requireAuth: true },
    { id: 'stress-analysis', label: t.nav.stressAnalysis, requireAuth: true },
    { id: 'journal', label: t.nav.journal, requireAuth: true },
    { id: 'activities', label: t.nav.activities, requireAuth: true },
    { id: 'education', label: t.nav.education, requireAuth: true },
    { id: 'reports', label: t.nav.reports, requireAuth: true },
    { id: 'professionals', label: t.nav.professionals, isPublic: true },
  ];
  const primaryNavItems = navItems.filter(item =>
    ['home', 'dashboard', 'assessment', 'screenings', 'ai-assistant', 'journal'].includes(item.id)
  );
  const moreNavItems = navItems.filter(item =>
    ['stress-analysis', 'activities', 'education', 'reports', 'professionals'].includes(item.id)
  );
  const selectNavItem = (item: typeof navItems[number]) => {
    const isLocked = item.requireAuth && !currentUser;
    onSelectTab(item.id);
    setMoreMenuOpen(false);
    if (isLocked) onOpenAuth();
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-b border-emerald-100 dark:border-slate-800 transition-colors">
      {/* Top emergency announcement bar */}
      <div className="bg-emerald-700 dark:bg-emerald-950 text-white text-[11px] py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping shrink-0" />
            <span className="font-medium tracking-wide">
              {t.emergencyNotice}
            </span>
          </div>
          <button
            onClick={onOpenCrisis}
            className="flex items-center gap-1.5 font-bold underline hover:text-emerald-200 shrink-0 ml-3"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>{t.getHelpNow}</span>
          </button>
        </div>
      </div>

      {/* Main navigation container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 h-[4.5rem]">
          {/* Brand Logo */}
          <div 
            onClick={() => { onSelectTab('home'); setMobileMenuOpen(false); }}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
              <Heart className="w-5 h-5 fill-white/20" />
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  MindCare
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Wellness
                </span>
              </div>
              <span className="text-[11px] block font-medium text-emerald-700 dark:text-emerald-400 leading-tight">
                {t.tagline}
              </span>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden xl:flex flex-1 items-center justify-center gap-0.5">
            {primaryNavItems.map((item) => {
              const isActive = currentTab === item.id;
              const isLocked = item.requireAuth && !currentUser;
              return (
                <button
                  key={item.id}
                  onClick={() => selectNavItem(item)}
                  className={`px-2.5 py-2 rounded-xl text-[11px] font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{item.label}</span>
                  {isLocked && <Lock className="w-3 h-3 text-slate-400" />}
                </button>
              );
            })}
            <div className="relative">
              <button
                onClick={() => setMoreMenuOpen(open => !open)}
                className={`px-2.5 py-2 rounded-xl text-[11px] font-semibold transition-colors flex items-center gap-1 whitespace-nowrap ${
                  moreNavItems.some(item => currentTab === item.id)
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
                aria-expanded={moreMenuOpen}
              >
                <span>{isBn ? 'আরও' : 'More'}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${moreMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {moreMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5 shadow-xl z-50">
                  {moreNavItems.map(item => {
                    const isLocked = item.requireAuth && !currentUser;
                    return (
                      <button
                        key={item.id}
                        onClick={() => selectNavItem(item)}
                        className={`w-full px-3 py-2.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between ${
                          currentTab === item.id
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        <span>{item.label}</span>
                        {isLocked && <Lock className="w-3 h-3 text-slate-400" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* Action Tools (Language, Dark mode, Auth, Crisis) */}
          <div className="ml-auto flex items-center gap-1.5">
            {(currentUser?.role === 'admin' || currentUser?.role === 'super_admin') && (
              <button
                onClick={() => {
                  onSelectTab('admin');
                  setUserDropdownOpen(false);
                  setMoreMenuOpen(false);
                }}
                className={`hidden lg:inline-flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-[11px] font-bold transition ${
                  currentTab === 'admin'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    : 'border border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-300 dark:hover:bg-amber-950/60'
                }`}
                title={isBn ? 'অ্যাডমিন কন্ট্রোল সেন্টার খুলুন' : 'Open admin control center'}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>{isBn ? 'অ্যাডমিন কন্ট্রোল' : 'Admin Control'}</span>
              </button>
            )}

            {/* Language Switcher */}
            <button
              onClick={onToggleLanguage}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Switch Language (বাংলা / English)"
              aria-label={isBn ? 'Switch to English' : 'বাংলায় পরিবর্তন করুন'}
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isBn ? 'বাংলা' : 'EN'}</span>
            </button>

            {/* Dark / Light Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Toggle Light/Dark Theme"
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* User Account / Profile */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => {
                    setUserDropdownOpen(open => !open);
                    setMoreMenuOpen(false);
                  }}
                  className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/40 hover:bg-emerald-100/50 transition text-xs font-medium"
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                    {(currentUser.name || 'U').charAt(0)}
                  </div>
                  <span className="hidden sm:inline font-semibold text-slate-800 dark:text-slate-100 max-w-[100px] truncate">
                    {(currentUser.name || 'User').split(' ')[0]}
                  </span>
                  {(currentUser.role === 'admin' || currentUser.role === 'super_admin') && (
                    <span className="px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 text-[9px] font-bold">
                      Admin
                    </span>
                  )}
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-fade-in">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                      <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                        {currentUser.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                        <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span>{currentUser.streakDays} {t.dashboard.streak}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => { onSelectTab('dashboard'); setUserDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                    >
                      <Activity className="w-4 h-4 text-emerald-600" />
                      {t.nav.dashboard}
                    </button>

                    <button
                      onClick={() => { onSelectTab('settings'); setUserDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                    >
                      <SettingsIcon className="w-4 h-4 text-slate-500" />
                      {t.nav.settings}
                    </button>

                    {(currentUser.role === 'admin' || currentUser.role === 'super_admin') && (
                      <button
                        onClick={() => { onSelectTab('admin'); setUserDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 flex items-center gap-2"
                      >
                        <Shield className="w-4 h-4 text-amber-600" />
                        {t.nav.admin}
                      </button>
                    )}

                    <div className="border-t border-slate-100 dark:border-slate-700 my-1" />

                    <button
                      onClick={() => { onLogout(); setUserDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      {t.nav.logout}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-sm transition"
              >
                {t.nav.signIn}
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => {
                setMobileMenuOpen(open => !open);
                setUserDropdownOpen(false);
              }}
              className="xl:hidden p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <div
        id="mobile-navigation"
        aria-hidden={!mobileMenuOpen}
        className={`xl:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 space-y-1 overflow-hidden transition-[max-height,opacity,padding] duration-200 ${
          mobileMenuOpen ? 'max-h-[80vh] opacity-100 pt-3 pb-6' : 'max-h-0 opacity-0 py-0 pointer-events-none'
        }`}
      >
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            const isLocked = item.requireAuth && !currentUser;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  setMobileMenuOpen(false);
                  if (isLocked) {
                    onOpenAuth();
                  }
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold flex items-center justify-between ${
                  isActive
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span>{item.label}</span>
                {isLocked && <Lock className="w-3.5 h-3.5 text-slate-400" />}
              </button>
            );
          })}

          {(currentUser?.role === 'admin' || currentUser?.role === 'super_admin') && (
            <button
              onClick={() => {
                onSelectTab('admin');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40"
            >
              {t.nav.admin}
            </button>
          )}

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => {
                onOpenCrisis();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 px-4 bg-rose-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow"
            >
              <PhoneCall className="w-4 h-4" />
              <span>{t.getHelpNow} (16122 / 999)</span>
            </button>
          </div>
      </div>
    </header>
  );
};
