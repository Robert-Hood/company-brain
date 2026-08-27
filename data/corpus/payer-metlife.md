---
id: payer-metlife
title: MetLife verification playbook
department: ops
source: notion
owner: Akhilesh T
updated: 2026-03-04
sensitivity: internal
---

# MetLife

Second highest volume payer. The portal is fast but shallow. Most of our exceptions here come from
the portal answering a question it does not actually have the data to answer.

## Access
MetDental provider portal. Requires TIN plus provider last name. The account locks after five failed
attempts and takes a business day to unlock, so do not retry a failing login more than twice.

## Benefit classes
- Preventive: 100%, deductible waived, D0120 D0150 D1110 D1206
- Basic: 80% after deductible, includes D4341 and D4342 scaling and root planing
- Major: 50%, 6 month waiting period on most groups, 12 on new hires

## Frequency rules
- D1110 prophy: 2 per calendar year
- D4910 perio maintenance: 4 per calendar year, the portal frequency counter shows remaining and
  can be trusted
- D0274 bitewings: 2 per calendar year, unusually generous, confirm before quoting
- D2740 crown: 1 per tooth per 60 months

## Trust the portal or call
Trust for eligibility, plan max, deductible. Call for anything involving a history of periodontal
treatment, and for any member whose plan name contains "Preferred Dentist Program Plus" since those
groups carry riders the portal does not surface.

## Portal quirk, May 2026
The benefit detail panel moved from a right hand column to a collapsible accordion below the member
summary on 2026-05-18. Our scraper broke for about six hours. If you see a verification come through
with plan maximum populated but every frequency field empty, that is the accordion not being
expanded, re-run it rather than calling.

## Common denial codes seen downstream
- 271: frequency limitation exceeded, almost always D4910 or D1110
- 149: procedure not covered under the member's plan
- W7: missing tooth clause applies
