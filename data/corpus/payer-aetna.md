---
id: payer-aetna
title: Aetna Dental verification playbook
department: ops
source: notion
owner: Akhilesh T
updated: 2026-07-14
sensitivity: internal
---

# Aetna Dental

Fourth by volume, highest exception rate of the big five at 4.2%. Almost all of that is the
alternate benefit provision on posterior composites.

## The downgrade problem
Aetna applies an alternate benefit provision: a composite filling on a posterior tooth (D2391,
D2392, D2393, D2394) is paid at the amalgam rate (D2140 through D2161). The patient owes the
difference. The portal does not flag this on the eligibility response. It is buried in the plan
booklet.

This matters because a practice quoting from our verification will under-quote the patient by
roughly $80 to $140 per surface, and that becomes a collections problem for them and a trust
problem for us. Always add the downgrade note when the treatment plan includes a posterior
composite code. NT-312 is the ticket to detect this automatically.

## Access
Aetna provider portal via Availity. Availity session and Aetna session expire independently, which
is why you sometimes get logged into Availity but see an Aetna authentication error. Log out of both
and back in rather than refreshing.

## Frequency rules
- D1110 prophy: 2 per calendar year on most groups, 2 per 12 rolling months on DMO
- D0274 bitewings: 1 per calendar year
- D0210 FMX: 1 per 36 months
- D4910 perio maintenance: 4 per calendar year but shares a counter with D1110 on many groups, so
  4 total cleanings of any type, not 4 plus 2

## Portal change, July 2026
The eligibility response layout changed on 2026-07-09. The remaining maximum field is now returned
as a string with a currency symbol rather than a number, which broke downstream parsing for two
days. Fixed, but if you see a maximum of $0.00 on an otherwise active plan, re-run before trusting.

## Trust the portal or call
Trust for eligibility and maximum. Call for the alternate benefit provision detail on any group you
have not seen before, and for orthodontic benefits on DMO plans.
