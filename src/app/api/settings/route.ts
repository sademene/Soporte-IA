import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET() {
  const row = db.prepare(`SELECT brand_hex, theme FROM settings WHERE id = 1`).get() as any;
  return NextResponse.json(row || { brand_hex: process.env.DEFAULT_BRAND_HEX || '#7c3aed', theme: process.env.DEFAULT_THEME || 'dark' });
}
export async function POST(req: Request) {
  const { session } = await getSession();
  if (!session.user) return NextResponse.json({ ok:false, error:'No autenticado' }, { status: 401 });
  if (session.user.role === 'user') return NextResponse.json({ ok:false, error:'Solo admin/superadmin' }, { status: 403 });
  const { brand_hex, theme } = await req.json();
  db.prepare(`UPDATE settings SET brand_hex=?, theme=?, updated_at=datetime('now') WHERE id = 1`).run(brand_hex, theme);
  return NextResponse.json({ ok:true });
}
