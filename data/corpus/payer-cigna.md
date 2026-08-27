---
id: payer-cigna
title: Cigna Dental verification playbook
department: ops
source: notion
owner: Priya Menon
updated: 2026-05-02
sensitivity: internal
---

# Cigna Dental

Third by volume. The cleanest portal of the big five for routine preventive work, and the most
painful for anything restorative because of waiting periods and the missing tooth clause.

## Access
Cigna for Health Care Professionals portal. Single sign on per TIN. Sessions are stable, no tab
limit issues.

## The missing tooth clause
This is our top exception reason for Cigna and it is worth understanding rather than escalating
blind. If a tooth was extracted before the member's effective date, the plan will not pay for the
prosthetic that replaces it, even years later. The portal does not tell you when a tooth was
extracted. It only tells you the clause applies to the group.

Practical rule: if the clause applies and the treatment plan includes D6010, D6240, D6750 or any
partial or full denture code, mark the verification as conditional and note "missing tooth clause
applies, prior extraction date required from patient records". Do not guess.

## Waiting periods
Basic 3 months, Major 6 months, Ortho 12 months on standard groups. New hire groups often waive
Basic. The portal shows the waiting period at plan level but not the member's original effective
date if they changed groups within the same employer, which is why we occasionally have to call.

## Frequency rules
- D1110 prophy: 2 per calendar year
- D0150 comprehensive exam: 1 per 36 months per provider
- D0274 bitewings: 1 per calendar year
- D4910 perio maintenance: 2 per calendar year, does not share a counter with prophy on most groups

## Trust the portal or call
Trust for eligibility, deductible, maximum, waiting period status. Call for missing tooth clause
detail and for any DHMO plan, since Cigna's DHMO benefit tables are not exposed to the portal at all.
