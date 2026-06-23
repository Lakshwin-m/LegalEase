'use client';

import { useState, useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import { Scale, Globe } from 'lucide-react';

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

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

    try {
      const res = await fetch('http://127.0.0.1:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: text, language })
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

  return (
    <div className="flex-1 flex flex-col h-[100dvh] bg-white min-w-0 pt-14 md:pt-0">
      {/* Language Selector - Top Bar */}
      <div className="shrink-0 flex items-center justify-end px-4 md:px-8 pt-3 pb-1">
        <div ref={langRef} className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border border-zinc-200 hover:bg-zinc-50 transition-colors text-zinc-600"
          >
            <Globe size={14} className="text-zinc-400" />
            <span>{selectedLang.flag} {selectedLang.label}</span>
          </button>

          {showLangMenu && (
            <div className="absolute right-0 mt-1 w-48 bg-white border border-zinc-200 rounded-xl shadow-lg overflow-hidden z-50 py-1 animate-in fade-in slide-in-from-top-1 duration-150">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setShowLangMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 transition-colors ${
                    language === lang.code
                      ? 'bg-zinc-100 text-black font-medium'
                      : 'text-zinc-600 hover:bg-zinc-50'
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.label}</span>
                  <span className="ml-auto text-xs text-zinc-400">{lang.code}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 md:px-8 pt-4 md:pt-8 pb-4 scrollbar-hide"
      >
        <div className="max-w-3xl mx-auto w-full">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center mt-16 md:mt-28 max-w-lg mx-auto">
              <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-white mb-6 shadow-sm">
                <Scale size={32} strokeWidth={2} />
              </div>
              <h2 className="text-3xl font-semibold tracking-tight text-black mb-3">
                How can I help you today?
              </h2>
              <p className="text-zinc-500 text-lg mb-6">
                Ask any legal question related to the Indian Penal Code in your preferred language.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {['What is Section 302?', 'धारा 420 क्या है?', 'Section 376 பற்றி கூறுங்கள்'].map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="px-4 py-2 text-sm border border-zinc-200 rounded-full text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300 transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
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
      <div className="shrink-0 bg-gradient-to-t from-white via-white to-transparent pt-4">
        <ChatInput onSend={sendMessage} disabled={isStreaming} />
      </div>
    </div>
  );
}
