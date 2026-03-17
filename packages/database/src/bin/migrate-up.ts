#!/usr/bin/env node
/**
 * CLI entry point for running database migrations up.
 *
 * Usage:
 *   DATABASE_URL=postgresql://... node dist/bin/migrate-up.js [migrationsDir]
 *
 * Defaults to infra/migrations relative to the monorepo root.
 */
import path from 'path';
import { migrateUp } from '../migrate';

const connectionString =
  process.env['DATABASE_URL'] ?? process.env['POSTGRES_URL'] ?? '';

if (!connectionString) {
  console.error(
    '[migrate] ERROR: DATABASE_URL or POSTGRES_URL environment variable is required',
  );
  process.exit(1);
}

const migrationsDir =
  process.argv[2] ??
  path.resolve(__dirname, '../../../../infra/migrations');

migrateUp(connectionString, migrationsDir).catch((err: unknown) => {
  console.error('[migrate] ERROR:', err);
  process.exit(1);
});
