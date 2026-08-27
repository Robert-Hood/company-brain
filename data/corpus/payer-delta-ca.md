---
id: payer-delta-ca
title: Delta Dental of California verification playbook
department: ops
source: notion
owner: Akhilesh T
updated: 2026-02-11
sensitivity: internal
---

# Delta Dental of California

Highest volume payer on the platform. Generally well behaved. Real-time eligibility returns in under
40 seconds on the provider portal for most PPO groups.

## Access
Provider Tools portal, shared service account. Session times out after 20 minutes idle. Do not open
more than three tabs against one session, the portal starts returning blank benefit panels rather
than an error.

## Benefit classes

| Class | Typical coinsurance | Notes |
|---|---|---|
| Diagnostic and Preventive | 100%, deductible waived | D0120, D0150, D1110, D1120 |
| Basic | 80% after deductible | D2140-D2394 restorative, D1206 adult fluoride, D7140 simple ext |
| Major | 50% after deductible, 12 month wait on some groups | D2740, D2750, D6010 |

Adult fluoride varnish D1206 sits under Basic and takes the 80% coinsurance with deductible applied.
Verifiers get this wrong regularly because most other payers treat it as preventive. Flag it in the
notes field so the practice does not quote the patient zero out of pocket.

## Frequency rules
- D1110 adult prophy: 2 per calendar year, portal counter is reliable
- D0274 bitewings: 1 per calendar year
- D0210 full mouth series: 1 per 36 months, portal shows last service date
- D1206 fluoride: 1 per calendar year, age 19 and over only on groups with the adult rider

## Trust the portal or call
Trust the portal for eligibility status, plan maximum, deductible remaining and prophy history.
Call for: orthodontic lifetime maximum where the member has prior ortho history, coordination of
benefits when a secondary payer is listed, and any group number beginning 77xxx (these are
self-funded ASO groups and the portal shows the administrator's default schedule, not the group's).

## Common exceptions
Benefit class ambiguity on fluoride is our top exception reason for this payer. Second most common
is a missing group number on the patient record in the PMS, which is a practice-side data problem,
not a payer problem. Route those back to the office rather than escalating.
