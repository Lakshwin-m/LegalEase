'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Sidebar() {
  const [sessions, setSessions] = useState<any[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/sessions')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setSessions(data);
      })
      .catch(console.error);
  }, [pathname]);

  return (
    <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-gray-200 bg-gray-50 flex flex-col h-auto md:h-full shrink-0">
      <div className="p-4 border-b border-gray-200">
        <Link 
          href="/" 
          className="block w-full text-center border border-black bg-white text-black py-2 hover:bg-gray-100 font-medium"
        >
          New chat
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {sessions.map(s => (
          <Link
            key={s.id}
            href={`/chat/${s.id}`}
            className={`block truncate p-2 border ${pathname === `/chat/${s.id}` ? 'border-black bg-white font-medium' : 'border-transparent hover:border-gray-300'} text-sm`}
          >
            {s.title}
          </Link>
        ))}
      </div>
    </div>
  );
}
