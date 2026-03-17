import { Pool, PoolClient } from 'pg';

/**
 * Creates a shared PostgreSQL connection pool.
 *
 * Pool settings follow the architecture spec:
 *   max: 20, idleTimeoutMillis: 30000, connectionTimeoutMillis: 2000
 * SSL is enabled automatically in production.
 */
export function createPool(connectionString: string): Pool {
  return new Pool({
    connectionString,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    ssl:
      process.env['NODE_ENV'] === 'production'
        ? { rejectUnauthorized: true }
        : undefined,
  });
}

/**
 * Sets the RLS tenant context on a checked-out client so that Row-Level
 * Security policies (tenant_id = current_setting('app.current_tenant')::uuid)
 * apply for the duration of the transaction / query sequence.
 *
 * Always call this before executing any query against an RLS-enabled table.
 */
export async function setTenantContext(
  client: PoolClient,
  tenantId: string,
): Promise<void> {
  await client.query('SET app.current_tenant = $1', [tenantId]);
}
