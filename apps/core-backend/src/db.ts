import { Pool, type QueryResult, type QueryResultRow, type PoolClient } from 'pg';
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

/**
 * Sets the PostgreSQL session variable required for Row-Level Security tenant isolation.
 * Must be called before any query that is subject to the tenant_isolation_policy.
 *
 * @example
 * const client = await pool.connect();
 * try {
 *   await setTenantContext(client, tenantId);
 *   await client.query('SELECT * FROM assessments');
 * } finally {
 *   client.release();
 * }
 */
export async function setTenantContext(
  client: PoolClient,
  tenantId: string,
): Promise<void> {
  await client.query(`SET app.current_tenant_id = $1`, [tenantId]);
}
