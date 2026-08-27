---
id: gtm-discovery-brightsmile
title: Discovery call notes, Bright Smile Dental Partners
department: gtm
source: crm
owner: Rhea Sharma
updated: 2026-08-12
sensitivity: internal
---

# Bright Smile Dental Partners, discovery call

**Date:** 2026-08-12
**Attendees:** Marcus Deng (VP Revenue Cycle), Alicia Tran (Regional Ops Manager). Rhea, Tom.
**Profile:** 34 locations across Texas, mostly DFW and Houston. Eaglesoft. Roughly 9,000
verifications per month. Centralised RCM team of six in Plano.

## Current state

Six people, all in house, doing eligibility for 34 locations. Marcus says the team is "permanently
two days behind" and that Monday and Tuesday are unrecoverable. They batch verifications for the
following week every Thursday and Friday, which means anything scheduled inside 48 hours goes
unverified and the front desk quotes from the last known benefit.

Asked about collections leakage from bad quotes. Alicia said they wrote off roughly $40k last year
in patient balances they could not collect after quoting wrong, and that the real number is higher
because a lot of it just becomes a discount at the desk.

## The thing Marcus kept coming back to

Claims status. He raised it three times unprompted. His team is checking eligibility in one system
and claim status in another, and he wants both surfaced inside Eaglesoft where his people already
live. Direct quote from my notes: "if I have to teach six people a third portal, I would rather keep
the backlog."

This is not our product today. I did not promise it. I said it was on the roadmap and that I would
find out where. Flagging for Jofin and Nakul, this is the second prospect this quarter to lead with
claims status rather than eligibility.

## Technical

Eaglesoft, on-premise at each location with a central SQL replica in Plano. Tom flagged that our
Eaglesoft sync is read-heavy and that the nightly appointment pull can lag if their replica is
behind. Needs a follow up on their replication schedule.

## Next steps

- Tom to scope the Eaglesoft integration against their replica setup, by 2026-08-19
- Rhea to send the pilot proposal, 30 day read-only
- Marcus to get his COO on the second call
- Open question: claims status timeline. Do not answer until Nakul confirms.
