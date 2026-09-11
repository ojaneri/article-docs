# ARTICLE-MEMORY — thermal-paper

Human-readable index of this article's durable memory.

**Everything in this example is invented.** It exists to show the shape of a filled-in
memory, not to describe real work. No number here was measured.

## What this is
A measurement study of thermal derating in edge ML accelerators: how much sustained
throughput a passively cooled module actually delivers once the die reaches steady state,
and how far a one-minute burst benchmark overstates it. Target venue is a systems workshop
with a 6-page limit. State: drafting, with the sustained-throughput campaign still running.

## Memory map
| Area | File |
|------|------|
| Manuscript sections | `sections/` |
| Claims and hypotheses | `claims/` |
| Experiments and data | `experiments/` |
| Venue, format and deadlines | `venue/` |
| Bibliography | `references/` |
| Reviewer reports and rebuttals | `reviews/` |
| Procedures (build, figures, analysis) | `skills/skills.jsonl` |
| Authors & ownership | `identity/ownership.md` |
| Sessions | `sessions/` |
| Machine index | `index.jsonl` |

## Quick facts
- Sources in `paper/`; `make -C paper` builds `paper/main.pdf`.
- The headline metric is the ratio of sustained to burst throughput, so board-specific
  constants cancel — see `claims/derating-ratio.md`.
- Six of the table cells in §IV are still empty. They are todos in
  `experiments/sustained-throughput.md`, and they block submission.
- The 6-page limit is hard. Two figures were already cut; see the decisions in
  `sections/results.md` before proposing a third.
