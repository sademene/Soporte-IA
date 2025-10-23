// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/session';
import { verifyPassword } from '@/lib/auth';
import { getThrottle, setThrottle, clearThrottle } from '@/lib/throttle';

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const body = await request.json().catch(() => ({}));
  const { username, password } = body as { username?: string; password?: string };

  if (!username || !password) {
    return NextResponse.json({ ok: false, error: 'Faltan credenciales' }, { status: 400 });
  }

  const throttle = getThrottle(username, ip);
  if (throttle && throttle.until && new Date(throttle.until).getTime() > Date.now()) {
    const seconds = Math.ceil((new Date(throttle.until).getTime() - Date.now()) / 1000);
    return NextResponse.json({ ok: false, error: `Espera ${seconds}s e intenta de nuevo` }, { status: 429 });
  }

  const u = db.prepare(`SELECT * FROM users WHERE username = ?`).get(username) as any;
  if (!u) {
    setThrottle(username, ip, (throttle?.failed_count || 0) + 1, new Date(Date.now() + 5000).toISOString());
    return NextResponse.json({ ok: false, error: 'Usuario/contraseña inválidos' }, { status: 401 });
  }
  if (u.blocked) {
    return NextResponse.json({ ok: false, error: 'Usuario bloqueado' }, { status: 403 });
  }

  const ok = await verifyPassword(password, u.password_hash || u.password);
  if (!ok) {
    setThrottle(username, ip, (throttle?.failed_count || 0) + 1, new Date(Date.now() + 5000).toISOString());
    return NextResponse.json({ ok: false, error: 'Usuario/contraseña inválidos' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  const session = await getSession();
  // Ajusta estos campos si tu tabla tiene diferentes nombres/roles
  session.user = { username: u.username ?? username, role: (u.role as any) ?? 'superadmin', userId: Number(u.id ?? 0) };
  await session.save();

  clearThrottle(username, ip);
  return res;
}
