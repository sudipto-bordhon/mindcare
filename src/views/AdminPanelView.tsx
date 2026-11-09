import React, { useEffect, useMemo, useState } from 'react';
import { 
  Shield, 
  Users, 
  Activity, 
  Bot, 
  FileText, 
  Lock, 
  CheckCircle, 
  AlertTriangle, 
  Database, 
  Sliders, 
  Clock,
  EyeOff,
  ClipboardCheck,
  Search,
  RefreshCw,
  UserCheck,
  DatabaseZap,
  TrendingUp,
  ShieldCheck,
  MessageSquare,
  LineChart,
  Trash2,
  Eye,
  EyeOff as EyeOffIcon,
  BookOpen,
  Sparkles,
  Plus,
  Stethoscope,
  Building2,
  X
} from 'lucide-react';
import { User, AuditEvent, JournalEntry, Language, MentalWellnessKnowledge, WellnessActivity, CheckIn, ScreeningAttempt, ChatMessage, ScreeningInstrument } from '../types';
import { DEMO_USERS, INITIAL_AUDIT_LOGS, SCREENING_INSTRUMENTS, WELLNESS_ACTIVITIES } from '../data/initialData';
import { translations } from '../data/translations';

interface AdminPanelViewProps {
  currentUser: User | null;
  language: Language;
}

