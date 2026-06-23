'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import { Scale, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

const LANGUAGES = [
  { code: 'English', label: 'English', flag: '🇬🇧' },
  { code: 'Hindi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'Tamil', label: 'தமிழ்', flag: '🇮🇳' },
  { code: 'Telugu', label: 'తెలుగు', flag: '🇮🇳' },
  { code: 'Kannada', label: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'Malayalam', label: 'മലയാളം', flag: '🇮🇳' },
  { code: 'Bengali', label: 'বাংলা', flag: '🇮🇳' },
  { code: 'Marathi', label: 'मराठी', flag: '🇮🇳' },
  { code: 'Gujarati', label: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'Punjabi', label: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'Urdu', label: 'اردو', flag: '🇮🇳' },
];

export default function ChatWindow({ sessionId, initialMessages = [] }: { sessionId: string, initialMessages?: any[] }) {
  const [messages, setMessages] = useState<any[]>(initialMessages);
  const [isStreaming, setIsStreaming] = useState(false);
  const [language, setLanguage] = useState('English');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState(sessionId);
  const scrollRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Close language menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setShowLangMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const sendMessage = async (text: string) => {
    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setIsStreaming(true);

    let currentSid = activeSessionId;
    if (!currentSid) {
      try {
        const title = text.length > 30 ? text.substring(0, 30) + '...' : text;
        const res = await fetch('http://127.0.0.1:8000/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title })
        });
        const data = await res.json();
        if (data.id) {
          currentSid = data.id;
          setActiveSessionId(currentSid);
          window.history.replaceState({}, '', `/chat/${currentSid}`);
          window.dispatchEvent(new Event('session-created'));
        }
      } catch (e) {
        console.error('Failed to create session', e);
      }
    }

    try {
      const res = await fetch('http://127.0.0.1:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: currentSid, message: text, language })
      });

      if (!res.body) throw new Error('No body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantMsg = { role: 'assistant', content: '', sources: [] };

      setMessages([...newMessages, assistantMsg]);

      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || ''; 

        for (const part of parts) {
          if (part.startsWith('data: ')) {
            const dataStr = part.slice(6);
            if (dataStr === '[DONE]') {
              setIsStreaming(false);
              break;
            }
            try {
              const data = JSON.parse(dataStr);
              if (data.text) {
                assistantMsg.content += data.text;
                setMessages([...newMessages, { ...assistantMsg }]);
              } else if (data.sources) {
                assistantMsg.sources = data.sources;
                setMessages([...newMessages, { ...assistantMsg }]);
              }
            } catch (e) {
              console.error('Failed to parse SSE JSON:', dataStr);
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsStreaming(false);
    }
  };

  const selectedLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];
  const isEmpty = messages.length === 0;

  return (
    <div className="flex-1 flex flex-col h-[100dvh] bg-[#FAF9F6] min-w-0 pt-14 md:pt-0 relative overflow-hidden">
      
      {/* Background Watermark when Empty */}
      {isEmpty && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center opacity-[0.03] pointer-events-none select-none w-full z-0">
          <span className="text-[20vw] md:text-[25vw] font-serif font-bold leading-[0.8] whitespace-nowrap text-[#2C1A12]">
            भारत
          </span>
        </div>
      )}

      {/* Removed Top Bar Language Selector */}

      <div 
        ref={scrollRef}
        className={`flex-1 overflow-y-auto px-4 md:px-8 pb-4 scrollbar-hide z-10 flex flex-col ${isEmpty ? 'justify-center' : 'pt-4 md:pt-8'}`}
      >
        <div className={`mx-auto w-full ${isEmpty ? 'max-w-4xl' : 'max-w-3xl'}`}>
          {isEmpty ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center text-center -mt-20 w-full"
            >
              <div className="flex gap-4 items-center mb-8">
                <span className="text-[#C84B31] text-2xl font-serif font-bold">சட்டம்</span>
                <span className="w-1.5 h-1.5 bg-[#E19B2D] rounded-none rotate-45" />
                <span className="text-[#C84B31] text-2xl font-serif font-bold">न्याय</span>
                <span className="w-1.5 h-1.5 bg-[#E19B2D] rounded-none rotate-45" />
                <span className="text-[#C84B31] text-2xl font-serif font-bold">న్యాయం</span>
              </div>
              
              <h2 className="text-5xl md:text-6xl font-bold tracking-tighter text-[#2C1A12] mb-12 leading-tight">
                Understand the Law.<br />
                <span className="text-[#C84B31]">Find Your Answers.</span>
              </h2>

              <div className="w-full relative z-30">
                <ChatInput onSend={sendMessage} disabled={isStreaming} isCentered={true} language={language} setLanguage={setLanguage} />
              </div>

              <div className="mt-12 flex flex-wrap gap-3 justify-center max-w-2xl">
                {['What is the punishment for cyber fraud?', 'धारा 302 क्या है?', 'Domestic violence legal protections'].map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="px-5 py-2.5 text-sm border-2 border-[#2C1A12]/15 bg-white text-[#2C1A12] font-bold uppercase tracking-wider hover:border-[#C84B31] hover:text-[#C84B31] transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="pb-8">
              {messages.map((m, i) => (
                <MessageBubble
                  key={i}
                  role={m.role}
                  content={m.content}
                  sources={m.sources}
                  isStreaming={isStreaming && i === messages.length - 1 && m.role === 'assistant'}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      
      {!isEmpty && (
        <div className="shrink-0 bg-gradient-to-t from-[#FAF9F6] via-[#FAF9F6] to-transparent pt-4 z-20">
          <ChatInput onSend={sendMessage} disabled={isStreaming} isCentered={false} language={language} setLanguage={setLanguage} />
        </div>
      )}
    </div>
  );
}
