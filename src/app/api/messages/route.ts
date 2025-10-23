// src/app/api/messages/route.ts
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function GET() {
  const session = await getSession();
  if (!session.user) return NextResponse.json({ ok: false }, { status: 401 });
  return NextResponse.json({ ok: true, messages: [] });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.user) return NextResponse.json({ ok: false }, { status: 401 });

  const { conversation_id, role, content } = await req.json();
  return NextResponse.json({
    ok: true,
    message: {
      id: crypto.randomUUID(),
      conversation_id,
      role: role ?? 'assistant',
      content: content ?? '',
      created_at: new Date().toISOString(),
    },
  });
}
