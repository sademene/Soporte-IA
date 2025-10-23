// src/app/api/conversations/archive/route.ts
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function POST() {
  const session = await getSession();
  if (!session.user) return NextResponse.json({ ok: false }, { status: 401 });
  return NextResponse.json({ ok: true });
}
