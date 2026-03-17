ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_policy ON assessments
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
