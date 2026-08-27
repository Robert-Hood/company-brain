---
id: product-feedback-digest
title: Customer feedback digest, July 2026
department: product
source: drive
owner: Jofin Joseph
updated: 2026-08-03
sensitivity: internal
---

# Customer feedback digest, July 2026

Compiled from support tickets, QBR notes and two customer calls. Six live customers.

## Recurring themes

**1. "Where did this answer come from?" (4 of 6 customers)**
The single most common request. Practices want to see which payer response and which rule produced
a verification result, especially when they disagree with it. Summit Dental Collective's RCM lead
described the current output as "an answer with no working out". This is a trust problem, not a
feature gap, and it gets worse as we automate more.

**2. Claim status (3 of 6 customers, plus 2 open prospects)**
Same request from every direction. Covered in PRD-014.

**3. Turnaround variance, not average (2 of 6)**
Our SLA is 95% within 4 business hours. Customers do not experience the 95%, they experience the
5%. Lakeside asked for a per-verification ETA rather than a blanket SLA, because their front desk
cannot plan around an average.

## Specific incidents

**Lakeside Family Dental, 2026-07-08.** Duplicate insurance plan records created in Open Dental by
our write-back. 140 patient records affected, cleaned up manually over two days by their office
manager and Wes. Write-back disabled behind a flag the same day. Lakeside were reasonable about it,
which we should not mistake for it being fine.

**Summit Dental Collective, 2026-07-22.** Batch of 60 Aetna verifications went out without the
posterior composite downgrade note during a week when the notes rule was mis-scoped. Caught by their
own front desk, not by us. Rubric now treats this as a critical miss.

## What nobody asked for

No customer has asked for a dashboard, a mobile app, or AI-generated summaries of their verification
volume. Two have asked for a CSV export they can put in their own BI tool. Worth remembering before
we build reporting.

## Quote worth keeping

Summit's RCM lead, on why they signed: "I do not need it to be right every time. I need to know
which ones it was not sure about." That is the product.
