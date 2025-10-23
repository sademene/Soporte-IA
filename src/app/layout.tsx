import './globals.css';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: 'Chat de Soporte IA',
  description: 'Frontend para soporte asistido por IA',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const c = cookies();
  const t = c.get('soporte-ia-theme')?.value || process.env.DEFAULT_THEME || 'dark';
  const brand = c.get('soporte-ia-brand')?.value || process.env.DEFAULT_BRAND_HEX || '#7c3aed';

  return (
    <html data-theme={t} style={{ ['--brand' as any]: brand }}>
      <body>{children}</body>
    </html>
  );
}
