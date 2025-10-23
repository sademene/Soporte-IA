// src/lib/session.ts
import { cookies } from 'next/headers';
import type { IronSessionOptions, IronSession } from 'iron-session';
import { getIronSession } from 'iron-session';

export type SessionUser = {
  username: string;
  role: 'superadmin' | 'admin' | 'agent';
  userId: number;
};

export type SessionData = {
  user?: SessionUser;
};

export type Session = IronSession<SessionData>;

const password = process.env.SESSION_PASSWORD;
if (!password || password.length < 32) {
  // In prod this MUST be set. We avoid throwing to not crash the build;
  // at runtime Next.js will still need it to sign cookies.
  console.warn('SESSION_PASSWORD is missing or too short; set it in your .env file (32+ chars).');
}

export const sessionOptions: IronSessionOptions = {
  password: password || 'CHANGE_ME_IN_PROD_32_CHARS_MINIMUM________________',
  cookieName: 'soporte-ia-session',
  cookieOptions: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  },
};

/**
 * Returns the iron-session instance bound to Next.js app-router cookies().
 * You can mutate `session.user` and call `session.save()` / `session.destroy()`.
 */
export async function getSession(): Promise<Session> {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);
  return session;
}
