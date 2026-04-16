# Core Backend — Scoring Rules Reference

This document describes the business rules used to derive risk levels, opportunity scores,
and lead rankings from Microsoft Secure Score data. All logic lives in
[`src/scoring.ts`](../src/scoring.ts).

---

## 1. Secure Score Normalization

```
security_percentage = round(current_score / max_score × 100)
```

Clamps to 0 when `max_score ≤ 0`.

---

## 2. Risk Level Thresholds

Based on CIS Controls v8 adoption bands:

| security_percentage | Risk Level |
|---------------------|------------|
| > 70%               | Low        |
| 40% – 70% inclusive | Medium     |
| < 40%               | High       |

---

## 3. Opportunity Score (0–100)

The opportunity score estimates the business value of engaging a tenant with MSSP services.
It blends two signals:

| Signal          | Weight | Formula                                                        |
|-----------------|--------|----------------------------------------------------------------|
| Security gap    | 70%    | `100 - security_percentage` (higher gap = more opportunity)    |
| Tenant size     | 30%    | `min(100, (userCount × 0.5 + deviceCount × 0.3) / 10)`        |

```
opportunity_score = round(security_gap × 0.7 + size_score × 0.3)
```

**Rationale for weights:**
- A tenant with low security posture is the primary sales driver (70%).
- Larger tenants (more users/devices) represent higher contract value (30%).
- Weights are initial estimates and should be reviewed after first sales cycle data is available.

---

## 4. Lead Rank Rules

| Condition                                    | Lead Rank |
|----------------------------------------------|-----------|
| `risk_level = High` AND `opportunity > 60`   | **Hot**   |
| `risk_level = Low` AND `opportunity < 30`    | **Cold**  |
| All other combinations                       | **Warm**  |

**Interpretation:**
- **Hot** — High security risk + high business value. Prioritize immediate outreach.
- **Warm** — Moderate situation. Standard pipeline treatment.
- **Cold** — Low risk tenant with small footprint. Low expected revenue; deprioritize.

---

## 5. Compliance Percentage Estimates

> ⚠️ **These are heuristic estimates, not legal compliance determinations.**

Compliance percentages are derived from `security_percentage` plus a fixed per-framework offset:

| Framework         | Offset | Rationale                                                    |
|-------------------|--------|--------------------------------------------------------------|
| CIS Controls v8   | ±0     | Baseline — Secure Score is aligned to CIS v8                |
| PIPEDA            | +5     | Slightly less strict than full CIS v8 on technical controls |
| Quebec Law 25     | −5     | Stricter privacy requirements (72h notification, PIAs)      |
| Microsoft Zero Trust | +3  | Closely aligned with Microsoft Secure Score methodology     |
| FSI               | −10    | Financial services requires stronger controls baseline      |
| MISA              | +8     | Microsoft's own security association — aligns with posture  |

These offsets are **placeholders**. A production implementation must map CIS Controls to
each framework's actual control requirements via a compliance mapping table.

---

## 6. `/refresh` Endpoint Orchestration

`POST /assessments/:tenantId/refresh` executes the full assessment pipeline:

1. `GET graph-proxy → /tenants/:tenantId/secure-score` — fetch raw score
2. `GET graph-proxy → /tenants/:tenantId/recommendations` — fetch open recommendations
3. `CisMappingService.mapRecommendationsToCisControls()` — derive CIS control statuses
4. `buildAssessment()` — compute security %, risk level, opportunity score, lead rank
5. `assessmentStore.add()` — persist to in-memory store
6. `publishAutomationEvent()` — fire-and-forget notification to automation-service

Steps 1–2 can fail and will return 502. Step 6 is failure-safe (logged as warning only).

This endpoint is intentionally a single orchestration point for Phase 1. If performance
or reliability requirements grow, steps 1–5 can be decomposed into separate endpoints
(`/assessments/:tenantId/score`, `/assessments/:tenantId/cis-map`, etc.).
