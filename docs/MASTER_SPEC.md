# MASTER_SPEC.md

SecurePulse — CloudMatrix Business Solutions

SecurePulse is a Microsoft-native, AI-assisted security operations platform for SMBs.

Phases:
1. Internal Control Plane
2. Customer Platform
3. Full MSSP Platform

Core rules:
- Graph only via graph-proxy
- AI cannot execute privileged actions
- All actions tenant-scoped and logged
- Entitlements control behavior
