'use client';
// src/components/IsacEmpleoPermisosBarChart.tsx
import { useMemo } from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { IsacPuestosTrabajo, IsacPermisos } from '@/types/isac';
import { formatFechaMes, formatNumero } from '@/utils/formatters';

interface Props {
  dataEmpleo: IsacPuestosTrabajo[];
  dataPermisos: IsacPermisos[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-xl text-xs">
      <p className="font-semibold text-slate-200 mb-2">{formatFechaMes(label)}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex justify-between gap-4">
          <span style={{ color: p.color ?? p.fill }}>{p.name}</span>
          <span className="text-slate-200 font-mono">{formatNumero(p.value, 0)}</span>
        </div>
      ))}
    </div>
  );
};

export default function IsacEmpleoPermisosBarChart({ dataEmpleo, dataPermisos }: Props) {
  const combined = useMemo(() => {
    const permisosMap = new Map(dataPermisos.map((p) => [p.fecha, p]));
    return dataEmpleo
      .map((e) => ({ ...e, ...permisosMap.get(e.fecha) }))
      .filter((d: any) => d.superficie_m2 != null);
  }, [dataEmpleo, dataPermisos]);

  return (
    <section className="card">
      <div className="card-header">
        <div>
          <h2 className="chart-title">Empleo y Permisos de Edificación</h2>
          <p className="chart-subtitle">Puestos de trabajo registrados y superficie permisada (m²)</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={380}>
        <ComposedChart data={combined} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
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
            yAxisId="left"
            orientation="left"
            tick={{ fontSize: 11, fill: '#0ea5e9' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => formatNumero(v, 0)}
            width={65}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 11, fill: '#22c55e' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => formatNumero(v, 0)}
            width={75}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '12px', color: '#94a3b8', paddingTop: '12px' }}
          />
          <Bar
            yAxisId="left"
            dataKey="puestos_trabajo"
            name="Puestos de Trabajo"
            fill="#0ea5e9"
            fillOpacity={0.75}
            radius={[2, 2, 0, 0]}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="superficie_m2"
            name="Superficie (m²)"
            stroke="#22c55e"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </section>
  );
}
