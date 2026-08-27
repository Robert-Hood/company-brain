---
id: product-ticket-nt318
title: NT-318 Portal change detector false positives
department: product
source: jira
owner: Nakul R
updated: 2026-08-21
sensitivity: internal
---

# NT-318: Portal change detector producing false positives

**Type:** Bug
**Priority:** Medium
**Status:** Open
**Assignee:** Unassigned
**Reporter:** Priya Menon
**Sprint:** Unscheduled

## Description

The portal change detector compares the DOM structure of each payer portal's eligibility response
page against a stored baseline and raises an alert when it diverges. The alert populates the "last
portal change" field in the payer coverage summary and pages the on-call engineer.

It is firing roughly four times a week and approximately one in five of those is a real change. The
rest are A/B tests, promotional banners, session-specific content and in one case a payer's holiday
message. On-call has started ignoring the alert, which defeats the purpose.

## Why this matters more than a medium priority bug usually does

The last-portal-change date is the signal ops uses to decide whether a playbook has gone stale. The
Delta Dental of California fluoride reclassification on 2026-06-01 was accompanied by a real portal
change on 2026-06-02, and that alert was in the same noise as everything else. Nobody acted on it
until Danny caught the misgraded verifications in QA nine days later.

A change detector that nobody trusts is worse than no change detector, because it creates the
impression that stale playbooks would have been caught.

## Suggested approach

- Diff only the benefit detail region, not the whole page
- Require the divergence to persist across three consecutive polls before alerting
- Suppress alerts where the diff is text-only within a known static region
- Separate "structure changed, scraper may break" from "content changed, playbook may be stale".
  These are different alerts for different people.

## Notes

Priya: the second alert type is the one ops needs and it does not exist today. The engineering alert
exists and is noisy. The ops alert does not exist at all.
