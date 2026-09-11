# references — what the key sources are used for

Invented example content.

| Source | Used for |
|---|---|
| the cooling-design survey | the related-work framing: prior work optimises the cooling, this paper measures what the cooling leaves |
| the burst-benchmark paper | the baseline this paper argues against; cited in the introduction and again in §IV |
| the vendor datasheets | the thermal design power figures in Table I — datasheet values, labelled as such |

Every entry in `paper/refs.bib` has a DOI except the datasheets, which are `@misc` with an
access date.

## Decisions

- **[#d-0006]** date: 2026-07-05 · status: proposed · author: dana
  **Cite the burst-benchmark work in its published form, not the preprint.**
  The preprint has a different baseline and would make the disagreement look larger than it
  is. This costs the earlier date, which mattered for the priority argument in the intro;
  that sentence was rewritten instead.

## Todos

- **[#t-0007]** status: open · author: dana — Three entries were typed by hand before the Crossref check existed. Verify authors and pages against the DOI.
