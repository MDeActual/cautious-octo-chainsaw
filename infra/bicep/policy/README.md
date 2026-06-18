# Canada Sovereignty Policy Pack

This folder contains a starter Azure Policy initiative for CloudMatrix MSSP deployments.

## What it enforces

- Denies resources deployed outside `canadacentral` and `canadaeast`
- Denies public network access for key compliance and evidence resources
- Audits for presence of Microsoft Purview account in-subscription
- Tags policy metadata with Law 25, PIPEDA, ITSG-33, and CIS Controls v8 relevance

## Deploy

```bash
az deployment sub create \
  --name cmx-policy-pack-dev \
  --location canadacentral \
  --template-file infra/bicep/policy/canada-sovereignty-initiative.bicep \
  --parameters environment=dev
```

## Notes

- Start in audit-heavy mode in non-production if your tenant has legacy public endpoints.
- Apply this policy assignment before provisioning Sentinel, Purview, and AI workloads for regulated tenants.
