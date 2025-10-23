// scripts/init-db.js (ESM-safe)
import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';

const dataDir = process.env.DATA_DIR || '/app/data';
fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, 'frontend.db');
const db = new Database(dbPath);

// Minimal schema (idempotent)
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    blocked INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS throttle (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    ip TEXT,
    failed_count INTEGER NOT NULL DEFAULT 0,
    until TEXT
  );
`);

db.close();
console.log('[init-db] DB initialized at', dbPath);
