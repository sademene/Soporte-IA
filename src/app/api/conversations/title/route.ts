// src/app/api/conversations/title/route.ts
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.user) return NextResponse.json({ ok: false }, { status: 401 });

  const { text } = await req.json();
  const title = (text ?? 'Nueva conversación').slice(0, 64);
  return NextResponse.json({ ok: true, title });
}
