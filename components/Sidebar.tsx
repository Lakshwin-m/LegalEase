'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Plus, MessageSquare, Menu, X, Trash2, BookOpen, BookA } from 'lucide-react';

export default function Sidebar() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/sessions')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setSessions(data);
      })
      .catch(console.error);
  }, [pathname]);

  const handleNewChat = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/sessions', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ title: 'New Chat' }) 
      });
      const data = await res.json();
      if (data.id) {
        router.push(`/chat/${data.id}`);
        setIsOpen(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white border border-zinc-200 rounded-lg shadow-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar Overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/20 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-40 w-72 bg-[#fafafa] border-r border-zinc-200 flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4 md:p-6 pb-4">
          <h1 className="text-xl font-bold tracking-tight text-black mb-4">LegalEase</h1>
          <div className="space-y-2">
            <button 
              onClick={handleNewChat}
              className="w-full flex items-center justify-center gap-2 bg-black text-white px-4 py-2.5 rounded-lg font-medium hover:bg-zinc-800 transition-colors shadow-sm"
            >
              <Plus size={18} strokeWidth={2.5} />
              <span>New Chat</span>
            </button>
            <button 
              onClick={() => { router.push('/search'); setIsOpen(false); }}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm border ${
                pathname === '/search'
                  ? 'bg-zinc-900 text-white border-zinc-900'
                  : 'bg-white text-black border-zinc-200 hover:bg-zinc-50'
              }`}
            >
              <BookOpen size={18} strokeWidth={2} />
              <span>Legal Knowledge</span>
            </button>
            <button 
              onClick={() => { router.push('/dictionary'); setIsOpen(false); }}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm border ${
                pathname === '/dictionary'
                  ? 'bg-zinc-900 text-white border-zinc-900'
                  : 'bg-white text-black border-zinc-200 hover:bg-zinc-50'
              }`}
            >
              <BookA size={18} strokeWidth={2} />
              <span>Dictionary</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-6">
          <div className="text-xs font-semibold text-zinc-400 uppercase tracking-widest px-3 mb-3 mt-4">Recent</div>
          {sessions.length === 0 ? (
            <div className="px-3 text-sm text-zinc-400">No recent chats</div>
          ) : (
            <div className="space-y-1">
              {sessions.map((s) => {
                const isActive = pathname === `/chat/${s.id}`;
                return (
                  <div key={s.id} className="relative group">
                    <button
                      onClick={() => {
                        router.push(`/chat/${s.id}`);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-3 truncate pr-10 ${
                        isActive 
                          ? 'bg-zinc-200/60 text-black font-medium' 
                          : 'text-zinc-600 hover:bg-zinc-200/40 hover:text-zinc-900'
                      }`}
                    >
                      <MessageSquare size={16} className="shrink-0 opacity-60" />
                      <span className="truncate">{s.title}</span>
                    </button>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          await fetch(`http://127.0.0.1:8000/api/sessions/${s.id}`, { method: 'DELETE' });
                          setSessions(prev => prev.filter(session => session.id !== s.id));
                          if (isActive) router.push('/');
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                      title="Delete chat"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
