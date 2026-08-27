---
id: eng-portal-change-detection
title: Portal change detection design notes
department: engineering
source: github
owner: Wes Okafor
updated: 2026-04-30
sensitivity: internal
---

# Portal change detection

## Why it exists

Payer portals change without notice. When a layout changes, our parser either breaks loudly, which
is fine, or silently extracts the wrong field, which is not. The Aetna currency string incident in
July is the second category and cost us two days of bad maximums.

## How it works today

For each payer we store a structural baseline of the eligibility response page: a normalised
representation of the DOM tree with text content stripped, element attributes reduced to tag,
class and position. Every poll cycle we render the page for a synthetic test member and diff the
structure against the baseline.

Divergence above a threshold raises an alert to #eng-oncall and stamps the payer's
`last_portal_change` field, which surfaces in the payer coverage summary.

## Known problems

The threshold is a single number applied to the whole page. Payers put marketing content, session
banners and A/B tests on the same page as the benefit detail, so the detector cannot tell a layout
change that will break the parser from a promotional banner that will not. Current false positive
rate is roughly 80%. See NT-318.

## What it does not do

It does not detect policy changes. A payer can move a procedure from one benefit class to another
without changing a single element of the page structure, and the detector will see nothing. The
Delta Dental of California fluoride reclassification on 2026-06-01 was a policy change; the portal
change on 2026-06-02 was coincidental and separate.

This is the more important gap. Structural changes break the scraper and we find out in minutes.
Policy changes silently invalidate a playbook and we find out when QA catches misgraded
verifications, or when a customer does.

## Ideas not yet built

- Golden-record checks: run a set of known members with known benefits and assert the extracted
  values, rather than asserting the page structure. Catches both categories.
- Distribution monitoring on parsed values. A sudden shift in the modal coinsurance for a payer is a
  policy change signal.
- Subscribe to payer provider bulletins. Unglamorous, probably the highest value item on this list.
