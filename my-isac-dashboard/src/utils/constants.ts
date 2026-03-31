// src/utils/constants.ts
import { InsumoKey } from '@/types/isac';

export const INSUMOS_NOMBRES: Record<InsumoKey, string> = {
  articulos_sanitarios: 'Art. Sanitarios',
  asfalto: 'Asfalto',
  cales: 'Cales',
  cemento_portland: 'Cemento Portland',
  hierro_redondo: 'Hierro Redondo',
  hormigon_elaborado: 'Hormigón Elaborado',
  ladrillos_huecos: 'Ladrillos Huecos',
  mosaicos: 'Mosaicos',
  pinturas: 'Pinturas',
  pisos_revestimientos: 'Pisos/Revestimientos',
  placas_yeso: 'Placas de Yeso',
  yeso: 'Yeso',
  resto: 'Resto',
};

export const INSUMO_KEYS = Object.keys(INSUMOS_NOMBRES) as InsumoKey[];

/** Paleta cromática diferenciada para 13 series */
export const ISAC_COLORS: string[] = [
  '#0ea5e9', // sky-500
  '#f43f5e', // rose-500
  '#22c55e', // green-500
  '#f59e0b', // amber-500
  '#8b5cf6', // violet-500
  '#06b6d4', // cyan-500
  '#f97316', // orange-500
  '#6366f1', // indigo-500
  '#ec4899', // pink-500
  '#10b981', // emerald-500
  '#ef4444', // red-500
  '#a855f7', // purple-500
  '#64748b', // slate-500
];

export const SERIE_LABELS: Record<string, string> = {
  original: 'Serie Original',
  desest: 'Desestacionalizada',
  tendencia: 'Tendencia-Ciclo',
};

export const NIVEL_SERIES = [
  { key: 'original',          label: 'Original',          color: '#0ea5e9' },
  { key: 'desestacionalizada',label: 'Desestacionalizada', color: '#f43f5e' },
  { key: 'tendencia_ciclo',   label: 'Tendencia-Ciclo',   color: '#22c55e' },
] as const;
