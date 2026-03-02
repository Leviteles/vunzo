import { createClient } from '@libsql/client';

export const client = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:local.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

let initialized = false;

export async function ensureDb(): Promise<void> {
  if (initialized) return;

  await client.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      plan TEXT NOT NULL DEFAULT 'free',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Migration: add plan column for existing databases
  try {
    await client.execute("ALTER TABLE users ADD COLUMN plan TEXT NOT NULL DEFAULT 'free'");
  } catch {
    // Column already exists — safe to ignore
  }

  await client.execute(`
    CREATE TABLE IF NOT EXISTS financial_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      income REAL NOT NULL,
      fixed_expenses TEXT NOT NULL,
      variable_expenses TEXT NOT NULL,
      debts TEXT NOT NULL,
      assets TEXT NOT NULL,
      ai_report TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  initialized = true;
}
