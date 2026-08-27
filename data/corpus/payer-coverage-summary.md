---
id: payer-coverage-summary
title: Payer coverage summary, top 10 by volume
department: ops
source: verification-db
owner: Nakul R
updated: 2026-08-25
sensitivity: internal
---

# Payer coverage summary

Generated nightly from the verification database. Lifetime figures since platform launch. Exception
rate is the share of verifications that could not be completed without human intervention.

Total verifications: 240,400. Blended exception rate: 3.4%.

| Payer | Verifications | Exception rate | Top exception reason | Last portal change |
|---|---|---|---|---|
| Delta Dental of California | 52,400 | 2.4% | Fluoride benefit class ambiguity (D1206) | 2026-06-02 |
| MetLife | 41,200 | 3.1% | Perio maintenance frequency (D4910) | 2026-05-18 |
| Cigna Dental | 33,700 | 2.9% | Missing tooth clause, prior extraction date unknown | 2026-04-27 |
| Aetna Dental | 28,900 | 4.2% | Posterior composite downgrade (D2392) | 2026-07-09 |
| Guardian | 22,150 | 3.6% | Ortho lifetime maximum not exposed in portal | 2026-03-11 |
| UnitedHealthcare Dental | 17,400 | 5.1% | Portal timeout, no real-time response | 2026-07-22 |
| Humana Dental | 14,800 | 3.3% | Plan type mismatch, PPO vs DHMO | 2026-02-19 |
| Ameritas | 11,600 | 2.7% | Frequency counted on service year not calendar year | 2026-05-05 |
| Principal | 9,300 | 3.8% | Coordination of benefits, secondary payer | 2026-06-30 |
| BCBS regional plans | 8,950 | 6.4% | Regional plan routing ambiguity | 2026-07-15 |

## Reading this table

Exception rate is the cost driver. Every point of exception rate is roughly 2,400 additional human
touches across the book at current volume. UnitedHealthcare and BCBS are the two payers where the
exception rate is driven by portal reliability rather than benefit complexity, which means they are
fixable with engineering rather than with better playbooks.

The "last portal change" column is populated by the portal change detector (see NT-318). A change
date within the last 30 days on a payer with a rising exception rate is the signal that a playbook
has gone stale. Delta Dental of California changed on 2026-06-02 and its top exception reason has
been fluoride benefit class ever since.

## Known gaps in this data
- Exception reason is assigned by the QA analyst at resolution time and is free text mapped to a
  fixed list. Roughly 6% of exceptions are tagged "other" and are not represented above.
- We do not currently join eligibility outcome to claim outcome. We know when a verification was
  hard, we do not know when it was wrong.
