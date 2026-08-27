---
id: escalation-sop
title: Escalation SOP for verification exceptions
department: ops
source: notion
owner: Akhilesh T
updated: 2026-07-30
sensitivity: phi-restricted
---

# Escalation SOP

An exception is any verification the agent could not complete with high confidence. This document is
about what a human does next. It is not about how the agent decides.

## Tier 1, verifier resolves
Handled in queue, target 15 minutes.
- Portal returned a partial response, re-run
- Member found under a different spelling or a dependent record
- Group number missing from the PMS record, request from the practice
- Benefit class needs a playbook lookup

## Tier 2, team lead
Escalate to Priya. Target 2 hours.
- Portal says one thing and the playbook says another
- Payer phone line gives an answer that contradicts the portal
- Any verification where a call is required and the payer wait time exceeds 25 minutes
- Same exception reason firing more than five times in a shift on one payer, which usually means a
  portal change rather than five unrelated problems

## Tier 3, RCM Lead
Escalate to Akhilesh. Same day.
- Any of the three critical misses in the QA rubric
- A practice disputing a verification we issued
- Suspected payer policy change affecting more than one group
- Anything that will require a playbook edit

## Tier 4, CTO
Escalate to Nakul. Immediate.
- Portal scraper failing across a whole payer
- Any suspected exposure of patient data outside the platform
- PMS write-back producing incorrect records at a customer site

## Handling patient data during escalation
Never paste member identifiers, dates of birth or subscriber IDs into Slack, including private
channels. Reference the verification ID only. The verification record already contains everything
the next person needs and is access controlled. This applies to screenshots as well, and screenshots
are the most common way this rule gets broken.

## After resolution
Every Tier 2 and above resolution requires the exception reason to be set on the verification record
before closing. That field is what populates the coverage summary. A blank or "other" reason means
the resolution is invisible to everyone who was not in the room.
