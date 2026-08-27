---
id: product-prd-claims-status
title: PRD-014 Claims status v1
department: product
source: notion
owner: Nakul R
updated: 2026-08-06
sensitivity: internal
---

# PRD-014: Claims status v1

**Status:** Approved, not started. Target: end Q3 2026.
**Owner:** Nakul R.

## Problem

A practice verifies eligibility with us, treats the patient, submits a claim, and the claim comes
back denied. Today there is no link between those two events. The practice cannot tell whether the
denial was caused by a bad verification, a coding error, or a payer decision that no verification
would have caught. Neither can we.

Two commercial consequences. First, prospects keep asking for claim status in the same breath as
eligibility, most recently Bright Smile Dental Partners on 2026-08-12. Second, and more important
internally, we have no accuracy measure. Our exception rate tells us which verifications were hard.
It tells us nothing about which ones were wrong.

## Scope, v1

**In:**
- Read-only claim status pulled from payer portals for claims linked to a verification we issued
- Status surfaced on the verification record: submitted, in process, paid, denied, with denial code
- Denial code mapped to our exception reason taxonomy where a mapping exists
- Backfill of the last 90 days where the payer portal exposes history

**Out:**
- Claim submission
- Appeals or resubmission workflow
- Any write-back of claim status into the PMS
- Payers outside the top 5 by volume for v1

## Success criteria

1. For at least 60% of denied claims linked to one of our verifications, we can say whether the
   denial was foreseeable from the eligibility response.
2. Verification-to-denial rate available per payer, per benefit class, in the coverage summary.
3. Bright Smile pilot can see claim status next to eligibility without leaving their workflow.

## The metric we actually want

Foreseeable denial rate: the share of denials that a correct verification would have predicted.
That number, per payer, is the first honest accuracy measure we will have. It is also the number
that turns the verification corpus into training signal rather than a log.

## Open questions

- Do we need a BAA amendment for claim-level data? Legal to confirm.
- Eaglesoft has no claim status API. Screen scrape or defer Eaglesoft to v2?
