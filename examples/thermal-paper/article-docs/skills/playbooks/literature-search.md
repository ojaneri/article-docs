# Playbook — searching the literature

The skills `lit-search-*` in `skills.jsonl` are the commands. This is the strategy.

## Which source answers which question

| Question | Go to |
|---|---|
| What exists on this topic at all? | **OpenAlex** — free, no key, broad, has citation counts |
| What does this key paper cite, and who answered it? | **Semantic Scholar** graph API |
| Is there something newer than the published record? | **arXiv**, and **IACR ePrint** for cryptography |
| Are these bibliographic details correct? | **Crossref**, by DOI |
| The work is only in a publisher's library | **IEEE Xplore / ACM DL / ScienceDirect**, in a browser session with institutional access |
| Who is working on this *right now*? | the venue's last two proceedings, read directly |

Google Scholar has the best recall and the worst interface for an agent: it blocks
scripted clients, returns no stable identifiers, and cannot be cited. Use it to discover,
then resolve every hit through Crossref or OpenAlex before it becomes a reference.

## A search that is worth repeating

1. **Write the query down before running it.** Terms, synonyms, date range, and what you
   are trying to establish — a gap, a baseline, a method, or a number to compare against.
2. **Two anchors, then snowball.** Find the two or three papers closest to the work, then
   walk their references backwards and their citations forwards. That finds more of what
   matters than a dozen keyword variations.
3. **Record the search itself** in `references/`: the query, the source, the date, and what
   you concluded. A related-work section defends itself much better when the search that
   produced it is written down, and a reviewer asking "did you consider X" is answerable.
4. **Record what each source is used for**, not just that it exists. A reference nobody can
   explain is a reference that gets cited in the wrong sentence.
5. **Resolve every hit to a DOI** before it enters the `.bib`, and let the publisher's own
   BibTeX be the starting point.

## Rules

- **Never cite a paper you have not read past the abstract.** An abstract does not tell you
  the assumptions, the baseline or the threat model, and those are what you are citing it for.
- **Never invent a reference.** No plausible-looking author, venue, year or page range,
  ever — a fabricated citation is the single most damaging thing an agent can put in a
  manuscript, and it is trivially caught.
- **A preprint is not a peer-reviewed paper.** Cite it when it is the real source, say what
  it is, and check for a published version first.
- **Respect publisher terms.** Search at human pace, never bulk-download, and keep saved
  PDFs out of the artifact you distribute.
