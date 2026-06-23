import { ArrowUp, Globe } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const LANGUAGES = [
  { code: 'English', label: 'English' },
  { code: 'Hindi', label: 'हिन्दी' },
  { code: 'Tamil', label: 'தமிழ்' },
  { code: 'Telugu', label: 'తెలుగు' },
  { code: 'Kannada', label: 'ಕನ್ನಡ' },
  { code: 'Malayalam', label: 'മലയാളം' },
  { code: 'Bengali', label: 'বাংলা' },
  { code: 'Marathi', label: 'मराठी' },
  { code: 'Gujarati', label: 'ગુજરાતી' },
  { code: 'Punjabi', label: 'ਪੰਜਾਬੀ' },
];

export default function ChatInput({ 
  onSend, 
  disabled, 
  isCentered = false,
  language = 'English',
  setLanguage = () => {}
}: { 
  onSend: (text: string) => void, 
  disabled: boolean, 
  isCentered?: boolean,
  language?: string,
  setLanguage?: (lang: string) => void
}) {
  const [text, setText] = useState('');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [text]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setShowLangMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (text.trim() && !disabled) {
      onSend(text.trim());
      setText('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={`w-full ${isCentered ? '' : 'p-4 md:p-6 bg-[#FAF9F6] shrink-0'}`}>
      <div className={`${isCentered ? 'max-w-3xl' : 'max-w-2xl'} mx-auto relative`}>
        <form 
          onSubmit={handleSubmit}
          className={`relative flex items-end bg-white ${
            isCentered 
              ? 'border-4 border-[#2C1A12] shadow-[6px_6px_0px_0px_#E19B2D] focus-within:shadow-[2px_2px_0px_0px_#E19B2D] focus-within:translate-x-1 focus-within:translate-y-1' 
              : 'border-2 border-[#2C1A12] shadow-[3px_3px_0px_0px_#E19B2D] focus-within:shadow-[1px_1px_0px_0px_#E19B2D] focus-within:translate-x-px focus-within:translate-y-px'
          } rounded-[32px] transition-all overflow-visible ${isCentered ? 'p-2' : 'p-1.5'}`}
        >
          {/* Left: Language Selector */}
          <div ref={langRef} className="relative shrink-0">
            <button
              type="button"
              onClick={() => setShowLangMenu(!showLangMenu)}
              className={`flex items-center justify-center ${isCentered ? 'h-12 w-12' : 'h-10 w-10'} rounded-full hover:bg-[#2C1A12]/5 transition-colors text-[#5C4A42] hover:text-[#2C1A12]`}
            >
              <Globe size={isCentered ? 24 : 20} className="text-[#C84B31]" />
            </button>

            {showLangMenu && (
              <div 
                className={`absolute ${isCentered ? 'top-full mt-4' : 'top-full mt-2'} left-0 w-32 bg-white border-2 border-[#2C1A12] shadow-[4px_4px_0px_0px_#2C1A12] z-50 py-1 max-h-[200px] overflow-y-auto rounded-2xl`}
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <style jsx>{`
                  div::-webkit-scrollbar {
                    display: none;
                  }
                `}</style>
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      setLanguage(lang.code);
                      setShowLangMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors border-b last:border-b-0 border-[#2C1A12]/10 ${
                      language === lang.code
                        ? 'bg-[#C84B31] text-white font-bold'
                        : 'text-[#2C1A12] hover:bg-[#FAF9F6] font-bold'
                    }`}
                  >
                    <span className="uppercase tracking-wider">{lang.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Middle: Textarea */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isCentered ? "Ask a legal question..." : "Ask a follow-up question..."}
            disabled={disabled}
            rows={1}
            className={`flex-1 bg-transparent border-0 focus:ring-0 resize-none outline-none text-[#2C1A12] placeholder:text-[#5C4A42]/50 font-bold tracking-tight leading-normal ${isCentered ? 'text-lg px-2 py-3' : 'text-base px-2 py-2.5'} max-h-[150px]`}
            style={{ minHeight: isCentered ? '52px' : '44px' }}
          />

          {/* Right: Submit Button */}
          <button
            type="submit"
            disabled={disabled || !text.trim()}
            className={`shrink-0 ${isCentered ? 'h-12 w-12' : 'h-10 w-10'} rounded-full bg-[#C84B31] text-white hover:bg-[#A63A23] disabled:bg-gray-100 disabled:text-gray-400 transition-all flex items-center justify-center ml-1`}
          >
            <ArrowUp size={isCentered ? 24 : 20} strokeWidth={3} />
          </button>
        </form>
        <div className={`text-center ${isCentered ? 'mt-4 text-xs' : 'mt-2 text-[10px]'} text-[#5C4A42] font-bold uppercase tracking-widest`}>
          URIM-AI • Local AI • Not Legal Advice
        </div>
      </div>
    </div>
  );
}
