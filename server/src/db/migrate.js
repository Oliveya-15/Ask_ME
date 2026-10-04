import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { pool } from './pool.js';

export async function migrate() {
  const sql = await readFile(fileURLToPath(new URL('./schema.sql', import.meta.url)), 'utf8');
  await pool.query(sql);
  console.log('[db] schema ready');
}

// Allow `npm run migrate`
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  migrate()
    .then(() => pool.end())
    .catch((e) => {
      console.error('[db] migration failed:', e.message);
      process.exit(1);
    });
}
