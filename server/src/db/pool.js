import pg from 'pg';
import { env } from '../config/env.js';

export const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  max: 5, // Neon free tier has a connection cap; a small pool is plenty for one Render instance
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 15_000, // allows for Neon waking from scale-to-zero
});

// An idle client erroring (e.g. Neon suspending compute) must never crash the process.
pool.on('error', (err) => console.error('[db] idle client error:', err.message));

export const query = (text, params) => pool.query(text, params);
