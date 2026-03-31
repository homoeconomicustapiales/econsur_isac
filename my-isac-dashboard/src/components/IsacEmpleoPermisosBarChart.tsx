'use client';
// src/components/IsacEmpleoPermisosBarChart.tsx
import { useMemo, useState } from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { IsacPuestosTrabajo, IsacPermisos } from '@/types/isac';
import { formatFechaMes, formatNumero } from '@/utils/formatters';

interface Props {
  dataEmpleo: IsacPuestosTrabajo[];
  dataPermisos: IsacPermisos[];
}

type SerieActiva = 'empleo' | 'permisos';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-lg text-xs">
      <p className="font-semibold text-slate-800 mb-2">{formatFechaMes(label)}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex justify-between gap-4">
          <span style={{ color: p.color ?? p.fill }}>{p.name}</span>
          <span className="text-slate-600 font-mono">{formatNumero(p.value, 0)}</span>
        </div>
      ))}
    </div>
  );
};

export default function IsacEmpleoPermisosBarChart({ dataEmpleo, dataPermisos }: Props) {
  const [serieActiva, setSerieActiva] = useState<SerieActiva>('empleo');

  const combined = useMemo(() => {
    const permisosMap = new Map(dataPermisos.map((p) => [p.fecha, p]));
    return dataEmpleo
      .map((e) => ({ ...e, ...permisosMap.get(e.fecha) }));
  }, [dataEmpleo, dataPermisos]);

  const displayedData = useMemo(
    () => combined.filter((d: any) =>
      serieActiva === 'empleo' ? d.puestos_trabajo != null : d.superficie_m2 != null,
    ),
    [combined, serieActiva],
  );

  const domainActivo = useMemo<[number, number]>(() => {
    const key = serieActiva === 'empleo' ? 'puestos_trabajo' : 'superficie_m2';
    const values = displayedData
      .map((d: any) => d[key] as number)
      .filter((v) => Number.isFinite(v));

    if (!values.length) return [0, 1];

    const min = Math.min(...values);
    const max = Math.max(...values);
    if (min === max) return [min * 0.95, max * 1.05 + 1];

    const padding = (max - min) * 0.08;
    return [Math.max(0, min - padding), max + padding];
  }, [displayedData, serieActiva]);

  return (
    <section className="card">
      <div className="card-header">
        <div>
          <h2 className="chart-title">Empleo y Permisos de Edificación</h2>
          <p className="chart-subtitle">Seleccioná la serie para visualizarla por separado</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSerieActiva('empleo')}
            className={`px-3 py-1 rounded-full text-xs border transition-all ${
              serieActiva === 'empleo'
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-transparent text-slate-500 border-slate-300 hover:border-slate-400'
            }`}
          >
            Puestos de Trabajo
          </button>
          <button
            onClick={() => setSerieActiva('permisos')}
            className={`px-3 py-1 rounded-full text-xs border transition-all ${
              serieActiva === 'permisos'
                ? 'bg-green-600 border-green-600 text-white'
                : 'bg-transparent text-slate-500 border-slate-300 hover:border-slate-400'
            }`}
          >
            Superficie (m²)
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={380}>
        <ComposedChart data={displayedData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
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
            yAxisId="left"
            orientation="left"
            tick={{ fontSize: 11, fill: '#3b82f6' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => formatNumero(v, 0)}
            width={65}
            hide={serieActiva !== 'empleo'}
            domain={serieActiva === 'empleo' ? domainActivo : undefined}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 11, fill: '#22c55e' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => formatNumero(v, 0)}
            width={75}
            hide={serieActiva !== 'permisos'}
            domain={serieActiva === 'permisos' ? domainActivo : undefined}
          />
          <Tooltip content={<CustomTooltip />} />
          {serieActiva === 'empleo' && (
            <Bar
              yAxisId="left"
              dataKey="puestos_trabajo"
              name="Puestos de Trabajo"
              fill="#3b82f6"
              fillOpacity={0.8}
              radius={[2, 2, 0, 0]}
            />
          )}
          {serieActiva === 'permisos' && (
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="superficie_m2"
              name="Superficie (m²)"
              stroke="#22c55e"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </section>
  );
}
