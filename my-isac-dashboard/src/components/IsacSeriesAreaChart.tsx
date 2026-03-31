'use client';
// src/components/IsacSeriesAreaChart.tsx
import { useState, useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { IsacNivelGeneral } from '@/types/isac';
import { NIVEL_SERIES } from '@/utils/constants';
import { formatFechaMes, formatNumero } from '@/utils/formatters';
import { filtrarPorFecha } from '@/utils/calculations';
import DateRangeFilter from './Shared/DateRangeFilter';
import AxisScaleSelector from './Shared/AxisScaleSelector';

type Tab = 'nivel' | 'interanual' | 'mensual';

interface Props { data: IsacNivelGeneral[] }

// ── Helpers de cálculo ──────────────────────────────────────────────────────
type VarEntry = { fecha: string; [key: string]: string | number };

function calcVarInteranual(data: IsacNivelGeneral[]): VarEntry[] {
  return data
    .map((row, i) => {
      const hace12 = data[i - 12];
      if (!hace12) return null;
      const entry: VarEntry = { fecha: row.fecha };
      for (const s of NIVEL_SERIES) {
        const actual = row[s.key] as number;
        const anterior = hace12[s.key] as number;
        entry[s.key] = parseFloat((((actual - anterior) / anterior) * 100).toFixed(2));
      }
      return entry;
    })
    .filter(Boolean) as VarEntry[];
}

function calcVarMensual(data: IsacNivelGeneral[]): VarEntry[] {
  return data
    .map((row, i) => {
      const prev = data[i - 1];
      if (!prev) return null;
      const entry: VarEntry = { fecha: row.fecha };
      for (const s of NIVEL_SERIES) {
        const actual = row[s.key] as number;
        const anterior = prev[s.key] as number;
        entry[s.key] = parseFloat((((actual - anterior) / anterior) * 100).toFixed(2));
      }
      return entry;
    })
    .filter(Boolean) as VarEntry[];
}

// ── Tooltips ────────────────────────────────────────────────────────────────
const TooltipNivel = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-lg text-xs">
      <p className="font-semibold text-slate-800 mb-2">{formatFechaMes(label)}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex justify-between gap-4">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="text-slate-600 font-mono">{formatNumero(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

const TooltipVariacion = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-lg text-xs">
      <p className="font-semibold text-slate-800 mb-2">{formatFechaMes(label)}</p>
      {payload.map((p: any) => {
        const val = p.value as number;
        return (
          <div key={p.dataKey} className="flex justify-between gap-4">
            <span style={{ color: p.fill }}>{p.name}</span>
            <span className="font-mono" style={{ color: val >= 0 ? '#22c55e' : '#ef4444' }}>
              {val >= 0 ? '+' : ''}{formatNumero(val)}%
            </span>
          </div>
        );
      })}
    </div>
  );
};

// ── Constantes de tabs ──────────────────────────────────────────────────────
const TABS: { id: Tab; label: string; subtitle: string }[] = [
  { id: 'nivel',      label: 'Nivel',           subtitle: 'Serie histórica · Base 2004=100' },
  { id: 'interanual', label: 'Var. Interanual',  subtitle: '% vs. mismo mes del año anterior' },
  { id: 'mensual',    label: 'Var. Mensual',     subtitle: '% vs. mes anterior' },
];

// ── Componente principal ────────────────────────────────────────────────────
export default function IsacSeriesAreaChart({ data }: Props) {
  const min = data[0]?.fecha ?? '';
  const max = data[data.length - 1]?.fecha ?? '';

  const [tab, setTab] = useState<Tab>('nivel');
  const [desde, setDesde] = useState(min);
  const [hasta, setHasta] = useState(max);
  const [scale, setScale] = useState<'auto' | 'zero'>('auto');
  const [activas, setActivas] = useState<Set<string>>(
    new Set(NIVEL_SERIES.map((s) => s.key)),
  );

  const filtered      = useMemo(() => filtrarPorFecha(data, desde, hasta), [data, desde, hasta]);
  const dataInteranual = useMemo(
    () => filtrarPorFecha(calcVarInteranual(data), desde, hasta),
    [data, desde, hasta],
  );
  const dataMensual   = useMemo(
    () => filtrarPorFecha(calcVarMensual(data), desde, hasta),
    [data, desde, hasta],
  );

  const toggleSerie = (key: string) =>
    setActivas((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const activeTab = TABS.find((t) => t.id === tab)!;

  return (
    <section className="card">
      {/* Header */}
      <div className="card-header">
        <div>
          <h2 className="chart-title">Índice Sintético de Actividad de la Construcción</h2>
          <p className="chart-subtitle">{activeTab.subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <DateRangeFilter
            desde={desde} hasta={hasta} min={min} max={max}
            onDesdeChange={setDesde} onHastaChange={setHasta}
          />
          {tab === 'nivel' && <AxisScaleSelector value={scale} onChange={setScale} />}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 mb-4 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-xs font-medium border-b-2 -mb-px transition-colors ${
              tab === t.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Serie toggles (comunes a los 3 tabs) */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {NIVEL_SERIES.map((s) => (
          <button
            key={s.key}
            onClick={() => toggleSerie(s.key)}
            className={`px-3 py-1 rounded-full text-xs border transition-all ${
              activas.has(s.key)
                ? 'text-white border-transparent'
                : 'bg-transparent text-slate-500 border-slate-300 hover:border-slate-400'
            }`}
            style={activas.has(s.key) ? { backgroundColor: s.color, borderColor: s.color } : {}}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Nivel ─────────────────────────────────────────────────── */}
      {tab === 'nivel' && (
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
            <Tooltip content={<TooltipNivel />} />
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
      )}

      {/* ── Tab: Var. Interanual ────────────────────────────────────────── */}
      {tab === 'interanual' && (
        <ResponsiveContainer width="100%" height={380}>
          <BarChart data={dataInteranual} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
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
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
              width={50}
            />
            <Tooltip content={<TooltipVariacion />} />
            <ReferenceLine y={0} stroke="#cbd5e1" strokeWidth={1} />
            <Legend wrapperStyle={{ fontSize: '12px', color: '#64748b', paddingTop: '12px' }} />
            {NIVEL_SERIES.map((s) =>
              activas.has(s.key) ? (
                <Bar
                  key={s.key}
                  dataKey={s.key}
                  name={s.label}
                  fill={s.color}
                  fillOpacity={0.8}
                  radius={[2, 2, 0, 0]}
                />
              ) : null,
            )}
          </BarChart>
        </ResponsiveContainer>
      )}

      {/* ── Tab: Var. Mensual ───────────────────────────────────────────── */}
      {tab === 'mensual' && (
        <ResponsiveContainer width="100%" height={380}>
          <BarChart data={dataMensual} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
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
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
              width={50}
            />
            <Tooltip content={<TooltipVariacion />} />
            <ReferenceLine y={0} stroke="#cbd5e1" strokeWidth={1} />
            <Legend wrapperStyle={{ fontSize: '12px', color: '#64748b', paddingTop: '12px' }} />
            {NIVEL_SERIES.map((s) =>
              activas.has(s.key) ? (
                <Bar
                  key={s.key}
                  dataKey={s.key}
                  name={s.label}
                  fill={s.color}
                  fillOpacity={0.8}
                  radius={[2, 2, 0, 0]}
                />
              ) : null,
            )}
          </BarChart>
        </ResponsiveContainer>
      )}
    </section>
  );
}
