"""
processor.py
Procesa isac.xlsx (INDEC) y genera JSONs estáticos para el dashboard.
Salida en: public/data/ y data/processed/
"""

import pandas as pd
import json
import shutil
from pathlib import Path


def limpiar_y_fechar(df: pd.DataFrame, col_control: str, fecha_inicio: str) -> pd.DataFrame:
    """Elimina filas vacías y agrega columna 'fecha' mensual."""
    df[col_control] = pd.to_numeric(df[col_control], errors='coerce')
    df = df.dropna(subset=[col_control]).reset_index(drop=True)
    df['fecha'] = (
        pd.date_range(start=fecha_inicio, periods=len(df), freq='MS')
        .strftime('%Y-%m-%d')
    )
    return df


def guardar_json(df: pd.DataFrame, cols: list, paths: list[Path]) -> None:
    """Serializa el DataFrame y lo guarda en todas las rutas indicadas."""
    data = df[cols].to_json(orient='records', indent=2, force_ascii=False)
    for p in paths:
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(data, encoding='utf-8')
        print(f"  ✓ {p}")


def procesar_isac(input_path: Path, public_dir: Path, processed_dir: Path) -> None:
    print(f"\n→ Leyendo: {input_path}")

    with pd.ExcelFile(input_path, engine='openpyxl') as xls:

        # ── CUADRO 1: Nivel General ─────────────────────────────────────────
        print("\n[Cuadro 1] Nivel General")
        df1 = pd.read_excel(xls, sheet_name='Cuadro 1', usecols=[1, 2, 6, 10], skiprows=6)
        df1.columns = ['mes', 'original', 'desestacionalizada', 'tendencia_ciclo']
        df1 = limpiar_y_fechar(df1, 'original', '2012-01-01')
        guardar_json(
            df1,
            ['fecha', 'original', 'desestacionalizada', 'tendencia_ciclo'],
            [public_dir / 'isac_nivel_general.json',
             processed_dir / 'isac_nivel_general.json']
        )

        # ── CUADROS 2.1 / 3.1 / 4.1: Insumos ──────────────────────────────
        INSUMOS = [
            'articulos_sanitarios', 'asfalto', 'cales', 'cemento_portland',
            'hierro_redondo', 'hormigon_elaborado', 'ladrillos_huecos',
            'mosaicos', 'pinturas', 'pisos_revestimientos',
            'placas_yeso', 'yeso', 'resto'
        ]
        mapa_insumos = {
            'Cuadro 2.1': ('isac_insumos_original.json',        'original'),
            'Cuadro 3.1': ('isac_insumos_desestacionalizado.json', 'desestacionalizado'),
            'Cuadro 4.1': ('isac_insumos_tendencia.json',       'tendencia'),
        }
        for sheet, (filename, label) in mapa_insumos.items():
            print(f"\n[{sheet}] Insumos {label}")
            df = pd.read_excel(xls, sheet_name=sheet, usecols=range(1, 15), skiprows=4)
            df.columns = ['mes_texto'] + INSUMOS
            df = limpiar_y_fechar(df, 'articulos_sanitarios', '2012-01-01')
            guardar_json(
                df,
                ['fecha'] + INSUMOS,
                [public_dir / filename, processed_dir / filename]
            )

        # ── CUADRO 5: Puestos de Trabajo ────────────────────────────────────
        print("\n[Cuadro 5] Puestos de Trabajo")
        df5 = pd.read_excel(xls, sheet_name='Cuadro 5', usecols=[1, 2], skiprows=6)
        df5.columns = ['mes_texto', 'puestos_trabajo']
        df5 = limpiar_y_fechar(df5, 'puestos_trabajo', '2015-01-01')
        guardar_json(
            df5,
            ['fecha', 'puestos_trabajo'],
            [public_dir / 'isac_puestos_trabajo.json',
             processed_dir / 'isac_puestos_trabajo.json']
        )

        # ── CUADRO 6.1: Permisos de Edificación ─────────────────────────────
        print("\n[Cuadro 6.1] Permisos")
        df6 = pd.read_excel(xls, sheet_name='Cuadro 6.1', usecols=[1, 2, 5], skiprows=7)
        df6.columns = ['mes_texto', 'superficie_m2', 'permisos_cantidad']
        df6 = limpiar_y_fechar(df6, 'superficie_m2', '2021-01-01')
        guardar_json(
            df6,
            ['fecha', 'superficie_m2', 'permisos_cantidad'],
            [public_dir / 'isac_permisos.json',
             processed_dir / 'isac_permisos.json']
        )

    print("\n✅ Proceso ISAC finalizado con éxito.\n")


if __name__ == '__main__':
    base = Path(__file__).resolve().parent.parent
    procesar_isac(
        input_path=base / 'data' / 'raw' / 'isac.xlsx',
        public_dir=base / 'public' / 'data',
        processed_dir=base / 'data' / 'processed',
    )
