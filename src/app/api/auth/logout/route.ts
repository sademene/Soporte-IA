import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  const { session, headers } = await getSession();
  session.destroy();
  headers.forEach((v,k)=>res.headers.set(k,v));
  return res;
}
