// scripts/init-db.js  (ESM)
import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';

const dataDir = '/app/data';
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, 'frontend.db');
const db = new Database(dbPath);

// Throttle
db.prepare(`
  CREATE TABLE IF NOT EXISTS login_throttle (
    username TEXT NOT NULL,
    ip TEXT NOT NULL,
    failed_count INTEGER NOT NULL DEFAULT 0,
    last_attempt_at TEXT,
    lock_until TEXT,
    PRIMARY KEY(username, ip)
  )
`).run();

// Settings
db.prepare(`
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  )
`).run();

// Users
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user','admin')),
    valid_until TEXT,
    blocked INTEGER NOT NULL DEFAULT 0
  )
`).run();

db.close();
console.log('SQLite inicializado en', dbPath);
