'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Plus, MessageSquare, Menu, X, Trash2, BookOpen, BookA, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Sidebar() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const fetchSessions = () => {
    fetch('http://127.0.0.1:8000/api/sessions')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setSessions(data);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchSessions();
  }, [pathname]);

  useEffect(() => {
    const handleSessionCreated = () => fetchSessions();
    window.addEventListener('session-created', handleSessionCreated);
    return () => window.removeEventListener('session-created', handleSessionCreated);
  }, []);

  const handleNewChat = () => {
    router.push('/chat');
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2.5 bg-[#FAF9F6] border-2 border-[#2C1A12] rounded-none shadow-[2px_2px_0px_0px_#2C1A12] text-[#2C1A12]"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={20} strokeWidth={2.5} /> : <Menu size={20} strokeWidth={2.5} />}
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
        fixed md:static inset-y-0 left-0 z-40 bg-[#FAF9F6] border-r-2 border-[#2C1A12]/15 flex flex-col transition-all duration-300 ease-in-out shrink-0
        ${isOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0'}
        ${isCollapsed ? 'md:w-20' : 'md:w-72'}
      `}>
        <div className={`p-4 md:p-6 pb-4 flex flex-col ${isCollapsed ? 'items-center px-2' : ''}`}>

          <div className={`flex items-center mb-6 w-full ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            <Link href="/" onClick={() => setIsOpen(false)} className={`flex items-center gap-2 hover:opacity-80 transition-opacity ${isCollapsed ? 'hidden' : 'flex'}`}>

              <h1 className="text-xl font-bold tracking-tight text-[#2C1A12]">URIM-AI</h1>
            </Link>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex p-1.5 text-[#5C4A42] hover:text-[#C84B31] transition-colors rounded-none border border-transparent hover:border-[#C84B31]/30"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? <ChevronRight size={20} strokeWidth={2.5} /> : <ChevronLeft size={20} strokeWidth={2.5} />}
            </button>
          </div>

          <div className={`space-y-3 w-full ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
            <button
              onClick={handleNewChat}
              className={`flex items-center justify-center bg-[#C84B31] text-[#FAF9F6] font-bold uppercase tracking-widest text-sm hover:bg-[#A63A23] transition-all border-2 border-[#2C1A12] shadow-[4px_4px_0px_0px_#2C1A12] active:translate-y-1 active:translate-x-1 active:shadow-none
                ${isCollapsed ? 'w-12 h-12 p-0' : 'w-full gap-2 px-4 py-3'}
              `}
              title="New Consultation"
            >
              <Plus size={isCollapsed ? 22 : 18} strokeWidth={3} className="shrink-0" />
              {!isCollapsed && <span>New Consultation</span>}
            </button>
            <button
              onClick={() => { router.push('/search'); setIsOpen(false); }}
              className={`flex items-center justify-center font-bold transition-all border-2 
                ${isCollapsed ? 'w-12 h-12 p-0' : 'w-full gap-2 px-4 py-2.5'}
                ${pathname === '/search'
                  ? 'bg-[#E19B2D] text-[#2C1A12] border-[#2C1A12] shadow-[2px_2px_0px_0px_#2C1A12]'
                  : 'bg-transparent text-[#2C1A12] border-[#2C1A12]/15 hover:border-[#C84B31] hover:text-[#C84B31]'
                }
              `}
              title="Legal Knowledge"
            >
              <BookOpen size={isCollapsed ? 20 : 18} strokeWidth={2.5} className="shrink-0" />
              {!isCollapsed && <span>Legal Knowledge</span>}
            </button>
            <button
              onClick={() => { router.push('/dictionary'); setIsOpen(false); }}
              className={`flex items-center justify-center font-bold transition-all border-2 
                ${isCollapsed ? 'w-12 h-12 p-0' : 'w-full gap-2 px-4 py-2.5'}
                ${pathname === '/dictionary'
                  ? 'bg-[#E19B2D] text-[#2C1A12] border-[#2C1A12] shadow-[2px_2px_0px_0px_#2C1A12]'
                  : 'bg-transparent text-[#2C1A12] border-[#2C1A12]/15 hover:border-[#C84B31] hover:text-[#C84B31]'
                }
              `}
              title="Dictionary"
            >
              <BookA size={isCollapsed ? 20 : 18} strokeWidth={2.5} className="shrink-0" />
              {!isCollapsed && <span>Dictionary</span>}
            </button>
          </div>
        </div>

        <div className={`flex-1 overflow-y-auto pb-6 ${isCollapsed ? 'hidden' : 'px-3'}`}>
          <div className="text-xs font-bold text-[#C84B31] uppercase tracking-widest px-3 mb-3 mt-4">Recent Sessions</div>
          {sessions.length === 0 ? (
            <div className="px-3 text-sm text-[#5C4A42] opacity-60 font-medium">No recent consultations</div>
          ) : (
            <div className="w-full space-y-1">
              {sessions.map((s) => {
                const isActive = pathname === `/chat/${s.id}`;
                return (
                  <div key={s.id} className="relative group w-full">
                    <button
                      onClick={() => {
                        router.push(`/chat/${s.id}`);
                        setIsOpen(false);
                      }}
                      className={`text-left transition-colors flex items-center w-full px-3 py-2.5 text-sm gap-3 truncate pr-10 border-l-4 rounded-none
                        ${isActive
                          ? 'bg-[#2C1A12]/5 text-[#2C1A12] border-[#C84B31] font-bold'
                          : 'text-[#5C4A42] border-transparent hover:bg-[#2C1A12]/5 font-medium'
                        }
                      `}
                      title={s.title}
                    >
                      <MessageSquare size={16} strokeWidth={2} className={`shrink-0 ${isActive ? 'text-[#C84B31]' : 'opacity-60'}`} />
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
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[#5C4A42]/50 hover:text-[#FAF9F6] hover:bg-[#C84B31] opacity-0 group-hover:opacity-100 transition-all"
                      title="Delete consultation"
                    >
                      <Trash2 size={14} strokeWidth={2.5} />
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
