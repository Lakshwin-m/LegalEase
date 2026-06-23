import { ArrowUp } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function ChatInput({ onSend, disabled }: { onSend: (text: string) => void, disabled: boolean }) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [text]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (text.trim() && !disabled) {
      onSend(text.trim());
      setText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="p-4 md:p-6 bg-white shrink-0">
      <div className="max-w-3xl mx-auto relative">
        <form 
          onSubmit={handleSubmit}
          className="relative flex items-end border border-zinc-200 bg-white rounded-2xl shadow-sm focus-within:border-zinc-300 focus-within:ring-[3px] focus-within:ring-zinc-100 transition-all overflow-hidden"
        >
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a legal question..."
            disabled={disabled}
            rows={1}
            className="w-full max-h-[200px] py-4 pl-5 pr-14 bg-transparent border-0 focus:ring-0 resize-none outline-none text-zinc-900 placeholder:text-zinc-400 text-base"
          />
          <div className="absolute right-2 bottom-2">
            <button
              type="submit"
              disabled={disabled || !text.trim()}
              className="p-2 rounded-xl bg-black text-white hover:bg-zinc-800 disabled:bg-zinc-100 disabled:text-zinc-400 transition-colors flex items-center justify-center"
            >
              <ArrowUp size={20} strokeWidth={2.5} />
            </button>
          </div>
        </form>
        <div className="text-center mt-3 text-xs text-zinc-400 font-medium">
          LegalEase provides informational responses based on the Indian Penal Code. Not legal advice.
        </div>
      </div>
    </div>
  );
}
