// src/app/api/chat/route.ts
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.user) return NextResponse.json({ ok: false }, { status: 401 });

  const { session_id, question } = await req.json();

  // Mock local (sin streaming)
  const USE_API_MOCK = process.env.USE_API_MOCK === 'true';
  if (USE_API_MOCK) {
    return NextResponse.json({
      answer: `(Mock) Respuesta a: "${question}"`,
      sources: ['Manual X.docx', 'Guía Y.docx'],
    });
  }

  // Proxy al backend real si lo tienes
  const base = process.env.API_BASE_URL || 'http://localhost:8000';
  try {
    const r = await fetch(`${base}/query`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ session_id, question }),
    });
    if (!r.ok) {
      return NextResponse.json({ error: 'Backend no disponible' }, { status: 502 });
    }
    const data = await r.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Error de red hacia backend' }, { status: 502 });
  }
}
