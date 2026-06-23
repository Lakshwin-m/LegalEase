'use client';

import { useRouter } from 'next/navigation';
import { Scale } from 'lucide-react';
import Sidebar from '@/components/Sidebar';

export default function Home() {
  const router = useRouter();

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
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex w-full h-screen bg-white">
      <Sidebar />
      <main className="flex-1 flex flex-col items-center justify-center relative px-4">
        <div className="flex flex-col items-center justify-center text-center max-w-lg mx-auto">
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-white mb-6 shadow-sm">
            <Scale size={32} strokeWidth={2} />
          </div>
          <h2 className="text-3xl font-semibold tracking-tight text-black mb-3">
            LegalEase AI
          </h2>
          <p className="text-zinc-500 text-lg mb-8">
            Your local, private, and fully grounded legal assistant for the Indian Penal Code.
          </p>
          <button 
            onClick={handleNewChat}
            className="bg-black text-white px-6 py-3 rounded-xl font-medium hover:bg-zinc-800 transition-colors shadow-sm"
          >
            Start a new conversation
          </button>
        </div>
      </main>
    </div>
  );
}
