---
id: slack-metlife-perio-edge
title: Slack thread, MetLife perio maintenance frequency edge case
department: ops
source: slack
owner: Priya Menon
updated: 2026-07-02
sensitivity: internal
---

# #verification-help, 2026-07-02

**Sam Ortiz** (09:14)
Question on a MetLife one. Member has had D4910 three times this year already, portal frequency
counter says 1 remaining out of 4. Treatment plan has another perio maintenance in September. The
playbook says 4 per calendar year and trust the counter. Do I just mark it covered?

**Priya Menon** (09:22)
Hold on that one. What is the group name?

**Sam Ortiz** (09:24)
Plan name is "Preferred Dentist Program", group 4417xx. Not the Plus version.

**Priya Menon** (09:31)
Then no, do not mark it covered off the counter. Tagging @Akhilesh T because this comes up
constantly and the playbook is out of date on it.

**Akhilesh T** (09:47)
Right, so this is the single most expensive mistake we make on MetLife. The playbook says 4 per
calendar year. That is only true for groups carrying the enhanced perio rider. On a standard group
it is 2 per calendar year. The portal counter shows 4 for everyone because it is rendering the
plan's maximum possible frequency, not the group's actual one.

So the counter saying "1 remaining" on a standard group means the member is already two over. If we
quote that as covered the practice bills it, MetLife denies with a 271, and the patient gets a
surprise bill for a cleaning they were told was free.

**Akhilesh T** (09:49)
Rule going forward: any D4910 on MetLife where the member already has two or more this calendar
year, call. Do not trust the counter. If the plan name ends in "Plus" you can trust 4.

**Sam Ortiz** (09:52)
Got it. Calling. Should the playbook get updated?

**Akhilesh T** (09:55)
Yes. It is on my list. It has been on my list since about March, which tells you something about
how well the list works.

**Danny Alvarez** (10:12)
Adding this to the coaching notes. This is behind a decent chunk of our MetLife exception volume.
