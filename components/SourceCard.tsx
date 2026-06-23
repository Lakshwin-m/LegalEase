export default function SourceCard({ section, offense, punishment }: { section: string, offense: string, punishment: string }) {
  return (
    <div className="border border-gray-200 p-3 mt-2 text-sm bg-white">
      <div className="font-mono font-medium mb-1 border-b border-gray-100 pb-1">Section {section} | {offense}</div>
      <div className="text-gray-700">Punishment: {punishment}</div>
    </div>
  );
}
