# SecurePulse — Microsoft Security Copilot Plugin

**Plugin name:** SecurePulse Security Advisor  
**Schema version:** v2  
**Owner:** CloudMatrix Business Solutions  
**Contact:** support@cloudmatrix.ca

---

## What This Plugin Is

The SecurePulse Security Copilot plugin is a **Microsoft Security Copilot declarative plugin** that lets security
analysts and IT administrators query their organization's Microsoft 365 security posture, CIS Controls v8
compliance status, Defender XDR risk signals, and AI-generated risk summaries directly from the Security
Copilot interface — using natural language.

It is a **read-only, advisory plugin**. It does not execute changes, trigger policies, or modify any tenant configuration.

The plugin connects to the SecurePulse platform API at `https://app.securepulse.ca` and returns data that has already been assessed and normalized by SecurePulse from Microsoft Graph API signals.

---

## What Users Can Ask

Once registered, users can ask questions like:

| Question | Function Used |
|---|---|
| "What is our current security score?" | `GetSecurityPosture` |
| "Are we a high-risk tenant?" | `GetSecurityPosture` |
| "How compliant are we with CIS Controls?" | `GetSecurityPosture` |
| "What should we fix first to improve our security?" | `GetTopRecommendations` |
| "Show me our top 3 quick-win security improvements" | `GetTopRecommendations` (effort_filter: low) |
| "Are we ready to deploy Microsoft Copilot?" | `GetCopilotReadiness` |
| "What's blocking our Copilot for M365 readiness?" | `GetCopilotReadiness` |
| "Give me an executive summary of our security posture" | `GetRiskAnalysis` |
| "What are our biggest security risks?" | `GetRiskAnalysis` |
| "What immediate actions should we take?" | `GetRiskAnalysis` |

---

## Available Functions

### `GetSecurityPosture`
Returns the current tenant security assessment:
- Microsoft Secure Score (normalized percentage)
- Risk level: Low / Medium / High
- Lead rank: Hot / Warm / Cold
- Opportunity score (0–100)
- CIS Controls v8 compliance summary (compliant / partial / non-compliant counts)

### `GetTopRecommendations`
Returns AI-prioritized remediation recommendations:
- Title and AI justification for priority
- Estimated Secure Score impact per recommendation
- Implementation effort: low / medium / high
- Supports filtering by effort level and limiting result count (default: 5, max: 20)

### `GetCopilotReadiness`
Returns a seven-check Copilot for M365 readiness assessment:
- Overall readiness score (0–100)
- Status: ready / partial / not-ready
- Copilot upsell lead rank: Hot / Warm / Cold
- Per-check breakdown: MFA, Intune MDM, DLP policies, Sensitivity Labels, Secure Score threshold, Microsoft Defender, Privileged Identity Management
- Remediation hint for each failed check

### `GetRiskAnalysis`
Returns an AI-generated risk analysis with transparency metadata:
- Plain-language executive risk summary
- Up to 5 key identified risks (tied to CIS v8 gaps)
- Up to 5 recommended immediate actions
- AI transparency: model version, guardrails applied, data sources used

---

## How to Register in Security Copilot

### Prerequisites
1. **SecurePulse is deployed** at `https://app.securepulse.ca` with the API live
2. **OpenAPI spec** is accessible at `https://app.securepulse.ca/api/openapi.json`
3. **Entra ID app registration** exists for the plugin OAuth flow with the `SecurityPosture.Read` scope
4. You have **Security Copilot** access in your Microsoft 365 tenant

### Registration Steps

1. Open **Microsoft Security Copilot** (https://securitycopilot.microsoft.com)
2. Navigate to **Settings** → **Plugins** → **Manage Plugins**
3. Click **Add a plugin**
4. Select **Upload a manifest file**
5. Upload `apps/copilot-plugin/plugin-manifest.json` from this repository
6. Confirm the plugin name: `SecurePulse Security Advisor`
7. Complete the OAuth flow to authorize the plugin to access your SecurePulse tenant
8. Test with a sample prompt: *"What is our current security posture?"*

### Self-hosted Registration (for Administrators)
If deploying for multiple users in an organization:
1. Register the plugin at the tenant level via the Security Copilot admin console
2. Grant consent for all users in the tenant
3. Configure the OAuth application ID from the Entra ID registration

---

## Required Permissions

The plugin uses **OAuth bearer token** authentication via Microsoft Entra ID. The following permissions are required:

| Permission | Type | Purpose |
|---|---|---|
| `api://securepulse.cloudmatrix.ca/SecurityPosture.Read` | Delegated | Read tenant security posture data |

This is a **custom application scope** on the SecurePulse Entra ID app registration. No Microsoft Graph permissions are granted directly to the plugin — all Graph data is pre-processed by SecurePulse's backend before being returned to the plugin.

The plugin does **not** require:
- Global Administrator rights
- Security Administrator rights
- Microsoft Graph API permissions

---

## Data and Privacy

- All data returned by the plugin is **tenant-scoped** — users see only their own organization's data
- **No raw user data or PII** is included in plugin responses
- AI-generated summaries use only normalized, aggregated security signals — no individual user records
- All AI outputs include transparency metadata: model version, guardrails applied, data sources
- Plugin activity is audit-logged in the SecurePulse platform per the standard audit logging policy

---

## Limitations

- This plugin is **read-only**. It cannot remediate issues, change policies, or configure Microsoft 365 settings.
- AI summaries are generated from assessment data and are intended to **support — not replace** professional security review.
- Plugin availability depends on SecurePulse platform uptime. Check `https://app.securepulse.ca/health` for status.
- Results reflect the most recent completed assessment for the tenant. For real-time data, trigger a new assessment from the SecurePulse dashboard first.

---

## Support

- **Documentation:** https://app.securepulse.ca/docs
- **Support email:** support@cloudmatrix.ca
- **Legal / Privacy:** https://app.securepulse.ca/legal
