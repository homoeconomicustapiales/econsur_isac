'use client';
'use client';
// src/components/IsacVariacionRelativaHorizontalChart.tsx
import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer, Cell,
} from 'recharts';
import { IsacInsumo, IsacNivelGeneral } from '@/types/isac';
import { INSUMO_KEYS, INSUMOS_NOMBRES } from '@/utils/constants';
import { formatNumero, formatFechaMes } from '@/utils/formatters';

interface Props {
  data: IsacInsumo[];
  dataNg: IsacNivelGeneral[];
}

const ISAC_COLOR = '#f59e0b'; // amber-400

function calcVariacion(
  data: (IsacInsumo | IsacNivelGeneral)[],
  keys: string[],
  fechaDesde: string,
  fechaHasta: string,
): { insumo: string; variacion: number; esIsac: boolean }[] {
  const rowDesde = data.find((d) => d.fecha === fechaDesde);
  const rowHasta = data.find((d) => d.fecha === fechaHasta);
  if (!rowDesde || !rowHasta) return [];

  return keys.map((key) => {
    const vDesde = rowDesde[key] as number;
    const vHasta = rowHasta[key] as number;
    return {
      insumo: key === 'original' ? 'ISAC Nivel General' : INSUMOS_NOMBRES[key as keyof typeof INSUMOS_NOMBRES],
      variacion: parseFloat((((vHasta - vDesde) / vDesde) * 100).toFixed(2)),
      esIsac: key === 'original',
    };
  });
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const entry = payload[0].payload;
  const val = entry.variacion as number;
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-lg text-xs">
      <p className="font-semibold text-slate-800 mb-1">{entry.insumo}</p>
      <p style={{ color: val >= 0 ? '#22c55e' : '#ef4444' }}>
        Variación: {val >= 0 ? '+' : ''}{formatNumero(val)}%
      </p>
      {entry.esIsac && (
        <p className="text-amber-500 mt-0.5">Índice de referencia</p>
      )}
    </div>
  );
};

export default function IsacVariacionRelativaHorizontalChart({ data, dataNg }: Props) {
  const fechas = data.map((d) => d.fecha);
  const defaultHasta = fechas[fechas.length - 1] ?? '';
  const defaultDesde = fechas[fechas.length - 2] ?? '';

  const [fechaDesde, setFechaDesde] = useState(defaultDesde);
  const [fechaHasta, setFechaHasta] = useState(defaultHasta);

  const variacionesInsumos = useMemo(
    () => calcVariacion(data, INSUMO_KEYS as string[], fechaDesde, fechaHasta),
    [data, fechaDesde, fechaHasta],
  );

  const variacionIsac = useMemo(() => {
    const rowDesde = dataNg.find((d) => d.fecha === fechaDesde);
    const rowHasta = dataNg.find((d) => d.fecha === fechaHasta);
    if (!rowDesde || !rowHasta) return null;
    return parseFloat(
      ((( rowHasta.original - rowDesde.original) / rowDesde.original) * 100).toFixed(2),
    );
  }, [dataNg, fechaDesde, fechaHasta]);

  // Ordenar insumos de mayor a menor y añadir ISAC al final como referencia
  const chartData = useMemo(() => {
    const sorted = [...variacionesInsumos].sort((a, b) => b.variacion - a.variacion);
    if (variacionIsac !== null) {
      sorted.push({ insumo: 'ISAC Nivel General', variacion: variacionIsac, esIsac: true });
    }
    return sorted;
  }, [variacionesInsumos, variacionIsac]);

  return (
    <section className="card">
      <div className="card-header">
        <div>
          <h2 className="chart-title">Variación por Insumo</h2>
          <p className="chart-subtitle">
            {formatFechaMes(fechaHasta)} vs {formatFechaMes(fechaDesde)} · Serie Original
          </p>
        </div>
        {/* Selector de fechas */}
        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-500">Período:</span>
          <select
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            className="bg-white border border-slate-300 rounded px-2 py-1 text-slate-800
                       focus:outline-none focus:border-blue-500 hover:border-slate-400 transition-colors"
          >
            {fechas.map((f) => (
              <option key={f} value={f}>{formatFechaMes(f)}</option>
            ))}
          </select>
          <span className="text-slate-400">→</span>
          <select
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            className="bg-white border border-slate-300 rounded px-2 py-1 text-slate-800
                       focus:outline-none focus:border-blue-500 hover:border-slate-400 transition-colors"
          >
            {fechas.map((f) => (
              <option key={f} value={f}>{formatFechaMes(f)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex gap-4 mb-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: '#3b82f6' }} />
          Variación positiva
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: '#ef4444' }} />
          Variación negativa
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: ISAC_COLOR }} />
          ISAC Nivel General (referencia)
        </span>
      </div>

      <ResponsiveContainer width="100%" height={chartData.length * 34 + 40}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 55, left: 8, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(203,213,225,0.2)" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <YAxis
            type="category"
            dataKey="insumo"
            tick={({ x, y, payload }: any) => {
              const isIsac = payload.value === 'ISAC Nivel General';
              return (
                <text
                  x={x}
                  y={y}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fontSize={11}
                  fontWeight={isIsac ? 700 : 400}
                  fill={isIsac ? ISAC_COLOR : '#64748b'}
                >
                  {payload.value}
                </text>
              );
            }}
            axisLine={false}
            tickLine={false}
            width={140}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine x={0} stroke="#cbd5e1" strokeWidth={1} />
          {variacionIsac !== null && (
            <ReferenceLine
              x={variacionIsac}
              stroke={ISAC_COLOR}
              strokeWidth={2}
              strokeDasharray="4 3"
              label={{ value: `ISAC ${variacionIsac >= 0 ? '+' : ''}${formatNumero(variacionIsac)}%`, position: 'top', fontSize: 10, fill: ISAC_COLOR }}
            />
          )}
          <Bar dataKey="variacion" name="Variación" radius={[0, 3, 3, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={index}
                fill={
                  entry.esIsac
                    ? ISAC_COLOR
                    : entry.variacion >= 0
                    ? '#3b82f6'
                    : '#ef4444'
                }
                fillOpacity={entry.esIsac ? 1 : 0.8}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}
