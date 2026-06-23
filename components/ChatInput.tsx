'use client';

import { useState, KeyboardEvent } from 'react';

export default function ChatInput({ onSend, disabled }: { onSend: (msg: string) => void, disabled?: boolean }) {
  const [text, setText] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (text.trim() && !disabled) {
        onSend(text);
        setText('');
      }
    }
  };

  return (
    <div className="border-t border-gray-200 p-4 bg-white">
      <div className="max-w-3xl mx-auto flex gap-4">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a legal question... (Shift+Enter for newline)"
          className="flex-1 border border-gray-300 p-3 resize-none h-14 outline-none focus:border-black font-sans"
          disabled={disabled}
        />
        <button
          onClick={() => {
            if (text.trim() && !disabled) {
              onSend(text);
              setText('');
            }
          }}
          disabled={!text.trim() || disabled}
          className="border border-black bg-black text-white px-6 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          Send
        </button>
      </div>
    </div>
  );
}
