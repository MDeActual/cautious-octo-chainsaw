# CloudMatrix MSSP - Dependency-Gated Execution Checklist

**Execution Model:** No calendar timelines. Every gate starts only when prerequisites are complete and verified.
**Cloud Boundary:** Microsoft/Azure native services only.
**Compliance Backbone:** CIS Controls v8, Law 25, PIPEDA, ITSG-33, NIST CSF 2.0, MITRE ATT&CK.
**Data Sovereignty:** Canada Central and Canada East only.

## Gate Map (G0-G8)

| Gate | Objective | Prerequisites | Completion Criteria |
|---|---|---|---|
| G0 | Program governance baseline | None | HITL approver matrix, budget caps, state-save template, architecture principles approved |
| G1 | Sovereignty and policy baseline | G0 | Deny policies for non-Canada regions active, public network exposure controls assigned, Purview account baseline defined |
| G2 | Swarm control plane (dev) | G1 | Azure AI Agent Service orchestration path configured, async routing active, HITL pause/resume tested |
| G3 | DevSecOps swarm output baseline | G2 | IaC package, Sentinel KQL pack, Graph integration manifest and MISA draft all produced and approved |
| G4 | SOC integration baseline | G3 + HITL approval | Sentinel + Defender XDR + Copilot for Security staging integration deployed and rollback-tested |
| G5 | Continuous compliance baseline | G4 | Purview collection and mapping jobs active for Law 25/PIPEDA/ITSG-33/CIS v8 control evidence |
| G6 | Pilot tenant production-readiness | G5 + HITL approval | End-to-end drift detection, evidence packaging, bilingual reporting validated in pilot |
| G7 | Partner evidence and submission readiness | G6 | MISA evidence package and Security Solution Partner artifacts complete and review-approved |
| G8 | Scale and commercialization | G7 + HITL approval | Repeatable onboarding factory and cost guardrails verified |

## Mandatory HITL Gates

| Decision ID | Trigger | Required Approval |
|---|---|---|
| HITL-01 | InfrastructureDeployment | Approve deployment scope and budget impact |
| HITL-02 | Paid_API_Key_Activation | Approve paid model/API activation |
| HITL-03 | MISA_Submission_Drafting | Approve legal and partner submission narrative |
| HITL-04 | Production Remediation Automation | Approve auto-remediation blast radius |

## Compliance Coverage Checklist (Must be attached to G5+)

- [ ] Purview compliance scans mapped to Law 25 obligations (privacy governance + language handling controls)
- [ ] Purview compliance scans mapped to PIPEDA obligations
- [ ] ITSG-33 Protected B control matrix populated with evidence URIs
- [ ] CIS Controls v8 mappings attached to each tenant baseline and drift report
- [ ] MITRE ATT&CK technique coverage generated from Sentinel detections
- [ ] NIST CSF 2.0 function coverage scorecard generated (Govern/Identify/Protect/Detect/Respond/Recover)

## Cost-Control Activation Rules

- [ ] Do not enable paid Azure OpenAI quota increases until G3 is approved.
- [ ] Do not enable production-scale Sentinel ingestion until G4 rollback test passes.
- [ ] Do not enable premium Purview/eDiscovery-heavy workflows until G5 evidence quality check passes.
- [ ] Do not onboard additional pilot tenants until G6 post-implementation review is signed.

## State-Save Record (Fill at the end of every gate)

```md
## Gate Checkpoint
- Gate: G#
- Status: Approved | Blocked | Rework
- Timestamp (UTC):
- Operator:

## Artifacts
- IaC package:
- Sentinel KQL package:
- Graph integration package:
- Purview evidence package:
- CIS v8 mapping package:

## HITL Decisions
- Decision ID:
- Approved by:
- Scope:
- Notes:

## Budget Snapshot (CAD)
- Current month spend:
- Forecast:
- Hard cap:

## Resume Instructions
1. Verify gate prerequisites remain true.
2. Re-run gate validation checks.
3. Continue from next unchecked completion criterion.
```
