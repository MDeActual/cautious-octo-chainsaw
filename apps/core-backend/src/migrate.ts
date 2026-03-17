import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import { createLogger } from '@cloudmatrix/logger';

const logger = createLogger({ service: 'core-backend:migrate' });

const MIGRATIONS_DIR = path.resolve(__dirname, '..', 'migrations');
const MIGRATIONS_TABLE = '_migrations';

async function ensureMigrationsTable(pool: Pool): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function getAppliedMigrations(pool: Pool): Promise<Set<string>> {
  const result = await pool.query<{ filename: string }>(
    `SELECT filename FROM ${MIGRATIONS_TABLE} ORDER BY id`,
  );
  return new Set(result.rows.map((r) => r.filename));
}

async function runUp(pool: Pool): Promise<void> {
  await ensureMigrationsTable(pool);
  const applied = await getAppliedMigrations(pool);

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    if (applied.has(file)) {
      logger.info(`Skipping already-applied migration: ${file}`);
      continue;
    }

    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf-8');
    logger.info(`Applying migration: ${file}`);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query(`INSERT INTO ${MIGRATIONS_TABLE} (filename) VALUES ($1)`, [file]);
      await client.query('COMMIT');
      logger.info(`Migration applied: ${file}`);
    } catch (err) {
      await client.query('ROLLBACK');
      logger.error(`Migration failed: ${file}`, { message: (err as Error).message });
      throw err;
    } finally {
      client.release();
    }
  }

  logger.info('All migrations applied successfully');
}

async function runDown(pool: Pool): Promise<void> {
  await ensureMigrationsTable(pool);
  const applied = await getAppliedMigrations(pool);

  if (applied.size === 0) {
    logger.info('No migrations to roll back');
    return;
  }

  const lastApplied = Array.from(applied).pop();
  if (!lastApplied) return;

  logger.info(`Rolling back migration: ${lastApplied}`);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`DELETE FROM ${MIGRATIONS_TABLE} WHERE filename = $1`, [lastApplied]);
    await client.query('COMMIT');
    logger.info(`Rolled back tracking record for: ${lastApplied}`);
    logger.info('Note: SQL rollback must be done manually via a down migration file');
  } catch (err) {
    await client.query('ROLLBACK');
    logger.error(`Rollback failed: ${lastApplied}`, { message: (err as Error).message });
    throw err;
  } finally {
    client.release();
  }
}

async function main(): Promise<void> {
  const command = process.argv[2];
  const postgresUrl = process.env['POSTGRES_URL'];

  if (!postgresUrl) {
    logger.error('POSTGRES_URL environment variable is not set');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: postgresUrl });

  try {
    if (command === 'up') {
      await runUp(pool);
    } else if (command === 'down') {
      await runDown(pool);
    } else {
      logger.error(`Unknown command: ${command ?? '(none)'}. Use 'up' or 'down'.`);
      process.exit(1);
    }
  } finally {
    await pool.end();
  }
}

main().catch((err: Error) => {
  logger.error('Migration runner failed', { message: err.message });
  process.exit(1);
});
