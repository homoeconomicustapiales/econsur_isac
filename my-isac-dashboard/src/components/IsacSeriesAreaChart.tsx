'use client';
// src/components/IsacSeriesAreaChart.tsx
import { useState, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { IsacNivelGeneral } from '@/types/isac';
import { NIVEL_SERIES } from '@/utils/constants';
import { formatFechaMes, formatNumero } from '@/utils/formatters';
import { filtrarPorFecha } from '@/utils/calculations';
import DateRangeFilter from './Shared/DateRangeFilter';
import AxisScaleSelector from './Shared/AxisScaleSelector';

interface Props { data: IsacNivelGeneral[] }

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-xl text-xs">
      <p className="font-semibold text-slate-200 mb-2">{formatFechaMes(label)}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex justify-between gap-4">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="text-slate-200 font-mono">{formatNumero(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default function IsacSeriesAreaChart({ data }: Props) {
  const min = data[0]?.fecha ?? '';
  const max = data[data.length - 1]?.fecha ?? '';
  const [desde, setDesde] = useState(min);
  const [hasta, setHasta] = useState(max);
  const [scale, setScale] = useState<'auto' | 'zero'>('auto');
  const [activas, setActivas] = useState<Set<string>>(
    new Set(NIVEL_SERIES.map((s) => s.key)),
  );

  const filtered = useMemo(() => filtrarPorFecha(data, desde, hasta), [data, desde, hasta]);

  const toggleSerie = (key: string) =>
    setActivas((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  return (
    <section className="card">
      <div className="card-header">
        <div>
          <h2 className="chart-title">Índice Sintético de Actividad de la Construcción</h2>
          <p className="chart-subtitle">Nivel General · Base 2004=100</p>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <DateRangeFilter
            desde={desde} hasta={hasta} min={min} max={max}
            onDesdeChange={setDesde} onHastaChange={setHasta}
          />
          <AxisScaleSelector value={scale} onChange={setScale} />
        </div>
      </div>

      {/* Serie toggles */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {NIVEL_SERIES.map((s) => (
          <button
            key={s.key}
            onClick={() => toggleSerie(s.key)}
            className={`px-3 py-1 rounded-full text-xs border transition-all ${
              activas.has(s.key)
                ? 'text-white border-transparent'
                : 'bg-transparent text-slate-500 border-slate-700'
            }`}
            style={activas.has(s.key) ? { backgroundColor: s.color, borderColor: s.color } : {}}
          >
            {s.label}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={380}>
        <AreaChart data={filtered} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <defs>
            {NIVEL_SERIES.map((s) => (
              <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={s.color} stopOpacity={0.15} />
                <stop offset="95%" stopColor={s.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" vertical={false} />
          <XAxis
            dataKey="fecha"
            tickFormatter={formatFechaMes}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={{ stroke: '#334155' }}
            tickLine={false}
            minTickGap={40}
          />
          <YAxis
            domain={scale === 'zero' ? [0, 'auto'] : ['auto', 'auto']}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => formatNumero(v, 0)}
            width={55}
          />
          <Tooltip content={<CustomTooltip />} />
          {NIVEL_SERIES.map((s) =>
            activas.has(s.key) ? (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={s.color}
                fill={`url(#grad-${s.key})`}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            ) : null,
          )}
        </AreaChart>
      </ResponsiveContainer>
    </section>
  );
}
