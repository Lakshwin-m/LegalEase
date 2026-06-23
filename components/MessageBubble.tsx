import ReactMarkdown from 'react-markdown';
import SourceCard from './SourceCard';
import { Scale } from 'lucide-react';

export default function MessageBubble({ role, content, sources }: { role: string, content: string, sources?: any[] }) {
  const isUser = role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end mb-8">
        <div className="max-w-[85%] bg-zinc-100 text-zinc-900 px-5 py-3.5 rounded-2xl rounded-tr-sm">
          <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 mb-10">
      <div className="w-8 h-8 rounded-full bg-black shrink-0 flex items-center justify-center text-white mt-1">
        <Scale size={16} strokeWidth={2.5} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="prose prose-zinc max-w-none text-zinc-900">
          {content || <span className="animate-pulse font-mono text-zinc-400">_</span>}
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
        
        {sources && sources.length > 0 && (
          <div className="mt-6">
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">Sources</div>
            <div className="grid gap-3">
              {sources.map((s, i) => (
                <SourceCard key={i} {...s} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
