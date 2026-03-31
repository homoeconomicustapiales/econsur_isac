// src/types/isac.ts

export interface IsacNivelGeneral {
  fecha: string;
  original: number;
  desestacionalizada: number;
  tendencia_ciclo: number;
  // Añade esta línea:
  [key: string]: string | number | undefined;
}

export interface IsacInsumo {
  fecha: string;
  articulos_sanitarios: number;
  asfalto: number;
  cales: number;
  cemento_portland: number;
  hierro_redondo: number;
  hormigon_elaborado: number;
  ladrillos_huecos: number;
  mosaicos: number;
  pinturas: number;
  pisos_revestimientos: number;
  placas_yeso: number;
  yeso: number;
  resto: number;
  // También añade esta línea por si usas variaciones en insumos:
  [key: string]: string | number | undefined;
}

export interface IsacPuestosTrabajo {
  fecha: string;
  puestos_trabajo: number;
  [key: string]: string | number | undefined;
}

export interface IsacPermisos {
  fecha: string;
  superficie_m2: number;
  permisos_cantidad: number;
  [key: string]: string | number | undefined;
}

export type InsumoKey = keyof Omit<IsacInsumo, 'fecha'>;
export type SerieNivelKey = keyof Omit<IsacNivelGeneral, 'fecha'>;
export type TipoSerie = 'original' | 'desest' | 'tendencia';

