// src/lib/throttle.ts
import db from '@/lib/db';

type Row = {
  username: string;
  ip: string;
  failed_count: number;
  last_attempt_at: string;
  lock_until: string | null;
};

export function getThrottle(username: string, ip: string): Row | undefined {
  return db
    .prepare(
      `SELECT username, ip, failed_count, last_attempt_at, lock_until
       FROM login_throttle WHERE username = ? AND ip = ?`
    )
    .get(username, ip) as Row | undefined;
}

export function setThrottle(
  username: string,
  ip: string,
  failed_count: number,
  lock_until: string | null
) {
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO login_throttle (username, ip, failed_count, last_attempt_at, lock_until)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(username, ip) DO UPDATE SET
       failed_count=excluded.failed_count,
       last_attempt_at=excluded.last_attempt_at,
       lock_until=excluded.lock_until`
  ).run(username, ip, failed_count, now, lock_until);
}

export function clearThrottle(username: string, ip: string) {
  db.prepare(`DELETE FROM login_throttle WHERE username = ? AND ip = ?`).run(username, ip);
}
