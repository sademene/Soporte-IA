// src/lib/session.ts
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

// Cumple la extensión de tipos pedida
declare module 'iron-session' {
  interface IronSessionData {
    user?: { username: string; role: 'user' | 'admin' | 'superadmin'; userId: number };
  }
}

// La consigna pide usar "SessionOptions". Creamos alias local compatible.
export type SessionOptions = {
  cookieName: string;
  password: string;
  ttl?: number;
  cookieOptions?: {
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: 'lax' | 'strict' | 'none';
    path?: string;
  };
};

export const sessionOptions: SessionOptions = {
  cookieName: 'soporte-ia-session',
  password: process.env.SESSION_SECRET || 'fallback-session-secret-please-change',
  cookieOptions: {
    secure: true,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  },
};

export async function getSession() {
  return getIronSession(cookies(), sessionOptions);
}
