# Canon sheet (internal, not part of the corpus)

Single source of truth for the synthetic corpus. Every doc is written against this.

## Company
Needletail. AI-powered, human-verified dental insurance eligibility verification for US group
practices and DSOs. Multi-agent AI plus a human-in-the-loop QA team. Integrates with Open Dental,
Dentrix Ascend, Carestack, Eaglesoft.

## Cast
| Name | Role | Expertise | Appears as owner of |
|---|---|---|---|
| Jofin Joseph | CEO | gtm, product | ICP, pricing, roadmap, lost-deal post-mortem |
| Akhilesh T | RCM Lead | ops | payer playbooks, escalation SOP, QA rubric |
| Nakul R | CTO | engineering, product | architecture, PRD, runbooks |
| Sam Ortiz | Verifier (started Aug 2026) | none | nothing; asks questions |
| Priya Menon | Verification Team Lead | ops | Slack threads, onboarding guide |
| Danny Alvarez | QA Analyst | ops | QA rubric co-owner |
| Rhea Sharma | Account Executive | gtm | discovery notes, objection handling |
| Tom Beckett | Solutions Engineer | gtm/eng | Eaglesoft sync issues |
| Wes Okafor | Backend Engineer | engineering | on-call notes, portal change detection |
| Maya Iyer | Ops Manager, People & Finance | ga | expense, PTO, vendor list |

## Payer numbers (canonical, mirrored in payer-coverage-summary)
Lifetime verifications since launch. Total 240,400. Blended exception rate 3.4%.

| Payer | Verifications | Exception rate | Top exception | Last portal change |
|---|---|---|---|---|
| Delta Dental of California | 52,400 | 2.4% | Fluoride benefit class ambiguity (D1206) | 2026-06-02 |
| MetLife | 41,200 | 3.1% | Perio maintenance frequency (D4910) | 2026-05-18 |
| Cigna Dental | 33,700 | 2.9% | Missing tooth clause / waiting period | 2026-04-27 |
| Aetna Dental | 28,900 | 4.2% | Posterior composite downgrade (D2392) | 2026-07-09 |
| Guardian | 22,150 | 3.6% | Ortho lifetime max not exposed in portal | 2026-03-11 |
| UnitedHealthcare Dental | 17,400 | 5.1% | Portal timeout, no real-time response | 2026-07-22 |
| Humana Dental | 14,800 | 3.3% | Plan type mismatch, PPO vs DHMO | 2026-02-19 |
| Ameritas | 11,600 | 2.7% | Frequency on service year not calendar year | 2026-05-05 |
| Principal | 9,300 | 3.8% | Coordination of benefits, secondary payer | 2026-06-30 |
| BCBS (regional plans) | 8,950 | 6.4% | Regional plan routing ambiguity | 2026-07-15 |

## Prospects / customers
- Bright Smile Dental Partners. 34 locations, Texas. Eaglesoft. Discovery 2026-08-12. Open deal.
- Cedar Ridge Dental Group. 9 locations, Oregon. Open Dental. Discovery 2026-07-29. Open deal.
- Northshore Dental Alliance. 112 locations, IL/WI. Dentrix Ascend. Discovery 2026-06-24. Open deal.
- Valley Oak Dental Group. 22 locations, Arizona. Carestack. LOST 2026-07-18 on pricing.
- Existing customers referenced: Lakeside Family Dental (6 loc, Open Dental),
  Summit Dental Collective (17 loc, Dentrix Ascend).

## Ticket / doc IDs
- PRD-014 Claims status v1
- NT-312 Aetna posterior composite downgrade detection
- NT-318 Portal change detector false positives

## Pricing history
- Launch to 2026-04: flat $1.75 per verification, 5,000/month minimum.
- From 2026-04-15: tiered. $1.75 up to 20k/mo, $1.40 for 20k-75k/mo, $1.15 above 75k/mo.
  Minimum dropped to 2,500/mo.

## Doc count by department
ops 11 (incl. coverage summary), gtm 7, product 5, engineering 5, ga 3. Total 31.
