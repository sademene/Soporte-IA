import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/session';
import { hashPassword } from '@/lib/auth';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { session } = await getSession();
  if (!session.user) return NextResponse.json({ ok:false }, { status: 401 });
  if (session.user.role === 'user') return NextResponse.json({ ok:false }, { status: 403 });
  const id = Number(params.id);
  const body = await req.json();
  const { password, role, valid_until, blocked } = body;
  const set: string[] = [];
  const vals: any[] = [];
  if (password) { set.push('pass_hash = ?'); vals.push(await hashPassword(password)); }
  if (role && role !== 'superadmin') { set.push('role = ?'); vals.push(role); }
  if (typeof blocked === 'boolean') { set.push('blocked = ?'); vals.push(blocked ? 1 : 0); }
  set.push('valid_until = ?'); vals.push(valid_until || null);
  vals.push(id);
  db.prepare(`UPDATE users SET ${set.join(', ')} WHERE id = ?`).run(...vals);
  return NextResponse.json({ ok:true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { session } = await getSession();
  if (!session.user) return NextResponse.json({ ok:false }, { status: 401 });
  if (session.user.role === 'user') return NextResponse.json({ ok:false }, { status: 403 });
  const id = Number(params.id);
  db.prepare(`DELETE FROM users WHERE id = ?`).run(id);
  return NextResponse.json({ ok:true });
}
