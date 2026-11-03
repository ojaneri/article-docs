# VIRTUAL-REVIEWERS — the pre-submission review protocol

> **What this is.** The procedure an agent follows when asked to review an article before it is
> submitted: `/artdocs:virtual-review <article> [--apply]`. A panel of virtual reviewers
> examines the manuscript domain by domain. Each domain gets a verdict —
> **Strong Accept · Weak Accept · Weak Reject · Strong Reject** — with its findings and the fix
> for each. With `--apply`, the fixes that can be made without new data are made, and the
> rest become todos.
>
> **For any article.** The protocol has three layers:
> - a **core** of nine domains that applies to every scholarly text: experimental, qualitative,
>   theoretical, a review, an essay, a case report, a software paper, a chapter or a thesis;
> - **packs** selected by what the article *is* (its type), *where it comes from* (its field)
>   and *how long it is* (its format);
> - the **venue's own rules**, read from `venue/`. Where they and this file disagree, the venue
>   wins.
>
> It works on LaTeX, Word, Markdown or any other source, because the final checks run on the PDF.
>
> **Where it came from.** It distils real reviews, internal audits of article projects run with
> article-docs, and the published reporting and reviewing standards listed in §12. The lessons
> in §9 are real events; each is phrased as a general rule with the case as its example.
>
> This file is framework-owned: `upgrade` replaces it. Put project-specific additions in
> `venue/` (venue rules, and a field pack of your own: §8.4) and in `reviews/` (what real
> reviewers said about this paper).

---

## 1. Ground rules

1. **The rendered document is what reviewers read.** Every check that can run on the PDF (or the
   exact file the venue receives) runs on it, after a fresh build or export. A clean source
   with a stale PDF is not clean.
2. **Nothing is invented to close a gap.** No number, quotation, reference, source, proof step,
   result or co-author opinion goes into the paper unless it was read from a source in this run.
   If the evidence does not exist, the finding is "this has no evidence". The fix is then more
   evidence, a weaker claim or a stated limitation: those three, never a fourth.
3. **Every S0 and S1 finding is verified by the lead before it is acted on.** A reviewer agent
   can be wrong. The lead re-reads the line, the data, the transcript, the archive or the proof,
   and marks the finding *verified*, *rejected* or *uncertain*.
4. **Judge the paper by the standards of its own paradigm.** A qualitative study is not
   faulted for lacking p-values, an essay for lacking a dataset, a proof for lacking
   experiments. The type pack (§7) sets what rigour means for this paper; the core checks say
   so where they differ by paradigm.
5. **Independence.** Reviewers share no context with each other or with the session that
   drafted the text. Where several models are available, use a different one for each role (§3).
6. **Nothing leaves the machine.** Fixes are applied on a local copy or branch. Nothing is pushed
   to a remote, a collaborative editor (Overleaf, Google Docs, SharePoint), a submission system
   or a repository unless the human asks for that specific push. Co-authors' edits are fetched
   before anything is changed (`skills/playbooks/overleaf.md` describes the pattern for any
   shared editor).
7. **Authorial choices stay authorial.** The title, the author list and order, the venue, the
   central thesis, and whether to drop a contribution are proposed, never decided by the agent
   (§5, class B).
8. **The checklist supports judgment; it does not replace it.** A "no" that the paper itself
   justifies in the text is downgraded one severity level (§4). Reviewer anti-patterns (§10)
   apply to the virtual reviewers too.

---

## 2. The run, step by step

```
locate → classify → pre-flight → lint → panel → lead verification → verdicts → apply → rebuild → loop → record → report
```

### Step 0 — Locate the article
The argument is a project directory, a main source file (`.tex`, `.docx`, `.md`, `.odt`) or the
PDF. Resolve:
- the source and everything it includes;
- the bibliography (`.bib`, reference-manager export, or the list in the document);
- the rendered PDF;
- the materials the paper cites: data, code, instruments, transcripts, archives;
- the memory (`article-docs/`).

Read `venue/`, `claims/`, `experiments/`, the open todos and the earlier rounds in `reviews/`
before reading the paper. An objection that an earlier round already answered is not new.

For a Word or other non-LaTeX source, export a PDF first. Accept tracked changes in the export
only, never in the source, and do not delete comments without asking.

### Step 1 — Classify the article
Record three things in the report, from `ARTICLE-MEMORY.md`, `venue/` or the text itself:
- the **type**: one or more of §7;
- the **field**: §8;
- the **format**: §8.3.

Ask the human if the type is ambiguous, because it decides which standard applies. At least
one type pack always applies. If nothing fits, use **AR** (argumentative).

### Step 2 — Pre-flight on the memory (domain **P**)
Run the P checks (§6). If the memory cannot name the target venue and its rules, stop and ask:
about a third of the problems below depend on the venue.

### Step 3 — The deterministic pass
```bash
node article-docs/bin/artdocs.mjs review lint <main.tex | paper.pdf> --json [--pages-max N] [--abstract-max N] [--anon|--no-anon]
```
- **On a LaTeX source** it checks the source, the build log, the bibliography and the PDF.
- **On a PDF** it checks the rendered text and the file. This covers Word, Markdown and anything
  else.

Its checks are H01–H19 (§6, domain H). It runs offline and exits 1 while any S0 remains. Its
findings go to the panel as given facts; they are not re-derived by reading.

### Step 4 — The panel
Each reviewer gets the manuscript, the lint report, `venue/`, its domains and the packs that
apply. It returns findings in the §11 format. Reviewers run in parallel when the tool allows it.

### Step 5 — Lead verification
The lead walks every S0/S1 finding against the source (rule 3). It merges duplicates and drops
what §10 rules out. Then it assigns each surviving finding a fix class (§5).

### Step 6 — Verdicts
Per domain, then per pack, then overall, by §4. A **Weak Reject** or **Strong Reject** in a gate
domain (P, V, H, R, E) blocks submission whatever the others say.

### Step 7 — Apply (only with `--apply`)
§5. Class A and B fixes are written on the branch `virtual-review/<YYYY-MM-DD>`, or on a copy
named `<file>.virtual-review-<date>.<ext>` when the source is not under git. Class C fixes
become todos.

### Step 8 — Rebuild and loop
Rebuild or re-export, re-run the lint, and re-run only the reviewers whose domains still hold
S0/S1, plus R5 if the text changed. Stop when a round finds nothing new at S0/S1, or after
`--rounds` (default 3).

Before closing, run the **content regression**: the set of numbers, and of direct quotations,
in the rendered text must be unchanged. The only exceptions are items a finding changed from a
source, and the record names each one.

### Step 9 — Record
Write `reviews/virtual/<YYYY-MM-DD>-r<N>.md` (§11). Register decisions (`d-NNNN`, status
`proposed`) and todos (`t-NNNN`) inside it and run `reindex`: their status then shows up in
`status` and `promote`.

### Step 10 — Report to the human
Answer in the human's language. The report contains, in this order:

1. The classification.
2. The gate: submittable or not.
3. A verdict table with one row per domain and per pack.
4. The overall verdict.
5. The venue-form scores.
6. What was applied, with where it lives.
7. What waits on the human.
8. What waits on evidence.
9. The three changes that would raise the overall verdict most, cheapest first.

---

