# Swarm Operator Runbook

This runbook explains how to use the three newly added deliverables:

1. Dependency-gated execution checklist (`plans/DEPENDENCY_GATED_EXECUTION_CHECKLIST.md`)
2. Canada sovereignty policy pack (`infra/bicep/policy/`)
3. Swarm orchestration API skeleton (`apps/automation-service/src/routes/swarm.ts`)

## 1) Use the dependency-gated checklist

- Open `plans/DEPENDENCY_GATED_EXECUTION_CHECKLIST.md`.
- Start at G0 and do not advance until every prerequisite and completion criterion is checked.
- At each gate close, append state to your state capture target (`/docs/state_capture.md` by default).
- Treat Purview control evidence and CIS Controls v8 mapping as mandatory at G5 and later.

## 2) Deploy the Canada sovereignty policy pack

```bash
az deployment sub create \
  --name cmx-policy-pack-dev \
  --location canadacentral \
  --template-file infra/bicep/policy/canada-sovereignty-initiative.bicep \
  --parameters environment=dev
```

Expected result:
- Policy initiative and assignment are created.
- New resources outside Canada Central/East are denied.
- Public network exposure for key resources is denied.
- Purview account presence is audited.

## 3) Run the swarm orchestrator skeleton

Start service:

```bash
pnpm --filter automation-service dev
```

Create a DevSecOps swarm run:

```bash
curl -X POST http://localhost:3004/swarm/runs \
  -H 'content-type: application/json' \
  -d '{
    "swarmName":"devsecops-architecture",
    "tenantId":"11111111-1111-1111-1111-111111111111",
    "operatorId":"mdeactual",
    "location":"canadacentral"
  }'
```

Create a Compliance swarm run (Purview required):

```bash
curl -X POST http://localhost:3004/swarm/runs \
  -H 'content-type: application/json' \
  -d '{
    "swarmName":"continuous-compliance-audit",
    "tenantId":"11111111-1111-1111-1111-111111111111",
    "operatorId":"mdeactual",
    "location":"canadacentral",
    "purviewAccountResourceId":"/subscriptions/<sub>/resourceGroups/<rg>/providers/Microsoft.Purview/accounts/<account>",
    "cisControlSetVersion":"CIS Controls v8"
  }'
```

Progress and approval flow:

```bash
curl -X POST http://localhost:3004/swarm/runs/<runId>/progress
curl -X POST http://localhost:3004/swarm/runs/<runId>/approve \
  -H 'content-type: application/json' \
  -d '{"decisionId":"InfrastructureDeployment","approvedBy":"mdeactual"}'
curl http://localhost:3004/swarm/runs/<runId>
```

## Purview and CIS v8 in this implementation

- Purview is explicitly represented in:
  - compliance swarm run input (`purviewAccountResourceId`, `purviewCollectionId`)
  - policy pack (`requirePurview` audit rule)
  - gated checklist compliance requirements
- CIS Controls v8 is explicitly represented in:
  - compliance coverage model (`cisV8`)
  - gate requirements and state-save artifacts
  - policy initiative framework metadata

## How to provide context files in this environment

If the prompt UI only shows image upload, add context files directly to the repository and point to exact paths in your prompt.

Recommended pattern:
- Place notes in `docs/context/` (for example: `docs/context/client-regulatory-notes.md`).
- In your message, reference the file path(s) and ask me to use them.
- For large source documents, split into multiple markdown/text files so they are easy to review and diff.
