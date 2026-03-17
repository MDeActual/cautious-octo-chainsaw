#!/usr/bin/env ts-node
/**
 * Seed script — inserts default compliance frameworks and a development tenant.
 *
 * Usage:
 *   DATABASE_URL=postgresql://... ts-node infra/seeds/seed.ts
 *   # or after build:
 *   DATABASE_URL=postgresql://... node infra/seeds/seed.js
 */

import { createPool } from '../../packages/database/src/pool';

const connectionString =
  process.env['DATABASE_URL'] ?? process.env['POSTGRES_URL'] ?? '';

if (!connectionString) {
  console.error('[seed] ERROR: DATABASE_URL or POSTGRES_URL is required');
  process.exit(1);
}

const pool = createPool(connectionString);

interface FrameworkSeed {
  name: string;
  version: string;
  region: string | null;
  industry: string | null;
  description: string;
}

const FRAMEWORKS: FrameworkSeed[] = [
  {
    name: 'CIS Controls v8',
    version: '8.0',
    region: null,
    industry: null,
    description:
      'Center for Internet Security Controls version 8 — industry-standard security best practices covering 18 control groups.',
  },
  {
    name: 'PIPEDA',
    version: '2019',
    region: 'Canada',
    industry: null,
    description:
      'Personal Information Protection and Electronic Documents Act — Canadian federal private-sector privacy law.',
  },
  {
    name: 'Quebec Law 25',
    version: '2022',
    region: 'Quebec, Canada',
    industry: null,
    description:
      'Act respecting the protection of personal information in the private sector (Law 25) — Quebec provincial privacy legislation.',
  },
  {
    name: 'Microsoft Zero Trust',
    version: '2023',
    region: null,
    industry: null,
    description:
      "Microsoft's Zero Trust security model: Verify Explicitly, Use Least Privilege, Assume Breach.",
  },
  {
    name: 'FSI',
    version: '1.0',
    region: 'Canada',
    industry: 'Financial Services',
    description:
      'Financial Services Industry security baseline for data encryption, access control, and incident response.',
  },
  {
    name: 'MISA',
    version: '1.0',
    region: null,
    industry: null,
    description:
      'Microsoft Intelligent Security Association — security standards for MSSP partners delivering managed security services.',
  },
];

async function seed(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Upsert compliance frameworks (idempotent)
    for (const fw of FRAMEWORKS) {
      await client.query(
        `INSERT INTO compliance_frameworks (name, version, region, industry, description, controls)
         VALUES ($1, $2, $3, $4, $5, '[]')
         ON CONFLICT (name) DO NOTHING`,
        [fw.name, fw.version, fw.region, fw.industry, fw.description],
      );
      console.log(`[seed] upserted framework: ${fw.name}`);
    }

    // Insert a development test tenant (idempotent)
    await client.query(
      `INSERT INTO tenants (tenant_id, name, status, domain, contact_email)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (tenant_id) DO NOTHING`,
      [
        '00000000-0000-0000-0000-000000000001',
        'CloudMatrix Dev Tenant',
        'trial',
        'dev.cloudmatrix.local',
        'dev@cloudmatrix.local',
      ],
    );
    console.log('[seed] upserted dev tenant');

    await client.query('COMMIT');
    console.log('[seed] seed complete');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err: unknown) => {
  console.error('[seed] ERROR:', err);
  process.exit(1);
});
