'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { Search, ArrowLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';

interface IPCSection {
  section: string;
  offense: string;
  punishment: string;
  description: string;
}

interface Topic {
  offense: string;
  count: number;
  example_section: string;
}

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<IPCSection[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'search' | 'topics'>('search');
  const [hasSearched, setHasSearched] = useState(false);

  // Load topics on mount
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/topics')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setTopics(data);
      })
      .catch(console.error);
  }, []);

  const fetchResults = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/search?q=${encodeURIComponent(searchQuery)}&limit=30`);
      const data = await res.json();
      setResults(data.results || []);
      setTotal(data.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResults(query);
  };

  const handleTopicClick = (offense: string) => {
    setQuery(offense);
    setActiveView('search');
    fetchResults(offense);
  };

  const formatSection = (section: string) => {
    return section.replace('IPC_', 'Section ');
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
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#2C1A12]">Legal Knowledge</h1>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative">
              <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#5C4A42] opacity-60" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by section number, keyword, or offense..."
                className="w-full pl-14 pr-6 py-4 text-lg bg-white border-2 border-[#2C1A12] text-[#2C1A12] placeholder-[#5C4A42]/50 focus:outline-none focus:border-[#C84B31] transition-colors font-medium"
              />
            </form>

            {/* View Toggle */}
            <div className="flex gap-0 mt-4">
              <button
                onClick={() => setActiveView('search')}
                className={`px-6 py-2.5 text-sm font-bold uppercase tracking-widest border-2 border-[#2C1A12] transition-colors ${
                  activeView === 'search'
                    ? 'bg-[#2C1A12] text-[#FAF9F6]'
                    : 'bg-transparent text-[#2C1A12] hover:bg-[#2C1A12]/5'
                }`}
              >
                Search Results
              </button>
              <button
                onClick={() => setActiveView('topics')}
                className={`px-6 py-2.5 text-sm font-bold uppercase tracking-widest border-2 border-l-0 border-[#2C1A12] transition-colors ${
                  activeView === 'topics'
                    ? 'bg-[#2C1A12] text-[#FAF9F6]'
                    : 'bg-transparent text-[#2C1A12] hover:bg-[#2C1A12]/5'
                }`}
              >
                Browse Topics
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">

            {activeView === 'topics' ? (
              /* Topics Grid */
              <div>
                <p className="text-[#5C4A42] text-lg mb-8 font-medium">
                  Browse {topics.length} legal topics. Click any topic to search related sections.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {topics.map((topic, i) => (
                    <button
                      key={i}
                      onClick={() => handleTopicClick(topic.offense)}
                      className="text-left p-6 border-2 border-[#2C1A12]/10 hover:border-[#C84B31] bg-white transition-all group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-[#2C1A12] text-lg mb-2 leading-tight line-clamp-2">
                            {topic.offense}
                          </h3>
                          <span className="text-sm text-[#5C4A42]">
                            {topic.count} section{topic.count > 1 ? 's' : ''} 
                          </span>
                        </div>
                        <ChevronRight size={18} className="text-[#C84B31] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Search Results */
              <div>
                {!hasSearched && !loading ? (
                  <div className="text-center py-20">
                    <p className="text-4xl font-bold text-[#2C1A12] mb-4 tracking-tight">Search the IPC</p>
                    <p className="text-[#5C4A42] text-xl font-medium max-w-md mx-auto mb-10">
                      Type a section number, keyword, or offense to find relevant laws instantly.
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center">
                      {['Murder', 'Theft', 'Section 302', 'Forgery', 'Dowry'].map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => { setQuery(suggestion); fetchResults(suggestion); }}
                          className="px-5 py-2.5 border-2 border-[#2C1A12]/15 text-[#2C1A12] font-bold text-sm uppercase tracking-wider hover:border-[#C84B31] hover:text-[#C84B31] transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : loading ? (
                  <div className="flex items-center gap-4 py-16 justify-center">
                    <div className="w-6 h-6 border-2 border-[#C84B31] border-t-transparent rounded-full animate-spin" />
                    <span className="text-[#5C4A42] font-medium">Searching...</span>
                  </div>
                ) : (
                  <>
                    <p className="text-[#5C4A42] text-lg mb-8 font-medium">
                      Found <span className="text-[#2C1A12] font-bold">{results.length}</span> results for "<span className="text-[#C84B31] font-bold">{query}</span>"
                    </p>
                    <div className="space-y-4">
                      {results.map((r, i) => {
                        const isExpanded = expandedCard === r.section;
                        return (
                          <div
                            key={i}
                            className="border-2 border-[#2C1A12]/10 bg-white hover:border-[#2C1A12]/30 transition-colors"
                          >
                            <button
                              onClick={() => setExpandedCard(isExpanded ? null : r.section)}
                              className="w-full text-left p-6 flex items-start justify-between gap-4"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-3 mb-2">
                                  <span className="px-3 py-1 bg-[#C84B31] text-[#FAF9F6] text-xs font-bold uppercase tracking-widest shrink-0">
                                    {formatSection(r.section)}
                                  </span>
                                  <h3 className="font-bold text-[#2C1A12] text-xl leading-tight">
                                    {r.offense}
                                  </h3>
                                </div>
                                <p className="text-[#5C4A42] text-base">
                                  <span className="font-bold text-[#2C1A12]">Punishment:</span> {r.punishment}
                                </p>
                              </div>
                              {isExpanded ? (
                                <ChevronUp size={20} className="text-[#5C4A42] shrink-0 mt-1" />
                              ) : (
                                <ChevronDown size={20} className="text-[#5C4A42] shrink-0 mt-1" />
                              )}
                            </button>
                            {isExpanded && (
                              <div className="px-6 pb-6 border-t-2 border-[#2C1A12]/5 pt-4">
                                <p className="text-[#5C4A42] text-lg leading-relaxed whitespace-pre-wrap">
                                  {r.description}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {results.length === 0 && !loading && (
                      <div className="text-center py-16">
                        <p className="text-[#5C4A42] text-xl font-medium mb-2">No sections found</p>
                        <p className="text-[#5C4A42]/70">Try a different keyword or browse topics instead</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
