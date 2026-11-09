import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  ShieldCheck, 
  Trash2, 
  Settings2, 
  Heart, 
  AlertCircle,
  HelpCircle,
  PhoneCall,
  Plus,
  MessageCircle,
  PanelLeft
} from 'lucide-react';
import { ChatMessage, ConsentSettings, Language, User } from '../types';
import { translations } from '../data/translations';

interface AIAssistantViewProps {
  currentUser: User | null;
  consent: ConsentSettings;
  onUpdateConsent: (updated: Partial<ConsentSettings>) => void;
  language: Language;
  onOpenCrisis: () => void;
}

interface ChatSession {
  id: string;
  title: string;
  updatedAt: number;
  messages: ChatMessage[];
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({
  currentUser,
  consent,
  onUpdateConsent,
  language,
  onOpenCrisis,
}) => {
  const t = translations[language];
  const isBn = language === 'bn';

  const storageKey = currentUser ? `mindcare_chat_${currentUser.id}` : null;
  const sessionsKey = currentUser ? `mindcare_chat_sessions_${currentUser.id}` : null;
  const welcomeMessage = (): ChatMessage => ({
    id: 'msg_welcome',
    role: 'assistant',
    content: isBn
      ? `নমস্কার / আসসালামু আলাইকুম! আমি মাইন্ডকেয়ারের ওয়েলনেস চ্যাটবট। আমি কোনো ডাক্তার নই, তবে আপনার মনের কথা মনোযোগ দিয়ে শুনে মন শান্ত করতে এবং মানসিক চাপ কমাতে সাহায্য করতে পারি। আজ আপনি কেমন বোধ করছেন?`
      : `Hello! I am your MindCare wellness chatbot. I am here to listen with empathy, guide you through low-risk calming practices, and support your self-care. (Please note: I am a chatbot, not a medical clinician). How is your heart and mind feeling today?`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    source: 'welcome_prompt'
  });
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (!storageKey) return [welcomeMessage()];
    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) return [welcomeMessage()];
      const parsed = JSON.parse(saved) as { savedAt: number; messages: ChatMessage[] };
      return Date.now() - parsed.savedAt <= 48 * 60 * 60 * 1000 && Array.isArray(parsed.messages)
        ? parsed.messages
        : [welcomeMessage()];
    } catch {
      return [welcomeMessage()];
    }
  });
  const [chatSessions, setChatSessions] = useState<ChatSession[]>(() => {
    if (!currentUser) return [];
    try {
      const saved = localStorage.getItem(`mindcare_chat_sessions_${currentUser.id}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      const legacy = localStorage.getItem(`mindcare_chat_${currentUser.id}`);
      if (legacy) {
        const parsed = JSON.parse(legacy);
        if (Array.isArray(parsed.messages)) {
          return [{ id: `chat_${Date.now()}`, title: isBn ? 'নতুন কথোপকথন' : 'New conversation', updatedAt: parsed.savedAt || Date.now(), messages: parsed.messages }];
        }
      }
    } catch {
      return [];
    }
    return [];
  });
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showConsentBar, setShowConsentBar] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if (!storageKey) return;
    localStorage.setItem(storageKey, JSON.stringify({ savedAt: Date.now(), messages }));
  }, [messages, storageKey]);

  useEffect(() => {
    if (!sessionsKey) return;
    setChatSessions(previous => {
      const activeId = activeChatId || previous[0]?.id || `chat_${Date.now()}`;
      const existing = previous.find(session => session.id === activeId);
      const updatedSession: ChatSession = {
        id: activeId,
        title: existing?.title || (() => {
          const firstUserMessage = messages.find(message => message.role === 'user');
          if (!firstUserMessage) return isBn ? 'নতুন কথোপকথন' : 'New conversation';
          const title = firstUserMessage.content.replace(/\s+/g, ' ').trim();
          return title.length > 38 ? `${title.slice(0, 38)}…` : title;
        })(),
        updatedAt: Date.now(),
        messages,
      };
      const updated = existing
        ? previous.map(session => session.id === activeId ? updatedSession : session)
        : [updatedSession, ...previous];
      localStorage.setItem(sessionsKey, JSON.stringify(updated));
      return updated;
    });
  }, [messages, sessionsKey, activeChatId, isBn]);

  useEffect(() => {
    if (!activeChatId && chatSessions.length) {
      setActiveChatId(chatSessions[0].id);
      setMessages(chatSessions[0].messages);
    }
  }, [activeChatId, chatSessions]);

  const createNewChat = () => {
    const newSession: ChatSession = {
      id: `chat_${Date.now()}`,
      title: isBn ? 'নতুন কথোপকথন' : 'New conversation',
      updatedAt: Date.now(),
      messages: [welcomeMessage()],
    };
    setChatSessions(previous => [newSession, ...previous]);
    setActiveChatId(newSession.id);
    setMessages(newSession.messages);
    setInput('');
  };

  const openChat = (session: ChatSession) => {
    setActiveChatId(session.id);
    setMessages(session.messages);
    setInput('');
  };

  const getSessionTitle = (session: ChatSession) => {
    const firstUserMessage = session.messages.find(message => message.role === 'user');
    if (!firstUserMessage) return session.title;
    const title = firstUserMessage.content.replace(/\s+/g, ' ').trim();
    return title.length > 38 ? `${title.slice(0, 38)}…` : title;
  };

  const handleSend = async (textToSend?: string) => {
    const userText = (textToSend || input).trim();
    if (!userText || loading) return;
    const chatId = activeChatId || `chat_${Date.now()}`;
    if (!activeChatId) setActiveChatId(chatId);

    const userMessage: ChatMessage = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setChatSessions(previous => previous.map(session => {
      if (session.id !== chatId) return session;
      return { ...session, title: getSessionTitle({ ...session, messages: [...session.messages, userMessage] }), updatedAt: Date.now() };
    }));
    setInput('');
    setLoading(true);

    // Send only user-generated turns in conversation history (exclude greeting card)
    const filteredHistory = consent.aiMemoryConsent
      ? messages.filter((m) => m.id !== 'msg_welcome' && m.id !== 'msg_cleared')
      : [];

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: filteredHistory,
          language,
          ageBand: currentUser?.ageBand || 'adult',
          memoryConsent: consent.aiMemoryConsent,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      const data = await response.json();
      const replyContent = data?.reply || (isBn
        ? 'আমি আপনার কথা মনোযোগ দিয়ে শুনেছি। নিজেকে কিছুটা সময় দিন এবং গভীর শ্বাস নিন।'
        : 'Thank you for sharing your thoughts. Take a slow, gentle breath.');

      const assistantMessage: ChatMessage = {
        id: 'msg_' + Date.now() + '_res',
        role: 'assistant',
        content: replyContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isCrisis: !!data?.isCrisis,
        source: data?.source || 'assistant',
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (data?.isCrisis) {
        onOpenCrisis();
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.warn('Chat request notice:', err?.name === 'AbortError' ? 'Client request timed out' : err?.message);
      const errorMessage: ChatMessage = {
        id: 'msg_err_' + Date.now(),
        role: 'assistant',
        content: isBn
          ? 'আমি আপনার কথা বুঝতে পেরেছি। মানসিক চাপ বা অস্থিরতার সময়ে গভীর শ্বাস নেওয়া এবং এক গ্লাস জল পান করা তাৎক্ষণিকভাবে কিছুটা হালকা বোধ করতে সহায়তা করতে পারে। আপনি চাইলে আরও কিছু বলতে পারেন।'
          : 'I hear you. When feeling stressed or overwhelmed, practicing a few slow, deep diaphragmatic breaths can provide immediate calm. Feel free to continue sharing whenever you are ready.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'client_resilience_fallback'
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (storageKey) localStorage.removeItem(storageKey);
    setMessages([
      {
        id: 'msg_cleared',
        role: 'assistant',
        content: isBn ? 'কথোপকথন সফলভাবে রিসেট করা হয়েছে। কীভাবে আপনাকে সহায়তা করতে পারি?' : 'Conversation context cleared. How can I support you right now?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4 pb-16">
      <div className="flex items-center gap-2 lg:hidden">
        <PanelLeft className="w-4 h-4 text-purple-600" />
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{isBn ? 'কথোপকথনের ইতিহাস' : 'Conversation history'}</span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[15rem_minmax(0,1fr)] gap-5 items-start">
        <aside className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 shadow-sm">
          <div className="flex items-center justify-between px-2 pb-3 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-extrabold text-slate-900 dark:text-white">{isBn ? 'চ্যাটসমূহ' : 'Chats'}</span>
            </div>
            <button type="button" onClick={createNewChat} className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40" title={isBn ? 'নতুন চ্যাট' : 'New chat'} aria-label={isBn ? 'নতুন চ্যাট' : 'New chat'}>
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-2 space-y-1 max-h-80 overflow-y-auto">
            {chatSessions.map(session => (
              <button
                type="button"
                key={session.id}
                onClick={() => openChat(session)}
                className={`w-full rounded-xl px-3 py-2.5 text-left text-xs transition ${
                  session.id === activeChatId
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-slate-700'
                }`}
              >
                <span className="block truncate font-bold">{getSessionTitle(session)}</span>
                <span className={`mt-1 block text-[10px] ${session.id === activeChatId ? 'text-purple-100' : 'text-slate-400'}`}>
                  {new Date(session.updatedAt).toLocaleDateString()}
                </span>
              </button>
            ))}
            {!chatSessions.length && <p className="px-2 py-4 text-[11px] text-slate-400">{isBn ? 'প্রথম বার্তা পাঠালে চ্যাট তৈরি হবে।' : 'A chat appears after your first message.'}</p>}
          </div>
        </aside>
        <div className="min-w-0 space-y-4">
      {/* Header card with non-clinical disclosure */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-emerald-100 dark:border-slate-700 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center shadow-md">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-lg text-slate-900 dark:text-white">
                  {t.ai.title}
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
                  {t.ai.disclaimerBadge}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {t.ai.subtitle}
              </p>
            </div>
          </div>

          {/* Privacy controls & Clear */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowConsentBar(!showConsentBar)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 flex items-center gap-1.5 transition"
              title="Privacy & Chatbot Memory Controls"
            >
              <Settings2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isBn ? 'গোপনীয়তা নিয়ন্ত্রণ' : 'Memory Consent'}</span>
            </button>

            <button
              onClick={handleClearHistory}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
              title="Clear Chat History"
              aria-label="Clear chat history"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Collapsible Consent Bar (Master prompt Section 6 requirement) */}
        {showConsentBar && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 space-y-3 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl animate-fade-in text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {t.ai.memoryConsentLabel}
                </span>
                <p className="text-[11px] text-slate-500">
                  {isBn ? 'চ্যাটবটকে সাম্প্রতিক কথোপকথনের সূত্র মনে রাখার অনুমতি দিন।' : 'Send prior turns in current session to maintain conversation continuity.'}
                </p>
              </div>
              <input
                type="checkbox"
                checked={consent.aiMemoryConsent}
                onChange={(e) => onUpdateConsent({ aiMemoryConsent: e.target.checked })}
                className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* Chat Messages Container */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 sm:p-6 h-[480px] overflow-y-auto space-y-4">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-emerald-600 text-white rounded-br-none shadow-sm'
                    : m.isCrisis
                    ? 'bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-100 rounded-bl-none'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-none'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>
                <div className={`text-[10px] mt-1.5 flex items-center justify-between ${
                  isUser ? 'text-emerald-100' : 'text-slate-400'
                }`}>
                  <span>{m.timestamp}</span>
                  {!isUser && m.source && (
                    <span className="italic ml-2 opacity-75">
                      {m.source === 'openai-gpt-4o-mini' ? 'Chatbot' :
                        m.source === 'gemini-3.1-flash-lite' ? 'Chatbot' :
                        m.source === 'gemini-3.8-flash' ? 'Chatbot' :
                        m.source === 'wellness_scope_guard' ? 'MindCare Scope' :
                        'MindCare Engine'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-100 dark:bg-slate-700 p-3.5 rounded-2xl rounded-bl-none flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Pills */}
      <div className="flex flex-wrap gap-2">
        {t.ai.quickPills.map((pill, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(pill)}
            className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-[11px] font-medium text-slate-700 dark:text-slate-300 transition shadow-2xs hover:bg-emerald-50/50"
          >
            "{pill}"
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.ai.placeholder}
          className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className={`px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-md transition ${
            !input.trim() || loading ? 'opacity-40 cursor-not-allowed' : 'hover:-translate-y-0.5'
          }`}
        >
          <span>{t.ai.send}</span>
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Safety Notice */}
      <div className="text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>{t.ai.safetyNotice}</span>
      </div>
        </div>
      </div>
    </div>
  );
};
