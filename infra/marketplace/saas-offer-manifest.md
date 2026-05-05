# Azure Marketplace / AppSource SaaS Offer — Configuration Guide

**Product:** SecurePulse by CloudMatrix Business Solutions  
**Offer type:** SaaS (Transactable)  
**Status:** Documentation complete — Partner Center submission pending  
**Last updated:** May 2026

---

## 1. Offer Type: SaaS (Transactable)

SecurePulse is listed as a **Transactable SaaS offer** on Azure Marketplace and AppSource. This means:
- Customers can subscribe directly through Microsoft's commercial marketplace
- Microsoft handles billing and payment collection
- CloudMatrix receives payouts via Microsoft Partner Center
- Azure Consumed Revenue (ACR) is attributed to CloudMatrix for co-sell incentives

**Offer listing targets:**
- **Azure Marketplace** — reached by Azure customers and IT professionals
- **AppSource** — reached by Microsoft 365 customers and business decision-makers

**Primary category:** Security → Identity and Access Management  
**Secondary category:** IT & Management Tools → Security & Compliance

---

## 2. Plan Mapping

| Plan | Name | Price Guidance | Target Customer | Key Features |
|---|---|---|---|---|
| Free | SecurePulse Free | $0/month | SMB evaluation | 1 tenant, Secure Score dashboard, basic CIS mapping, read-only reports |
| Core | SecurePulse Core | ~$99 CAD/tenant/month | Active SMB customer | 3 tenants, full CIS v8 mapping, AI summaries (10/month), Copilot readiness, customer portal |
| Pro | SecurePulse Pro | ~$249 CAD/tenant/month | Mid-market / MSP | 10 tenants, unlimited AI summaries, Defender signal integration, compliance reports, automation notifications |
| Elite | SecurePulse Elite | Custom / per seat | Enterprise / MSSP | Unlimited tenants, white-glove onboarding, SLA, CSP attribution reporting, dedicated support |

### Plan Feature Matrix

| Feature | Free | Core | Pro | Elite |
|---|---|---|---|---|
| Tenant assessments | 1 | 3 | 10 | Unlimited |
| Microsoft Secure Score | ✅ | ✅ | ✅ | ✅ |
| CIS Controls v8 mapping | Basic | Full | Full | Full |
| AI executive summaries | ❌ | 10/mo | Unlimited | Unlimited |
| Copilot readiness score | ❌ | ✅ | ✅ | ✅ |
| Defender XDR signals | ❌ | ❌ | ✅ | ✅ |
| Compliance reports (PIPEDA, Law 25) | ❌ | ❌ | ✅ | ✅ |
| Customer portal | ❌ | ✅ | ✅ | ✅ |
| Automation notifications (Teams) | ❌ | ❌ | ✅ | ✅ |
| CSP attribution reporting | ❌ | ❌ | ❌ | ✅ |
| SLA | None | 99% | 99.5% | 99.9% |

### Billing Notes
- All plans are billed monthly
- Annual billing option (10% discount) to be enabled post-launch
- Per-tenant pricing is the primary unit
- Elite tier uses custom pricing negotiated through partner channel

---

## 3. Technical Configuration

### 3.1 Landing Page
The landing page is the URL Microsoft redirects customers to after marketplace purchase.

**Required URL:** `https://app.securepulse.ca/marketplace/landing`

**Landing page must:**
- Accept `token` query parameter from Microsoft (marketplace purchase token)
- Call Microsoft SaaS Fulfillment API to resolve the token to a subscription
- Collect tenant information and provision the subscription in SecurePulse
- Redirect to the SecurePulse dashboard after provisioning

**Endpoint to implement:**
```
GET /marketplace/landing?token={purchaseToken}
```

### 3.2 Webhook URL
Microsoft sends subscription lifecycle events to the webhook.

**Required URL:** `https://app.securepulse.ca/api/webhooks/marketplace`

**Webhook must handle these event types:**
- `Subscribed` — activate the tenant subscription
- `Unsubscribed` — deactivate (do not delete) the tenant
- `Suspended` — suspend access pending payment resolution
- `Reinstated` — restore suspended subscription
- `ChangePlan` — update tenant plan tier
- `ChangeQuantity` — update tenant seat/unit count

