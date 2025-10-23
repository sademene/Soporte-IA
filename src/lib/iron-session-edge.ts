// src/lib/iron-session-edge.ts
import { cookies } from 'next/headers';
import { getIronSession as _getIronSession, type IronSession, type IronSessionOptions } from 'iron-session';

/**
 * Shim compatible with old `iron-session/edge` imports.
 * It re-exports `getIronSession` signatures so your current code keeps working.
 */

export type { IronSession, IronSessionOptions } from 'iron-session';

/**
 * Overload 1 (App Router read-only): getIronSession(cookies(), options)
 * Overload 2 (Legacy pages/api): getIronSession(req, res, options)
 */
export function getIronSession(arg1: any, arg2?: any, arg3?: any): Promise<IronSession> {
  if (arguments.length === 1) {
    // Not a valid form, but keep for safety (no-op)
    return _getIronSession(cookies() as any, arg1 as IronSessionOptions) as Promise<IronSession>;
  }
  if (arguments.length === 2) {
    // App Router pattern: cookies(), options
    return _getIronSession(arg1, arg2) as Promise<IronSession>;
  }
  // Classic: req, res, options
  return _getIronSession(arg1, arg2, arg3) as Promise<IronSession>;
}
