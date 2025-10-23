import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/session';
import { hashPassword } from '@/lib/auth';

export async function GET() {
  const { session } = await getSession();
  if (!session.user) return NextResponse.json({ ok:false }, { status: 401 });
  if (session.user.role === 'user') return NextResponse.json({ ok:false }, { status: 403 });
  const su = (process.env.SUPERADMIN_USER || 'admin');
  const list = db.prepare(`SELECT id, username, role, valid_until, blocked FROM users WHERE username != ? ORDER BY id DESC`).all(su) as any[];
  return NextResponse.json({ ok:true, users: list });
}

export async function POST(req: Request) {
  const { session } = await getSession();
  if (!session.user) return NextResponse.json({ ok:false }, { status: 401 });
  if (session.user.role === 'user') return NextResponse.json({ ok:false }, { status: 403 });
  const body = await req.json();
  const { username, password, role, valid_until } = body;
  if (role === 'superadmin') return NextResponse.json({ ok:false, error:'No permitido' }, { status: 400 });
  const hash = await hashPassword(password);
  try{
    const r = db.prepare(`INSERT INTO users(username, pass_hash, role, valid_until) VALUES(?,?,?,?)`).run(username, hash, role, valid_until || null);
    return NextResponse.json({ ok:true, id: r.lastInsertRowid });
  }catch(e: any){
    return NextResponse.json({ ok:false, error: e.message }, { status: 400 });
  }
}
