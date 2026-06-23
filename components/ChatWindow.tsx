'use client';

import { useState, useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import { Scale } from 'lucide-react';

export default function ChatWindow({ sessionId, initialMessages = [] }: { sessionId: string, initialMessages?: any[] }) {
  const [messages, setMessages] = useState<any[]>(initialMessages);
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (text: string) => {
    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setIsStreaming(true);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: text })
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

  return (
    <div className="flex-1 flex flex-col h-[100dvh] bg-white min-w-0 pt-14 md:pt-0">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 md:px-8 pt-8 md:pt-12 pb-4 scrollbar-hide"
      >
        <div className="max-w-3xl mx-auto w-full">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center mt-20 md:mt-32 max-w-lg mx-auto">
              <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-white mb-6 shadow-sm">
                <Scale size={32} strokeWidth={2} />
              </div>
              <h2 className="text-3xl font-semibold tracking-tight text-black mb-3">
                How can I help you today?
              </h2>
              <p className="text-zinc-500 text-lg">
                Ask any legal question related to the Indian Penal Code to receive a fully grounded answer.
              </p>
            </div>
          ) : (
            <div className="pb-8">
              {messages.map((m, i) => (
                <MessageBubble key={i} role={m.role} content={m.content} sources={m.sources} />
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
