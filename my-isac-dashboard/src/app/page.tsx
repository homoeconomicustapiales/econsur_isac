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
  const accentColor = accent === 'green' ? '#22c55e' : accent === 'red' ? '#f43f5e' : '#0ea5e9';
  return (
    <div className="kpi-card">
      <span className="kpi-label">{label}</span>
      <span className="kpi-value" style={{ color: accentColor }}>{value}</span>
      {delta && (
        <span
          className="kpi-delta"
          style={{ color: delta.startsWith('+') ? '#22c55e' : '#f43f5e' }}
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
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      {/* Header */}
      <header
        className="border-b px-6 py-5 flex flex-wrap justify-between items-end gap-4"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-surface)' }}
      >
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span
              className="text-xs font-bold px-2 py-0.5 rounded uppercase tracking-widest"
              style={{
                backgroundColor: 'rgba(14,165,233,0.15)',
                color: '#0ea5e9',
                fontFamily: "'Space Mono', monospace",
              }}
            >
              INDEC · ISAC
            </span>
          </div>
          <h1
            className="text-xl font-bold"
            style={{ fontFamily: "'DM Sans', sans-serif", color: 'var(--text-primary)' }}
          >
            Índice Sintético de Actividad de la Construcción
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>
            Fuente: Instituto Nacional de Estadística y Censos · Argentina
          </p>
        </div>
        {lastNg && (
          <div
            className="text-right"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            <p style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Último dato disponible</p>
            <p style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600 }}>
              {formatFechaMes(lastNg.fecha)}
            </p>
          </div>
        )}
      </header>

      {/* KPIs */}
      <div className="px-6 py-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
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

      {/* Charts */}
      <main className="px-6 pb-10">
        <IsacSeriesAreaChart data={ng} />

        <div className="section-divider" />

        <IsacVariacionesBarChart data={ng} />

        <div className="section-divider" />

        <IsacInsumosAreaChart dataOrig={io} dataDesest={id} dataTend={it} />

        <div className="section-divider" />

        <IsacVariacionRelativaHorizontalChart data={io} />

        <div className="section-divider" />

        <IsacEmpleoPermisosBarChart dataEmpleo={em} dataPermisos={pe} />
      </main>

      {/* Footer */}
      <footer
        className="border-t px-6 py-4 text-center"
        style={{
          borderColor: 'var(--border)',
          backgroundColor: 'var(--bg-surface)',
          color: 'var(--text-muted)',
          fontSize: '11px',
          fontFamily: "'Space Mono', monospace",
        }}
      >
        Dashboard ISAC · Datos INDEC Argentina · econsur-isac
      </footer>
    </div>
  );
}
