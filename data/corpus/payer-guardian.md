---
id: payer-guardian
title: Guardian verification playbook
department: ops
source: notion
owner: Priya Menon
updated: 2026-04-08
sensitivity: internal
---

# Guardian

Fifth by volume. Straightforward for general dentistry, consistently difficult for orthodontics.

## Access
Guardian Anytime provider portal. Requires provider NPI. The portal is single threaded per account,
a second concurrent session silently invalidates the first, so verifiers must not share the account
during the same shift block. Check the shift roster before logging in.

## The orthodontic problem
Guardian's orthodontic lifetime maximum is not exposed on the eligibility response. This is our top
exception reason for this payer. The portal shows whether ortho is covered and at what coinsurance,
but not how much of the lifetime maximum the member has already consumed. For a member who had
treatment under a previous employer's Guardian plan, the remaining maximum can be zero while the
portal shows the benefit as active.

Rule: any treatment plan containing D8080, D8090 or D8670 on a Guardian member gets a phone
verification. No exceptions, no matter what the portal says. A wrong ortho quote is a five figure
mistake for the practice.

## Frequency rules
- D1110 prophy: 2 per calendar year
- D1206 fluoride: through age 18 on standard groups, adult rider available
- D0274 bitewings: 1 per calendar year
- D2740 crown: 1 per tooth per 60 months, portal shows prior crown history reliably

## Waiting periods
Basic none, Major 6 months, Ortho 12 months. Guardian is one of the few payers that reliably shows
the member's original effective date, so waiting period calculation is usually safe from the portal.

## Portal change, March 2026
Provider search moved from NPI-first to TIN-first on 2026-03-11. Old bookmarked deep links return a
404. Use the portal home page and navigate, do not bookmark.
