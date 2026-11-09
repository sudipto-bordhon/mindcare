import React, { useEffect, useState } from 'react';
import { 
  BookOpen, 
  Clock, 
  User, 
  Calendar, 
  ArrowRight, 
  Search, 
  Tag, 
  Heart, 
  X,
  Sparkles
} from 'lucide-react';
import { Article, Language, MentalWellnessKnowledge } from '../types';
import { WELLNESS_ARTICLES } from '../data/initialData';
import { translations } from '../data/translations';

interface EducationViewProps {
  language: Language;
}

export const EducationView: React.FC<EducationViewProps> = ({ language }) => {
  const isBn = language === 'bn';
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedKnowledge, setSelectedKnowledge] = useState<MentalWellnessKnowledge | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selfCareCards, setSelfCareCards] = useState<MentalWellnessKnowledge[]>([]);

  useEffect(() => {
    const loadSelfCareCards = () => {
      try {
        const saved = localStorage.getItem('mindcare_wellness_knowledge');
        const parsed: unknown = saved ? JSON.parse(saved) : [];
        setSelfCareCards(Array.isArray(parsed) ? parsed : []);
      } catch {
        setSelfCareCards([]);
      }
    };

    loadSelfCareCards();
    window.addEventListener('storage', loadSelfCareCards);
    window.addEventListener('mindcare-library-updated', loadSelfCareCards);
    return () => {
      window.removeEventListener('storage', loadSelfCareCards);
      window.removeEventListener('mindcare-library-updated', loadSelfCareCards);
    };
  }, []);

  const filtered = WELLNESS_ARTICLES.filter((art) => {
    const title = isBn ? art.titleBn : art.titleEn;
    const summary = isBn ? art.summaryBn : art.summaryEn;
    const matchesSearch = title.toLowerCase().includes(search.toLowerCase()) || summary.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'All' || art.categoryEn === categoryFilter;
    return matchesSearch && matchesCat;
  });
  const filteredSelfCareCards = selfCareCards.filter(card => {
    const query = search.toLowerCase();
    return [
      card.titleEn,
      card.titleBn,
      card.contentEn,
      card.contentBn,
      card.category,
    ].some(value => value.toLowerCase().includes(query));
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center dark:border-slate-700 dark:bg-slate-800 sm:p-9">
        <div className="mx-auto max-w-2xl space-y-3">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            {isBn ? 'সেলফ-কেয়ার লাইব্রেরি ও সুস্থতা নির্দেশিকা' : 'Self-Care Library & Wellness Guides'}
          </h1>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {isBn 
              ? 'প্রতিদিনের যত্ন ও মানসিক সুস্থতার জন্য সহজ, সহায়ক নির্দেশিকা এবং আর্টিকেল পড়ুন।' 
              : 'Explore approachable guidance and helpful articles to support your everyday mental wellness.'}
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-xs dark:border-slate-700 dark:bg-slate-800 sm:flex sm:items-center sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isBn ? 'লাইব্রেরিতে খুঁজুন...' : 'Search the library...'}
            className="w-full rounded-xl border border-transparent bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 dark:bg-slate-900 dark:text-white dark:focus:border-emerald-700 dark:focus:bg-slate-900"
          />
        </div>
        <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1 sm:mt-0 sm:pl-2">
          {['All', 'Anxiety Relief', 'Rest & Recovery', 'Work-Life Balance'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition ${
                categoryFilter === cat
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'border border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-emerald-700 dark:hover:text-emerald-300'
              }`}
            >
              {cat === 'All' ? (isBn ? 'সবগুলো' : 'All') : cat}
            </button>
          ))}
        </div>
      </div>

      {filteredSelfCareCards.length > 0 && (
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 dark:bg-rose-950/50 dark:text-rose-300">
              <Heart className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white sm:text-xl">
                {isBn ? 'সেলফ-কেয়ার লাইব্রেরি' : 'Self-Care Library'}
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {isBn ? 'MindCare টিমের প্রকাশিত সহায়ক wellness guidance' : 'Wellness guidance published by the MindCare team'}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredSelfCareCards.map(card => (
              <article
                key={card.id}
                className="group relative flex min-h-[270px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl dark:border-slate-700 dark:bg-slate-800 dark:hover:border-emerald-800"
              >
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex max-w-[65%] items-center gap-1.5 truncate rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
                      <Tag className="h-3 w-3 shrink-0" />
                      <span className="truncate">{card.category}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5 text-[10px] font-medium text-slate-400">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(card.createdAt).toLocaleDateString(isBn ? 'bn-BD' : 'en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <h3 className="mt-4 text-lg font-bold leading-snug text-slate-900 transition-colors group-hover:text-emerald-700 dark:text-white dark:group-hover:text-emerald-300">
                    {isBn ? card.titleBn : card.titleEn}
                  </h3>

                  <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {isBn ? card.contentBn : card.contentEn}
                  </p>

                  <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-700/60">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                    {isBn ? 'MindCare টিম' : 'MindCare team'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedKnowledge(card)}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/60"
                  >
                    <span>{isBn ? 'সম্পূর্ণ পড়ুন' : 'Read guidance'}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Article Cards Grid */}
      <section className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300">
          <BookOpen className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white sm:text-xl">
            {isBn ? 'সুস্থতা বিষয়ক আর্টিকেল' : 'Wellness Articles'}
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {isBn ? 'বিষয়ভিত্তিক পরামর্শ ও ব্যবহারিক নির্দেশিকা' : 'Practical guidance and supportive reading by topic'}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((art) => {
          const title = isBn ? art.titleBn : art.titleEn;
          const summary = isBn ? art.summaryBn : art.summaryEn;
          const cat = isBn ? art.categoryBn : art.categoryEn;

          return (
            <article
              key={art.id}
              className="group relative flex min-h-[245px] cursor-pointer flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl dark:border-slate-700 dark:bg-slate-800 dark:hover:border-blue-800"
              onClick={() => setSelectedArticle(art)}
            >
              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3 text-[11px]">
                  <span className="max-w-[68%] truncate rounded-full bg-blue-50 px-3 py-1 font-bold text-blue-800 dark:bg-blue-950/70 dark:text-blue-300">
                    {cat}
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5 text-slate-400">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{art.readTimeMinutes} {isBn ? 'মিনিট পাঠ' : 'min read'}</span>
                  </span>
                </div>

                <h3 className="mt-4 text-lg font-bold leading-snug text-slate-900 transition-colors group-hover:text-blue-700 dark:text-white dark:group-hover:text-blue-300">
                  {title}
                </h3>

                <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {summary}
                </p>

              <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4 text-xs dark:border-slate-700/60">
                <span className="flex min-w-0 items-center gap-1.5 truncate text-[11px] text-slate-400">
                  <User className="h-3.5 w-3.5 shrink-0" />{art.author}
                </span>
                <span className="flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 font-bold text-blue-700 transition group-hover:bg-blue-50 dark:text-blue-300 dark:group-hover:bg-blue-950/60">
                  <span>{isBn ? 'সম্পূর্ণ পড়ুন' : 'Read Article'}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
              </div>
            </article>
          );
        })}
      </div>
      </section>

      {/* Read Article Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold">
                {isBn ? selectedArticle.categoryBn : selectedArticle.categoryEn}
              </span>
              <button
                onClick={() => setSelectedArticle(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-full"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white leading-snug">
                {isBn ? selectedArticle.titleBn : selectedArticle.titleEn}
              </h2>
              <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                <span>{selectedArticle.author}</span>
                <span>•</span>
                <span>{selectedArticle.publishedDate}</span>
                <span>•</span>
                <span>{selectedArticle.readTimeMinutes} min read</span>
              </div>
            </div>

            <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap space-y-4">
              {isBn ? selectedArticle.contentBn : selectedArticle.contentEn}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs"
              >
                {isBn ? 'বন্ধ করুন' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedKnowledge && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fade-in"
          onMouseDown={event => {
            if (event.target === event.currentTarget) setSelectedKnowledge(null);
          }}
        >
          <div className="relative max-h-[85vh] w-full max-w-2xl space-y-6 overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {selectedKnowledge.category}
              </span>
              <button
                type="button"
                onClick={() => setSelectedKnowledge(null)}
                className="rounded-full p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                aria-label={isBn ? 'বন্ধ করুন' : 'Close'}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div>
              <h2 className="text-2xl font-bold leading-snug text-slate-900 dark:text-white">
                {isBn ? selectedKnowledge.titleBn : selectedKnowledge.titleEn}
              </h2>
              <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                <User className="h-3.5 w-3.5" />
                <span>{isBn ? 'MindCare টিম' : 'MindCare team'}</span>
                <span>•</span>
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  {new Date(selectedKnowledge.createdAt).toLocaleDateString(isBn ? 'bn-BD' : 'en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>

            <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-200">
              {isBn ? selectedKnowledge.contentBn : selectedKnowledge.contentEn}
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-4 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedKnowledge(null)}
                className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-700"
              >
                {isBn ? 'বন্ধ করুন' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
