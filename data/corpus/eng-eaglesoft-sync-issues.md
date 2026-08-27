---
id: eng-eaglesoft-sync-issues
title: Eaglesoft sync known issues
department: engineering
source: github
owner: Tom Beckett
updated: 2026-08-19
sensitivity: internal
---

# Eaglesoft sync, known issues

Eaglesoft has no usable public API for what we need. We read from a SQL Server replica the customer
maintains. This works but every known issue below is a consequence of that choice.

## Known issues

**1. Replica lag (severity: high)**
We read from the customer's replica, not their primary. If replication falls behind, we pull a stale
schedule and verify appointments that have been cancelled or moved. At Bright Smile's scale, 34
locations into one central replica in Plano, this is the main scoping risk. Before any Eaglesoft
deal, get their replication schedule and lag monitoring in writing.

Mitigation in place: we compare the max appointment modified timestamp against wall clock and skip
the sync if the gap exceeds 90 minutes. This means we silently do nothing rather than doing
something wrong, which is correct but invisible. There is no alert. Should be.

**2. Schema variance across versions (severity: medium)**
Eaglesoft installs drift. Column names on the insurance tables differ between 21.x and 23.x, and at
least one customer has a vendor-customised schema. We maintain a per-customer column map. Adding a
new Eaglesoft customer is a day of schema mapping, not an afternoon.

**3. No write-back (severity: medium, accepted)**
We do not write to Eaglesoft. Writing to a customer's SQL Server directly is not something we are
willing to do. Eaglesoft customers receive verification results in the Needletail UI and via CSV
export. Sales must not imply otherwise.

**4. Character encoding on patient names (severity: low)**
Older installs use a non-UTF8 collation. Names with accents come through mangled, which breaks
member search on payer portals. Normalisation layer handles most of it, occasional manual fix.

**5. No claim status data (severity: low today, blocking for PRD-014)**
The replica does not contain claim status in a usable form. PRD-014 v1 will either screen scrape or
defer Eaglesoft. Open question in the PRD.
