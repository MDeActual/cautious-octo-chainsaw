/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  // Enable UUID extension
  pgm.createExtension('pgcrypto', { ifNotExists: true });

  // =========================================================================
  // tenants
  // =========================================================================
  pgm.createTable('tenants', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    tenant_id: { type: 'varchar(255)', notNull: true, unique: true },
    name: { type: 'varchar(255)', notNull: true },
    domain: { type: 'varchar(255)', notNull: true },
    status: {
      type: 'varchar(50)',
      notNull: true,
      default: 'onboarding',
      check: "status IN ('active', 'inactive', 'suspended', 'onboarding')",
    },
    contact_email: { type: 'varchar(255)', notNull: true },
    onboarded_at: { type: 'timestamptz' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  // =========================================================================
  // users
  // =========================================================================
  pgm.createTable('users', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    entra_id: { type: 'varchar(255)', notNull: true, unique: true },
    email: { type: 'varchar(255)', notNull: true },
    name: { type: 'varchar(255)', notNull: true },
    role: {
      type: 'varchar(50)',
      notNull: true,
      default: 'read_only',
      check: "role IN ('admin', 'analyst', 'sales', 'read_only')",
    },
    tenant_id: { type: 'uuid', notNull: true, references: '"tenants"', onDelete: 'CASCADE' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  // =========================================================================
  // assessments
  // =========================================================================
  pgm.createTable('assessments', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    tenant_id: { type: 'uuid', notNull: true, references: '"tenants"', onDelete: 'CASCADE' },
    secure_score: { type: 'integer', notNull: true, default: 0 },
    max_secure_score: { type: 'integer', notNull: true, default: 0 },
    security_percentage: { type: 'decimal(5,2)', notNull: true, default: 0 },
    risk_level: {
      type: 'varchar(50)',
      notNull: true,
      default: 'medium',
      check: "risk_level IN ('critical', 'high', 'medium', 'low')",
    },
    lead_rank: {
      type: 'varchar(10)',
      notNull: true,
      default: 'cold',
      check: "lead_rank IN ('hot', 'warm', 'cold')",
    },
    assessment_data: { type: 'jsonb', notNull: true, default: '{}' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  // =========================================================================
  // cis_controls
  // =========================================================================
  pgm.createTable('cis_controls', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    assessment_id: {
      type: 'uuid',
      notNull: true,
      references: '"assessments"',
      onDelete: 'CASCADE',
    },
    control_id: { type: 'varchar(20)', notNull: true },
    control_name: { type: 'varchar(255)', notNull: true },
    status: {
      type: 'varchar(50)',
      notNull: true,
      default: 'not_implemented',
      check: "status IN ('implemented', 'partially_implemented', 'not_implemented', 'not_applicable')",
    },
    score: { type: 'integer', notNull: true, default: 0 },
    max_score: { type: 'integer', notNull: true, default: 0 },
    recommendations: { type: 'jsonb', notNull: true, default: '[]' },
    evidence: { type: 'jsonb', notNull: true, default: '{}' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  // =========================================================================
  // compliance_frameworks
  // =========================================================================
  pgm.createTable('compliance_frameworks', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    name: { type: 'varchar(255)', notNull: true },
    version: { type: 'varchar(50)', notNull: true },
    region: { type: 'varchar(100)', notNull: true },
    industry: { type: 'varchar(100)', notNull: true },
    controls: { type: 'jsonb', notNull: true, default: '[]' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  // =========================================================================
  // compliance_assessments
  // =========================================================================
  pgm.createTable('compliance_assessments', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    tenant_id: { type: 'uuid', notNull: true, references: '"tenants"', onDelete: 'CASCADE' },
    framework_id: {
      type: 'uuid',
      notNull: true,
      references: '"compliance_frameworks"',
      onDelete: 'CASCADE',
    },
    assessment_id: {
      type: 'uuid',
      notNull: true,
      references: '"assessments"',
      onDelete: 'CASCADE',
    },
    compliance_percentage: { type: 'decimal(5,2)', notNull: true, default: 0 },
    passed_controls: { type: 'integer', notNull: true, default: 0 },
    total_controls: { type: 'integer', notNull: true, default: 0 },
    details: { type: 'jsonb', notNull: true, default: '{}' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  // =========================================================================
  // automation_rules
  // =========================================================================
  pgm.createTable('automation_rules', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    name: { type: 'varchar(255)', notNull: true },
    description: { type: 'text' },
    trigger_event: { type: 'varchar(100)', notNull: true },
    conditions: { type: 'jsonb', notNull: true, default: '[]' },
    actions: { type: 'jsonb', notNull: true, default: '[]' },
    enabled: { type: 'boolean', notNull: true, default: true },
    created_by: { type: 'uuid', notNull: true, references: '"users"', onDelete: 'CASCADE' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  // =========================================================================
  // automation_history
  // =========================================================================
  pgm.createTable('automation_history', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    rule_id: { type: 'uuid', notNull: true, references: '"automation_rules"', onDelete: 'CASCADE' },
    tenant_id: { type: 'uuid', notNull: true, references: '"tenants"', onDelete: 'CASCADE' },
    trigger_data: { type: 'jsonb', notNull: true, default: '{}' },
    actions_executed: { type: 'jsonb', notNull: true, default: '[]' },
    status: {
      type: 'varchar(20)',
      notNull: true,
      default: 'pending',
      check: "status IN ('success', 'failed', 'pending')",
    },
    error: { type: 'text' },
    executed_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  // =========================================================================
  // ai_usage_logs
  // =========================================================================
  pgm.createTable('ai_usage_logs', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    tenant_id: { type: 'uuid', notNull: true, references: '"tenants"', onDelete: 'CASCADE' },
    user_id: { type: 'uuid', notNull: true, references: '"users"', onDelete: 'CASCADE' },
    operation: { type: 'varchar(100)', notNull: true },
    tokens_used: { type: 'integer', notNull: true, default: 0 },
    cost: { type: 'decimal(10,6)', notNull: true, default: 0 },
    response_time_ms: { type: 'integer', notNull: true, default: 0 },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  // =========================================================================
  // audit_logs
  // =========================================================================
  pgm.createTable('audit_logs', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    tenant_id: { type: 'uuid', references: '"tenants"', onDelete: 'SET NULL' },
    user_id: { type: 'uuid', references: '"users"', onDelete: 'SET NULL' },
    action: { type: 'varchar(100)', notNull: true },
    resource_type: { type: 'varchar(100)', notNull: true },
    resource_id: { type: 'uuid' },
    details: { type: 'jsonb', notNull: true, default: '{}' },
    ip_address: { type: 'varchar(45)' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  // =========================================================================
  // Indexes
  // =========================================================================
  pgm.createIndex('tenants', 'tenant_id');
  pgm.createIndex('tenants', 'status');
  pgm.createIndex('users', 'entra_id');
  pgm.createIndex('users', 'tenant_id');
  pgm.createIndex('users', 'email');
  pgm.createIndex('assessments', 'tenant_id');
  pgm.createIndex('assessments', 'risk_level');
  pgm.createIndex('assessments', 'lead_rank');
  pgm.createIndex('assessments', 'created_at');
  pgm.createIndex('cis_controls', 'assessment_id');
  pgm.createIndex('cis_controls', 'control_id');
  pgm.createIndex('compliance_assessments', 'tenant_id');
  pgm.createIndex('compliance_assessments', 'framework_id');
  pgm.createIndex('automation_history', 'tenant_id');
  pgm.createIndex('automation_history', 'rule_id');
  pgm.createIndex('automation_history', 'status');
  pgm.createIndex('ai_usage_logs', 'tenant_id');
  pgm.createIndex('audit_logs', 'tenant_id');
  pgm.createIndex('audit_logs', 'user_id');
  pgm.createIndex('audit_logs', 'action');
  pgm.createIndex('audit_logs', 'created_at');

  // =========================================================================
  // Enable Row Level Security
  // =========================================================================
  pgm.sql('ALTER TABLE tenants ENABLE ROW LEVEL SECURITY');
  pgm.sql('ALTER TABLE users ENABLE ROW LEVEL SECURITY');
  pgm.sql('ALTER TABLE assessments ENABLE ROW LEVEL SECURITY');
  pgm.sql('ALTER TABLE cis_controls ENABLE ROW LEVEL SECURITY');
  pgm.sql('ALTER TABLE compliance_assessments ENABLE ROW LEVEL SECURITY');
  pgm.sql('ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY');
  pgm.sql('ALTER TABLE automation_history ENABLE ROW LEVEL SECURITY');
  pgm.sql('ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY');
  pgm.sql('ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY');

  // Create RLS policies (app_tenant_id is set by the application layer)
  pgm.sql(`
    CREATE POLICY tenant_isolation_tenants ON tenants
      USING (tenant_id = current_setting('app.tenant_id', true))
  `);
  pgm.sql(`
    CREATE POLICY tenant_isolation_users ON users
      USING (tenant_id = (
        SELECT id FROM tenants WHERE tenant_id = current_setting('app.tenant_id', true)
      ))
  `);
  pgm.sql(`
    CREATE POLICY tenant_isolation_assessments ON assessments
      USING (tenant_id = (
        SELECT id FROM tenants WHERE tenant_id = current_setting('app.tenant_id', true)
      ))
  `);
  pgm.sql(`
    CREATE POLICY tenant_isolation_cis_controls ON cis_controls
      USING (assessment_id IN (
        SELECT id FROM assessments WHERE tenant_id = (
          SELECT id FROM tenants WHERE tenant_id = current_setting('app.tenant_id', true)
        )
      ))
  `);
  pgm.sql(`
    CREATE POLICY tenant_isolation_compliance_assessments ON compliance_assessments
      USING (tenant_id = (
        SELECT id FROM tenants WHERE tenant_id = current_setting('app.tenant_id', true)
      ))
  `);
  pgm.sql(`
    CREATE POLICY tenant_isolation_automation_rules ON automation_rules
      USING (created_by IN (
        SELECT id FROM users WHERE tenant_id = (
          SELECT id FROM tenants WHERE tenant_id = current_setting('app.tenant_id', true)
        )
      ))
  `);
  pgm.sql(`
    CREATE POLICY tenant_isolation_automation_history ON automation_history
      USING (tenant_id = (
        SELECT id FROM tenants WHERE tenant_id = current_setting('app.tenant_id', true)
      ))
  `);
  pgm.sql(`
    CREATE POLICY tenant_isolation_ai_usage_logs ON ai_usage_logs
      USING (tenant_id = (
        SELECT id FROM tenants WHERE tenant_id = current_setting('app.tenant_id', true)
      ))
  `);
  pgm.sql(`
    CREATE POLICY tenant_isolation_audit_logs ON audit_logs
      USING (tenant_id = (
        SELECT id FROM tenants WHERE tenant_id = current_setting('app.tenant_id', true)
      ))
  `);
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.dropTable('audit_logs');
  pgm.dropTable('ai_usage_logs');
  pgm.dropTable('automation_history');
  pgm.dropTable('automation_rules');
  pgm.dropTable('compliance_assessments');
  pgm.dropTable('compliance_frameworks');
  pgm.dropTable('cis_controls');
  pgm.dropTable('assessments');
  pgm.dropTable('users');
  pgm.dropTable('tenants');
  pgm.dropExtension('pgcrypto', { ifExists: true });
};
