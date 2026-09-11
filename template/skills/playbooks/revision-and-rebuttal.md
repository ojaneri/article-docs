# Playbook — revision and rebuttal

The reviews arrived. What happens now is a process, and most of its failures are procedural
rather than scientific.

## Before answering anything

1. **Tag what was submitted**, if it was not tagged on the day (`submission-snapshot-tag`).
   Without that baseline, "show us what changed" becomes archaeology.
2. **Quote every point verbatim** into `reviews/<round>.md`, numbered per reviewer.
   Paraphrasing a criticism to make it easier to answer is the fastest way to lose a referee
   who then sees their own point misrepresented.
3. **Sort the points**: what needs new evidence, what needs a weaker claim, what needs a
   stated limitation, and what is a misunderstanding — which is usually a sign the paper was
   unclear, not that the reviewer was careless.

## Answering

Each point gets one of three honest answers, and each answer names the change:

- **We changed X** — and say where, by section and line.
- **We disagree, and here is why** — with the argument, not the assertion. This is allowed,
  and a well-argued disagreement reads better than a grudging change.
- **We agree and cannot fix it in this paper** — so it is now a stated limitation. Say that.

A point answered with no change to the manuscript must say so explicitly. An editor reading
a response where every point claims a change, and a diff showing three, will not believe the
third one either.

## Producing the revision

- `latexdiff-for-revision` makes the marked-up PDF editors ask for. Check it compiles and is
  readable; latexdiff mangles changed tables and figures, and those get marked by hand.
- Run the **validation passes again** on the revised text. A revision introduces new claims,
  and new claims arrive without evidence by default.
- Re-check the page limit: revisions grow.

## What goes in the memory

The decision behind each answer, not just the answer. "We kept the original baseline because
changing it would invalidate the transfer analysis, and said so in §IV" is a decision with a
cost, and the next round of reviews will ask about it again.
