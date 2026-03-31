'use client';
// src/components/IsacInsumosAreaChart.tsx
import { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { IsacInsumo, TipoSerie } from '@/types/isac';
import { INSUMOS_NOMBRES, INSUMO_KEYS, ISAC_COLORS, SERIE_LABELS } from '@/utils/constants';
import { formatFechaMes, formatNumero } from '@/utils/formatters';
import { filtrarPorFecha } from '@/utils/calculations';
import DateRangeFilter from './Shared/DateRangeFilter';
import AxisScaleSelector from './Shared/AxisScaleSelector';

interface Props {
  dataOrig: IsacInsumo[];
  dataDesest: IsacInsumo[];
  dataTend: IsacInsumo[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const sorted = [...payload].sort((a, b) => b.value - a.value);
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-lg text-xs max-h-64 overflow-y-auto">
      <p className="font-semibold text-slate-800 mb-2 sticky top-0 bg-white pb-1">
        {formatFechaMes(label)}
      </p>
      {sorted.map((p: any) => (
        <div key={p.dataKey} className="flex justify-between gap-4">
          <span style={{ color: p.stroke }}>{p.name}</span>
          <span className="text-slate-600 font-mono">{formatNumero(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default function IsacInsumosAreaChart({ dataOrig, dataDesest, dataTend }: Props) {
  const datasets: Record<TipoSerie, IsacInsumo[]> = {
    original: dataOrig, desest: dataDesest, tendencia: dataTend,
  };

  const [tipo, setTipo] = useState<TipoSerie>('original');
  const activeData = datasets[tipo];
  const min = activeData[0]?.fecha ?? '';
  const max = activeData[activeData.length - 1]?.fecha ?? '';
  const [desde, setDesde] = useState(min);
  const [hasta, setHasta] = useState(max);
  const [scale, setScale] = useState<'auto' | 'zero'>('auto');
  
  // CORRECCIÓN 1: Se añade el cast "as string[]" para asegurar compatibilidad con Set<string>
  const [activas, setActivas] = useState<Set<string>>(new Set(INSUMO_KEYS as string[]));

  const filtered = useMemo(() => filtrarPorFecha(activeData, desde, hasta), [activeData, desde, hasta]);

  const toggleInsumo = (key: string) =>
    setActivas((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const toggleAll = () =>
    // CORRECCIÓN 2: Se añade el cast "as string[]" aquí también
    setActivas(activas.size === INSUMO_KEYS.length ? new Set() : new Set(INSUMO_KEYS as string[]));

  return (
    <section className="card">
      <div className="card-header">
        <div>
          <h2 className="chart-title">Insumos de la Construcción</h2>
          <p className="chart-subtitle">Índices por material · Base 2004=100</p>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <DateRangeFilter
            desde={desde} hasta={hasta} min={min} max={max}
            onDesdeChange={setDesde} onHastaChange={setHasta}
          />
          <AxisScaleSelector value={scale} onChange={setScale} />
        </div>
      </div>

      {/* Tipo de serie */}
      <div className="flex gap-2 mb-4 flex-wrap items-center">
        {(Object.entries(SERIE_LABELS) as [TipoSerie, string][]).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTipo(k)}
            className={`px-3 py-1 rounded-full text-xs border transition-all ${
              tipo === k
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-transparent text-slate-500 border-slate-300 hover:border-slate-400'
            }`}
          >
            {label}
          </button>
        ))}
        <div className="ml-auto">
          <button onClick={toggleAll} className="text-xs text-slate-500 hover:text-blue-600 transition-colors">
            {activas.size === INSUMO_KEYS.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
          </button>
        </div>
      </div>

      {/* Insumo toggles */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {INSUMO_KEYS.map((key, i) => (
          <button
            key={key}
            onClick={() => toggleInsumo(key as string)}
            className={`px-2 py-0.5 rounded text-xs border transition-all ${
              activas.has(key as string)
                ? 'text-white border-transparent'
                : 'bg-transparent text-slate-600 border-slate-300'
            }`}
            style={activas.has(key as string) ? { backgroundColor: ISAC_COLORS[i], borderColor: ISAC_COLORS[i] } : {}}
          >
            {INSUMOS_NOMBRES[key as keyof typeof INSUMOS_NOMBRES]}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={filtered} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(203,213,225,0.2)" vertical={false} />
          <XAxis
            dataKey="fecha"
            tickFormatter={formatFechaMes}
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={false}
            minTickGap={40}
          />
          <YAxis
            domain={scale === 'zero' ? [0, 'auto'] : ['auto', 'auto']}
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => formatNumero(v, 0)}
            width={55}
          />
          <Tooltip content={<CustomTooltip />} />
          {INSUMO_KEYS.map((key, i) =>
            activas.has(key as string) ? (
              <Line
                key={key}
                type="monotone"
                dataKey={key as string}
                name={INSUMOS_NOMBRES[key as keyof typeof INSUMOS_NOMBRES]}
                stroke={ISAC_COLORS[i % ISAC_COLORS.length]}
                strokeWidth={1.5}
                dot={false}
                activeDot={{ r: 3, strokeWidth: 0 }}
              />
            ) : null,
          )}
        </LineChart>
      </ResponsiveContainer>
    </section>
  );
}
