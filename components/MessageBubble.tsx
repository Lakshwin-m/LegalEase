import ReactMarkdown from 'react-markdown';
import SourceCard from './SourceCard';
import { Scale, BrainCircuit, Loader2 } from 'lucide-react';

export default function MessageBubble({ role, content, sources, isStreaming = false }: { role: string, content: string, sources?: any[], isStreaming?: boolean }) {
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

  let thinkContent = '';
  let mainContent = content;

  // Extract <think> block specifically for DeepSeek models
  const thinkMatch = content.match(/<think>([\s\S]*?)(?:<\/think>|$)/);
  if (thinkMatch) {
    thinkContent = thinkMatch[1].trim();
    mainContent = content.replace(/<think>[\s\S]*?(?:<\/think>|$)/, '').trim();
  }

  const isEmpty = !mainContent && !thinkContent;

  return (
    <div className="flex gap-4 mb-10">
      <div className="w-8 h-8 rounded-full bg-black shrink-0 flex items-center justify-center text-white mt-1">
        <Scale size={16} strokeWidth={2.5} />
      </div>
      <div className="flex-1 min-w-0">
        
        {/* Loading indicator — shown while streaming and no content yet */}
        {isStreaming && isEmpty && (
          <div className="flex items-center gap-3 py-4">
            <Loader2 size={18} className="animate-spin text-zinc-400" />
            <span className="text-zinc-400 text-sm font-medium">Analyzing your query...</span>
            <span className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-zinc-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-1.5 h-1.5 bg-zinc-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-1.5 h-1.5 bg-zinc-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </span>
          </div>
        )}

        {thinkContent && (
          <div className="mb-6 overflow-hidden rounded-xl bg-zinc-50 border border-zinc-100 text-zinc-600 text-sm">
            <div className="px-4 py-2 bg-zinc-100/50 border-b border-zinc-100 font-medium flex items-center gap-2">
              <BrainCircuit size={16} className={content.includes('</think>') ? 'text-zinc-400' : 'text-blue-500 animate-pulse'} />
              {content.includes('</think>') ? 'Thought Process' : 'Thinking...'}
            </div>
            <div className="px-4 py-3 whitespace-pre-wrap font-mono text-[13px] leading-relaxed max-h-96 overflow-y-auto">
              {thinkContent}
            </div>
          </div>
        )}

        <div className="prose prose-zinc max-w-none text-zinc-900">
          {mainContent && <ReactMarkdown>{mainContent}</ReactMarkdown>}
        </div>

        {/* Streaming cursor — shown when actively receiving text */}
        {isStreaming && mainContent && (
          <span className="inline-block w-2 h-4 bg-zinc-800 animate-pulse ml-0.5 -mb-0.5 rounded-sm"></span>
        )}
        
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
