# PERMISSION_MODEL.md

Layers:
1. Authentication (Entra ID)
2. Role Authorization
3. Tenant Read Access
4. Managed Write Authority
5. Entitlements

Rules:
- Separate read/write
- Require admin consent for write
- Log everything
- No AI direct execution
