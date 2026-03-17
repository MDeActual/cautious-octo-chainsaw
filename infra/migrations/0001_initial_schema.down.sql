-- ============================================================
-- Migration 0001: Rollback initial schema
-- Drops all tables created in the up migration (reverse order)
-- ============================================================

DROP TABLE IF EXISTS audit_logs              CASCADE;
DROP TABLE IF EXISTS ai_usage_logs           CASCADE;
DROP TABLE IF EXISTS automation_history      CASCADE;
DROP TABLE IF EXISTS automation_rules        CASCADE;
DROP TABLE IF EXISTS compliance_assessments  CASCADE;
DROP TABLE IF EXISTS compliance_frameworks   CASCADE;
DROP TABLE IF EXISTS cis_controls            CASCADE;
DROP TABLE IF EXISTS assessments             CASCADE;
DROP TABLE IF EXISTS users                   CASCADE;
DROP TABLE IF EXISTS tenants                 CASCADE;
