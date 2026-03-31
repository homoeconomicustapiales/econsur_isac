// src/utils/formatters.ts

/** Formatea una fecha ISO (YYYY-MM-DD) como "Ene 2024" */
export function formatFechaMes(fecha: string): string {
  const [year, month] = fecha.split('-');
  const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  return `${meses[parseInt(month, 10) - 1]} ${year}`;
}

/** Formatea número con separador de miles (punto) y decimales (coma) */
export function formatNumero(n: number, decimales = 1): string {
  return n.toLocaleString('es-AR', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  });
}

/** Calcula variación interanual (%) respecto al mismo mes del año anterior */
export function variacionInteranual(
  data: { fecha: string; [k: string]: number | string }[],
  key: string,
): { fecha: string; variacion: number }[] {
  return data
    .map((row, i) => {
      const hace12 = data[i - 12];
      if (!hace12) return null;
      const actual = row[key] as number;
      const anterior = hace12[key] as number;
      return {
        fecha: row.fecha as string,
        variacion: parseFloat((((actual - anterior) / anterior) * 100).toFixed(2)),
      };
    })
    .filter(Boolean) as { fecha: string; variacion: number }[];
}
