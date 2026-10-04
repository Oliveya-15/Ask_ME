import app from './app.js';
import { env } from './config/env.js';
import { pool } from './db/pool.js';
import { migrate } from './db/migrate.js';

async function start() {
  await migrate(); // idempotent; creates tables on first boot so no manual SQL step is needed

  const server = app.listen(env.PORT, () => console.log(`[server] AskMe API listening on :${env.PORT} (${env.NODE_ENV})`));

  const shutdown = (signal) => {
    console.log(`[server] ${signal} received, shutting down...`);
    server.close(async () => {
      await pool.end().catch(() => {});
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

process.on('unhandledRejection', (reason) => console.error('[server] unhandledRejection:', reason));

start().catch((err) => {
  console.error('[server] failed to start:', err.message);
  process.exit(1);
});
