'use client';
// src/components/IsacVariacionRelativaHorizontalChart.tsx
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer, Cell,
} from 'recharts';
import { IsacInsumo } from '@/types/isac';
import { calcularVariacionRelativa } from '@/utils/calculations';
import { formatNumero, formatFechaMes } from '@/utils/formatters';

interface Props { data: IsacInsumo[] }

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const val = payload[0].value as number;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-xl text-xs">
      <p className="font-semibold text-slate-200 mb-1">{payload[0].payload.insumo}</p>
      <p style={{ color: val >= 0 ? '#22c55e' : '#f43f5e' }}>
        Var. mensual: {val >= 0 ? '+' : ''}{formatNumero(val)}%
      </p>
    </div>
  );
};

export default function IsacVariacionRelativaHorizontalChart({ data }: Props) {
  const variaciones = calcularVariacionRelativa(data);
  const ultimaFecha = data[data.length - 1]?.fecha ?? '';
  const penultimaFecha = data[data.length - 2]?.fecha ?? '';

  return (
    <section className="card">
      <div className="card-header">
        <div>
          <h2 className="chart-title">Variación Mensual por Insumo</h2>
          <p className="chart-subtitle">
            {formatFechaMes(ultimaFecha)} vs {formatFechaMes(penultimaFecha)} · Serie Original
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={420}>
        <BarChart
          data={variaciones}
          layout="vertical"
          margin={{ top: 5, right: 40, left: 8, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={{ stroke: '#334155' }}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <YAxis
            type="category"
            dataKey="insumo"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            width={130}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine x={0} stroke="#475569" strokeWidth={1} />
          <Bar dataKey="variacion" name="Var. mensual" radius={[0, 3, 3, 0]}>
            {variaciones.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.variacion >= 0 ? '#0ea5e9' : '#f43f5e'}
                fillOpacity={0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}
