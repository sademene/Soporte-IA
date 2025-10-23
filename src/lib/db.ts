// src/lib/db.ts
import Database from 'better-sqlite3';
import path from 'node:path';

const dbPath = path.join('/app/data', 'frontend.db');
const db = new Database(dbPath);

// Asegura índices básicos
db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS login_throttle (
    username TEXT NOT NULL,
    ip TEXT NOT NULL,
    failed_count INTEGER NOT NULL DEFAULT 0,
    last_attempt_at TEXT NOT NULL,
    lock_until TEXT,
    PRIMARY KEY (username, ip)
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user','admin','superadmin')),
    valid_until TEXT,
    blocked INTEGER NOT NULL DEFAULT 0
  );
`);

export default db;
