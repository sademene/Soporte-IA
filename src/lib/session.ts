// src/lib/session.ts
import { getIronSession, type IronSession, type IronSessionOptions } from 'iron-session';
import { cookies } from 'next/headers';

export type UserSession = {
  username: string;
  role: 'superadmin' | 'admin' | 'user' | string;
  userId: number;
};

export type SessionData = {
  user?: UserSession;
};

export const sessionOptions: IronSessionOptions = {
  cookieName: process.env.SESSION_COOKIE_NAME || 'soporte-ia-session',
  password:
    process.env.SESSION_PASSWORD ||
    // ❗️En producción DEBES establecer SESSION_PASSWORD (mín. 32 chars)
    'dev-only-min-32-characters-password-please-change-me-123456',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    // Ajusta dominio si lo necesitas: domain: process.env.COOKIE_DOMAIN
  },
};

/**
 * Devuelve la sesión usando cookies() en App Router.
 * Uso: const session = await getSession(); session.user = {...}; await session.save();
 */
export async function getSession(): Promise<IronSession<SessionData>> {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);
  return session;
}

/**
 * Helper opcional: asegura que exista sesión con user.
 * Lanza si no hay sesión válida (puedes adaptarlo a tu flujo).
 */
export async function requireSession(): Promise<IronSession<SessionData>> {
  const session = await getSession();
  if (!session.user) {
    throw new Error('Unauthorized: session not found');
  }
  return session;
}
