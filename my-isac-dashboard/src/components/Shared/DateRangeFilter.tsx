'use client';
// src/components/Shared/DateRangeFilter.tsx

interface DateRangeFilterProps {
  desde: string;
  hasta: string;
  min: string;
  max: string;
  onDesdeChange: (v: string) => void;
  onHastaChange: (v: string) => void;
}

export default function DateRangeFilter({
  desde, hasta, min, max, onDesdeChange, onHastaChange,
}: DateRangeFilterProps) {
  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="text-slate-500">Período:</span>
      <input
        type="month"
        value={desde.slice(0, 7)}
        min={min.slice(0, 7)}
        max={hasta.slice(0, 7)}
        onChange={(e) => onDesdeChange(e.target.value + '-01')}
        className="bg-white border border-slate-300 rounded px-2 py-1 text-slate-800
                   focus:outline-none focus:border-blue-500 hover:border-slate-400 transition-colors"
      />
      <span className="text-slate-400">→</span>
      <input
        type="month"
        value={hasta.slice(0, 7)}
        min={desde.slice(0, 7)}
        max={max.slice(0, 7)}
        onChange={(e) => onHastaChange(e.target.value + '-01')}
        className="bg-white border border-slate-300 rounded px-2 py-1 text-slate-800
                   focus:outline-none focus:border-blue-500 hover:border-slate-400 transition-colors"
      />
    </div>
  );
}
