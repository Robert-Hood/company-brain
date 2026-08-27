---
id: product-ticket-nt312
title: NT-312 Detect Aetna posterior composite downgrade automatically
department: product
source: jira
owner: Nakul R
updated: 2026-08-18
sensitivity: internal
---

# NT-312: Detect Aetna posterior composite downgrade automatically

**Type:** Story
**Priority:** High
**Status:** In progress
**Assignee:** Wes Okafor
**Reporter:** Akhilesh T
**Sprint:** 2026-08-17

## Description

Aetna applies an alternate benefit provision on posterior composite restorations. D2391, D2392,
D2393 and D2394 are paid at the corresponding amalgam rate (D2140 to D2161) and the patient owes the
difference. The eligibility response does not flag this. It is in the plan booklet only.

Verifiers are expected to add a downgrade note manually when the treatment plan includes one of
these codes. This is one of three critical misses in the QA rubric and it is the most frequently
missed of the three. The Summit Dental Collective incident on 2026-07-22 was 60 verifications going
out without the note.

Aetna is our highest exception rate payer in the top five at 4.2% and this is the top exception
reason.

## Acceptance criteria

- [ ] When a treatment plan on an Aetna member contains D2391-D2394, the verification record carries
      a `downgrade_applies` flag
- [ ] The flag renders as a required note on the verifier's screen and cannot be dismissed without a
      reason
- [ ] Estimated patient responsibility difference is calculated from the group's amalgam allowable
      where we have it, and left blank rather than guessed where we do not
- [ ] Flag appears in the customer-facing verification output
- [ ] Backfill not required

## Notes

Akhilesh: do not extend this to other payers without checking. Several payers have an alternate
benefit provision and the code sets are not identical. Getting this wrong on Cigna would be worse
than not having it.

Wes: group allowable amounts are only available for about 60% of Aetna groups. Handling the other
40% as blank rather than estimating, per acceptance criteria.
