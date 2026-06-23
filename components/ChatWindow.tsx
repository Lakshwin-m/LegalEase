'use client';

import { useState, useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';

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
    <div className="flex-1 flex flex-col h-full bg-white min-w-0">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-8"
      >
        <div className="max-w-3xl mx-auto w-full">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-20 border border-gray-200 p-8">
              <h2 className="text-black font-medium mb-2 text-lg">Welcome to LegalEase</h2>
              <p>Ask a legal question related to the Indian Penal Code to begin.</p>
            </div>
          ) : (
            messages.map((m, i) => (
              <MessageBubble key={i} role={m.role} content={m.content} sources={m.sources} />
            ))
          )}
        </div>
      </div>
      <ChatInput onSend={sendMessage} disabled={isStreaming} />
    </div>
  );
}
