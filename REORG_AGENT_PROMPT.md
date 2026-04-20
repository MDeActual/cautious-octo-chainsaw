# REORG_AGENT_PROMPT.md

## Prime Directive

Reorganize this repository into a cleaner, scalable operating structure for SecurePulse / CloudMatrix / DevOS **without breaking product code, imports, CI, routes, auth flows, preview flows, package boundaries, or current business momentum**.

This is a **repository operating-system upgrade**, not a rewrite.

---

# Read First

Inspect and use the current repository before making changes.

Review in this order:

1. README.md  
2. Existing `/docs` folder  
3. Existing `/apps` structure  
4. Existing `/packages` structure  
5. Existing `.github/workflows`  
6. Any existing DevOS / SecurePulse strategy files

Then execute.

---

# Mission

Create a repo structure that supports:

- product shipping speed  
- commercialization readiness  
- AI-agent usability  
- clean operations  
- founder clarity  
- scalable documentation  
- faster onboarding for future contributors

---

# Non-Negotiables

## Do NOT break:

- TypeScript / build health
- CI pipelines
- app routes
- auth flows
- preview dashboard flows
- existing package imports
- environment assumptions
- deployment assumptions
- shared type contracts

## Do NOT:

- rewrite the app
- rename live services casually
- move source code unless clearly beneficial and low risk
- create random duplicate docs
- add fake enterprise process theater

---

# Primary Objective

Make this repository easier for:

1. humans to navigate  
2. agents to operate inside  
3. customers to monetize through product execution  
4. founders to control strategically

---

# Recommended Future Structure

```text
/
├── .github/
├── apps/
├── packages/
├── infra/
├── docs/
│   ├── architecture/
│   ├── product/
│   ├── sales/
│   ├── devos/
│   └── ops/
├── agent-context/
├── ops/
├── scripts/            (if useful)
├── tests/              (if useful)
├── plans/
├── README.md
├── CONTRIBUTING.md
└── REORG_AGENT_PROMPT.md
