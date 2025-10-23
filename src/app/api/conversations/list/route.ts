// src/app/api/conversations/list/route.ts
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function GET() {
  const session = await getSession();
  if (!session.user) return NextResponse.json({ ok: false }, { status: 401 });

  // El historial vive en el front; devolvemos vacío para no romper UI.
  return NextResponse.json({ ok: true, conversations: [] });
}
