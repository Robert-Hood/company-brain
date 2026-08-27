---
id: product-roadmap-q3
title: Product roadmap Q3 2026
department: product
source: notion
owner: Jofin Joseph
updated: 2026-07-05
sensitivity: internal
---

# Roadmap, Q3 2026

Three themes. Everything else is explicitly not happening this quarter.

## Theme 1: reduce exception rate on the two worst payers

UnitedHealthcare at 5.1% and BCBS regional at 6.4% are both reliability problems, not benefit
complexity problems. UHC times out, BCBS routes to the wrong regional plan. Neither needs a better
playbook, both need engineering.

Target: UHC below 3.5%, BCBS below 4.5% by end of quarter.

- Retry and backoff strategy for UHC portal timeouts
- Regional plan routing table for BCBS, built from the last 12 months of resolved exceptions
- NT-318 portal change detector false positive cleanup, so the signal is trustworthy

## Theme 2: claims status v1 (PRD-014)

Second quarter running that prospects have led with claims status rather than eligibility. Bright
Smile raised it three times unprompted on discovery. Northshore's CFO asked about audit trail, which
is adjacent.

Scope for v1 is read-only status surfaced next to the eligibility record. Not submission, not
appeals, not denial management. Nakul owns. See PRD-014.

The strategic reason this matters more than it looks: joining eligibility to claim outcome is what
lets us know when a verification was wrong, not just when it was hard. Today we measure difficulty.
We do not measure accuracy.

## Theme 3: PMS write-back reliability

Open Dental write-back is currently disabled behind a flag after the Lakeside duplicate plan record
incident. Getting it back on with proper idempotency is the priority. Eaglesoft sync lag at Bright
Smile scale is the second.

## Explicitly not this quarter

- Claims submission
- Dentrix Ascend certified partner integration, paperwork is in flight but the build is Q4
- Any new payer beyond the current top 10
- Self-serve onboarding
