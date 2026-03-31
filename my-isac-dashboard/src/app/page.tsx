// src/app/page.tsx
import IsacSeriesAreaChart from '@/components/IsacSeriesAreaChart';
import IsacInsumosAreaChart from '@/components/IsacInsumosAreaChart';
import IsacVariacionesBarChart from '@/components/IsacVariacionesBarChart';
import IsacVariacionRelativaHorizontalChart from '@/components/IsacVariacionRelativaHorizontalChart';
import IsacEmpleoPermisosBarChart from '@/components/IsacEmpleoPermisosBarChart';

import nivelGeneral from '../../public/data/isac_nivel_general.json';
import insumosOrig from '../../public/data/isac_insumos_original.json';
import insumosDesest from '../../public/data/isac_insumos_desestacionalizado.json';
import insumosTend from '../../public/data/isac_insumos_tendencia.json';
import empleo from '../../public/data/isac_puestos_trabajo.json';
import permisos from '../../public/data/isac_permisos.json';

import { IsacNivelGeneral, IsacInsumo, IsacPuestosTrabajo, IsacPermisos } from '@/types/isac';
import { formatFechaMes, formatNumero } from '@/utils/formatters';
import { ultimoValor } from '@/utils/calculations';

// ── KPI helper ──────────────────────────────────────────────────────────────
function KpiCard({
  label, value, delta, deltaLabel, accent,
}: {
  label: string;
  value: string;
  delta?: string;
  deltaLabel?: string;
  accent?: 'green' | 'red' | 'blue';
}) {
  const colorMap = {
    green: '#22c55e',
    red: '#ef4444',
    blue: '#3b82f6',
  };
  const accentColor = colorMap[accent || 'blue'];
  return (
    <div className="kpi-card">
      <span className="kpi-label">{label}</span>
      <span className="kpi-value" style={{ color: accentColor }}>{value}</span>
      {delta && (
        <span
          className="kpi-delta"
          style={{ color: delta.startsWith('+') ? '#22c55e' : '#ef4444' }}
        >
          {delta} {deltaLabel}
        </span>
      )}
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────
export default function IsacPage() {
  const ng = nivelGeneral as IsacNivelGeneral[];
  const io = insumosOrig as IsacInsumo[];
  const id = insumosDesest as IsacInsumo[];
  const it = insumosTend as IsacInsumo[];
  const em = empleo as IsacPuestosTrabajo[];
  const pe = permisos as IsacPermisos[];

  // KPIs
  const lastNg = ultimoValor(ng, 'original');
  const prev12Ng = ng.length > 12 ? ng[ng.length - 13]?.original : null;
  const varIa = lastNg && prev12Ng
    ? (((lastNg.valor as number) - prev12Ng) / prev12Ng * 100).toFixed(1)
    : null;

  const lastEm = ultimoValor(em, 'puestos_trabajo');
  const lastPe = ultimoValor(pe, 'superficie_m2');

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 px-6 py-5 bg-white">
        <div className="max-w-5xl mx-auto flex flex-wrap justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xs font-bold px-2 py-0.5 rounded uppercase tracking-widest bg-blue-50 text-blue-600">
                INDEC · ISAC
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-800">
              Índice Sintético de Actividad de la Construcción
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Análisis sectorial · Fuente: Instituto Nacional de Estadística y Censos · Argentina
            </p>
          </div>
          {lastNg && (
            <div className="text-right">
              <p className="text-xs text-slate-400 uppercase tracking-wider">Último dato disponible</p>
              <p className="text-slate-800 text-sm font-semibold mt-0.5">
                {formatFechaMes(lastNg.fecha)}
              </p>
            </div>
          )}
        </div>
      </header>

      {/* KPIs */}
      <div className="px-6 py-6 bg-slate-50">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {lastNg && (
            <KpiCard
              label="ISAC · Original"
              value={formatNumero(lastNg.valor as number)}
              delta={varIa ? `${Number(varIa) >= 0 ? '+' : ''}${varIa}%` : undefined}
              deltaLabel="vs. i.a."
              accent={varIa ? (Number(varIa) >= 0 ? 'green' : 'red') : 'blue'}
            />
          )}
          {lastEm && (
            <KpiCard
              label="Puestos de Trabajo"
              value={formatNumero(lastEm.valor as number, 0)}
              accent="blue"
            />
          )}
          {lastPe && (
            <KpiCard
              label="Superficie Permisada"
              value={`${formatNumero((lastPe.valor as number) / 1000, 0)}k m²`}
              accent="green"
            />
          )}
          <KpiCard
            label="Series disponibles"
            value={`${ng.length} meses`}
            accent="blue"
          />
        </div>
      </div>

      {/* Charts */}
      <main className="px-6 pb-10">
        <div className="max-w-5xl mx-auto space-y-6">
          <IsacSeriesAreaChart data={ng} />

          <IsacVariacionesBarChart data={ng} />

          <IsacInsumosAreaChart dataOrig={io} dataDesest={id} dataTend={it} />

          <IsacVariacionRelativaHorizontalChart data={io} />

          <IsacEmpleoPermisosBarChart dataEmpleo={em} dataPermisos={pe} />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 px-6 py-4 bg-white text-center">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs text-slate-400 uppercase tracking-wider">
            Fuente: INDEC — Instituto Nacional de Estadística y Censos
          </p>
        </div>
      </footer>
    </div>
  );
}
