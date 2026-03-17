CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  secure_score_raw NUMERIC NOT NULL,
  secure_score_max NUMERIC NOT NULL,
  security_percentage INTEGER NOT NULL,
  risk_level VARCHAR(10) NOT NULL CHECK (risk_level IN ('Low', 'Medium', 'High')),
  opportunity_score INTEGER NOT NULL,
  lead_rank VARCHAR(10) NOT NULL CHECK (lead_rank IN ('Hot', 'Warm', 'Cold')),
  assessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assessments_tenant_id ON assessments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_assessments_assessed_at ON assessments(assessed_at);
