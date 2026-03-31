# econsur-isac

Dashboard interactivo del **Índice Sintético de Actividad de la Construcción (ISAC)** publicado por el INDEC de Argentina.

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Procesamiento | Python 3.11 · pandas · openpyxl |
| Frontend | Next.js 14 (App Router) · TypeScript |
| Gráficos | Recharts |
| Estilos | Tailwind CSS |
| CI/CD | GitHub Actions → Vercel |

## Estructura del proyecto

```
econsur-isac/
├── .github/workflows/update-data.yml   ← CI: procesa xlsx → commit JSONs
└── my-isac-dashboard/
    ├── data/
    │   ├── raw/isac.xlsx               ← Fuente INDEC (agregar manualmente)
    │   └── processed/                  ← JSONs generados (backup)
    ├── public/data/                    ← JSONs servidos por Next.js
    ├── scripts/
    │   ├── processor.py               ← Script ETL principal
    │   └── requirements.txt
    └── src/
        ├── app/                       ← App Router (layout + page)
        ├── components/                ← Componentes de gráficos
        ├── types/isac.ts             ← Interfaces TypeScript
        └── utils/                    ← constants / formatters / calculations
```

## Gráficos incluidos

1. **ISAC Nivel General** — Área con 3 series (Original / Desestacionalizada / Tendencia-Ciclo), filtro de fechas y escala de eje configurable
2. **Variación Interanual** — Barras verticales positivas/negativas vs. mismo mes año anterior
3. **Insumos de la Construcción** — Líneas para 13 insumos con selector de tipo de serie
4. **Variación Mensual por Insumo** — Barras horizontales ordenadas, último mes vs. anterior
5. **Empleo y Permisos** — Barras (puestos de trabajo) + línea (superficie m²), doble eje Y

## Configuración inicial

### 1. Clonar y configurar

```bash
git clone https://github.com/TU_USUARIO/econsur-isac.git
cd econsur-isac/my-isac-dashboard
npm install
```

### 2. Agregar el archivo de datos

Descargá `isac.xlsx` desde:
https://www.indec.gob.ar/indec/web/Nivel4-Tema-3-5-31

Colocalo en: `my-isac-dashboard/data/raw/isac.xlsx`

### 3. Procesar los datos

```bash
pip install -r scripts/requirements.txt
python scripts/processor.py
```

### 4. Correr en desarrollo

```bash
npm run dev
# → http://localhost:3000
```

## Deploy en Vercel

1. Importar el repositorio en [vercel.com](https://vercel.com)
2. Configurar:
   - **Root Directory**: `my-isac-dashboard`
   - **Framework Preset**: Next.js (autodetectado)
3. Deploy

> Los JSONs ya están commiteados en `public/data/`, por lo que Vercel puede hacer build sin necesitar Python.

## Actualización de datos

**Opción A — Manual:**
```bash
# 1. Reemplazar isac.xlsx
# 2. Ejecutar:
python scripts/processor.py
# 3. Commitear y pushear los JSONs actualizados
git add public/data/ data/processed/
git commit -m "chore: actualizar datos ISAC"
git push
```

**Opción B — GitHub Actions (automático):**
Cada vez que se hace push con un `isac.xlsx` nuevo, el workflow `.github/workflows/update-data.yml` ejecuta el procesador y commitea los JSONs automáticamente. Vercel detecta el nuevo commit y redeploya.

## Licencia

MIT
