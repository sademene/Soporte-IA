// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/session';
import { verifyPassword } from '@/lib/auth';
import { getThrottle, setThrottle, clearThrottle } from '@/lib/throttle';

function getIp(headers: Headers) {
  return headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '0.0.0.0';
}

export async function POST(req: Request) {
  const { username, password } = await req.json();

  // superadmin por env (si coincide, entra sin tocar tabla users)
  const su = process.env.SUPERADMIN_USER || 'admin';
  const sp = process.env.SUPERADMIN_PASS || 'admin';
  const ip = getIp(req.headers);

  // Throttle window
  const existing = getThrottle(username, ip);
  const now = Date.now();

  if (existing?.lock_until && new Date(existing.lock_until).getTime() > now) {
    const wait = Math.ceil((new Date(existing.lock_until).getTime() - now) / 1000);
    return NextResponse.json({ ok: false, error: `Espere ${wait}s e intente de nuevo` }, { status: 429 });
  }

  // SUPERADMIN
  if (username === su && password === sp) {
    const res = NextResponse.json({ ok: true });
    const session = await getSession();
    session.user = { username, role: 'superadmin', userId: 0 };
    await session.save();
    clearThrottle(username, ip);
    return res;
  }

  // Usuarios en BD
  const u = db.prepare(`SELECT * FROM users WHERE username = ?`).get(username) as any;
  if (!u) {
    const failed = (existing?.failed_count || 0) + 1;
    const base = 5000; // 5s después de 5 fallos
    const extra = failed > 5 ? (failed - 5) * 10000 : 0; // +10s por cada extra
    const lockUntil = failed >= 5 ? new Date(now + base + extra).toISOString() : null;
    setThrottle(username, ip, failed, lockUntil);
    return NextResponse.json({ ok: false, error: 'Usuario/contraseña inválidos' }, { status: 401 });
  }

  if (u.blocked) {
    return NextResponse.json({ ok: false, error: 'Usuario bloqueado' }, { status: 403 });
  }

  // Vigencia
  if (u.valid_until && new Date(u.valid_until).getTime() < now) {
    return NextResponse.json({ ok: false, error: 'Usuario fuera de vigencia' }, { status: 403 });
  }

  const ok = await verifyPassword(password, u.password_hash);
  if (!ok) {
    const failed = (existing?.failed_count || 0) + 1;
    const base = 5000;
    const extra = failed > 5 ? (failed - 5) * 10000 : 0;
    const lockUntil = failed >= 5 ? new Date(now + base + extra).toISOString() : null;
    setThrottle(username, ip, failed, lockUntil);
    return NextResponse.json({ ok: false, error: 'Usuario/contraseña inválidos' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  const session = await getSession();
  session.user = { username: u.username, role: u.role as any, userId: u.id };
  await session.save();
  clearThrottle(username, ip);
  return res;
}