export const AdminPanelView: React.FC<AdminPanelViewProps> = ({
  currentUser,
  language,
}) => {
  const t = translations[language];
  const isBn = language === 'bn';

  const [activeTab, setActiveTab] = useState<'metrics' | 'users' | 'journal' | 'stress' | 'chats' | 'knowledge' | 'activities' | 'instruments' | 'audit'>('metrics');
  const [futureFeatureNotice, setFutureFeatureNotice] = useState<'specialists' | 'clinics' | null>(null);
  const [allJournalEntries, setAllJournalEntries] = useState<JournalEntry[]>([]);
  const [allCheckIns, setAllCheckIns] = useState<CheckIn[]>([]);
  const [allScreenings, setAllScreenings] = useState<ScreeningAttempt[]>([]);
  const [chatUsers, setChatUsers] = useState<{ user: User; messages: ChatMessage[] }[]>([]);
  const [selectedDataUser, setSelectedDataUser] = useState<string>('all');
  const [userLoadError, setUserLoadError] = useState<string | null>(null);
  const [journalContentVisible, setJournalContentVisible] = useState(false);
  const [privacyNotice, setPrivacyNotice] = useState(false);
  const [managedUsers, setManagedUsers] = useState<User[]>(DEMO_USERS);
  const [activityItems, setActivityItems] = useState<WellnessActivity[]>(() => {
    try {
      const saved = localStorage.getItem('mindcare_custom_activities');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [activityForm, setActivityForm] = useState({
    titleEn: '', titleBn: '', descriptionEn: '', descriptionBn: '', durationMinutes: '5', category: 'mindfulness',
  });
  const [knowledgeCards, setKnowledgeCards] = useState<MentalWellnessKnowledge[]>(() => {
    try {
      const saved = localStorage.getItem('mindcare_wellness_knowledge');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [knowledgeForm, setKnowledgeForm] = useState({
    titleEn: '',
    titleBn: '',
    contentEn: '',
    contentBn: '',
    category: 'Self-care',
  });
  const [knowledgeFormError, setKnowledgeFormError] = useState<string | null>(null);
  const [editingKnowledgeId, setEditingKnowledgeId] = useState<string | null>(null);
  const [instrumentDrafts, setInstrumentDrafts] = useState<ScreeningInstrument[]>(() => {
    try {
      const saved = localStorage.getItem('mindcare_screening_instruments');
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) && parsed.length ? parsed : SCREENING_INSTRUMENTS;
    } catch {
      return SCREENING_INSTRUMENTS;
    }
  });
  const [selectedInstrumentId, setSelectedInstrumentId] = useState<ScreeningInstrument['id']>('phq9');

  useEffect(() => {
    if (currentUser?.role !== 'admin' && currentUser?.role !== 'super_admin') return;
    const journalEntries: JournalEntry[] = [];
    const checkIns: CheckIn[] = [];
    const screenings: ScreeningAttempt[] = [];
    const chats: { user: User; messages: ChatMessage[] }[] = [];
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (!key) continue;
      try {
        const stored = JSON.parse(localStorage.getItem(key) || '[]');
        if (key.startsWith('mindcare_journal_') && Array.isArray(stored)) {
          journalEntries.push(...stored);
        }
        if (key.startsWith('mindcare_checkins_') && Array.isArray(stored)) {
          checkIns.push(...stored);
        }
        if (key.startsWith('mindcare_screenings_') && Array.isArray(stored)) {
          screenings.push(...stored);
        }
        if (key.startsWith('mindcare_chat_') && stored?.messages && Array.isArray(stored.messages)) {
          const userId = key.replace('mindcare_chat_', '');
          const user = managedUsers.find(item => item.id === userId);
          if (user) chats.push({ user, messages: stored.messages });
        }
      } catch {
        console.warn('Unable to read a user activity storage record for admin review.');
      }
    }
    setAllJournalEntries(journalEntries.sort((a, b) => (b.createdAt || b.date).localeCompare(a.createdAt || a.date)));
    setAllCheckIns(checkIns);
    setAllScreenings(screenings);
    setChatUsers(chats);
  }, [currentUser?.role, managedUsers]);

  const adminHeaders = {
    'Content-Type': 'application/json',
    'x-admin-token': currentUser?.adminToken || '',
  };

  const loadManagedUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', { headers: adminHeaders });
      if (!response.ok) throw new Error('Unable to load users');
      const data = await response.json();
      setManagedUsers(Array.isArray(data.users) ? data.users : []);
      setUserLoadError(null);
    } catch {
      setUserLoadError(isBn ? 'ব্যবহারকারীর তালিকা লোড করা যায়নি। আবার চেষ্টা করুন।' : 'Unable to load the live user list. Please try again.');
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'admin' || currentUser?.role === 'super_admin') loadManagedUsers();
  }, [currentUser?.role]);

  const [aiSystemPrompt, setAiSystemPrompt] = useState(
    `You are MindCare's wellness chatbot, an empathetic, supportive, and non-judgmental wellness companion.
Clinical boundaries:
1. NOT a doctor or clinician. Never diagnose or prescribe medication.
2. Low-risk evidence-based relaxation guidance only.
3. Prompt escalation to 16122 / 999 on self-harm indicators.`
  );
  const [promptSaved, setPromptSaved] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const adminStats = useMemo(() => {
    let checkInCount = 0;
    let screeningCount = 0;
    let journalCount = allJournalEntries.length;
    let activeUsers = 0;

    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (!key) continue;
      try {
        if (key.startsWith('mindcare_checkins_')) {
          const records = JSON.parse(localStorage.getItem(key) || '[]');
          if (Array.isArray(records)) {
            checkInCount += records.length;
            if (records.length > 0) activeUsers += 1;
          }
        }
        if (key.startsWith('mindcare_screenings_')) {
          const records = JSON.parse(localStorage.getItem(key) || '[]');
          if (Array.isArray(records)) screeningCount += records.length;
        }
        if (key.startsWith('mindcare_journal_')) {
          const records = JSON.parse(localStorage.getItem(key) || '[]');
          if (Array.isArray(records)) journalCount += records.length;
        }
      } catch {
        // Ignore malformed local records while keeping the dashboard available.
      }
    }

    return {
      users: Math.max(managedUsers.length, activeUsers),
      checkIns: checkInCount,
      screenings: screeningCount,
      journals: journalCount,
    };
  }, [allJournalEntries, managedUsers.length]);

  const getUserRecordCount = (prefix: string, userId: string): number => {
    try {
      const saved = localStorage.getItem(`mindcare_${prefix}_${userId}`);
      const records = saved ? JSON.parse(saved) : [];
      return Array.isArray(records) ? records.length : 0;
    } catch {
      return 0;
    }
  };

  const visibleDemoUsers = managedUsers.filter(user => {
    const query = userSearch.trim().toLowerCase();
    return !query || user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query);
  });
  const visibleJournalEntries = allJournalEntries.filter(entry => selectedDataUser === 'all' || entry.userId === selectedDataUser);
  const visibleCheckIns = allCheckIns.filter(entry => selectedDataUser === 'all' || entry.userId === selectedDataUser);
  const visibleChatUsers = chatUsers.filter(item => selectedDataUser === 'all' || item.user.id === selectedDataUser);

  const getWeeklyStats = (userId: string) => {
    const records = allCheckIns
      .filter(entry => entry.userId === userId)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 7);
    if (!records.length) return { count: 0, stress: null, mood: null, sleep: null };
    return {
      count: records.length,
      stress: Number((records.reduce((sum, entry) => sum + entry.stressLevel, 0) / records.length).toFixed(1)),
      mood: Number((records.reduce((sum, entry) => sum + entry.mood, 0) / records.length).toFixed(1)),
      sleep: Number((records.reduce((sum, entry) => sum + entry.sleepHours, 0) / records.length).toFixed(1)),
    };
  };

  const refreshAdminData = async () => {
    setLastUpdated(new Date());
    window.dispatchEvent(new Event('storage'));
    await loadManagedUsers();
  };

  const handleSavePrompt = () => {
    setPromptSaved(true);
    setTimeout(() => setPromptSaved(false), 2500);
  };

  const handleAddKnowledge = (event: React.FormEvent) => {
    event.preventDefault();
    setKnowledgeFormError(null);
    const titleEn = knowledgeForm.titleEn.trim();
    const titleBn = knowledgeForm.titleBn.trim();
    const contentEn = knowledgeForm.contentEn.trim();
    const contentBn = knowledgeForm.contentBn.trim();

    if ((!titleEn && !titleBn) || (!contentEn && !contentBn)) {
      setKnowledgeFormError(isBn
        ? 'কমপক্ষে একটি শিরোনাম এবং একটি wellness guidance লিখুন।'
        : 'Enter at least one title and one wellness guidance.');
      return;
    }

    const card: MentalWellnessKnowledge = {
      id: editingKnowledgeId || `knowledge_${Date.now()}`,
      titleEn: titleEn || titleBn,
      titleBn: titleBn || titleEn,
      contentEn: contentEn || contentBn,
      contentBn: contentBn || contentEn,
      category: knowledgeForm.category.trim() || 'Self-care',
      createdAt: editingKnowledgeId
        ? knowledgeCards.find(item => item.id === editingKnowledgeId)?.createdAt || new Date().toISOString()
        : new Date().toISOString(),
    };

    const updated = editingKnowledgeId
      ? knowledgeCards.map(item => item.id === editingKnowledgeId ? card : item)
      : [card, ...knowledgeCards];

    try {
      localStorage.setItem('mindcare_wellness_knowledge', JSON.stringify(updated));
      setKnowledgeCards(updated);
      window.dispatchEvent(new Event('mindcare-library-updated'));
      setKnowledgeForm({ titleEn: '', titleBn: '', contentEn: '', contentBn: '', category: 'Self-care' });
      setEditingKnowledgeId(null);
    } catch {
      setKnowledgeFormError(isBn
        ? 'Card সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।'
        : 'The card could not be saved. Please try again.');
    }
  };

  const handleDeleteKnowledge = (id: string) => {
    const updated = knowledgeCards.filter(card => card.id !== id);
    setKnowledgeCards(updated);
    localStorage.setItem('mindcare_wellness_knowledge', JSON.stringify(updated));
    window.dispatchEvent(new Event('mindcare-library-updated'));
  };

  const startKnowledgeEdit = (card: MentalWellnessKnowledge) => {
    setEditingKnowledgeId(card.id);
    setKnowledgeForm({
      titleEn: card.titleEn,
      titleBn: card.titleBn,
      contentEn: card.contentEn,
      contentBn: card.contentBn,
      category: card.category,
    });
  };

  const handleRoleChange = async (user: User, role: User['role']) => {
    const response = await fetch(`/api/admin/users/${user.id}`, {
      method: 'PATCH',
      headers: adminHeaders,
      body: JSON.stringify({ role }),
    });
    if (!response.ok) return;
    await loadManagedUsers();
  };

  const handleDeleteUser = async (user: User) => {
    if (user.id === currentUser?.id || !window.confirm(isBn ? `${user.name}-এর account মুছে ফেলবেন?` : `Delete ${user.name}'s account?`)) return;
    const response = await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE', headers: adminHeaders });
    if (response.ok) {
      ['checkins', 'journal', 'screenings', 'moods'].forEach(type => localStorage.removeItem(`mindcare_${type}_${user.id}`));
      await loadManagedUsers();
    }
  };

  const handleAddActivity = (event: React.FormEvent) => {
    event.preventDefault();
    if (!activityForm.titleEn.trim() || !activityForm.descriptionEn.trim()) return;
    const activity: WellnessActivity = {
      id: `custom_activity_${Date.now()}`,
      titleEn: activityForm.titleEn.trim(),
      titleBn: activityForm.titleBn.trim() || activityForm.titleEn.trim(),
      descriptionEn: activityForm.descriptionEn.trim(),
      descriptionBn: activityForm.descriptionBn.trim() || activityForm.descriptionEn.trim(),
      category: activityForm.category as WellnessActivity['category'],
      durationMinutes: Math.max(1, Number(activityForm.durationMinutes) || 5),
      instructionsEn: ['Find a comfortable position.', 'Practice this activity at your own pace.'],
      instructionsBn: ['আরামদায়ক অবস্থান নিন।', 'নিজের গতিতে অনুশীলন করুন।'],
    };
    const updated = [activity, ...activityItems];
    setActivityItems(updated);
    localStorage.setItem('mindcare_custom_activities', JSON.stringify(updated));
    window.dispatchEvent(new Event('mindcare-library-updated'));
    setActivityForm({ titleEn: '', titleBn: '', descriptionEn: '', descriptionBn: '', durationMinutes: '5', category: 'mindfulness' });
  };

  const handleDeleteActivity = (id: string) => {
    const updated = activityItems.filter(activity => activity.id !== id);
    setActivityItems(updated);
    localStorage.setItem('mindcare_custom_activities', JSON.stringify(updated));
    window.dispatchEvent(new Event('mindcare-library-updated'));
  };

  const updateInstrumentQuestion = (
    instrumentId: ScreeningInstrument['id'],
    questionId: number,
    field: 'textEn' | 'textBn',
    value: string
  ) => {
    setInstrumentDrafts(previous => previous.map(instrument => instrument.id !== instrumentId ? instrument : {
      ...instrument,
      questions: instrument.questions.map(question => question.id === questionId ? { ...question, [field]: value } : question),
    }));
  };

  const addInstrumentQuestion = (instrumentId: ScreeningInstrument['id']) => {
    setInstrumentDrafts(previous => previous.map(instrument => {
      if (instrument.id !== instrumentId) return instrument;
      const nextId = Math.max(0, ...instrument.questions.map(question => question.id)) + 1;
      return {
        ...instrument,
        questions: [...instrument.questions, { id: nextId, textEn: 'New reflection question', textBn: 'নতুন প্রতিফলনমূলক প্রশ্ন' }],
      };
    }));
  };

  const deleteInstrumentQuestion = (instrumentId: ScreeningInstrument['id'], questionId: number) => {
    setInstrumentDrafts(previous => previous.map(instrument => instrument.id !== instrumentId ? instrument : {
      ...instrument,
      questions: instrument.questions.filter(question => question.id !== questionId),
    }));
  };

  const saveInstrumentDrafts = () => {
    localStorage.setItem('mindcare_screening_instruments', JSON.stringify(instrumentDrafts));
    window.dispatchEvent(new Event('storage'));
  };

  const handleDeleteJournalEntry = (entry: JournalEntry) => {
    if (!privacyNotice || !window.confirm(isBn
      ? 'ব্যবহারকারীর স্পষ্ট সম্মতি ছাড়া ব্যক্তিগত journal মুছবেন না। আপনি কি নিশ্চিত?'
      : 'Journal deletion requires documented user consent. Continue?')) return;
    const key = `mindcare_journal_${entry.userId}`;
    try {
      const current = JSON.parse(localStorage.getItem(key) || '[]');
      const updated = Array.isArray(current) ? current.filter((item: JournalEntry) => item.id !== entry.id) : [];
      localStorage.setItem(key, JSON.stringify(updated));
      setAllJournalEntries(items => items.filter(item => item.id !== entry.id));
    } catch {
      console.warn('Unable to delete the selected journal entry.');
    }
  };

  const adminNavItems = [
    { id: 'metrics' as const, label: isBn ? 'ওভারভিউ' : 'Overview', icon: TrendingUp, description: isBn ? 'সিস্টেম সারাংশ' : 'System overview' },
    { id: 'users' as const, label: isBn ? 'ব্যবহারকারী' : 'Users', icon: Users, description: isBn ? 'অ্যাকাউন্ট পরিচালনা' : 'Account management' },
    { id: 'specialists' as const, label: isBn ? 'বিশেষজ্ঞ' : 'Specialists', icon: Stethoscope, description: isBn ? 'ভবিষ্যৎ ফিচার' : 'Future feature' },
    { id: 'clinics' as const, label: isBn ? 'ক্লিনিক' : 'Clinics', icon: Building2, description: isBn ? 'ভবিষ্যৎ ফিচার' : 'Future feature' },
    { id: 'journal' as const, label: isBn ? 'জার্নাল' : 'Journal', icon: FileText, description: isBn ? 'গোপনীয় ডেটা' : 'Private data' },
    { id: 'stress' as const, label: isBn ? 'স্ট্রেস রিপোর্ট' : 'Stress reports', icon: Activity, description: isBn ? 'সাপ্তাহিক ট্রেন্ড' : 'Weekly trends' },
    { id: 'chats' as const, label: isBn ? 'চ্যাটবট চ্যাট' : 'Chatbot chats', icon: MessageSquare, description: isBn ? 'কথোপকথন' : 'Conversations' },
    { id: 'knowledge' as const, label: isBn ? 'জ্ঞান কার্ড' : 'Knowledge', icon: BookOpen, description: isBn ? 'লাইব্রেরি কনটেন্ট' : 'Library content' },
    { id: 'activities' as const, label: isBn ? 'অ্যাক্টিভিটি' : 'Activities', icon: Sparkles, description: isBn ? 'সেল্ফ-কেয়ার' : 'Self-care tools' },
    { id: 'instruments' as const, label: isBn ? 'টেস্ট' : 'Tests', icon: ClipboardCheck, description: isBn ? 'স্ক্রিনিং টুলস' : 'Screening tools' },
    { id: 'audit' as const, label: isBn ? 'অডিট লগ' : 'Audit logs', icon: ShieldCheck, description: isBn ? 'নিরাপত্তা রেকর্ড' : 'Security records' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {futureFeatureNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="future-feature-title">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-800">
            <div className="bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 px-6 pb-10 pt-7 text-white">
              <button type="button" onClick={() => setFutureFeatureNotice(null)} className="absolute right-4 top-4 rounded-full bg-white/20 p-2 transition hover:bg-white/30" aria-label={isBn ? 'বন্ধ করুন' : 'Close'}>
                <X className="h-4 w-4" />
              </button>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
                {futureFeatureNotice === 'specialists' ? <Stethoscope className="h-6 w-6" /> : <Building2 className="h-6 w-6" />}
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/80">{isBn ? 'ভবিষ্যৎ বিল্ড' : 'Future build'}</p>
              <h2 id="future-feature-title" className="mt-1 text-2xl font-black">
                {futureFeatureNotice === 'specialists'
                  ? (isBn ? 'বিশেষজ্ঞ নেটওয়ার্ক' : 'Specialist Network')
                  : (isBn ? 'ক্লিনিক ম্যানেজমেন্ট' : 'Clinic Management')}
              </h2>
            </div>
            <div className="-mt-5 mx-4 rounded-2xl border border-amber-100 bg-white p-5 shadow-lg dark:border-slate-700 dark:bg-slate-800">
              <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                {isBn
                  ? 'এই ফিচারটি MindCare-এর পরবর্তী বিল্ডে যুক্ত হবে। যাচাইকৃত বিশেষজ্ঞ ও ক্লিনিক প্রোফাইল, অ্যাপয়েন্টমেন্ট এবং নিরাপদ রেফারেল ব্যবস্থাপনা এখানে পাওয়া যাবে।'
                  : 'This feature is reserved for a future MindCare build. It will bring verified profiles, appointment workflows, and safe referral management into the admin center.'}
              </p>
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2.5 text-xs font-semibold text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                <Sparkles className="h-4 w-4 shrink-0" />
                {isBn ? 'আপনার বর্তমান ডেটা ও কনফিগারেশন নিরাপদ আছে।' : 'Your current data and configuration remain safe.'}
              </div>
              <button type="button" onClick={() => setFutureFeatureNotice(null)} className="mt-5 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-700 dark:bg-emerald-600 dark:hover:bg-emerald-500">
                {isBn ? 'বুঝেছি' : 'Got it'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Admin Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-bold mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>{isBn ? 'প্রশাসনিক ও ক্লিনিক্যাল সুশাসন' : 'Clinical & Administrative Governance'}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {t.admin.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {t.admin.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            Role: {currentUser?.role || 'Admin'}
          </span>
        </div>
      </div>

      {/* Strict Privacy Pledge Banner (Master Prompt Section 13) */}
      <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3 text-xs text-emerald-900 dark:text-emerald-200">
        <EyeOff className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">{isBn ? 'গোপনীয়তার সাংবিধানিক অঙ্গীকার:' : 'Zero Routine Browse Pledge:'}</span>{' '}
          {t.admin.privacyPledge}
        </div>
      </div>

      {/* Live platform overview */}
      <section className="rounded-3xl bg-slate-900 dark:bg-slate-950 p-5 sm:p-6 text-white shadow-xl shadow-slate-900/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-emerald-300 font-bold">System overview</p>
            <h2 className="text-lg font-extrabold mt-1">{isBn ? 'সিস্টেম পারফরম্যান্স ও ব্যবহার' : 'System performance & usage'}</h2>
          </div>
          <button onClick={refreshAdminData} className="inline-flex items-center gap-2 self-start px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition">
            <RefreshCw className="w-3.5 h-3.5" />
            {isBn ? 'রিফ্রেশ' : 'Refresh data'}
          </button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: t.admin.totalUsers, value: adminStats.users, icon: Users, tone: 'text-emerald-300' },
            { label: t.admin.checkInsLogged, value: adminStats.checkIns, icon: Activity, tone: 'text-cyan-300' },
            { label: t.admin.screeningsDone, value: adminStats.screenings, icon: ClipboardCheck, tone: 'text-blue-300' },
            { label: isBn ? 'জার্নাল এন্ট্রি' : 'Journal entries', value: adminStats.journals, icon: FileText, tone: 'text-violet-300' },
          ].map(({ label, value, icon: Icon, tone }) => (
            <div key={label} className="rounded-2xl bg-white/10 border border-white/10 p-4">
              <Icon className={`w-4 h-4 ${tone}`} />
              <div className="text-2xl font-black mt-3">{value.toLocaleString()}</div>
              <div className="text-[11px] text-slate-300 mt-1">{label}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-slate-300">
          <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /> {isBn ? 'সিস্টেম সচল' : 'All systems operational'}</span>
          <span>{isBn ? 'সর্বশেষ আপডেট' : 'Last updated'} {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <span className="inline-flex items-center gap-1.5"><DatabaseZap className="w-3.5 h-3.5 text-cyan-300" /> {isBn ? 'ডেটা লোকাল-সেফ' : 'Privacy-first storage'}</span>
        </div>
      </section>

      {/* Admin workspace navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-[15rem_minmax(0,1fr)] gap-5 items-start">
        <aside className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 shadow-sm lg:sticky lg:top-24">
          <div className="hidden lg:flex items-center gap-3 px-3 py-3 mb-2 border-b border-slate-100 dark:border-slate-700">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-sm">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-slate-900 dark:text-white">{isBn ? 'অ্যাডমিন কন্ট্রোল' : 'Admin Control'}</p>
              <p className="text-[10px] text-slate-500">{isBn ? 'সিস্টেম পরিচালনা' : 'System workspace'}</p>
            </div>
          </div>
          <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible" aria-label="Admin navigation">
            {adminNavItems.map(item => {
              const Icon = item.icon;
              const isFutureFeature = item.id === 'specialists' || item.id === 'clinics';
              const isActive = activeTab === item.id;
              return (
                <button key={item.id} onClick={() => isFutureFeature ? setFutureFeatureNotice(item.id) : setActiveTab(item.id)} aria-current={isActive ? 'page' : undefined}
                  className={`group shrink-0 lg:w-full flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition ${
                    isActive ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' : isFutureFeature ? 'text-slate-600 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-950/30' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/70'
                  }`}>
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : isFutureFeature ? 'text-amber-500' : 'text-slate-400 group-hover:text-emerald-600'}`} />
                  <span className="min-w-0">
                    <span className="block text-xs font-bold whitespace-nowrap">{item.label}</span>
                    <span className={`hidden lg:block text-[10px] truncate ${isActive ? 'text-emerald-100' : 'text-slate-400'}`}>{item.description}</span>
                  </span>
                  {isFutureFeature && <span className="hidden lg:inline-flex ml-auto rounded-full bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.5 text-[9px] font-bold text-amber-700 dark:text-amber-300">Soon</span>}
                </button>
              );
            })}
          </nav>
          <div className="hidden lg:block mt-3 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-100 dark:border-amber-900/50 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">{isBn ? 'পরবর্তী ধাপ' : 'Coming next'}</p>
            <p className="mt-1 text-[11px] leading-relaxed text-amber-900/70 dark:text-amber-200/70">
              {isBn ? 'বিশেষজ্ঞ ও ক্লিনিক নেটওয়ার্ক শীঘ্রই যুক্ত হবে।' : 'Specialist and clinic network tools are planned for a future release.'}
            </p>
          </div>
        </aside>
        <section className="min-w-0 space-y-6">
      {/* Tabs */}
      <div className="hidden">
        <button
          onClick={() => setActiveTab('metrics')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'metrics'
              ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          {isBn ? 'চ্যাটবট ব্যবস্থাপনা' : 'Chatbot Safety Config'}
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'users'
              ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          {t.admin.userManagement}
        </button>
        <button
          onClick={() => setActiveTab('journal')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'journal'
              ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          {isBn ? 'জার্নাল ডেটা' : 'Journal Data'}
        </button>
        <button
          onClick={() => setActiveTab('stress')}
          className={`flex-1 min-w-[8rem] py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'stress'
              ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          {isBn ? 'স্ট্রেস রিপোর্ট' : 'Stress Reports'}
        </button>
        <button
          onClick={() => setActiveTab('chats')}
          className={`flex-1 min-w-[8rem] py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'chats'
              ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          {isBn ? 'চ্যাটবট চ্যাট' : 'Chatbot Chats'}
        </button>
        <button
          onClick={() => setActiveTab('knowledge')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'knowledge'
              ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          {isBn ? 'ওয়েলনেস জ্ঞান' : 'Wellness Knowledge'}
        </button>
        <button
          onClick={() => setActiveTab('activities')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'activities'
              ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          {isBn ? 'অ্যাক্টিভিটি' : 'Activities'}
        </button>
        <button
          onClick={() => setActiveTab('instruments')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'instruments'
              ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          {isBn ? 'স্ক্রিনিং টুলস' : 'Instruments'}
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'audit'
              ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          {isBn ? 'অডিট লগ' : 'Audit Logs'}
        </button>
      </div>

      {/* Tab 1: Chatbot Safety & System Prompt Configuration */}
      {activeTab === 'metrics' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Bot className="w-5 h-5 text-purple-600" />
                <span>{t.admin.aiConfig}</span>
              </h3>
              <p className="text-xs text-slate-500">
                {isBn ? 'মডেল: gemini-3.8-flash • সার্ভার-সাইড প্রক্সি আর্কিটেকচার' : 'Provider: Gemini 3.8 Flash • Server-side API Proxy'}
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Active & Protected
            </span>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              {isBn ? 'ক্লিনিক্যাল বাউন্ডারি ও সেফটি ইন্সট্রাকশন প্রম্পট' : 'Clinical Boundaries & Safety Guardrail System Instruction'}
            </label>
            <textarea
              rows={5}
              value={aiSystemPrompt}
              onChange={(e) => setAiSystemPrompt(e.target.value)}
              className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {promptSaved && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Prompt updated in memory successfully.</span>
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={handleSavePrompt}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition"
            >
              {isBn ? 'সেফটি প্রম্পট আপডেট করুন' : 'Update Safety Instructions'}
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: User Accounts Management */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">{t.admin.userManagement}</h3>
              <p className="text-xs text-slate-500 mt-1">
                {isBn ? 'অ্যাকাউন্ট, ভূমিকা ও অ্যাক্টিভিটি পর্যবেক্ষণ করুন' : 'Monitor account access, roles, and activity.'}
              </p>
            </div>
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                value={userSearch}
                onChange={event => setUserSearch(event.target.value)}
                placeholder={isBn ? 'নাম বা ইমেইল খুঁজুন' : 'Search name or email'}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              type="button"
              onClick={loadManagedUsers}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 px-3 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              {isBn ? 'ইউজার রিফ্রেশ' : 'Refresh users'}
            </button>
          </div>

          {userLoadError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
              {userLoadError}
            </div>
          )}

          <div className="divide-y divide-slate-100 dark:divide-slate-700 text-xs">
            {visibleDemoUsers.map((usr) => (
              <div key={usr.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">{usr.name}</div>
                  <div className="text-[11px] text-slate-500">{usr.email} • Age Group: {usr.ageBand}</div>
                  <div className="flex flex-wrap gap-2 mt-1 text-[10px] text-slate-400">
                    <span>{getUserRecordCount('checkins', usr.id)} check-ins</span>
                    <span>{getUserRecordCount('screenings', usr.id)} screenings</span>
                    <span>{getUserRecordCount('journal', usr.id)} journal</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 text-[10px] font-bold">
                    Active
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] uppercase font-bold">
                    {usr.role}
                  </span>
                  {usr.id !== currentUser?.id && (
                    <>
                      <select
                        value={usr.role}
                        onChange={event => handleRoleChange(usr, event.target.value as User['role'])}
                        className="rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-1.5 py-1 text-[10px] text-slate-700 dark:text-slate-200"
                        aria-label={`Change role for ${usr.name}`}
                      >
                        <option value="user">User</option>
                        <option value="counselor">Counselor</option>
                        <option value="admin">Admin</option>
                        <option value="super_admin">Super admin</option>
                      </select>
                      <button type="button" onClick={() => handleDeleteUser(usr)} className="text-[10px] font-bold text-rose-600 hover:underline">
                        {isBn ? 'মুছুন' : 'Delete'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
            {visibleDemoUsers.length === 0 && (
              <div className="py-10 text-center text-sm text-slate-500">
                {isBn ? 'কোনো ব্যবহারকারী পাওয়া যায়নি।' : 'No users match your search.'}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'journal' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {isBn ? 'ব্যবহারকারীর জার্নাল ডেটা' : 'User Journal Data'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {isBn ? 'সম্মতি-নিয়ন্ত্রিত অ্যাক্সেস • মোট ' : 'Consent-gated access • Total '}{visibleJournalEntries.length} {isBn ? 'টি এন্ট্রি' : 'entries'}
            </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select value={selectedDataUser} onChange={event => setSelectedDataUser(event.target.value)} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-2.5 py-2 text-xs text-slate-700 dark:text-slate-200">
                <option value="all">{isBn ? 'সব ব্যবহারকারী' : 'All users'}</option>
                {managedUsers.filter(user => user.role !== 'super_admin').map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
              </select>
              <label className="inline-flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                <input type="checkbox" checked={privacyNotice} onChange={event => setPrivacyNotice(event.target.checked)} />
                {isBn ? 'সম্মতি যাচাই করেছি' : 'Consent verified'}
              </label>
              <button type="button" onClick={() => setJournalContentVisible(value => !value)} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 px-2.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                {journalContentVisible ? <EyeOffIcon className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {journalContentVisible ? (isBn ? 'লুকান' : 'Hide content') : (isBn ? 'দেখুন' : 'View content')}
              </button>
            </div>
          </div>
          {!privacyNotice && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200">
              {isBn ? 'গোপনীয়তার কারণে journal content ডিফল্টভাবে লুকানো। ব্যবহারকারীর স্পষ্ট সম্মতি যাচাই করুন।' : 'Journal content is hidden by default. Verify explicit user consent before viewing or deleting.'}
            </div>
          )}
          {visibleJournalEntries.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">{isBn ? 'কোনো জার্নাল ডেটা পাওয়া যায়নি।' : 'No journal data available.'}</p>
          ) : (
            <div className="max-h-[32rem] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
              {visibleJournalEntries.map(entry => (
                <article key={entry.id} className="py-4 space-y-1">
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{entry.title}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500">{entry.createdAt ? new Date(entry.createdAt).toLocaleString() : entry.date}</span>
                      {privacyNotice && <button type="button" onClick={() => handleDeleteJournalEntry(entry)} className="text-rose-600" aria-label="Delete journal entry"><Trash2 className="w-3.5 h-3.5" /></button>}
                    </div>
                  </div>
                  {privacyNotice && journalContentVisible
                    ? <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{entry.content}</p>
                    : <p className="text-xs italic text-slate-400">{isBn ? 'ব্যক্তিগত content hidden' : 'Private content hidden'}</p>}
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400">User: {entry.userId} • Mood: {entry.moodTag}</p>
                </article>
              ))}
            </div>
          )}

        </div>
      )}

      {activeTab === 'stress' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 space-y-5">
          <div className="flex items-start gap-3">
            <LineChart className="w-5 h-5 text-emerald-600 mt-0.5" />
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">{isBn ? 'সাপ্তাহিক স্ট্রেস রিপোর্ট' : 'Weekly stress reports'}</h3>
              <p className="text-xs text-slate-500 mt-1">{isBn ? 'সর্বশেষ ৭টি check-in থেকে সহায়ক trend summary। এটি clinical diagnosis নয়।' : 'Supportive trend summaries from the latest seven check-ins; not a clinical diagnosis.'}</p>
            </div>
          </div>
          <select value={selectedDataUser} onChange={event => setSelectedDataUser(event.target.value)} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-2.5 py-2 text-xs text-slate-700 dark:text-slate-200">
            <option value="all">{isBn ? 'সব ব্যবহারকারী' : 'All users'}</option>
            {managedUsers.filter(user => user.role !== 'super_admin').map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
          </select>
          <div className="grid gap-3">
            {managedUsers.filter(user => user.role !== 'super_admin' && (selectedDataUser === 'all' || user.id === selectedDataUser)).map(user => {
              const stats = getWeeklyStats(user.id);
              return (
                <div key={user.id} className="rounded-2xl bg-slate-50 dark:bg-slate-900 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-sm text-slate-900 dark:text-white">{user.name}</p>
                    <p className="text-[11px] text-slate-500">{stats.count} {isBn ? 'টি check-in' : 'check-ins'} • {isBn ? 'সাপ্তাহিক summary' : 'weekly summary'}</p>
                  </div>
                  <div className="flex gap-4 text-xs">
                    <span className="font-bold text-rose-600">Stress {stats.stress ?? '—'}/10</span>
                    <span className="font-bold text-emerald-600">Mood {stats.mood ?? '—'}/5</span>
                    <span className="font-bold text-blue-600">Sleep {stats.sleep ?? '—'}h</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'chats' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 space-y-5">
          <div className="flex items-start gap-3">
            <MessageSquare className="w-5 h-5 text-purple-600 mt-0.5" />
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">{isBn ? 'Mind Assistant chat management' : 'Mind Assistant chat management'}</h3>
              <p className="text-xs text-slate-500 mt-1">{isBn ? 'Chat content defaultভাবে গোপন থাকে; অনুমোদিত support review-এর জন্য user consent প্রয়োজন।' : 'Conversation content is private by default and requires documented consent for support review.'}</p>
            </div>
          </div>
          <div className="space-y-3">
            {visibleChatUsers.map(({ user, messages }) => (
              <details key={user.id} className="rounded-2xl bg-slate-50 dark:bg-slate-900 p-4">
                <summary className="cursor-pointer flex items-center justify-between text-sm font-bold text-slate-900 dark:text-white">
                  <span>{user.name}</span><span className="text-[11px] text-slate-500">{messages.length} messages</span>
                </summary>
                <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
                  {messages.filter(message => message.id !== 'msg_welcome').map(message => (
                    <p key={message.id} className="rounded-xl bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-700 dark:text-slate-300">
                      <strong>{message.role === 'user' ? 'User' : 'MindCare chatbot'}:</strong> {message.content}
                    </p>
                  ))}
                </div>
              </details>
            ))}
            {visibleChatUsers.length === 0 && <p className="py-8 text-center text-sm text-slate-500">{isBn ? 'কোনো chat history নেই।' : 'No chat history available.'}</p>}
          </div>
        </div>
      )}

      {activeTab === 'knowledge' && (
            <div className="space-y-5">
              <form onSubmit={handleAddKnowledge} className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 space-y-4">
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {editingKnowledgeId
                      ? (isBn ? 'Knowledge card সম্পাদনা করুন' : 'Edit Mental Wellness Knowledge card')
                      : (isBn ? 'নতুন Mental Wellness Knowledge card যোগ করুন' : 'Add Mental Wellness Knowledge card')}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {isBn ? 'এই card Self-Care Library-তে প্রকাশিত হবে।' : 'Published cards will appear in the Self-Care Library.'}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {([
                    ['titleEn', 'English title', 'ইংরেজি শিরোনাম'],
                    ['titleBn', 'বাংলা title', 'বাংলা শিরোনাম'],
                    ['category', 'Category', 'ক্যাটাগরি'],
                  ] as const).map(([field, placeholderEn, placeholderBn]) => (
                    <input
                      key={field}
                      value={knowledgeForm[field]}
                      onChange={event => setKnowledgeForm(previous => ({ ...previous, [field]: event.target.value }))}
                      placeholder={isBn ? placeholderBn : placeholderEn}
                      className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <textarea
                    value={knowledgeForm.contentEn}
                    onChange={event => setKnowledgeForm(previous => ({ ...previous, contentEn: event.target.value }))}
                    placeholder="English wellness guidance"
                    rows={4}
                    className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <textarea
                    value={knowledgeForm.contentBn}
                    onChange={event => setKnowledgeForm(previous => ({ ...previous, contentBn: event.target.value }))}
                    placeholder="বাংলা wellness guidance"
                    rows={4}
                    className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                {knowledgeFormError && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300" role="alert">
                    {knowledgeFormError}
                  </div>
                )}
                <button type="submit" className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white transition">
                  {editingKnowledgeId
                    ? (isBn ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save changes')
                    : (isBn ? 'Knowledge card প্রকাশ করুন' : 'Publish knowledge card')}
                </button>
                {editingKnowledgeId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingKnowledgeId(null);
                      setKnowledgeForm({ titleEn: '', titleBn: '', contentEn: '', contentBn: '', category: 'Self-care' });
                    }}
                    className="ml-2 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300"
                  >
                    {isBn ? 'বাতিল' : 'Cancel'}
                  </button>
                )}
              </form>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {knowledgeCards.map(card => (
                  <article key={card.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-emerald-600">{card.category}</span>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{isBn ? card.titleBn : card.titleEn}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => startKnowledgeEdit(card)} className="text-[11px] font-bold text-emerald-600 hover:underline">
                          {isBn ? 'সম্পাদনা' : 'Edit'}
                        </button>
                        <button type="button" onClick={() => handleDeleteKnowledge(card.id)} className="text-[11px] font-bold text-rose-600 hover:underline">
                          {isBn ? 'মুছুন' : 'Delete'}
                        </button>
                      </div>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">{isBn ? card.contentBn : card.contentEn}</p>
                  </article>
                ))}
              </div>
            </div>
      )}

      {activeTab === 'activities' && (
        <div className="space-y-5">
          <form onSubmit={handleAddActivity} className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-5 dark:border-slate-700">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-400">{isBn ? 'নতুন কনটেন্ট' : 'New content'}</p>
                <h3 className="mt-1 text-lg font-extrabold text-slate-900 dark:text-white">{isBn ? 'Activity তৈরি করুন' : 'Create an activity'}</h3>
                <p className="mt-1 text-[11px] text-slate-500">{isBn ? 'ব্যবহারকারীদের জন্য একটি ছোট self-care tool তৈরি করুন।' : 'Build a simple self-care tool for your users.'}</p>
              </div>
              <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white sm:flex dark:bg-emerald-600">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>
            <div className="space-y-5 p-5">
              <div className="grid grid-cols-1 gap-3 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2 dark:bg-slate-900/50">
              <label className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">English title</span>
                <input value={activityForm.titleEn} onChange={event => setActivityForm(previous => ({ ...previous, titleEn: event.target.value }))} placeholder="Activity title" className="admin-input bg-white dark:bg-slate-800" />
              </label>
              <label className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">বাংলা title</span>
                <input value={activityForm.titleBn} onChange={event => setActivityForm(previous => ({ ...previous, titleBn: event.target.value }))} placeholder="অ্যাক্টিভিটির নাম" className="admin-input bg-white dark:bg-slate-800" />
              </label>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">English description</span>
                <textarea value={activityForm.descriptionEn} onChange={event => setActivityForm(previous => ({ ...previous, descriptionEn: event.target.value }))} placeholder="Short description" rows={3} className="admin-input" />
              </label>
              <label className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">বাংলা description</span>
                <textarea value={activityForm.descriptionBn} onChange={event => setActivityForm(previous => ({ ...previous, descriptionBn: event.target.value }))} placeholder="সংক্ষিপ্ত বর্ণনা" rows={3} className="admin-input" />
              </label>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">{isBn ? 'ক্যাটাগরি' : 'Category'}</span>
                <select value={activityForm.category} onChange={event => setActivityForm(previous => ({ ...previous, category: event.target.value }))} className="admin-input">
                  <option value="mindfulness">Mindfulness</option>
                  <option value="breathing">Breathing</option>
                  <option value="grounding">Grounding</option>
                  <option value="relaxation">Relaxation</option>
                  <option value="sleep">Sleep</option>
                </select>
              </label>
              <label className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">{isBn ? 'সময় (মিনিট)' : 'Duration (minutes)'}</span>
                <input type="number" min="1" value={activityForm.durationMinutes} onChange={event => setActivityForm(previous => ({ ...previous, durationMinutes: event.target.value }))} placeholder="Minutes" className="admin-input" />
              </label>
              </div>
            </div>
            <div className="border-t border-slate-100 pt-4 dark:border-slate-700">
              <div className="flex items-center justify-between gap-3 px-5 pb-5">
                <span className="text-[10px] text-slate-400">{isBn ? 'লাইব্রেরিতে প্রকাশিত হবে' : 'Will appear in the library'}</span>
                <button type="submit" className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500">
                  {isBn ? 'প্রকাশ করুন' : 'Publish activity'}
                </button>
              </div>
            </div>
          </form>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{isBn ? 'প্রকাশিত custom activities' : 'Published custom activities'}</h3>
                <p className="mt-1 text-[11px] text-slate-500">{isBn ? 'ব্যবহারকারীরা MindCare Activities পেজে এগুলো দেখতে পাবেন।' : 'These activities are visible on the user-facing MindCare Activities page.'}</p>
              </div>
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">{activityItems.length} total</span>
            </div>
            {activityItems.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 py-10 text-center dark:border-slate-700">
                <Sparkles className="mx-auto h-7 w-7 text-slate-300" />
                <p className="mt-2 text-xs text-slate-500">{isBn ? 'কোনো custom activity নেই।' : 'No custom activities yet.'}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {activityItems.map(activity => (
              <article key={activity.id} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2 dark:border-slate-700 dark:bg-slate-800">
                <div className="flex items-start justify-between gap-3">
                  <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{isBn ? activity.titleBn : activity.titleEn}</h4>
                    <span className="text-[10px] font-bold uppercase text-emerald-600">{activity.category}</span>
                  </div>
                  </div>
                  <button type="button" onClick={() => handleDeleteActivity(activity.id)} className="text-[11px] font-bold text-rose-600 hover:underline">
                    {isBn ? 'মুছুন' : 'Delete'}
                  </button>
                </div>
                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">{isBn ? activity.descriptionBn : activity.descriptionEn}</p>
                <p className="text-[10px] text-slate-400">{activity.durationMinutes} {isBn ? 'মিনিট' : 'minutes'} • Published</p>
              </article>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Screening Instruments Versioning */}
      {activeTab === 'instruments' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            {t.admin.assessmentMgmt}
          </h3>
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200">
            {isBn
              ? 'PHQ-9 ও GAD-7 validated tool। প্রশ্ন পরিবর্তনের আগে clinical review ও licensing নিশ্চিত করুন। Scoring এখানে পরিবর্তন করা যাবে না।'
              : 'PHQ-9 and GAD-7 are validated tools. Obtain clinical review and licensing before changing content; scoring is intentionally locked here.'}
          </div>

          <div className="space-y-3">
            {instrumentDrafts.map((inst) => (
              <div key={inst.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{inst.code}: {inst.titleEn}</span>
                    {inst.isStandardized ? (
                      <span className="px-2 py-0.2 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 text-[10px] font-bold">
                        Validated
                      </span>
                    ) : (
                      <span className="px-2 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 text-[10px] font-bold">
                        Custom
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {inst.licenseInfo} • {inst.questions.length} items • Bengali localized
                  </div>
                </div>
                <button type="button" onClick={() => setSelectedInstrumentId(inst.id)} className="text-emerald-600 font-bold text-xs">
                  {selectedInstrumentId === inst.id ? (isBn ? 'নির্বাচিত' : 'Selected') : (isBn ? 'সম্পাদনা' : 'Edit')}
                </button>
              </div>
            ))}
          </div>
          {(() => {
            const selected = instrumentDrafts.find(instrument => instrument.id === selectedInstrumentId);
            if (!selected) return null;
            return (
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{selected.titleEn} {isBn ? 'প্রশ্নসমূহ' : 'questions'}</h4>
                  <div className="flex gap-2">
                    {!selected.isStandardized && (
                      <button type="button" onClick={() => addInstrumentQuestion(selected.id)} className="rounded-xl bg-emerald-600 px-3 py-2 text-[11px] font-bold text-white">
                        + {isBn ? 'প্রশ্ন' : 'Add question'}
                      </button>
                    )}
                    <button type="button" onClick={saveInstrumentDrafts} className="rounded-xl border border-emerald-200 px-3 py-2 text-[11px] font-bold text-emerald-700">
                      {isBn ? 'সংরক্ষণ' : 'Save draft'}
                    </button>
                  </div>
                </div>
                {selected.questions.map(question => (
                  <div key={question.id} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2 items-start">
                    <textarea value={question.textEn} onChange={event => updateInstrumentQuestion(selected.id, question.id, 'textEn', event.target.value)} rows={2} disabled={selected.isStandardized} className="admin-input disabled:opacity-60" aria-label="English question" />
                    <textarea value={question.textBn} onChange={event => updateInstrumentQuestion(selected.id, question.id, 'textBn', event.target.value)} rows={2} disabled={selected.isStandardized} className="admin-input disabled:opacity-60" aria-label="Bangla question" />
                    {!selected.isStandardized && <button type="button" onClick={() => deleteInstrumentQuestion(selected.id, question.id)} className="p-2 text-rose-600" aria-label="Delete question"><Trash2 className="w-4 h-4" /></button>}
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* Tab 4: Audit Logs (Master Prompt Page 14/17) */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            {t.admin.auditLogs}
          </h3>
          <p className="text-xs text-slate-500">
            {isBn ? 'সিস্টেম নিরাপত্তা ও গোপনীয়তা নিশ্চিতকরণ ইভেন্ট হিস্ট্রি' : 'Immutable audit trail of privacy policy verifications and consent mutations'}
          </p>

          <div className="space-y-3">
            {INITIAL_AUDIT_LOGS.map((aud) => (
              <div key={aud.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    {aud.action}
                  </span>
                  <span className="text-[10px] text-slate-400">{aud.timestamp}</span>
                </div>
                <div className="text-slate-700 dark:text-slate-300">
                  {aud.details}
                </div>
                <div className="text-[10px] text-slate-400">
                  Actor: <span className="font-semibold">{aud.actor}</span> • Resource: {aud.resourceType}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
        </section>
      </div>
    </div>
  );
};
