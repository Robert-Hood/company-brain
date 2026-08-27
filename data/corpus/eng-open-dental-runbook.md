---
id: eng-open-dental-runbook
title: Open Dental integration runbook
department: engineering
source: github
owner: Wes Okafor
updated: 2026-05-22
sensitivity: internal
---

# Open Dental integration runbook

Open Dental is our most permissive integration and the one we recommend prospects be on. Direct API
access, no partner agreement, no middleware.

## Setup

1. Customer generates an API key in Open Dental under Setup > Advanced Setup > API. Needs the
   Developer Key from us plus their own Customer Key.
2. Confirm the version. We support 24.2 and above. Below that the appointment endpoint does not
   return the insurance plan reference and the whole thing falls apart.
3. Set the sync window. Default is 48 hours ahead, hourly.

## Endpoints used

- `GET /appointments` filtered by date range, for the schedule pull
- `GET /patients/{id}` for demographics
- `GET /insplans/{id}` and `GET /patplans` for the plan and subscriber relationship
- `PUT /benefits` for write-back

## Write-back

Verification results are written back automatically once a verification completes. Benefit detail
lands on the patient's insurance plan record as benefit rows, and the verification date is stamped
on the patplan record so the office can see freshness at a glance. No manual step, no export. This
is the main reason Open Dental customers have the smoothest experience.

## Common failure modes

**Version drift.** Customer upgrades Open Dental, endpoint behaviour changes subtly. Check the
version on every failed sync before debugging anything else.

**Duplicate patient records.** Practices create duplicates constantly. We match on patient ID, not
name, so a duplicate means we verify one record and the front desk looks at the other. Nothing we
can fix from our side, flag it to the practice.

**Local install, no static IP.** Some single-server installs sit behind a dynamic IP. Allowlisting
breaks weekly. Push them toward Open Dental's cloud hosting.

**Replica lag.** Not applicable here, Open Dental API is against live. That is an Eaglesoft problem.
