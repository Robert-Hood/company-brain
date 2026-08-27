# Planted contradictions and stale facts

Four deliberate conflicts live in the corpus so the correction loop has something to fix.
Use plant 1 for the Loom demo. The others are there so the corpus does not look suspiciously tidy.

---

## Plant 1 (DEMO PLANT) — Fluoride benefit class, Delta Dental of California

**Stale doc:** `payer-delta-ca` (updated 2026-02-11) says adult fluoride varnish D1206 is
adjudicated under **Basic** at 80% with deductible applied.

**Correct source:** `slack-fluoride-delta-june` (2026-06-11) has Priya Menon confirming Delta CA
moved adult fluoride to **Preventive** at 100%, no deductible, effective 2026-06-01, and that the
portal layout changed on 2026-06-02 so the benefit class now renders in a different panel.

**Supporting signal:** `payer-coverage-summary` lists Delta CA's top exception as
"fluoride benefit class ambiguity (D1206)" with last portal change 2026-06-02.

**Demo question:** "Does fluoride count under basic or preventive for Delta Dental of California?"
Expected before correction: cites `payer-delta-ca` and `payer-coverage-summary`, answers Basic,
confidence high. That confident-and-wrong answer is the point.
Correct as Akhilesh (ops, weight 3) to Preventive. Re-ask as Sam. Answer flips and cites the
team correction alongside the playbook.

---

## Plant 2 — MetLife perio maintenance frequency

**Stale doc:** `payer-metlife` says D4910 perio maintenance is 4 per calendar year and the portal
frequency counter can be trusted.

**Correct source:** `slack-metlife-perio-edge` (2026-07-02) has Akhilesh explaining it is 2 per
calendar year on standard groups, 4 only where the group carries the enhanced perio rider, and the
portal does not distinguish the two, so a call is required. Ties to MetLife's 3.1% exception rate
and top exception in the coverage summary.

---

## Plant 3 — Open Dental write-back status (three-way)

**Doc A:** `eng-open-dental-runbook` says verification results write back to Open Dental
automatically via the API bridge.
**Doc B:** `eng-oncall-notes` says write-back has been behind a disabled feature flag since
2026-07-08 after duplicate insurance plan records were created at Lakeside Family Dental, and
results are being CSV-exported manually in the meantime.
**Doc C:** `gtm-discovery-cedarridge` has Rhea telling the prospect write-back is automatic today.

Useful for showing that a correction can override an engineering doc as well as an ops one, and
that GTM is repeating a stale engineering fact to a customer.

---

## Plant 4 — Per-verification pricing

**Stale docs:** `gtm-pricing-notes` (updated 2026-01-20) and `gtm-objection-handling` both quote
flat $1.75 per verification with a 5,000/month minimum.

**Correct source:** `gtm-lost-deal-valleyoak` (2026-07-18) states pricing moved to a tiered model on
2026-04-15 ($1.75 / $1.40 / $1.15 by volume band, minimum 2,500/mo) and that quoting the old flat
rate to a 22-location group is part of why the deal was lost.

---

## Minor stale fact (not counted as a plant)
`ga-pto-policy` states 18 days annual leave. `ga-vendor-list` notes the HR system was reconfigured
to 20 days in March 2026. Low stakes, gives the Knowledge tab a second realistic entry if wanted.
