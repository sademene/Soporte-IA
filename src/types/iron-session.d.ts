// src/types/iron-session.d.ts
import 'iron-session';

declare module 'iron-session' {
  interface IronSessionData {
    user?: { username: string; role: 'user' | 'admin' | 'superadmin'; userId: number };
  }
}
