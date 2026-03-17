import { Pool, type QueryResult, type QueryResultRow } from 'pg';
import { createLogger } from '@cloudmatrix/logger';

const logger = createLogger({ service: 'core-backend' });

let pool: Pool | null = null;

export function getPool(): Pool | null {
  if (!process.env['POSTGRES_URL']) {
    return null;
  }
  if (!pool) {
    pool = new Pool({ connectionString: process.env['POSTGRES_URL'] });
    pool.on('error', (err: Error) => {
      logger.error('Unexpected PostgreSQL pool error', { message: err.message });
    });
  }
  return pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  sql: string,
  params?: unknown[],
): Promise<QueryResult<T>> {
  const p = getPool();
  if (!p) {
    throw new Error('Database not configured — POSTGRES_URL is not set');
  }
  return p.query<T>(sql, params);
}
