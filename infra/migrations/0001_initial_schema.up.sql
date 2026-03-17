-- ============================================================
-- Migration 0001: Initial schema
-- Creates all 10 core tables with constraints, RLS, and indexes
-- ============================================================

-- ─── 1. tenants (no RLS — root table) ──────────────────────
CREATE TABLE tenants (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id     VARCHAR(255) UNIQUE NOT NULL,  -- Entra tenant ID
    name          VARCHAR(255) NOT NULL,
    status        VARCHAR(50)  NOT NULL DEFAULT 'trial'
                    CHECK (status IN ('trial', 'active', 'suspended')),
    domain        VARCHAR(255),
    contact_email VARCHAR(255),
    onboarded_at  TIMESTAMP,
    created_at    TIMESTAMP    DEFAULT NOW(),
    updated_at    TIMESTAMP    DEFAULT NOW()
);

-- ─── 2. users (no RLS — root table) ────────────────────────
CREATE TABLE users (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    entra_id   VARCHAR(255) UNIQUE NOT NULL,
    email      VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name  VARCHAR(255),
    role       VARCHAR(50)  NOT NULL
                 CHECK (role IN ('Sales', 'Analyst', 'Admin')),
    tenant_id  UUID         NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    created_at TIMESTAMP    DEFAULT NOW(),
    updated_at TIMESTAMP    DEFAULT NOW()
);

-- ─── 3. assessments (RLS enabled) ──────────────────────────
CREATE TABLE assessments (
    id                   UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id            UUID         NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    secure_score         INTEGER      NOT NULL,
    max_score            INTEGER      NOT NULL,
    security_percentage  DECIMAL(5,2) NOT NULL,
    risk_level           VARCHAR(50)  NOT NULL
                           CHECK (risk_level IN ('Low', 'Medium', 'High')),
    opportunity_score    DECIMAL(5,2) NOT NULL DEFAULT 0,
    lead_rank            VARCHAR(50)  NOT NULL
                           CHECK (lead_rank IN ('Hot', 'Warm', 'Cold')),
    assessment_data      JSONB        NOT NULL DEFAULT '{}',
    created_at           TIMESTAMP    DEFAULT NOW()
);

ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_assessments ON assessments
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant')::uuid);

-- ─── 4. cis_controls (RLS enabled) ─────────────────────────
CREATE TABLE cis_controls (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id    UUID         NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    tenant_id        UUID         NOT NULL REFERENCES tenants(id)    ON DELETE CASCADE,
    control_id       VARCHAR(50)  NOT NULL,
    control_name     VARCHAR(255) NOT NULL,
    control_category VARCHAR(255) NOT NULL,
    status           VARCHAR(50)  NOT NULL
                       CHECK (status IN ('compliant', 'partial', 'non-compliant')),
    score            DECIMAL(5,2),
    recommendations  TEXT[],
    evidence         JSONB,
    created_at       TIMESTAMP    DEFAULT NOW()
);

ALTER TABLE cis_controls ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_cis_controls ON cis_controls
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant')::uuid);

-- ─── 5. compliance_frameworks (no RLS — reference data) ────
CREATE TABLE compliance_frameworks (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL UNIQUE,
    version     VARCHAR(50),
    region      VARCHAR(100),
    industry    VARCHAR(100),
    description TEXT,
    controls    JSONB        NOT NULL DEFAULT '[]',
    created_at  TIMESTAMP    DEFAULT NOW()
);

-- ─── 6. compliance_assessments (RLS enabled) ───────────────
CREATE TABLE compliance_assessments (
    id                    UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id             UUID         NOT NULL REFERENCES tenants(id)              ON DELETE CASCADE,
    framework_id          UUID         NOT NULL REFERENCES compliance_frameworks(id) ON DELETE RESTRICT,
    assessment_id         UUID                  REFERENCES assessments(id)          ON DELETE SET NULL,
    compliance_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
    status                VARCHAR(50)  NOT NULL DEFAULT 'pending',
    gaps                  JSONB                 DEFAULT '[]',
    created_at            TIMESTAMP    DEFAULT NOW(),
    updated_at            TIMESTAMP    DEFAULT NOW()
);

ALTER TABLE compliance_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_compliance_assessments ON compliance_assessments
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant')::uuid);

-- ─── 7. automation_rules (no RLS — managed by admins) ──────
CREATE TABLE automation_rules (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name          VARCHAR(255) NOT NULL,
    trigger_event VARCHAR(100) NOT NULL,
    conditions    JSONB        NOT NULL DEFAULT '{}',
    actions       JSONB        NOT NULL DEFAULT '[]',
    enabled       BOOLEAN      NOT NULL DEFAULT true,
    created_by    UUID                  REFERENCES users(id),
    created_at    TIMESTAMP    DEFAULT NOW(),
    updated_at    TIMESTAMP    DEFAULT NOW()
);

-- ─── 8. automation_history (no RLS) ────────────────────────
CREATE TABLE automation_history (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id          UUID        NOT NULL REFERENCES automation_rules(id) ON DELETE CASCADE,
    tenant_id        UUID        NOT NULL REFERENCES tenants(id)          ON DELETE CASCADE,
    trigger_data     JSONB,
    actions_executed JSONB,
    status           VARCHAR(50) NOT NULL DEFAULT 'pending',
    error_message    TEXT,
    created_at       TIMESTAMP   DEFAULT NOW()
);

-- ─── 9. ai_usage_logs (no RLS) ─────────────────────────────
CREATE TABLE ai_usage_logs (
    id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id        UUID          NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id          UUID                   REFERENCES users(id),
    operation        VARCHAR(100)  NOT NULL,
    tokens_used      INTEGER       NOT NULL DEFAULT 0,
    cost             DECIMAL(10,4) NOT NULL DEFAULT 0,
    response_time_ms INTEGER,
    created_at       TIMESTAMP     DEFAULT NOW()
);

-- ─── 10. audit_logs (RLS enabled) ──────────────────────────
CREATE TABLE audit_logs (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id     UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id       UUID                 REFERENCES users(id),
    action        VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id   VARCHAR(255),
    details       JSONB,
    ip_address    INET,
    user_agent    TEXT,
    created_at    TIMESTAMP   DEFAULT NOW()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_audit_logs ON audit_logs
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant')::uuid);

-- ─── Indexes ────────────────────────────────────────────────
CREATE INDEX idx_assessments_tenant_id           ON assessments(tenant_id);
CREATE INDEX idx_assessments_created_at          ON assessments(created_at DESC);
CREATE INDEX idx_cis_controls_assessment_id      ON cis_controls(assessment_id);
CREATE INDEX idx_compliance_assessments_tenant_id ON compliance_assessments(tenant_id);
CREATE INDEX idx_audit_logs_tenant_id            ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_created_at           ON audit_logs(created_at DESC);
CREATE INDEX idx_users_tenant_id                 ON users(tenant_id);
CREATE INDEX idx_users_entra_id                  ON users(entra_id);
