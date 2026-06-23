import SourceCard from './SourceCard';
import { useState } from 'react';

export default function MessageBubble({ role, content, sources }: { role: string, content: string, sources?: any[] }) {
  const isAssistant = role === 'assistant';
  const [showSources, setShowSources] = useState(false);

  return (
    <div className={`w-full flex ${isAssistant ? 'justify-start' : 'justify-end'} mb-6`}>
      <div className={`w-full max-w-3xl border ${isAssistant ? 'bg-gray-50 border-l-2 border-l-black border-y-gray-200 border-r-gray-200' : 'bg-white border-gray-300'} p-4`}>
        <div className="whitespace-pre-wrap leading-relaxed font-sans text-gray-900">
          {content || <span className="animate-pulse font-mono">_</span>}
        </div>
        
        {isAssistant && sources && sources.length > 0 && (
          <div className="mt-4 border-t border-gray-200 pt-3">
            <button 
              onClick={() => setShowSources(!showSources)}
              className="text-sm underline text-gray-600 hover:text-black hover:no-underline font-medium"
            >
              {showSources ? 'Hide Sources' : 'Show Sources'}
            </button>
            {showSources && (
              <div className="mt-2 space-y-2">
                {sources.map((src, i) => (
                  <SourceCard 
                    key={i} 
                    section={src.section} 
                    offense={src.offense} 
                    punishment={src.punishment} 
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
