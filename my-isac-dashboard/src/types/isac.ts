// src/types/isac.ts

export interface IsacNivelGeneral {
  fecha: string;
  original: number;
  desestacionalizada: number;
  tendencia_ciclo: number;
  // Firma de índice compatible con funciones de cálculo (sin undefined)
  [key: string]: string | number;
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
  // Firma de índice para permitir acceso dinámico a los insumos
  [key: string]: string | number;
}

export interface IsacPuestosTrabajo {
  fecha: string;
  puestos_trabajo: number;
  [key: string]: string | number;
}

export interface IsacPermisos {
  fecha: string;
  superficie_m2: number;
  permisos_cantidad: number;
  [key: string]: string | number;
}

export type InsumoKey = keyof Omit<IsacInsumo, 'fecha'>;
export type SerieNivelKey = keyof Omit<IsacNivelGeneral, 'fecha'>;
export type TipoSerie = 'original' | 'desest' | 'tendencia';

