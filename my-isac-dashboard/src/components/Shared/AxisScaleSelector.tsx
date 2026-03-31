'use client';
// src/components/Shared/AxisScaleSelector.tsx

interface AxisScaleSelectorProps {
  value: 'auto' | 'zero';
  onChange: (v: 'auto' | 'zero') => void;
}

export default function AxisScaleSelector({ value, onChange }: AxisScaleSelectorProps) {
  return (
    <div className="flex items-center gap-1 text-xs">
      <span className="text-slate-400 mr-1">Eje Y:</span>
      {(['auto', 'zero'] as const).map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-2 py-1 rounded border transition-colors ${
            value === opt
              ? 'bg-sky-600 border-sky-600 text-white'
              : 'border-slate-600 text-slate-400 hover:border-sky-500 hover:text-sky-400'
          }`}
        >
          {opt === 'auto' ? 'Dinámico' : 'Desde 0'}
        </button>
      ))}
    </div>
  );
}
