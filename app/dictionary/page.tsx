'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { Search, ArrowLeft, ChevronDown, ChevronUp, BookA } from 'lucide-react';

interface LegalTerm {
  term: string;
  full_form: string;
  category: string;
  definition: string;
  example: string;
  related: string[];
}

interface Category {
  category: string;
  count: number;
}

export default function DictionaryPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [terms, setTerms] = useState<LegalTerm[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Load categories on mount
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/dictionary/categories')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch(console.error);

    // Do not load all terms initially
    // fetchTerms('', '');
  }, []);

  const fetchTerms = async (q: string, category: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (category) params.set('category', category);
      const res = await fetch(`http://127.0.0.1:8000/api/dictionary?${params.toString()}`);
      const data = await res.json();
      setTerms(data.results || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTerms(query, activeCategory);
  };

  const handleCategoryClick = (cat: string) => {
    const newCat = activeCategory === cat ? '' : cat;
    setActiveCategory(newCat);
    fetchTerms(query, newCat);
  };

  const handleRelatedClick = (term: string) => {
    setQuery(term);
    setActiveCategory('');
    fetchTerms(term, '');
  };

  const getCategoryColor = (cat: string) => {
    const colors: Record<string, string> = {
      'Procedure': '#C84B31',
      'Criminal Law': '#2C1A12',
      'Constitutional': '#8B5E3C',
      'Document': '#E19B2D',
      'Remedy': '#6B4226',
      'Judgement': '#A0522D',
      'Family Law': '#D2691E',
    };
    return colors[cat] || '#5C4A42';
  };

  return (
    <div className="flex w-full h-screen bg-[#FAF9F6]">
      <Sidebar />
      <main className="flex-1 flex flex-col h-[100dvh] min-w-0 pt-14 md:pt-0 overflow-hidden">
        
        {/* Top Bar */}
        <div className="shrink-0 border-b border-zinc-200 bg-[#FAF9F6]">
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
            <div className="flex items-center gap-4 mb-6">
              <button 
                onClick={() => router.push('/')}
                className="p-2 hover:bg-zinc-100 rounded-lg transition-colors text-[#5C4A42]"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#2C1A12]">Legal Dictionary</h1>
                <p className="text-[#5C4A42] text-sm mt-1">Common Indian legal terms explained simply</p>
              </div>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative">
              <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#5C4A42] opacity-60" />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  // Live search as you type
                  fetchTerms(e.target.value, activeCategory);
                }}
                placeholder="Search terms like FIR, Bail, Affidavit, Injunction..."
                className="w-full pl-14 pr-6 py-4 text-lg bg-white border-2 border-[#2C1A12] text-[#2C1A12] placeholder-[#5C4A42]/50 focus:outline-none focus:border-[#C84B31] transition-colors font-medium"
              />
            </form>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2 mt-4">
              {categories.map((cat) => (
                <button
                  key={cat.category}
                  onClick={() => handleCategoryClick(cat.category)}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-widest border-2 transition-colors"
                  style={{
                    borderColor: getCategoryColor(cat.category),
                    backgroundColor: activeCategory === cat.category ? getCategoryColor(cat.category) : 'transparent',
                    color: activeCategory === cat.category ? '#FAF9F6' : getCategoryColor(cat.category),
                  }}
                >
                  {cat.category} ({cat.count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
            {loading ? (
              <div className="flex items-center gap-4 py-16 justify-center">
                <div className="w-6 h-6 border-2 border-[#C84B31] border-t-transparent rounded-full animate-spin" />
                <span className="text-[#5C4A42] font-medium">Loading...</span>
              </div>
            ) : (!query && !activeCategory) ? (
              <div className="text-center py-20 bg-white border-2 border-[#2C1A12]/10 max-w-2xl mx-auto mt-8">
                <BookA size={48} strokeWidth={1.5} className="mx-auto text-[#C84B31] mb-4 opacity-50" />
                <p className="text-[#2C1A12] text-2xl font-bold mb-2">Dictionary</p>
                <p className="text-[#5C4A42] text-lg">Search for a legal term or select a category above to view definitions.</p>
              </div>
            ) : terms.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-[#5C4A42] text-xl font-medium mb-2">No matching terms found</p>
                <p className="text-[#5C4A42]/70">Try a different keyword or clear the category filter</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-[#5C4A42] font-medium mb-6">
                  Showing <span className="text-[#2C1A12] font-bold">{terms.length}</span> term{terms.length !== 1 ? 's' : ''}
                  {query && <> matching "<span className="text-[#C84B31] font-bold">{query}</span>"</>}
                  {activeCategory && <> in <span className="font-bold text-[#2C1A12]">{activeCategory}</span></>}
                </p>

                {terms.map((term, i) => {
                  const isExpanded = expandedTerm === term.term;
                  const catColor = getCategoryColor(term.category);

                  return (
                    <div
                      key={`${term.term}-${i}`}
                      className="border-2 border-[#2C1A12]/10 bg-white hover:border-[#2C1A12]/25 transition-colors"
                    >
                      <button
                        onClick={() => setExpandedTerm(isExpanded ? null : term.term)}
                        className="w-full text-left p-6 flex items-start justify-between gap-4"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-3 mb-3">
                            <span 
                              className="px-3 py-1 text-[#FAF9F6] text-xs font-bold uppercase tracking-widest shrink-0"
                              style={{ backgroundColor: catColor }}
                            >
                              {term.category}
                            </span>
                            <h3 className="text-2xl font-bold text-[#2C1A12] tracking-tight">
                              {term.term}
                              {term.full_form && (
                                <span className="text-[#5C4A42] text-base font-medium ml-3">
                                  ({term.full_form})
                                </span>
                              )}
                            </h3>
                          </div>
                          <p className="text-[#5C4A42] text-base leading-relaxed line-clamp-2">
                            {term.definition}
                          </p>
                        </div>
                        {isExpanded ? (
                          <ChevronUp size={20} className="text-[#5C4A42] shrink-0 mt-1" />
                        ) : (
                          <ChevronDown size={20} className="text-[#5C4A42] shrink-0 mt-1" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="px-6 pb-6 space-y-6 border-t-2 border-[#2C1A12]/5 pt-5">
                          {/* Full Definition */}
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-widest text-[#C84B31] mb-3">Definition</h4>
                            <p className="text-[#2C1A12] text-lg leading-relaxed">
                              {term.definition}
                            </p>
                          </div>

                          {/* Example */}
                          <div className="border-l-4 pl-6 py-3" style={{ borderColor: catColor }}>
                            <h4 className="text-xs font-bold uppercase tracking-widest text-[#E19B2D] mb-3">Real-Life Example</h4>
                            <p className="text-[#5C4A42] text-lg leading-relaxed italic">
                              {term.example}
                            </p>
                          </div>

                          {/* Related Terms */}
                          {term.related && term.related.length > 0 && (
                            <div>
                              <h4 className="text-xs font-bold uppercase tracking-widest text-[#5C4A42] mb-3">Related Terms</h4>
                              <div className="flex flex-wrap gap-2">
                                {term.related.map((rel) => (
                                  <button
                                    key={rel}
                                    onClick={(e) => { e.stopPropagation(); handleRelatedClick(rel); }}
                                    className="px-4 py-2 border-2 border-[#2C1A12]/15 text-[#2C1A12] text-sm font-bold uppercase tracking-wider hover:border-[#C84B31] hover:text-[#C84B31] transition-colors"
                                  >
                                    {rel}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
