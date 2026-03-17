import { Router, type Router as ExpressRouter } from 'express';
import { z } from 'zod';
import { createTenant, getTenantById, listTenants, updateTenantStatus } from '../tenantStore.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const tenantsRouter: ExpressRouter = Router();

const CreateTenantSchema = z.object({
  name: z.string().min(1).max(255),
  entra_tenant_id: z.string().uuid(),
});

const UpdateStatusSchema = z.object({
  status: z.enum(['trial', 'active', 'suspended']),
});

// GET /tenants — list all tenants (Analyst+)
tenantsRouter.get('/', requireAuth, requireRole('Analyst'), (_req, res) => {
  const tenants = listTenants();
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
  res.status(201).json({ data: tenant, error: null });
});

// PATCH /tenants/:id/status — update tenant status (Admin only)
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
