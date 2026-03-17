import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import { createPool } from './pool';

/**
 * Ensures the migrations tracking table exists.
 */
async function ensureMigrationsTable(pool: Pool): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id        SERIAL PRIMARY KEY,
      filename  VARCHAR(255) UNIQUE NOT NULL,
      applied_at TIMESTAMP DEFAULT NOW()
    )
  `);
}

/**
 * Returns filenames of migrations that have already been applied.
 */
async function appliedMigrations(pool: Pool): Promise<Set<string>> {
  const result = await pool.query<{ filename: string }>(
    'SELECT filename FROM schema_migrations ORDER BY id',
  );
  return new Set(result.rows.map((r) => r.filename));
}

/**
 * Runs all pending *.up.sql migrations found in migrationsDir.
 */
export async function migrateUp(
  connectionString: string,
  migrationsDir: string,
): Promise<void> {
  const pool = createPool(connectionString);
  try {
    await ensureMigrationsTable(pool);
    const applied = await appliedMigrations(pool);

    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.up.sql'))
      .sort();

    for (const file of files) {
      if (applied.has(file)) {
        console.log(`[migrate] skipping (already applied): ${file}`);
        continue;
      }
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query(
          'INSERT INTO schema_migrations (filename) VALUES ($1)',
          [file],
        );
        await client.query('COMMIT');
        console.log(`[migrate] applied: ${file}`);
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    }
    console.log('[migrate] migrate:up complete');
  } finally {
    await pool.end();
  }
}

/**
 * Rolls back the most recently applied migration by running its *.down.sql
 * counterpart.
 */
export async function migrateDown(
  connectionString: string,
  migrationsDir: string,
): Promise<void> {
  const pool = createPool(connectionString);
  try {
    await ensureMigrationsTable(pool);
    const result = await pool.query<{ filename: string }>(
      'SELECT filename FROM schema_migrations ORDER BY id DESC LIMIT 1',
    );
    if (result.rows.length === 0) {
      console.log('[migrate] nothing to roll back');
      return;
    }
    const upFile = result.rows[0].filename;
    const downFile = upFile.replace('.up.sql', '.down.sql');
    const downPath = path.join(migrationsDir, downFile);

    if (!fs.existsSync(downPath)) {
      throw new Error(`Down migration not found: ${downFile}`);
    }
    const sql = fs.readFileSync(downPath, 'utf8');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query(
        'DELETE FROM schema_migrations WHERE filename = $1',
        [upFile],
      );
      await client.query('COMMIT');
      console.log(`[migrate] rolled back: ${upFile}`);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
    console.log('[migrate] migrate:down complete');
  } finally {
    await pool.end();
  }
}
