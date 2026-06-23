import { Scale } from 'lucide-react';

export default function SourceCard({ section, offense, punishment, description }: { section: string, offense: string, punishment: string, description: string }) {
  return (
    <div className="mt-4 border border-zinc-200 rounded-xl p-5 bg-white transition-all hover:bg-zinc-50/50">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 p-1.5 bg-zinc-100 rounded-md text-zinc-600">
          <Scale size={16} />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-zinc-900">Section {section}: {offense}</h4>
          <p className="text-xs font-medium text-zinc-500 mt-1 uppercase tracking-wider">Punishment: {punishment}</p>
          <p className="text-sm text-zinc-600 mt-3 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}