**Endpoint to implement:**
```
POST /api/webhooks/marketplace
Content-Type: application/json
x-ms-marketplace-token: {webhookToken}
```

### 3.3 AAD App Registration Requirements

A **separate** Entra ID app registration is required for marketplace authentication (distinct from the Graph API app registration).

| Setting | Value |
|---|---|
| App type | Multi-tenant |
| Redirect URI | `https://app.securepulse.ca/marketplace/landing` |
| API permissions | `user.read` (delegated) |
| Client secret | Store in Azure Key Vault as `MARKETPLACE_CLIENT_SECRET` |
| Required env vars | `MARKETPLACE_CLIENT_ID`, `MARKETPLACE_CLIENT_SECRET`, `MARKETPLACE_TENANT_ID` |

### 3.4 SaaS Fulfillment API Integration

Use Microsoft's SaaS Fulfillment API v2 to:
- **Resolve purchase token** (`POST /api/saas/subscriptions/resolve`)
- **Activate subscription** (`POST /api/saas/subscriptions/{subscriptionId}/activate`)
- **Get subscription** (`GET /api/saas/subscriptions/{subscriptionId}`)
- **Update subscription** (`PATCH /api/saas/subscriptions/{subscriptionId}`)

Base URL: `https://marketplaceapi.microsoft.com/api/saas`

---

## 4. Go-Live Checklist for Partner Center Submission

### Publisher Account
- [ ] Microsoft Partner Network account active
- [ ] Publisher verification completed (legal entity, bank account for payouts)
- [ ] Microsoft Publisher Agreement signed
- [ ] Azure Marketplace publisher account approved

### Offer Configuration in Partner Center
- [ ] Offer name and description written (no prohibited claims per Trust Claims Policy)
- [ ] Logo assets: 48×48, 90×90, 216×216, 255×115, 815×290 PNG
- [ ] Screenshots (min 3): dashboard, assessment view, recommendation list
- [ ] Video demo URL (optional but recommended)
- [ ] Categories and industries configured
- [ ] Plan names, descriptions, and prices configured
- [ ] Preview audience configured for internal testing

### Technical Readiness
- [ ] Landing page live and tested (`https://app.securepulse.ca/marketplace/landing`)
- [ ] Webhook endpoint live and tested
- [ ] Marketplace AAD app registration complete
- [ ] SaaS Fulfillment API integration tested end-to-end
- [ ] Subscription lifecycle events handled (subscribe, cancel, suspend, reinstate, change plan)
- [ ] Test purchase completed in Partner Center preview mode

### Legal and Compliance
- [ ] Privacy policy published at `https://app.securepulse.ca/privacy`
- [ ] Terms of use published at `https://app.securepulse.ca/terms`
- [ ] Data Processing Agreement (DPA) template available
- [ ] PIPEDA-compliant data handling documented

---

## 5. Co-Sell Configuration Requirements

Co-sell eligibility requires:
- [ ] AppSource/Azure Marketplace listing published (any plan, even Free)
- [ ] Co-sell solution registered in Partner Center as an **Azure Co-sell Offer (ACO)**
- [ ] Solution overview PDF uploaded (2-pager format per Microsoft template)
- [ ] Reference architecture diagram uploaded
- [ ] Customer pitch deck uploaded
- [ ] Nominated Microsoft PDM (Partner Development Manager)

**Co-sell revenue threshold for incentives:** USD $1,000+ ACR per deal  
**Cloud Security Specialization impact:** Earns higher co-sell payout rate per deal

### ACO Registration Fields
- **Solution name:** SecurePulse Security Posture Platform
- **Solution type:** SaaS
- **Azure services used:** Azure App Service, Azure Front Door, Azure Key Vault, Azure OpenAI, Entra ID
- **Industries:** Cross-industry (SMB focus); Financial Services, Healthcare as primary verticals
- **Geographies:** Canada (primary), United States, Australia (secondary)
