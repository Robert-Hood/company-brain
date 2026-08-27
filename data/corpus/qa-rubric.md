---
id: qa-rubric
title: Verification QA rubric v3
department: ops
source: notion
owner: Danny Alvarez
updated: 2026-06-20
sensitivity: internal
---

# Verification QA rubric v3

Every verifier has 10% of their completed verifications sampled and scored. New verifiers are
sampled at 100% for their first two weeks, then 25% until they clear two consecutive weeks above 95.

## Scoring

Each sampled verification is scored out of 100 across five dimensions.

| Dimension | Weight | What a miss looks like |
|---|---|---|
| Eligibility accuracy | 30 | Active/inactive wrong, wrong effective date, wrong plan |
| Benefit detail accuracy | 30 | Wrong coinsurance, wrong benefit class, wrong deductible |
| Frequency accuracy | 20 | Frequency limit wrong or history misread |
| Notes and flags | 15 | Missing downgrade note, missing conditional flag, missing COB flag |
| Turnaround | 5 | Outside the SLA band for the queue |

## Thresholds
- 95 and above: pass
- 90 to 94: pass with coaching note
- Below 90: fail, verification is re-worked and the verifier gets a review session
- Any eligibility accuracy miss is an automatic fail regardless of total score

## Critical misses
Three categories are treated as critical and are escalated to the RCM Lead the same day, regardless
of the overall score:
1. Quoting a patient zero out of pocket on a procedure that is not actually covered at 100%
2. Missing an orthodontic lifetime maximum check on Guardian
3. Missing a posterior composite downgrade note on Aetna

These three account for the large majority of practice-reported errors. They are also the three
cases where the portal actively misleads you, which is why they are rubric-level rather than
coaching-level.

## Calibration
Danny and Priya independently score the same 20 verifications every second Friday and compare. If
inter-rater agreement drops below 90% the rubric wording gets revised rather than the scores. v3
was written after the May calibration showed disagreement on what counted as a notes miss.