## 3. The panel

| Role | Reads as | Domains |
|---|---|---|
| **R0 Editor / pre-screen** | the editor deciding desk-reject in ten minutes: title, abstract, contributions, figures, conclusion, then the venue's scope and rules | P, V, K (fit and contribution), E (policy) |
| **R1 Field expert, hostile** | the reviewer with the highest confidence and the lowest score, who knows the field's literature, terms and standards better than the authors | K, field packs, conceptual precision everywhere |
| **R2 Methodologist of the paradigm** | a statistician for quantitative work; a qualitative methodologist for interviews or ethnography; a mathematician for proofs; a historian or philologist for archival and textual work; a review methodologist for reviews | M, type packs |
| **R3 Evidence versus sources** | every number, quotation and factual statement against the data, transcripts, archives or proofs that support it. Re-runs, re-derives or re-reads what it can | X |
| **R4 References** | every entry against the bibliographic record, and key citations against the cited text | R |
| **R5 Language and venue style** | the venue's author guide and an editor's red pen | W, formatting in V |

**Why R1 is hostile.** In one real review, a single Strong Reject from a high-confidence expert
outweighed two Weak Accepts. An average score hides that reviewer, so the panel simulates them.

**Models.** Use the strongest model for R1 and R2, a mid model with tool access for R3 and R4,
and a small model for R5. A panel of one model playing six roles is weaker but acceptable; say
so in the record.

---

## 4. Severity, verdicts and scores

### Severity of a finding

| Level | Name | Meaning |
|---|---|---|
| **S0** | Blocking | desk reject or unpublishable as-is, whatever the merit: an unresolved citation, a placeholder in the text, a nonexistent reference, a fabricated or misquoted source, a length or template violation, broken anonymity, a missing mandatory statement or ethics approval, an AI listed as author, plagiarism |
| **S1** | Critical | the central claim does not survive: a claim without evidence, the headline component not evaluated, an argument whose conclusion is assumed in its premises, a proof with a gap at the main theorem, a design that cannot answer its question, a method described as done but not done |
| **S2** | Major | weakens confidence or reproducibility, and is fixable: missing detail of procedure, no measure of uncertainty, limitations that are generic, counterarguments not engaged, materials unavailable without reason |
| **S3** | Minor | clarity, presentation, completeness: an undefined term, an unreferenced figure, an incomplete reference |
| **S4** | Suggestion | an optional improvement |

Downgrade one level when the paper states the gap itself and justifies it in the text
("we did not do X because Y"). Never downgrade S0.

### Verdict per domain or pack

| Verdict | Rule |
|---|---|
| **Strong Reject** | any S0, or two or more S1 |
| **Weak Reject** | one S1, or three or more S2 |
| **Weak Accept** | one or two S2, no S0/S1 |
| **Strong Accept** | only S3/S4, or nothing |

A domain or pack that does not apply is reported as `n/a`, not as Strong Accept.

### Overall verdict
- **Gate:** any S0 anywhere → overall **Strong Reject**, status *not submittable*.
- Otherwise the overall verdict is the **worst** of: the gate domains (P, V, H, R, E), K, M, X,
  and the type pack. W, the field packs and the format pack can lower the result by one level
  and cannot raise it.
- Report each reviewer's confidence (1–5). Flag for the human any spread of two or more verdict
  levels between reviewers: that is where a real panel splits.

### Translating into the venue's own form
Fill the form the venue actually uses, as recorded in `venue/`. Common shapes:

| Form | Mapping |
|---|---|
| Journal decision | Strong Accept → Accept/Minor · Weak Accept → Minor/Major · Weak Reject → Major/Reject & resubmit · Strong Reject → Reject |
| Conference overall 1–5 | Strong Reject 1 · Weak Reject 2 · split panel 3 · Weak Accept 4 · Strong Accept 5 |
| Ranking 0–10 | 2 · 4 · 6.5 · 8.5, in the same order |
| Criterion scores (originality, significance, soundness, clarity, related work, relevance) | originality and significance ← K; soundness ← M, X, type pack; clarity ← W; related work ← K, R; relevance ← V08 |
| Humanities / book chapter reports | a recommendation plus a narrative: use the verdict and the top findings of K, M (AR pack) and R |

---

## 5. Fix classes — what `--apply` may do

| Class | What it is | Under `--apply` |
|---|---|---|
| **A — mechanical** | changes no meaning: broken citations and cross-references, build or export errors, layout overflow, a missing figure path, a term or acronym expanded at first use, bibliography fields corrected *from the record fetched in this run*, uncited references removed, template spacing restored, anonymity switches, file metadata, spelling, the venue's house style | applied |
| **B — authorial wording** | changes how strong or how framed a statement is. Examples: soften an overclaim, qualify a result's scope, rename a confounded variable, remove editorial meta-language, define a concept the paper borrowed, move an existing limitation into the abstract, cut a figure that adds nothing | applied, and **each one recorded as a `proposed` decision** with the before and after text. The human accepts it with `promote` or reverts it. It never changes a number or a quotation, never adds a claim, never removes a stated limitation, never changes the title, the authors or the thesis |
| **C — needs evidence or a person** | a new experiment, a re-run, more interviews, an archive visit, a missing proof step, a reference not yet verified, a permission, a co-author's source file, a venue or title choice | **never applied.** It becomes a todo `t-NNNN` naming what would close it and who can do it |

**Rules for applying:**
- Start from a clean tree, or record what was dirty. For a source under git, create the branch
  `virtual-review/<date>`; otherwise work on the dated copy (§2, step 7).
- Offer commits per class; do not make them. A commit never carries an AI co-author trailer.
- Word and other binary sources: apply edits with tracked changes on, so the human reviews
  them in the editor they use.
- When a fix needs a citation, add it only if R4 fetched and verified the record in this run.
  Otherwise the fix is class C.
- Do not re-apply a class B fix that a human rejected in an earlier round. Quote that rejection
  in the new record instead.

---

## 6. The core domains (every article)

Each check is listed as **Id · Sev · Fix · Check**, followed by how it is done. "Lint Hnn" means
`review lint` already decides it. The tags say what a check needs:
- **(auto)**: a script;
- **(semi)**: the agent locates, then judges lightly;
- **(judg)**: expert judgment.

### P — Pre-flight on the memory (gate)

| Id | Sev | Fix | Check |
|---|---|---|---|
| P01 | S0 | C | `venue/` names **one current** target, with the source and date of every rule and a list of what is *not verified*. An old target is marked superseded, not left under a new header. (semi) |
| P02 | S1 | C | The review regime (open, single or double anonymous) comes from the venue's current call, not carried over from the previous venue. (semi) |
| P03 | S2 | C | The decisions this version rests on are `accepted`, not left `proposed`. (auto: `status`) |
| P04 | S2 | A | Project notes and `article-docs/` agree on venue, authors and status. Where they disagree, the memory is corrected or the divergence recorded. (semi) |
| P05 | S1 | C | The deadline is known and not past, and the length, abstract and reference limits are recorded as numbers. (semi) |
| P06 | S2 | C | If this project forks another (a v2, a resubmission, a chapter from a thesis), the record says which one, and reused text is known (V09). (semi) |
| P07 | S1 | C | The shared editor holds no co-author edits newer than the local copy. (semi) |
| P08 | S3 | C | At least one recently published piece from the target venue, of the same type, has been dissected: structure, length, number of references, figures, what it does that this one does not (`venue/exemplar.md`). (judg) |

