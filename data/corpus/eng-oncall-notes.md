---
id: eng-oncall-notes
title: On-call notes, July and August 2026
department: engineering
source: slack
owner: Wes Okafor
updated: 2026-08-22
sensitivity: phi-restricted
---

# On-call notes

Running log from #eng-oncall. Newest first. Verification IDs only, no member identifiers.

## 2026-08-22, Fri
Portal change detector fired three times overnight on Cigna. All three false positives, promotional
banner. This is NT-318. I am muting the Cigna channel until that ticket is picked up, which I am
aware is exactly the failure mode described in the ticket.

## 2026-08-11, Mon
UHC portal timeouts spiked to 22% of attempts between 06:00 and 09:00 ET. Not our side. Added a
retry with exponential backoff as a stopgap, brought effective failure to 9%. Proper fix is in the
Q3 roadmap.

## 2026-07-22, Tue
Summit Dental Collective: 60 Aetna verifications went out without the posterior composite downgrade
note. Root cause was a rule scoping change deployed 2026-07-20 that narrowed the code set to D2391
and D2393 only, dropping D2392 and D2394. My change, my mistake. Reverted same day, 60 verifications
re-issued with the note. Ticket NT-312 will make this rule harder to get wrong.

## 2026-07-09, Wed
Aetna eligibility response layout changed. Remaining maximum now returns as a string with a currency
symbol. Parser was casting to numeric and silently producing zero. Two days of verifications showed
$0.00 remaining maximum on active plans before Danny flagged it in QA. Fixed, added a type guard,
added a test. Two days is too long and the reason it took two days is that nothing alerts on a
distribution shift in parsed values, only on parse failures.

## 2026-07-08, Tue
**Open Dental write-back incident, Lakeside Family Dental.**
Write-back created duplicate insurance plan records. 140 patient records affected. Cause: our
write-back had no idempotency key, so a retried write after a timeout created a second plan row
rather than updating the first. The retry path was added in June and never tested against a timeout.

**Write-back is now disabled behind the `pms_writeback_enabled` feature flag, set to false for all
customers, as of 2026-07-08.** Open Dental customers are receiving results via manual CSV export
until this is fixed properly with an idempotency key and a reconciliation pass. Cleanup at Lakeside
took two days, mostly done by their office manager.

Re-enabling is a Q3 roadmap item under PMS write-back reliability. No date yet. Nobody should be
telling customers or prospects that Open Dental write-back is automatic today, because it is not.
