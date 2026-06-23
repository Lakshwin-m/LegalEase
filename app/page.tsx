'use client';

import Sidebar from '@/components/Sidebar';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const handleNewChat = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/sessions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: 'New Chat' }) });
      const data = await res.json();
      if (data.id) {
        router.push(`/chat/${data.id}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex w-full h-full">
      <Sidebar />
      <div className="flex-1 flex items-center justify-center bg-white p-4">
        <div className="max-w-md w-full border border-black p-8 text-center">
          <h1 className="text-2xl font-bold mb-4 font-serif">LegalEase</h1>
          <p className="text-gray-600 mb-8">Local-first AI legal assistant powered by the Indian Penal Code.</p>
          <button 
            onClick={handleNewChat}
            className="w-full border border-black bg-black text-white py-3 font-medium hover:bg-gray-800"
          >
            Start New Chat
          </button>
        </div>
      </div>
    </div>
  );
}
