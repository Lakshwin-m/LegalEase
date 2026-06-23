import ReactMarkdown from 'react-markdown';
import SourceCard from './SourceCard';
import { Scale, BrainCircuit, Loader2 } from 'lucide-react';

export default function MessageBubble({ role, content, sources, isStreaming = false }: { role: string, content: string, sources?: any[], isStreaming?: boolean }) {
  const isUser = role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end mb-8">
        <div className="max-w-[85%] bg-[#2C1A12] text-[#FAF9F6] px-5 py-3.5 rounded-2xl rounded-tr-sm">
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
      <div className="flex flex-col items-center shrink-0">
        <div className="w-10 h-10 rounded-full bg-[#C84B31] flex items-center justify-center text-[#FAF9F6] mt-1 shadow-sm">
          <Scale size={18} strokeWidth={2.5} />
        </div>
        <span className="text-[10px] font-bold text-[#5C4A42] mt-1.5 uppercase tracking-widest">MEI</span>
      </div>
      <div className="flex-1 min-w-0">
        
        {/* Loading indicator — shown while streaming and no content yet */}
        {isStreaming && isEmpty && (
          <div className="flex items-center gap-3 py-4">
            <Loader2 size={18} className="animate-spin text-[#C84B31]" />
            <span className="text-[#5C4A42] text-sm font-medium">Analyzing your query...</span>
            <span className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-[#C84B31]/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-1.5 h-1.5 bg-[#C84B31]/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-1.5 h-1.5 bg-[#C84B31]/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </span>
          </div>
        )}

        {thinkContent && (
          <div className="mb-6 overflow-hidden rounded-xl bg-white border border-[#2C1A12]/10 text-[#5C4A42] text-sm shadow-sm">
            <div className="px-4 py-2 bg-[#FAF9F6] border-b border-[#2C1A12]/10 font-bold flex items-center gap-2">
              <BrainCircuit size={16} className={content.includes('</think>') ? 'text-[#5C4A42]/50' : 'text-[#E19B2D] animate-pulse'} />
              <span className="uppercase tracking-widest text-xs">{content.includes('</think>') ? 'Thought Process' : 'Thinking...'}</span>
            </div>
            <div className="px-4 py-3 whitespace-pre-wrap font-mono text-[13px] leading-relaxed max-h-96 overflow-y-auto">
              {thinkContent}
            </div>
          </div>
        )}

        <div className="prose max-w-none text-[#2C1A12] prose-p:leading-[1.8] prose-p:mb-6 prose-headings:font-bold prose-headings:text-[#2C1A12] prose-headings:mt-8 prose-headings:mb-4 prose-strong:font-bold prose-strong:text-[#2C1A12] prose-ul:space-y-3 prose-li:leading-[1.8] marker:text-[#C84B31] text-[15px]">
          {mainContent && <ReactMarkdown>{mainContent}</ReactMarkdown>}
        </div>

        {/* Streaming cursor — shown when actively receiving text */}
        {isStreaming && mainContent && (
          <span className="inline-block w-2 h-4 bg-[#C84B31] animate-pulse ml-0.5 -mb-0.5 rounded-sm"></span>
        )}
        
        {sources && sources.length > 0 && (
          <div className="mt-6">
            <div className="text-xs font-bold text-[#C84B31] uppercase tracking-widest mb-3">Sources</div>
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
