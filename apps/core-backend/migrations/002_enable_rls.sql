-- Row Level Security for tenant isolation.
-- Requires the calling code to set the session variable before executing queries:
--   SET app.current_tenant_id = '<tenant-uuid>';
-- Use the setTenantContext() helper in apps/core-backend/src/db.ts for this purpose.

ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_policy ON assessments
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
