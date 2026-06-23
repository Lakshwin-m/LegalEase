import { Scale } from 'lucide-react';

export default function SourceCard({ section, offense, punishment, description }: { section: string, offense: string, punishment: string, description: string }) {
  return (
    <div className="mt-4 border-2 border-[#2C1A12]/10 rounded-xl p-5 bg-white transition-all hover:bg-[#2C1A12]/5 hover:border-[#2C1A12]/20">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 p-1.5 bg-[#2C1A12]/5 rounded-md text-[#E19B2D]">
          <Scale size={16} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-[#2C1A12]">Section {section}: {offense}</h4>
          <p className="text-xs font-bold text-[#C84B31] mt-1 uppercase tracking-wider">Punishment: {punishment}</p>
          <p className="text-sm text-[#5C4A42] mt-3 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}
