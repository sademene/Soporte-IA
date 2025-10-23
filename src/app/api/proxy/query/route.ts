import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { session_id, question } = await req.json();
  const base = process.env.API_BASE_URL || 'http://localhost:8000';
  const useMock = String(process.env.USE_API_MOCK || 'true') === 'true';

  if (!useMock) {
    try{
      const r = await fetch(`${base}/query`, {
        method:'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id, question }),
        cache: 'no-store',
      });
      if (r.ok) {
        const json = await r.json();
        return NextResponse.json(json);
      }
    }catch(e){ /* cae a mock */ }
  }

  // Respuesta mock
  return NextResponse.json({ answer: `(Mock) Respuesta a: ${question}`, sources: ['Manual X.docx','Guía Y.docx'] });
}
