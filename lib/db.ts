import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

// ── Neon Postgres (production) ────────────────────────────────────────────────
function getNeonClient() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

// ── Local JSON store (development without DATABASE_URL) ───────────────────────
const STORE_PATH = path.join(process.cwd(), 'data', 'local-store.json');

interface LocalStore {
  users: Record<string, unknown>[];
  products: Record<string, unknown>[];
  posts: Record<string, unknown>[];
  settings: Record<string, unknown>[];
}

function readLocalStore(): LocalStore {
  try {
    if (fs.existsSync(STORE_PATH)) {
      return JSON.parse(fs.readFileSync(STORE_PATH, 'utf-8'));
    }
  } catch { /* */ }
  return { users: [], products: [], posts: [], settings: [] };
}

function writeLocalStore(store: LocalStore) {
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');
}

// ── Unified DB interface ───────────────────────────────────────────────────────
export async function dbQuery<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  const client = getNeonClient();
  if (client) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await client.query(sql, params as any[]);
    return result as T[];
  }
  // Local store fallback — only used for seed/read operations
  return localFallback<T>(sql, params);
}

function localFallback<T>(sql: string, params: unknown[]): T[] {
  const store = readLocalStore();
  const q = sql.trim().toLowerCase();

  if (q.startsWith('select') && q.includes('from users')) {
    const email = params[0];
    if (email) return store.users.filter((u: any) => u.email === email) as T[];
    return store.users as T[];
  }
  if (q.startsWith('select') && q.includes('from products')) {
    const id = params[0];
    if (id) return store.products.filter((p: any) => p.id === id) as T[];
    return store.products as T[];
  }
  if (q.startsWith('select') && q.includes('from posts')) {
    // Only filter by day_number when it's a WHERE condition (params present)
    const day = params[0];
    if (day !== undefined && q.includes('where')) {
      return store.posts.filter((p: any) => p.day_number === day) as T[];
    }
    return store.posts as T[];
  }
  if (q.startsWith('select') && q.includes('from settings')) {
    const key = params[0];
    if (key) return store.settings.filter((s: any) => s.key === key) as T[];
    return store.settings as T[];
  }
  return [];
}

export async function dbExecute(sql: string, params: unknown[] = []): Promise<void> {
  const client = getNeonClient();
  if (client) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await client.query(sql, params as any[]);
    return;
  }
  localExecute(sql, params);
}

function localExecute(sql: string, params: unknown[]) {
  const store = readLocalStore();
  const q = sql.trim().toLowerCase();

  if (q.startsWith('insert into users')) {
    store.users.push({ email: params[0], password_hash: params[1], id: Date.now() });
  } else if (q.startsWith('insert into products')) {
    const existing = store.products.findIndex((p: any) => p.id === params[0]);
    const record = { id: params[0], data: params[1] };
    if (existing >= 0) store.products[existing] = record;
    else store.products.push(record);
  } else if (q.startsWith('insert into posts')) {
    // Column order in all INSERT INTO posts calls: (id, day_number, data)
    // params[0]=id (string), params[1]=dayNumber (integer), params[2]=data (JSON string)
    const postId = params[0] as string;
    const dayNum = params[1] as number;
    const data = params[2];
    const existing = store.posts.findIndex((p: any) => p.day_number === dayNum);
    const record = { id: postId, day_number: dayNum, data };
    if (existing >= 0) {
      // ON CONFLICT DO NOTHING — skip if already exists
      if (!q.includes('do nothing')) store.posts[existing] = record;
    } else {
      store.posts.push(record);
    }
  } else if (q.startsWith('insert into settings')) {
    const existing = store.settings.findIndex((s: any) => s.key === params[0]);
    const record = { key: params[0], value: params[1] };
    if (existing >= 0) store.settings[existing] = record;
    else store.settings.push(record);
  }

  writeLocalStore(store);
}

export async function initDb() {
  const client = getNeonClient();
  if (!client) return; // local store doesn't need init

  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      day_number INTEGER UNIQUE NOT NULL,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value JSONB NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
}