### V — Venue fit and formal compliance (gate)

| Id | Sev | Fix | Check |
|---|---|---|---|
| V01 | S0 | B | Length within the limit, counted the way the venue counts it (pages, words, characters; with or without references, abstract or appendices), in the venue's template. (auto: lint `--pages-max`) |
| V02 | S1 | A | The template is unmodified: margins, spacing, fonts and styles are as provided. (auto: lint H08 for LaTeX; semi for Word) |
| V03 | S0 | C | Length is **not too short** either. Real case: 5 pages called "superficial" where the venue's median was 12. (semi) |
| V04 | S0 | B | Abstract within the limit, and in the required form (structured or not). Keywords in the required count and vocabulary (MeSH, ACM CCS, JEL, MSC). (auto: lint `--abstract-max`) |
| V05 | S0 | B | The required structure and statements are present under the venue's exact names. Typical items: IMRaD or the venue's section scheme, a data-availability statement, ethics and consent, conflicts of interest, funding, author contributions (CRediT), an AI-use statement, an open-science or artifact section, an ethics-considerations section, author biographies, a contact section. (semi) |
| V06 | S1 | A | Author metadata as required: ORCID iDs, affiliations, corresponding author. (semi) |
| V07 | S0 | A | Reference style and order as the venue wants (numbered, author–date, notes-bibliography). File format, size and naming as the submission system demands. (semi) |
| V08 | S0 | C | **Scope and article type fit.** The venue publishes this kind of piece in this subject. Real cases: a journal rejecting a pure measurement study for lacking the contribution type it publishes; a review sent where only original research is accepted. (judg) |
| V09 | S0 | C | No undisclosed overlap with another submission or publication, including the authors' own, theses and preprints, where the venue restricts them. Similarity-check thresholds are respected. (semi) |
| V10 | S0 | A | No hidden text and no instruction aimed at an automated or LLM reviewer. (auto: lint H17) |
| V11 | S2 | B | Tone matches the venue: no promotional language, products named neutrally, no advocacy where the venue expects analysis. (semi) |
| V12 | S2 | C | The language requirement is met (language of the text, of the abstract, a second-language abstract, translation of quotations). (semi) |

### H — Document hygiene (gate)

| Id | Sev | Fix | Check |
|---|---|---|---|
| H01 | S0 | A/C | No placeholder survives: `TODO`, `TBD`, `XXX`, `\todo`, `\tbd`, highlighted or red text, "[ref]", "[citation needed]", "to be done", "Scopus still to be searched". A placeholder that stands for **missing evidence** is class C, never "filled". Real case: a submission went out with a placeholder in the abstract and was desk-rejected. (auto) |
| H02 | S0 | A | The build or export is clean: no undefined citation or cross-reference, no missing file, no fatal error, and it is newer than the source. (auto for LaTeX) |
| H03 | S0 | A | The rendered PDF has no `[?]`, `??`, "Error! Reference source not found", "Error! Bookmark not defined", unresolved field codes, or visible TODO. (auto) |
| H04 | S0 | A | Every citation resolves to an entry, and every entry is cited in the text. One venue rejected a paper for references "listed but not cited". (auto for LaTeX; semi otherwise) |
| H05 | S3 | A | Every figure and table is referred to in the text, numbered in order, and present. (auto for LaTeX) |
| H06 | S1 | B | No editorial meta-language: "in response to review", "previous round", "as the reviewers asked", "not available to the authors". It belongs in the response letter. (auto) |
| H13 | S0 | C | No credential or personal data in the document, its metadata or its materials. If found, remove it, and rotate a credential, because it is already in history. (auto) |
| H14 | S1 | A | The PDF embeds its fonts, has no bitmap fonts, is not encrypted, and its metadata suits the review regime. (auto) |
| H18 | S2 | A | Clean source package: no tracked changes or comments left in a Word file, no stray drafts, test files or "remove-before-submission" folders, no file present only on one machine. (semi) |

### R — References and source integrity (gate)

| Id | Sev | Fix | Check |
|---|---|---|---|
| R01 | S0 | A/C | **Every** reference exists, and its authors, title, year and venue or publisher match the record (Crossref, DataCite, DBLP, PubMed, a library catalogue, the publisher, the archive). Check 100 % of entries, not a sample. Agent-drafted bibliographies in real projects contained invented co-authors, wrong titles and nonexistent works. A wrong field is fixed from the record (A); an entry that cannot be found is removed together with its claim, or becomes a todo (C). (semi: `bib-verify-entries`) |
| R02 | S1 | A | Every DOI or persistent identifier resolves to *this* work. A preprint with a published version is cited as published. Editions and translations are the ones actually used. (semi) |
| R03 | S1 | C | No cited work is retracted or under an expression of concern without the paper saying so. (semi: `citation-retraction-check`) |
| R04 | S1 | B | **The source says what the sentence says.** Numbers, findings and positions are attributed to the work that contains them; a criterion is reported as the source states it; a study is described as the kind of study it is; a quotation is verbatim, with its page. Every sentence that attributes something specific to a citation is checked against the cited text. (judg: `citation-context-check`) |
| R05 | S1 | C | Every claim of a gap ("no prior work", "the first", "has been neglected") survived a dated search recorded in the memory. Real case: a reviewer pointed to work the paper said did not exist. (judg) |
| R06 | S1 | C | Factual assertions carry citations. Quantitative claims (prevalence, cost, risk, dates) cite a source or the paper's own data. (semi) |
| R07 | S2 | C | Foundational concepts cite their origin, and the canonical works of the debate are present. (judg) |
| R08 | S2 | C | No predatory or low-credibility outlet carries an argument; grey literature is identified as such. (semi) |
| R09 | S2 | C | Self-citation is pertinent and not excessive. Under anonymous review it is written in the third person (E02). (semi) |
| R10 | S1 | C | Laws, standards, regulations, guidelines and canonical texts are cited by the correct article, clause, section or verse, against the official text. (semi) |
| R11 | S2 | C | Web sources have an access date, or an archived copy for mutable pages. (semi; lint lists URLs) |
| R12 | S0 | C | **The paper is self-contained.** No concept, taxonomy, instrument or scenario it needs is defined only in an unpublished, "in press" or inaccessible work; it is defined operationally here. (judg) |

### K — Contribution, claims and novelty

