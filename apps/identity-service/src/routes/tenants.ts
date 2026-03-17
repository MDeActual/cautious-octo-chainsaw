import { Router, type Router as ExpressRouter } from 'express';
import { z } from 'zod';
import { createTenant, getTenantById, listTenants, updateTenantStatus } from '../tenantStore.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { logAudit } from '../services/audit.service.js';

export const tenantsRouter: ExpressRouter = Router();

const CreateTenantSchema = z.object({
  name: z.string().min(1).max(255),
  entra_tenant_id: z.string().uuid(),
});

const UpdateStatusSchema = z.object({
  status: z.enum(['trial', 'active', 'suspended']),
});

// GET /tenants — list all tenants (Analyst+)
tenantsRouter.get('/', requireAuth, requireRole('Analyst'), (req, res) => {
  const tenants = listTenants();
  logAudit(
    req.claims?.tenant_id ?? '',
    req.claims?.sub ?? '',
    'tenant.list',
    'tenant',
    undefined,
    { count: tenants.length },
    req,
  );
  res.json({ data: tenants, error: null, meta: { count: tenants.length } });
});

// GET /tenants/:id — get single tenant (Analyst+)
tenantsRouter.get('/:id', requireAuth, requireRole('Analyst'), (req, res) => {
  const tenant = getTenantById(req.params['id'] ?? '');
  if (!tenant) {
    res.status(404).json({ data: null, error: 'Tenant not found' });
    return;
  }
  res.json({ data: tenant, error: null });
});

// POST /tenants — create tenant (Admin only)
tenantsRouter.post('/', requireAuth, requireRole('Admin'), (req, res) => {
  const parse = CreateTenantSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ data: null, error: parse.error.message });
    return;
  }
  const tenant = createTenant(parse.data.name, parse.data.entra_tenant_id);
  logAudit(
    req.claims?.tenant_id ?? '',
    req.claims?.sub ?? '',
    'tenant.create',
    'tenant',
    tenant.id,
    { name: tenant.name },
    req,
  );
  res.status(201).json({ data: tenant, error: null });
});

// PUT /tenants/:id/status — update tenant status (Admin only)
tenantsRouter.put('/:id/status', requireAuth, requireRole('Admin'), (req, res) => {
  const parse = UpdateStatusSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ data: null, error: parse.error.message });
    return;
  }
  const updated = updateTenantStatus(req.params['id'] ?? '', parse.data.status);
  if (!updated) {
    res.status(404).json({ data: null, error: 'Tenant not found' });
    return;
  }
  logAudit(
    req.claims?.tenant_id ?? '',
    req.claims?.sub ?? '',
    'tenant.status.update',
    'tenant',
    updated.id,
    { status: updated.status },
    req,
  );
  res.json({ data: updated, error: null });
});

// PATCH /tenants/:id/status — update tenant status (Admin only, kept for backwards compat)
tenantsRouter.patch('/:id/status', requireAuth, requireRole('Admin'), (req, res) => {
  const parse = UpdateStatusSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ data: null, error: parse.error.message });
    return;
  }
  const updated = updateTenantStatus(req.params['id'] ?? '', parse.data.status);
  if (!updated) {
    res.status(404).json({ data: null, error: 'Tenant not found' });
    return;
  }
  res.json({ data: updated, error: null });
});
