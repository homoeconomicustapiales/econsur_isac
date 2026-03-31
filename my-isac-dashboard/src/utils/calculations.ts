// src/utils/calculations.ts
import { IsacInsumo } from '@/types/isac';
import { INSUMO_KEYS, INSUMOS_NOMBRES } from './constants';

/** Calcula la variación relativa del último mes vs el anterior para cada insumo */
export function calcularVariacionRelativa(
  data: IsacInsumo[],
): { insumo: string; variacion: number }[] {
  if (data.length < 2) return [];
  const last = data[data.length - 1];
  const prev = data[data.length - 2];

  return INSUMO_KEYS.map((key) => {
    // Forzamos a TypeScript a tratar los valores como números para la operación aritmética
    const vLast = last[key] as number;
    const vPrev = prev[key] as number;
    
    return {
      insumo: INSUMOS_NOMBRES[key],
      variacion: parseFloat((((vLast - vPrev) / vPrev) * 100).toFixed(2)),
    };
  }).sort((a, b) => b.variacion - a.variacion);
}

/** Filtra un array de datos por rango de fechas */
export function filtrarPorFecha<T extends { fecha: string }>(
  data: T[],
  desde: string | null,
  hasta: string | null,
): T[] {
  return data.filter((row) => {
    if (desde && row.fecha < desde) return false;
    if (hasta && row.fecha > hasta) return false;
    return true;
  });
}

/** Devuelve el último valor y su fecha, o null si no hay datos */
export function ultimoValor<T extends { fecha: string }>(
  data: T[],
  key: keyof T,
): { valor: T[keyof T]; fecha: string } | null {
  if (!data.length) return null;
  const last = data[data.length - 1];
  return { valor: last[key], fecha: last.fecha };
}