| Id | Sev | Fix | Check |
|---|---|---|---|
| K01 | S1 | B | The question, aim, thesis or hypothesis is explicit near the start. A research question that can only be answered "yes" is reframed as *how*, *how well* or *under what conditions*. (semi) |
| K02 | S1 | B/C | Contributions are stated, specific, and each points to where the paper supports it. A contribution with no support is cut or supported. (semi) |
| K03 | S1 | C | **Novelty is demonstrated, not asserted.** The paper names its closest predecessors and states the difference: in a comparison table for technical work, in a positioned literature discussion for other work. "We combine known practices" needs exactly this. (judg) |
| K04 | S1 | C | The works and positions the paper discusses are the ones a field expert would expect, and the direct competitors are among them. (judg) |
| K05 | S1 | B | **Evidence is proportional to the claim.** The element named in the title or the first contribution is the best-supported one. A broad framework, theory or interpretation needs correspondingly broad support. Otherwise the framing narrows to what was shown. This was the reason for a real desk reject. (judg) |
| K06 | S1 | B | The title promises only what the paper delivers. "Systematic review" means a finished systematic review; "measurement-based" means measurements; "a theory of" means a theory. (judg) |
| K07 | S1 | B | Abstract, introduction and conclusion state each finding at the strength the body supports. No headline rests on the weakest part of the work. (judg: `claim-evidence-audit`) |
| K08 | S2 | B | Strong words ("first", "novel", "significant", "proves", "always", "unprecedented") are backed by a result, a citation or a test. (auto hint: lint H11) |
| K09 | S2 | C | Load-bearing adjectives are quantified or defined: "low-cost", "negligible", "widespread", "representative". (semi) |
| K10 | S2 | B | A proposed framework, model or architecture comes with a demonstration or an evaluation, or is explicitly framed as a proposal. (judg) |
| K11 | S2 | B | Open problems the paper raises come with at least one concrete direction. (judg) |
| K12 | S2 | B | Fashionable topics appear only where they do work in the argument. Real case: a paragraph on a trending technique was "out of context" to the expert. (judg) |
| K13 | S3 | — | The **strengths to protect** are listed: honest limitations, a precise scope, a clean dataset, a careful reading. No fix may erode them. (judg) |

### M — Method and validity (paradigm-aware)

The type pack (§7) adds the detailed standard. These checks hold for every paradigm.

| Id | Sev | Fix | Check |
|---|---|---|---|
| M01 | S1 | B | The approach is named: experiment, survey, observational study, interviews, ethnography, case study, simulation, design and evaluation, proof, archival or textual analysis, review, or argument. It fits the question. (semi) |
| M02 | S1 | C | The procedure is described well enough for a peer to replicate or audit it. That means the protocol (quantitative), the procedures and analytic process (qualitative), the assumptions and definitions (theoretical), the corpus and how it was read (textual or historical), or the search (review). (judg) |
| M03 | S1 | B/C | **Nothing is true by construction or by assumption.** No result that the design guarantees, and no conclusion contained in its premises, is offered as a finding. (judg) |
| M04 | S1 | B | Planned and post-hoc work are told apart. An analysis, a theme or a case chosen after seeing the material is labelled exploratory and does not carry the headline. (judg) |
| M05 | S1 | C | Claims of pre-registration, a protocol or a prior plan have dated proof (a registry entry, a commit, a timestamped file). (semi) |
| M06 | S0 | B | **The method is described as done only if it was done.** An unexecuted step is written as planned, or the paper waits. (judg) |
| M07 | S1 | B/C | **Rival explanations and confounds.** The factor the text credits can be isolated by the design. Otherwise the text names what actually varied, and discusses the alternatives. (judg) |
| M08 | S1 | C | The limits of the setting are discussed: a laboratory, a synthetic testbed, a convenience sample, one archive, one institution, a selected corpus. Results are scoped to them, or presented as an upper or lower bound where that applies. (judg) |
| M09 | S1 | B/C | Limitations or threats to validity are specific to this design, each with its consequence and any mitigation. Use the paradigm's own terms: validity for quantitative work; trustworthiness for qualitative work; scope conditions for theory. A boilerplate list does not count. (judg: `validity-threats-sweep`) |
| M10 | S2 | B | Deviations between plan and execution are reported. (semi) |
| M11 | S1 | C | **Too good to be true is audited.** A perfect score, a unanimous sample, a flawless fit or an effect far larger than the literature reports gets a check for leakage, selection, circularity or error before it stays. Lint H16 lists numeric candidates. (judg) |
| M12 | S2 | B/C | The conclusions follow from the results and answer the question asked. (judg) |

### X — Evidence and materials

