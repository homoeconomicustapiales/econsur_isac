// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dashboard ISAC · INDEC',
  description: 'Análisis interactivo del Índice Sintético de Actividad de la Construcción',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-slate-50">{children}</body>
    </html>
  );
}
