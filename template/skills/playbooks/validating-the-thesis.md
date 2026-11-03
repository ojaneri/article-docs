# Playbook — validating the paper's own argument

Before a reviewer does it. The `validation` skills are the commands; this is the order and
the standard.

## The five passes, in this order

Each pass is cheap only if the one before it has been done.

1. **Claims against evidence** (`claim-evidence-audit`). Two sweeps, not one. Forwards:
   every claim in `claims/` — where does the manuscript state it, and what does it name as
   support? Backwards: every strong sentence in the manuscript — which claim file stands
   behind it? The second sweep is the one that finds trouble.

2. **Numbers against data** (`numbers-traceability`). Regenerate every table and figure
   from the raw data and diff. A number that no current script reproduces is a number you
   cannot defend, whatever its provenance felt like at the time.

3. **Statistics against themselves** (`stats-sanity-check`). Test statistic, df, p, n,
   effect size, CI — recomputed, not re-read. Most mismatches are transcription errors, and
   they are found by automated screening at many journals before a human ever reads them.

4. **Citations against their sources** (`citation-context-check`). Does the cited work say
   what the sentence says it says? The tell for citation drift is a reference you inherited
   from someone else's related-work section rather than read.

5. **Threats to validity** (`validity-threats-sweep`). Internal, external, construct,
   conclusion. Every threat the design cannot remove must appear in the paper.

Then, and only then, the **adversarial pass** (`adversarial-review`) — a read by someone who
wants to reject the paper and has to justify it. Running it earlier wastes it: it will find
the things the five passes were going to find anyway, and you will have spent the one
genuinely fresh reading on them.

## The standard each pass is held to

- **A gap is reported, not repaired.** Softening a claim, dropping a citation or restating a
  result is an authorial act. An agent lists what it found, with file and line, and where
  the strength of a statement differs between the abstract and the results.
- **Three honest answers to every objection**, and no fourth: more evidence, a weaker
  claim, or an admitted limitation. "Reviewers probably will not notice" is not one.
- **A stated limitation is not a weakness in the paper.** A hidden one is, and it is found.
- **Nothing is invented to close a gap.** If the evidence for a claim does not exist, the
  finding is "this claim has no evidence", and the fix is measurement or a weaker claim.

## As a panel

`VIRTUAL-REVIEWERS.md` (`/artdocs:virtual-review`) runs these five passes and the adversarial
one as six reviewer roles, gives each domain a Strong/Weak Accept/Reject verdict, and records
the round in `reviews/virtual/`. Use it before a submission; use the passes one at a time
while writing.

## Where the output goes

Every round goes in `reviews/`, even the internal ones — especially the internal ones. The
objections you raised against yourself and answered are the first draft of the rebuttal, and
they are the only record of why a claim is phrased as cautiously as it is. Six months later,
a co-author who cannot see that record will "tidy" the hedge away.
