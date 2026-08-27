---
id: hitl-verifier-onboarding
title: New verifier onboarding, first two weeks
department: ops
source: notion
owner: Priya Menon
updated: 2026-08-04
sensitivity: phi-restricted
---

# New verifier onboarding

Written for people joining the human-in-the-loop team with dental front office or RCM experience but
no Needletail experience. Two weeks to independent queue work.

## Week 1

**Days 1 to 2.** HIPAA training and platform access. You will not touch a live verification until
training is signed off. Read the escalation SOP and the QA rubric before anything else. Understand
that everything you see in the queue is patient data and the rules about where it can go are not
negotiable.

**Days 3 to 5.** Shadow queue. You work verifications alongside a reviewer who checks every one
before it goes out. You will be slow. Everyone is slow. Speed comes from knowing which payer does
what, and that takes about three weeks, not three days.

Start with Delta Dental of California and Cigna. They are the highest volume and the most
predictable. Do not start on Aetna or Guardian.

## Week 2

Live queue at 100% QA sampling. You own the verification, a QA analyst scores all of it. Target is
95 on the rubric, not speed. Turnaround is 5% of your score for a reason.

## What the agent has already done before you see it

By the time a verification reaches your queue, the agent has attempted the portal, parsed the
response and assigned a confidence. You are seeing it because the confidence was low or a rule fired.
Your job is not to redo the work, it is to resolve the specific thing the agent could not.

Read the exception reason first. It tells you what to look at.

## The thing new verifiers get wrong most often

Trusting the playbook over the portal, or the portal over the playbook, without noticing they
disagree. When they disagree, that is the finding. Escalate it rather than picking one. A
disagreement between the playbook and the portal usually means the payer changed something and
nobody has updated us yet, and you are the first person to see it.

Ask in #verification-help. Nobody has ever been in trouble here for asking about a frequency rule.
People have been in trouble for guessing one.