| Id | Sev | Fix | Check |
|---|---|---|---|
| X01 | S0 | C | **Every number, quotation and specific fact traces** to its source: a data file and its key, a script, a transcript and line, an archive and folio, a proof and lemma. A figure or table with no source behind it is S0. (semi: `numbers-traceability`) |
| X02 | S1 | C | Key results are **re-derived** where possible: the code re-run, the statistics recomputed, the proof re-checked, the quotation re-read in the source. In real projects, re-running found wrong counts and a false bound that reading had missed. (semi) |
| X03 | S1 | A | Counts are counts. "19 experiments" read off the highest experiment number while 14 exist is the canonical error. A column or category never mixes two definitions. (semi) |
| X04 | S1 | B | **Denominators are explicit.** A result computed on a subset is not placed beside the size of the whole as if it covered it. Reviewers read that as dishonesty, not imprecision. (judg) |
| X05 | S1 | C | The materials the paper points to match the submitted version: the cited version, tag or deposit, every named file present, versions agreeing. (semi) |
| X06 | S1 | C | Materials are available as the venue and field expect: data, code, instruments, interview guides, codebooks, protocols, supplementary files. They are reachable without the authors' login and carry persistent identifiers. Where they cannot be shared (privacy, consent, licence, IP, security), the paper says why and what access exists. (semi) |
| X07 | S2 | C | Supplementary materials are usable: a README that maps each result to its file or command, pinned versions, one entry point. (semi) |
| X08 | S1 | C | Materials leak nothing: no personal data beyond what consent allows, no credentials, no internal paths, no AI co-author trailers (lint H13, H19). Material already cited by a submission is archived, never deleted. (semi) |
| X09 | S2 | C | Method details and provenance survived cuts for length. Diff against the previous version for what was removed. (semi) |
| X10 | S2 | C | Translations of quotations are attributed (the authors' or a published translation), and the original is available where it matters. (semi) |

### W — Writing, presentation and figures

| Id | Sev | Fix | Check |
|---|---|---|---|
| W01 | S2 | B | A reader gets the **main points** from the abstract and introduction without effort, with no sentences overloaded with numbers or qualifiers. (judg) |
| W02 | S3 | A | Terms and acronyms are defined at first use, including before their first table or figure. (auto hint: lint H09) |
| W03 | S3 | A | Terminology and notation are consistent throughout. (semi) |
| W04 | S1 | B | **The text does not read as unsupervised AI output.** It gives specific examples, makes the authors' own judgments, compares rather than lists, and avoids generic paragraphs. In one real review this impression alone produced the decisive Strong Reject. (judg; `tortured-phrase-screen` gives hints) |
| W05 | S2 | B | No self-defeating sentence: a limitation is justified by scope, not by circumstance ("we could not obtain the text"). (auto hint: lint H06) |
| W06 | S2 | B | Each figure, table and long quotation earns its space. Material that repeats a sentence is cut, and the space goes where the method or argument needs it. (judg) |
| W07 | S2 | A/C | Figures are legible at print size and in greyscale, colour-blind safe, labelled with units, and honest in scale. Images keep the resolution the venue requires, and reproduced images have permission (E10). (semi) |
| W08 | S3 | A | Captions are self-contained: what is shown, the sample, what the error bars or symbols mean. (semi) |
| W09 | S3 | A | Language and house style: grammar, a consistent variety of English (or the venue's language), number and date formats, the venue's citation style. Changes here leave the content regression identical (§2, step 8). (semi: `language-pass`) |

### E — Ethics, integrity, anonymity and AI policy (gate)

| Id | Sev | Fix | Check |
|---|---|---|---|
| E01 | S0 | A | Under anonymous review: no names, affiliations, funders, acknowledgments, identifying links, or document metadata (lint H07, H14). (auto) |
| E02 | S0 | B | Under anonymous review, the authors' own work is cited in the third person or blinded, never "our previous work". (auto) |
| E03 | S0 | A | Under a non-anonymous regime, the paper is not left anonymized from a previous venue. The availability statements carry the real links. (semi) |
| E04 | S0 | A | No AI system is an author or co-author anywhere: the paper, the materials, the commit history. (auto: lint H19) |
| E05 | S1 | B | AI use is disclosed where and as the venue requires, at the level it was actually used: drafting is not "language editing". A disclosure that an earlier submission carried is never removed. (semi: `ai-use-disclosure`) |
| E06 | S1 | C | AI-generated or AI-altered images are declared. No image that is itself data is generated or manipulated beyond what the venue's image-integrity policy allows. (semi) |
| E07 | S0 | C | Research with people or animals states its ethics approval, consent and data protection without breaking anonymity. Examples: IRB, CEP/CONEP, a REC, an animal-ethics committee. (semi) |
| E08 | S0 | C | Authorship follows the venue's criteria (e.g. ICMJE); contributions are stated where required; conflicts of interest and funding are declared and true. (semi) |
| E09 | S0 | C | No plagiarism, duplicate publication or salami-slicing. Text reused from the authors' own work is disclosed where the venue requires. (semi) |
| E10 | S1 | C | Permission is held for reproduced figures, long quotations, images of people, and copyrighted or licensed material. (semi) |
| E11 | S1 | C | Harm is considered where it can occur: vulnerable groups, sensitive locations, dual-use findings, security vulnerabilities (disclosed to whoever can fix them before publication). (semi) |

---

## 7. Type packs — what the article *is*

Pick every type that applies. Its verdict joins the overall verdict (§4).

### QN — Quantitative empirical
Experiments, quasi-experiments, observational studies, surveys, measurements, benchmarks,
simulations. Reporting guidelines are on the EQUATOR Network; empirical-standards references
are the ACM SIGSOFT Empirical Standards and the APA JARS.

| Id | Sev | Fix | Check |
|---|---|---|---|
| QN01 | S1 | C | Variables, measures and instruments are defined, with their validity and reliability where they are constructs. (semi) |
| QN02 | S1 | C | The sample size is justified (power, precision, or a stated constraint). The sampling frame and the recruitment are described. (semi) |
| QN03 | S1 | C | Randomness and replication: stochastic procedures are repeated, the number of runs and the seeds are stated, and no single sample is quoted as a property of the system. (semi) |
| QN04 | S2 | A/C | Every estimate has its uncertainty (SD, SE, CI, IQR), and the paper says which. Values are recomputed from per-unit data where it exists (A); otherwise the fix is C. (semi) |
| QN05 | S2 | C | Tests suit the design and the data; their assumptions are checked; effect sizes come with intervals; multiple comparisons are corrected. (semi: `stats-sanity-check`) |
| QN06 | S2 | C | Missing data, exclusions and outliers are reported, with how they were handled. (semi) |
| QN07 | S1 | C | Baselines and comparison groups are fair and equally treated: the same tuning effort, configuration and measurement. (judg) |
| QN08 | S2 | B | Summaries fit the data: no "up to X %" that hides the distribution; precision no finer than the error; ratios reported where absolute values belong to one machine or one setting. (semi) |
| QN09 | S2 | C | Sensitivity of the conclusions to key choices (thresholds, windows, model specification) is shown or bounded. (judg) |
| QN10 | S2 | C | For simulations: the model is described, verified and validated, and its parameters are justified. (semi) |

### QL — Qualitative
Interviews, focus groups, ethnography, document analysis, grounded theory, phenomenology,
discourse analysis. References: SRQR, COREQ.

| Id | Sev | Fix | Check |
|---|---|---|---|
| QL01 | S1 | C | The paradigm and approach are named and fit the question (e.g. thematic analysis, grounded theory, IPA). (semi) |
| QL02 | S1 | C | Sampling is purposive and justified. Participant characteristics are given. The point of stopping (saturation, information power) is argued. (semi) |
| QL03 | S1 | C | Data collection is described: guide, setting, duration, recording, transcription, language and translation. (semi) |
| QL04 | S1 | C | The analysis is traceable: who coded, how codes became themes, the codebook or an example of the chain. (semi) |
| QL05 | S1 | B/C | Trustworthiness is addressed (credibility, transferability, dependability, confirmability), for instance through triangulation, member checking, peer debriefing or an audit trail. (judg) |
| QL06 | S1 | B | The researchers' reflexivity is stated: position, relationship to participants, and how it may shape the reading. (semi) |
| QL07 | S1 | B | Quotations support the themes they illustrate, come from a spread of participants, and are not chosen only for eloquence. Counter-cases are discussed. (judg) |
| QL08 | S0 | C | Participants cannot be re-identified from quotations or descriptions beyond what consent allows. (semi) |

### MX — Mixed methods
Reference: GRAMMS.

| Id | Sev | Fix | Check |
|---|---|---|---|
| MX01 | S1 | C | The reason for mixing is stated, together with the design (convergent, explanatory or exploratory sequential). (semi) |
| MX02 | S1 | C | Integration is shown where it happens (joint display, linked analysis), not just two studies side by side. (judg) |
| MX03 | S2 | C | Each strand meets its own standard (QN, QL). (semi) |

### RV — Reviews
Systematic reviews, scoping reviews, rapid reviews, meta-analyses, umbrella reviews, mapping
studies and narrative reviews. References: PRISMA 2020, PRISMA-S, PRISMA-ScR, MOOSE,
Kitchenham & Charters, Petersen et al., GRADE.

| Id | Sev | Fix | Check |
|---|---|---|---|
| RV01 | S0 | B | A paper calls itself "systematic" or "scoping" only if the process is **finished**: every database searched, screening complete, every question answered with synthesis. Otherwise it is retitled (e.g. "a narrative review", "a literature-grounded framework"). Real case: an instant reject. (semi) |
| RV02 | S1 | C | The protocol is defined a priori, registered or available (PROSPERO, OSF), and deviations are reported. (semi) |
| RV03 | S1 | C | The full search for each source is given: the string, the platform, the date, limits and filters. (auto: grep) |
| RV04 | S1 | C | Inclusion and exclusion criteria are explicit and operational. (semi) |
| RV05 | S1 | C | Screening and extraction are done by **two or more independent reviewers**, with agreement (κ) and conflict resolution. A single screener, or an LLM used as a screener, is declared with its error or divergence rate. (semi) |
| RV06 | S2 | A | A flow diagram is present and its numbers add up at every stage. (auto: arithmetic) |
| RV07 | S2 | C | Complementary methods are used (snowballing, hand search, grey literature), and the search is validated against a known set. (semi) |
| RV08 | S2 | C | Risk of bias or quality is appraised with an instrument chosen a priori; venue prestige is not a proxy. (semi) |
| RV09 | S1 | C | The synthesis is real: a framework, a classification, a meta-analysis or a narrative synthesis with explicit method. A study-by-study list is not one. (judg) |
| RV10 | S2 | C | Meta-analysis: the model choice, heterogeneity, sensitivity analyses, small-study effects and certainty of evidence (GRADE) are reported. (semi) |
| RV11 | S2 | B | Narrative review: the scope and how sources were chosen are stated honestly, and no systematic claim is made. (semi) |
| RV12 | S2 | C | Supplementary package: the protocol, the search strings, the screening decisions, the extraction sheet. (semi) |

### TH — Theoretical, mathematical and formal

| Id | Sev | Fix | Check |
|---|---|---|---|
| TH01 | S1 | B | Every theorem, proposition or model is stated precisely, with all its assumptions explicit and in one place. (semi) |
| TH02 | S0 | C | Proofs are complete. Every step is justified, and "it is easy to see" hides nothing that a referee would need to check. Each gap is a finding at the severity of the result it supports. (judg) |
| TH03 | S1 | C | The result is placed against known results: does it generalize, specialize or contradict them? Is it already known under another name? (judg) |
| TH04 | S2 | B | Notation is defined before use and is consistent. Definitions are not circular. (semi) |
| TH05 | S2 | C | The limits of the result are shown: counterexamples when an assumption is dropped, and tightness of bounds. (judg) |
| TH06 | S2 | C | Computer-assisted proofs, formal verifications or numerical evidence are reproducible: code, tool versions and the checked artifact. (semi) |
| TH07 | S2 | B | A conceptual or verbal theory has defined constructs, explicit propositions and stated boundary conditions, and at least one way it could be shown wrong. (judg) |

### DS — Design, engineering and artifacts
New systems, tools, methods, devices or processes evaluated against a need. References: design
science research (Hevner et al.), the SIGSOFT engineering-research standard.

| Id | Sev | Fix | Check |
|---|---|---|---|
| DS01 | S1 | C | The problem and the requirements come before the solution and stand on their own. (semi) |
| DS02 | S1 | C | The artifact is described well enough to rebuild or obtain it. (semi) |
| DS03 | S1 | C | The evaluation tests the artifact against the stated requirements, in a realistic setting, against fair alternatives. A toy example is not called a case study. (judg) |
| DS04 | S2 | C | All relevant costs are measured, not only the favourable effect: time, resources, energy, usability, maintenance. (semi) |
| DS05 | S2 | C | The evaluation platform matches the claim: real hardware, users or sites when the claim is about them. Simulation is justified and labelled. (judg) |

### CS — Case studies and case reports
References: Yin; Runeson & Höst; CARE for clinical case reports.

| Id | Sev | Fix | Check |
|---|---|---|---|
| CS01 | S1 | C | Why this case: its selection logic (typical, extreme, critical, revelatory) is stated. (semi) |
| CS02 | S1 | C | The context is described so readers can judge transfer. (semi) |
| CS03 | S2 | C | Multiple sources of evidence are triangulated, with a chain of evidence from data to conclusion. (semi) |
| CS04 | S1 | B | Generalization is analytic (to theory), not statistical. Claims beyond the case are framed accordingly. (judg) |
| CS05 | S0 | C | Clinical case reports: patient consent, de-identification and the CARE items. (semi) |

### AR — Argumentative, humanities, essays, position and vision papers
For history, philosophy, law, literary and cultural studies, theology and policy analysis, and
for essays, position papers and vision papers in any field.

| Id | Sev | Fix | Check |
|---|---|---|---|
| AR01 | S1 | B | The thesis or position is stated early and clearly. A reader can say in one sentence what the paper argues. (semi) |
| AR02 | S1 | B/C | The argument's structure is visible. Each step is supported by evidence or reasoning, and the conclusion follows from the steps without a leap. (judg) |
| AR03 | S1 | C | The strongest counterarguments and rival interpretations are engaged in their best form, not as straw men. (judg) |
| AR04 | S1 | C | The state of the debate (historiography, literature, case law, doctrine) is accurately represented, and the paper's place in it is clear. (judg) |
| AR05 | S1 | C | Primary sources are used where the claim needs them, are cited precisely (edition, page, folio, article), and are read in context. Secondary claims are not presented as primary findings. (semi) |
| AR06 | S2 | B | Key terms are defined and used consistently; anachronism and equivocation are avoided. (judg) |
| AR07 | S2 | B | Position and vision papers: the stakes, the audience and what should change are explicit. It is not a research paper without evidence presented as one. (judg) |
| AR08 | S2 | A | Citation style follows the field's convention (Chicago, MLA, Bluebook, OSCOLA, ABNT), notes and bibliography agree, and quotations are exact. (semi) |

### SW — Software, data and resource papers
References: FAIR principles, JOSS, Scientific Data and Data in Brief guidance, Datasheets for
Datasets.

| Id | Sev | Fix | Check |
|---|---|---|---|
| SW01 | S0 | C | The resource is publicly available under a stated licence, with a persistent identifier and a version. (semi) |
| SW02 | S1 | C | Documentation is enough to install, use or load it. For data: a schema, provenance, collection method and known limits (a datasheet). (semi) |
| SW03 | S1 | C | Quality is demonstrated: tests, validation of the data, coverage, error rates. (semi) |
| SW04 | S2 | C | Reuse is shown with use cases or users, against existing alternatives. (judg) |
| SW05 | S2 | C | Maintenance, contribution and citation paths are stated (CITATION file, contact, governance). (semi) |

---

## 8. Field and format packs

### 8.1 Health and life sciences
Reporting guidelines from the EQUATOR Network: CONSORT for trials, SPIRIT for protocols, STROBE
for observational studies, STARD for diagnostic accuracy, TRIPOD for prediction models, ARRIVE
for animal research, CARE for case reports, PRISMA for reviews, SRQR/COREQ for qualitative work,
CHEERS for economic evaluations. Use the matching checklist in full; the items below are the
ones most often missed.

| Id | Sev | Fix | Check |
|---|---|---|---|
| HE01 | S0 | C | The study is registered when the design requires it (trial registry, PROSPERO), and the registration id is in the abstract where required. (semi) |
| HE02 | S0 | C | Ethics approval, informed consent and data protection are stated (E07). (semi) |
| HE03 | S1 | C | The completed reporting checklist and flow diagram are supplied, as the journal requires. (semi) |
| HE04 | S1 | C | Primary and secondary outcomes are pre-specified, and outcome switching is reported. (semi) |
| HE05 | S1 | B | Clinical significance is distinguished from statistical significance; absolute effects are given beside relative ones. (judg) |
| HE06 | S2 | C | Sex and gender are reported as the SAGER guidelines ask. Populations are described well enough to judge applicability. (semi) |

### 8.2 Computing, engineering and other technical fields
Each pack below is activated when the field matches. Each was built from real reviews.

**ML — Machine learning** (NeurIPS checklist, REFORMS, Pineau, Arp et al.)

| Id | Sev | Fix | Check |
|---|---|---|---|
| ML01 | S1 | C | No leakage: nothing fitted on the test set, no duplicates across splits, no temporal leakage, no in-sample "held-out" set. Real case: an F1 of 1.000 reported as held-out was a training-set fit. (judg) |
| ML02 | S1 | C | The dataset is described: statistics, splits, exclusions, prevalence, origin. (semi) |
| ML03 | S1 | C | Baselines get the same tuning budget, simple non-ML baselines are included, and no baseline is weakened until it loses. (judg) |
| ML04 | S2 | C | Hyperparameter search space, selection method (not on test data) and final values are reported, with compute. (semi) |
| ML05 | S2 | B | Metrics fit the problem (imbalance, base rates). Scores are not compared across prevalences. (judg) |
| ML06 | S2 | C | Generalization and distribution shift are evaluated on unseen data. (judg) |
| ML07 | S1 | B | An LLM used inside the method is specified: model, version, prompts, date. (semi) |

**SC — Security and privacy** (calls of USENIX Security, IEEE S&P, NDSS, ACM CCS; Carlini et al.)

| Id | Sev | Fix | Check |
|---|---|---|---|
| SC01 | S1 | C | The threat model is explicit: capabilities, knowledge, access, goals, trust assumptions, what is out of scope. (semi) |
| SC02 | S1 | B/C | Every attack cited carries its preconditions (privilege, access) and its known mitigations. (judg) |
| SC03 | S1 | B | The chain adversary → threat → control is explicit and traceable. (judg) |
| SC04 | S1 | C | Defenses are evaluated against adaptive attackers. (judg) |
| SC05 | S1 | B | SoK papers contribute a taxonomy or a new viewpoint, and are titled as the venue requires. (judg) |

**AU — Automotive, safety-critical and regulated systems** (ISO/SAE 21434, ISO 26262, ISO 21448, UN R155/R156, AUTOSAR)

| Id | Sev | Fix | Check |
|---|---|---|---|
| AU01 | S1 | B | Platforms, middleware and protocols are classified correctly. Example: AUTOSAR Adaptive is an execution platform, not "a communication standard". (judg) |
| AU02 | S1 | B | Isolation claims cover spatial and temporal isolation. Roots of trust are contrasted precisely: microkernel versus TEE. (judg) |
| AU03 | S1 | B | The boot and trust chain is the one the platform actually uses. (judg) |
| AU04 | S2 | A | Domain acronyms are defined and disambiguated. (semi) |
| AU05 | S1 | B/C | A scenario borrowed from a source stays inside its operational design domain. The authors' own assumptions are marked as theirs. (judg) |
| AU06 | S2 | B | Compliance claims (ASIL, certification) are framed as design intent unless a safety case exists. (judg) |

**SY — Systems, embedded and benchmarking** (Heiser's "benchmarking crimes"; the SIGPLAN checklist)

| Id | Sev | Fix | Check |
|---|---|---|---|
| SY01 | S1 | C | The platform is fully specified: hardware and clock, memory, OS, compiler and flags, versions. (semi) |
| SY02 | S1 | B/C | Simulation, emulation and hardware results are labelled and never mixed. Determinism claims are scoped to the conditions measured. (judg) |
| SY03 | S2 | C | Benchmarks are standard, or subsetting is justified. Microbenchmarks are not sold as application performance. (judg) |
| SY04 | S2 | C | Warm-up, steady state, repetitions, per-benchmark and absolute numbers are given. (semi) |

### 8.3 Format packs — *how long* and *for what*

**SH — Short formats** (work-in-progress, short paper, poster, extended abstract, letter)

| Id | Sev | Fix | Check |
|---|---|---|---|
| SH01 | S1 | B | One contribution, stated plainly. Do not compress a full paper into the short format (scope cramming). (judg) |
| SH02 | S2 | B | Preliminary results are labelled as preliminary, with what comes next. (semi) |

**LG — Long formats** (journal article over the usual length, book chapter, thesis, dissertation, monograph)

| Id | Sev | Fix | Check |
|---|---|---|---|
| LG01 | S1 | C | A chapter fits the volume's theme and the editors' brief, in length and audience. (semi) |
| LG02 | S1 | C | A thesis follows the institution's rules (structure, front matter, length, language, similarity threshold, required statements). (semi) |
| LG03 | S2 | B | The whole is coherent: chapters connect, terms do not drift, and the introduction promises what the conclusion delivers. Run the core domains per chapter and once more on the whole. (judg) |
| LG04 | S1 | C | Material reused from published articles is disclosed, with permission where the publisher requires it. (semi) |

### 8.4 Your field
A field not covered here gets a pack in the project. Write `venue/review-pack.md` with a table
in the same format: id prefix `FX`, severity, fix class, check. The panel reads it as a field
pack. When a pack proves itself on two projects, propose it upstream, so the next project
starts with it.

---

## 9. Lessons from real reviews

Each row is a real event, anonymized, stated as a general rule with the case as its example.
The cases come from technical fields, where this protocol was first used. Every rule holds for
any article.

| # | Rule | The case | Checks |
|---|---|---|---|
| 1 | Do not call unfinished work by the name of the finished method | a "systematic review" submitted while screening was "ongoing" and one database "to be done"; instant reject | RV01, H01, K06 |
| 2 | The scope fits the length | a review, an architecture, a threat matrix and measurements in 6 pages: "each part without depth" | SH01, K05, V03 |
| 3 | Field precision is what experts check first; vagueness reads as unsupervised AI | misclassified platforms and undefined acronyms, called "largely AI-driven … limited human oversight": a Strong Reject that outweighed two Weak Accepts | W04, R1 role, AU01–AU04 |
| 4 | Every cited effect carries its conditions | an attack cited without its privilege preconditions | SC02, R04 |
| 5 | The rendered PDF is the paper | about ten citations, including the one to the data, printed as `[?]`: "unpublishable as-is" | H02–H04 |
| 6 | The paper is self-contained | core concepts defined only in the authors' inaccessible "in press" paper | R12 |
| 7 | The headline rests on the strongest evidence | the headline came from a post-hoc analysis that benefited from a convenient simplification of the setting | M04, M08, K07 |
| 8 | What the design guarantees is not a finding | most compared differences held "by construction" | M03 |
| 9 | The review history and the authors' circumstances stay out of the text | "in response to review" and "the standard was not available to the authors" in the paper | H06, W05 |
| 10 | Space goes to what the reader cannot reconstruct | a generic diagram took the space that the procedure details needed | W06, M02 |
| 11 | Novelty is shown against named predecessors | "what exactly is new over known practices?" from two reviewers | K03, K04 |
| 12 | The element in the title is the best-evaluated one | a broad framework whose main component was "illustrative rather than experimentally evaluated"; the version sent still had a placeholder | K05, H01 |
| 13 | Method, citation in the body, template and length are the venue's first filters | a review rejected twice for no selection method, references never cited in the text, the wrong template, and half the expected length | RV03–RV05, H04, V02, V03 |
| 14 | Every reference is verified, not trusted | invented co-authors, wrong titles and nonexistent works in agent-drafted bibliographies across about ten projects | R01 |
| 15 | The source says what the sentence says | numbers credited to the wrong reference; a source's criterion inverted; a study described as another kind of study | R04 |
| 16 | Borrowed scenarios, cases or definitions keep their original conditions | a scenario placed outside the conditions of the system it was borrowed from | AU05, R04 |
| 17 | Normative texts are cited by the right clause | a standard cited by the wrong clause | R10 |
| 18 | A perfect result is a question, not an answer | a held-out score of 1.000 that was a training-set fit; a failure credited to a factor the design could not isolate | M11, M07, ML01 |
| 19 | Counts are counted | "19 experiments" read off the highest number while 14 existed; one column with two definitions supported a false claim | X03 |
| 20 | Denominators are explicit | a score on a subset next to the size of the whole corpus | X04 |
| 21 | Re-derive before you print | a "below 0.1 ms" bound was one fast sample; ten runs said 0.156 ms. Re-running found it, reading did not | X02, QN03 |
| 22 | Cutting for length must not cut provenance | seeds, versions and the table carrying the contribution vanished in a cut | X09 |
| 23 | Public materials match the submitted version | the public repository was two versions behind; a named script did not exist | X05 |
| 24 | AI involvement is disclosed, never hidden after the fact | an AI co-author trailer in public materials; removing an existing disclosure was considered and rejected | E04, E05, X08 |
| 25 | Each venue's rules are read fresh | a paper kept anonymized for a venue that was not anonymous, with no data link | P02, E03 |
| 26 | Formal limits are numbers, checked | 302 words for a 250-word abstract; missing biographies and author identifiers | V04–V06 |
| 27 | Load-bearing adjectives are measured; questions can fail | "low-cost" four times with no cost; a research question answerable only "yes" | K09, K01 |
| 28 | Methods are reported as done only when done | screening steps described in the past tense before they ran | M06 |
| 29 | Placeholders are counted, not estimated | 154 placeholder macros where 33 were believed; a figure drawn from data that did not exist | H01, X01 |
| 30 | Secrets never enter the record | credentials in committed project notes; one internal note publicly reachable | H13, X08 |

When a real review arrives, quote it in `reviews/` (CONSTITUTION rule 18). If it raises
something no check catches, add a row here and a check upstream. A lesson kept in one
project's memory is lost to the next.

---

## 10. Reviewer anti-patterns (applied to the virtual reviewers)

At lead verification (step 5), drop any finding that:

- **Is not specific and actionable.** It must name the place and what is missing. "Lacks
  novelty" without the prior work it duplicates is not a finding.
- **Is an invalid criticism.** Examples: an arbitrary sample size with no argument; faulting a
  replication, a negative result or a qualitative design for being one; preferring a different
  method or school; asking a case study to generalize statistically.
- **Contradicts another finding**, such as "too long" and "missing details" for the same section.
- **Reviews the paper the reviewer would have written** rather than the one submitted.
- **Asks for work unrelated to the question** of the paper.
- **Imposes one paradigm's standard on another** (rule 4).
- **Uses the checklist as a "gotcha"** instead of as support for judgment.

---

## 11. Output formats

### Finding
```
VR-<domain>-<nn> · <check id> · S<0-4> · class <A|B|C> · <reviewer> · confidence <1-5>
Where:    <file>:<line> | PDF p.<n> §<section>
Evidence: "<the exact text>"  or  <source → location → value>
Problem:  <one sentence>
Fix:      <what to change, or what would close it>
Status:   verified | rejected (why) | uncertain — applied | proposed d-NNNN | todo t-NNNN
```

### `reviews/virtual/<YYYY-MM-DD>-r<N>.md`
```markdown
---
id: virtual-review-<YYYY-MM-DD>-r<N>
title: Virtual review round <N> — <venue>
date: <YYYY-MM-DD>
manuscript: <file> @ <commit or editor version>
classification: type <QN|QL|…> · field <…> · format <…>
venue: <venue> (<review regime>)
panel: R0 <model>, R1 <model>, R2 <model>, R3 <model>, R4 <model>, R5 <model>
gate: blocked | open
overall: Strong Reject | Weak Reject | Weak Accept | Strong Accept
---

# Virtual review — round <N>

## Verdicts
| Domain / pack | Verdict | S0 | S1 | S2 | S3 | Main reason |
|---|---|---:|---:|---:|---:|---|

## Venue form (as the real reviewers would fill it)

## Strengths to protect

## Findings
<one block per finding, in the format above, grouped by domain and pack>

## Applied
- class A: <list> · class B: <list, each with its d-NNNN>
- where: <branch or dated copy>; content regression: identical | <differences, each justified>

## Decisions
- **[#d-NNNN]** date: <YYYY-MM-DD> · status: proposed · author: <the human who asked for the review>
  **<the class B change>**
  Before: "<…>"  After: "<…>". Why: <finding id>. Cost: <what it gives up>.

## Todos
- **[#t-NNNN]** status: open · author: <name> — <class C item, what closes it, who can>
```

### Report to the human
Write it in the human's language and put the sections in this order:

1. The classification.
2. The gate.
3. The verdict table.
4. The overall verdict.
5. The venue-form scores.
6. What was applied.
7. What waits on you.
8. What waits on evidence.
9. The three changes that would move the verdict most, cheapest first.

No finding appears in the report that is not in the record.

---

## 12. Sources

**Reporting standards across fields**
- EQUATOR Network (equator-network.org): CONSORT, SPIRIT, STROBE, STARD, TRIPOD, ARRIVE, CARE,
  PRISMA 2020, PRISMA-S, PRISMA-ScR, MOOSE, SRQR, COREQ, CHEERS, SAGER
- APA Journal Article Reporting Standards (JARS-Quant, JARS-Qual, JARS-Mixed)
- GRAMMS (O'Cathain et al.)
- GRADE
- ACM SIGSOFT Empirical Standards (github.com/acmsigsoft/EmpiricalStandards)

**Reviews and case studies**
- Kitchenham & Charters, EBSE-2007-01
- Petersen et al., doi:10.1016/j.infsof.2015.03.007
- Runeson & Höst, doi:10.1007/s10664-008-9102-8
- Yin, *Case Study Research*

**Design and resource papers**
- Hevner et al., "Design Science in Information Systems Research"
- FAIR principles
- JOSS review criteria
- Datasheets for Datasets (arXiv:1803.09010)
- Model Cards (arXiv:1810.03993)

**Machine learning and security**
- NeurIPS Paper Checklist
- REFORMS (reforms.cs.princeton.edu)
- Pineau, ML Reproducibility Checklist
- Arp et al., USENIX Security 2022
- Carlini et al., arXiv:1902.06705
- Calls for papers of USENIX Security, IEEE S&P, NDSS and ACM CCS
- The Menlo Report

**Systems**
- Heiser, "Systems Benchmarking Crimes"
- SIGPLAN Empirical Evaluation Checklist
- ACM Artifact Review and Badging

**Ethics and integrity**
- ICMJE Recommendations
- COPE guidance: authorship and AI tools, citation manipulation
- The generative-AI policies of Elsevier, IEEE, ACM, Springer Nature, Wiley, Taylor & Francis and SAGE
- Crossref and Retraction Watch data
- Think.Check.Submit

**On reviewing**
- Smith, "The Task of the Referee"
- Allman, "Thoughts on Reviewing"
- Cormode, "How NOT to review a paper"
- Keshav, "How to Read a Paper"
- The reviewer guidelines of Elsevier, Springer Nature and the major society publishers
