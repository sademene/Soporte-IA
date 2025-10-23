// src/app/api/conversations/export/route.ts
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.user) return NextResponse.json({ ok: false }, { status: 401 });

  const { username, sessionId, text } = await req.json();
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
  const filename = `Soporte-IA_${username}_${stamp}_${sessionId}.txt`;

  return new NextResponse(text || '', {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'content-disposition': `attachment; filename="${filename}"`,
    },
  });
}
