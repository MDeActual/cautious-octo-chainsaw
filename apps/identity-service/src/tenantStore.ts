import { v4 as uuidv4 } from 'uuid';
import type { Tenant, TenantStatus } from '@cloudmatrix/shared-types';

// In-memory store for Phase 1 development. Replace with PostgreSQL in production.
const tenants = new Map<string, Tenant>();

export function listTenants(): Tenant[] {
  return Array.from(tenants.values());
}

export function getTenantById(id: string): Tenant | undefined {
  return tenants.get(id);
}

export function getTenantByEntraId(entraId: string): Tenant | undefined {
  return Array.from(tenants.values()).find((t) => t.entra_tenant_id === entraId);
}

export function createTenant(name: string, entraId: string): Tenant {
  const now = new Date().toISOString();
  const tenant: Tenant = {
    id: uuidv4(),
    name,
    entra_tenant_id: entraId,
    status: 'trial',
    created_at: now,
    updated_at: now,
  };
  tenants.set(tenant.id, tenant);
  return tenant;
}

export function updateTenantStatus(id: string, status: TenantStatus): Tenant | undefined {
  const tenant = tenants.get(id);
  if (!tenant) return undefined;
  const updated: Tenant = { ...tenant, status, updated_at: new Date().toISOString() };
  tenants.set(id, updated);
  return updated;
}
