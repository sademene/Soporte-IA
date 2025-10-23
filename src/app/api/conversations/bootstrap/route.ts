// src/app/api/conversations/bootstrap/route.ts
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function GET() {
  const session = await getSession();
  if (!session.user) return NextResponse.json({ ok: false }, { status: 401 });

  // Datos mínimos para hidratar cliente
  return NextResponse.json({
    ok: true,
    user: session.user,
    settings: {
      theme: process.env.DEFAULT_THEME || 'dark',
      brand: process.env.DEFAULT_BRAND_HEX || '#7c3aed',
    },
  });
}

}
