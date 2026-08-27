---
id: eng-architecture-overview
title: Architecture overview
department: engineering
source: github
owner: Nakul R
updated: 2026-06-28
sensitivity: internal
---

# Architecture overview

One page. Deliberately.

## Flow

1. **Ingest.** We pull tomorrow's and the following day's appointment schedule from the customer's
   PMS. Open Dental via API, Carestack via API, Eaglesoft via a SQL replica read, Dentrix Ascend via
   partner API (pending). Runs hourly.
2. **Dedupe and enrich.** Match the appointment to a patient record and an insurance plan record.
   Drop anything verified in the last 30 days unless the plan changed.
3. **Agent pass.** A payer-specific agent handles the portal: authenticate, search the member, parse
   the eligibility and benefit response, extract frequency history. Each agent is a prompt plus a
   parser plus a payer playbook loaded from the ops corpus.
4. **Confidence scoring.** Every extracted field carries a confidence. A verification is high
   confidence only if every field required by the treatment plan is high confidence. Rules can
   override: Guardian ortho always goes to a human regardless of confidence.
5. **Human queue.** Low confidence or rule-triggered verifications land in the HITL queue with the
   exception reason attached.
6. **Output.** Verification record written to our store, returned to the customer, and written back
   to the PMS where write-back is enabled.

## Stores

- Postgres for verification records, appointments, customers, users
- Object store for raw portal responses, retained 90 days, encrypted at rest
- No PHI in logs. This is enforced by a redaction layer, not by convention

## Agents

Five payer agents in production covering the top 5 by volume. The remaining payers run a generic
agent with a lower success rate, which is most of why UHC and BCBS sit at 5.1% and 6.4% exception
rates. Generic agent replacement is not a Q3 item.

## Deliberate omissions

- No vector database. Playbooks are short and payer-scoped, we load the relevant one directly.
- No queue infrastructure beyond Postgres row locking. At 240k lifetime verifications we do not
  need it and it would be another thing to page someone about.
- No microservices. One deployable.

## The thing that will need to change first

Confidence scoring is per-field and hand-tuned. It has no ground truth to calibrate against because
we never learn whether a verification was correct, only whether it was hard. PRD-014 is the first
step toward fixing that.
