'use client';
// src/components/IsacVariacionesBarChart.tsx
import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer, Cell,
} from 'recharts';
import { IsacNivelGeneral } from '@/types/isac';
import { formatFechaMes, formatNumero, variacionInteranual } from '@/utils/formatters';

interface Props { data: IsacNivelGeneral[] }

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const val = payload[0].value as number;
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-lg text-xs">
      <p className="font-semibold text-slate-800 mb-1">{formatFechaMes(label)}</p>
      <p style={{ color: val >= 0 ? '#22c55e' : '#ef4444' }}>
        Variación i.a.: {val >= 0 ? '+' : ''}{formatNumero(val)}%
      </p>
    </div>
  );
};

export default function IsacVariacionesBarChart({ data }: Props) {
  const variaciones = useMemo(() => variacionInteranual(data, 'original'), [data]);

  return (
    <section className="card">
      <div className="card-header">
        <div>
          <h2 className="chart-title">Variación Interanual</h2>
          <p className="chart-subtitle">ISAC Nivel General · Serie Original · % vs mismo mes año anterior</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={variaciones} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
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
            width={48}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0} stroke="#cbd5e1" strokeWidth={1} />
          <Bar dataKey="variacion" name="Var. i.a." radius={[2, 2, 0, 0]}>
            {variaciones.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.variacion >= 0 ? '#22c55e' : '#f43f5e'}
                fillOpacity={0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}
