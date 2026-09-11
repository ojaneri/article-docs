# Playbook — before a submission that cannot be undone

Run this with a human present. Submission is one-shot per deadline.

## The manuscript
- [ ] Built clean from a fresh checkout — no local file, no uncommitted figure.
- [ ] **No placeholder survives.** Every unmeasured number, every empty table cell, every
      `TODO` is either filled or the paper is not ready. Check the rendered PDF, not the source.
- [ ] Page count within the venue's limit, in the venue's class file, at the venue's font size.
- [ ] Reference count within the limit; every citation resolves; the `.blg` has no
      unexpected warning.
- [ ] Every claim in the abstract is supported by a result in the paper, in the same strength.
- [ ] Limitations and threats to validity are stated, not implied.
- [ ] Figures are vector, legible in greyscale, with embedded fonts.

## Anonymity, if the venue is anonymous
- [ ] No author name, institution, funder or acknowledgement in the text.
- [ ] PDF metadata swept — the author field survives most builds.
- [ ] No repository URL, no dataset DOI that resolves to the group, no
      "our previous work [12]" phrasing that names the group.
- [ ] Figure files and source archives carry no identifying paths or metadata.

## Authorship and disclosure
- [ ] The author list and order are what every author agreed to.
- [ ] **No AI system appears as an author or co-author**, anywhere.
- [ ] AI assistance disclosed in the form the venue requires, if it requires one.
- [ ] Funding, conflicts of interest and data availability statements present and true.

## The record
- [ ] The decisions that produced this version are `accepted`, not left `proposed`.
- [ ] `reindex`, `validate` and `git drift` all clean.
- [ ] The submitted PDF is archived in the repository, tagged, so the next revision has a
      baseline to diff against.
