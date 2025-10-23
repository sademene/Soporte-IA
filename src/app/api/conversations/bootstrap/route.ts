// src/app/api/conversations/bootstrap/route.ts
// Minimal, safe bootstrap endpoint to unblock Next.js build.
// If your app needs seeding logic, you can extend inside the handlers.

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Health-check style bootstrap — returns ok:true
export async function GET() {
  return NextResponse.json({ ok: true, bootstrap: 'noop' });
}

export async function POST() {
  // Place any first-run initialization here if needed
  return NextResponse.json({ ok: true, bootstrap: 'noop' });
}
