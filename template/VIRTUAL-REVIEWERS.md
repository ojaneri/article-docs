# VIRTUAL-REVIEWERS — the pre-submission review protocol

> **What this is.** The procedure an agent follows when asked to review an article before it is
> submitted: `/artdocs:virtual-review <article> [--apply]`. A panel of virtual reviewers
> examines the manuscript domain by domain. Each domain gets a verdict —
> **Strong Accept · Weak Accept · Weak Reject · Strong Reject** — with its findings and the fix
> for each. With `--apply`, the fixes that can be made without new data are made, and the
> rest become todos.
>
> **Where it came from.** It distils real reviews, internal audits of 25 article projects run
> with article-docs, and the published reviewing standards listed at the end. Every lesson in
> §8 happened to a real paper. That is why each one is phrased as a check rather than as advice.
>
> This file is framework-owned: `upgrade` replaces it. Put project-specific additions in
> `venue/` (venue rules) and in `reviews/` (what real reviewers said about this paper).

---

## 1. Ground rules

1. **The rendered PDF is what reviewers read.** Every check that can be run on the PDF is run on
   the PDF, after a fresh build. A clean source with a stale PDF is not clean.
2. **Nothing is invented to close a gap.** No number, reference, standard clause, result or
   co-author opinion is written into the paper unless it was read from a source in this run.
   If the evidence does not exist, the finding is "this has no evidence". The fix is then a
   measurement, a weaker claim or a stated limitation: those three, never a fourth.
3. **Every S0 and S1 finding is verified by the lead before it is acted on.** A reviewer agent
   can be wrong. The lead re-reads the line, the data file or the source and records
   *verified*, *rejected* or *uncertain* on the finding.
4. **Independence.** Reviewers do not share context with each other or with the session that
   drafted the text. Where several models are available, use a different one for each role (§3).
5. **Nothing leaves the machine.** Fixes are applied on a local branch. Nothing is pushed to a
   remote, an Overleaf project, a submission system or an artifact repository without the
   human asking for that specific push. A co-author's edits on the collaborative editor are
   fetched before anything is changed (`skills/playbooks/overleaf.md`).
6. **Authorial choices stay authorial.** The title, the author list and order, the venue, and
   whether to drop a contribution are proposed and never decided by the agent (§5, class B).
7. **The checklist supports judgment; it does not replace it.** A "no" that the paper itself
   justifies, in the text, is downgraded one severity level (§4). Reviewer anti-patterns (§9)
   apply to the virtual reviewers too.

---

## 2. The run, step by step

```
locate → pre-flight → lint → panel → lead verification → verdicts → apply → rebuild → loop → record → report
```

### Step 0 — Locate the article
The argument is a project directory, a main `.tex` or a PDF. Resolve:
the main `.tex` (`\documentclass`), its `\input` closure, the `.bib`/`\bibitem`s, the build log
and PDF, the artifact repository named in the paper, and the memory (`article-docs/`). Read
`venue/`, `claims/`, `experiments/`, the open todos and the previous rounds in `reviews/`
before reading the paper. An objection that an earlier round already answered is not new.

### Step 1 — Pre-flight on the memory (domain **P**)
Run the P checks (§6). If the memory cannot name the target venue and its rules, stop. Ask the
human: about a third of the problems below depend on the venue.

### Step 2 — The deterministic pass
```bash
node article-docs/bin/artdocs.mjs review lint <main.tex> --json [--pages-max N] [--abstract-max N] [--anon|--no-anon]
```
It runs checks H01–H19 offline: placeholders, the build log, the PDF through poppler, the
bibliography, anonymity, template tampering, hidden text, credentials and AI co-author
trailers. It exits 1 while any S0 remains. Its findings go to the panel as given facts. They
are not re-derived by reading.

### Step 3 — The panel
Each reviewer gets the manuscript, the lint report, `venue/` and its own domains. It returns
findings in the §10 format. Reviewers run in parallel when the tool allows it.

### Step 4 — Lead verification
The lead walks every S0/S1 finding against the source (rule 3). It merges duplicates across
reviewers and drops findings that fall under §9. Then it assigns each surviving finding a fix
class (§5).

### Step 5 — Verdicts
Per domain, then overall, by the rules in §4. A **Weak Reject** or **Strong Reject** in a gate
domain (P, V, H, R, E) blocks submission whatever the other domains say.

### Step 6 — Apply (only with `--apply`)
§5. Class A and class B fixes are written on the branch `virtual-review/<YYYY-MM-DD>`. Class C
fixes become todos.

### Step 7 — Rebuild and loop
Rebuild (`latex-build`) and re-run the lint. Then re-run only the reviewers whose domains still
hold S0/S1, plus R5 if the text changed. Stop when a round finds no new S0/S1, or after
`--rounds` rounds (default 3).

Before closing, run the **number-set regression**: extract every number from the PDF text before
and after the fixes. The two sets must be equal, except for numbers that a finding changed from
a data file and that the record names.

### Step 8 — Record
Write `reviews/virtual/<YYYY-MM-DD>-r<N>.md` (§10). Register decisions (`d-NNNN`, status
`proposed`) and todos (`t-NNNN`) inside it, then run `reindex`. `reindex` reads `reviews/`, so
they show up in `status` and `promote`.

### Step 9 — Report to the human
Answer in the human's language. The report contains:

1. The gate: submittable or not.
2. The verdict table, one row per domain.
3. The overall verdict.
4. The scores the venue's real form would get.
5. What was applied, in classes A and B, with the branch name.
6. What waits on the human or on data (class C).
7. The three changes that would raise the overall verdict most, cheapest first.

---

## 3. The panel

| Role | Reads as | Domains | Model guidance |
|---|---|---|---|
| **R0 Editor / pre-screen** | an editor-in-chief deciding desk-reject in ten minutes: title, abstract, contributions, figures, conclusion, then the venue rules | P, V, K (fit and contribution), E (policy) | strong model |
| **R1 Domain expert, hostile** | the reviewer with the highest confidence and the lowest score. They know the standards and platforms better than the authors | K, domain packs, technical precision in M | strongest model available |
| **R2 Methodologist** | design, validity, statistics, baselines | M, packs SR/ML method items | strong model |
| **R3 Data versus artifact** | every number in the paper against the files that produced it. Re-run what can be re-run | X | mid model, with shell access |
| **R4 References** | every entry against Crossref/DBLP/arXiv/the publisher, and key citations against the cited text | R | mid model, with web access |
| **R5 Language and venue style** | the venue's author guide and an editor's red pen | W, venue formatting in V | small model is enough |

Why R1 is hostile: in one real review, a single Strong Reject from a high-confidence expert
outweighed two Weak Accepts. An average score hides that reviewer, so the panel simulates them.

A panel of one model playing six roles is weaker but acceptable. Say so in the record.

---

## 4. Severity, verdicts and scores

### Severity of a finding

| Level | Name | Meaning | Examples |
|---|---|---|---|
| **S0** | Blocking | desk reject or unpublishable as-is, whatever the merit | `[?]` in the PDF, placeholder in the text, nonexistent reference, page or template violation, anonymity broken, missing mandatory section, AI listed as author, credential in the paper |
| **S1** | Critical | the central claim does not survive | claim without evidence, headline component not evaluated, leakage, unfair baseline, single run of a stochastic method, method described as executed but not executed |
| **S2** | Major | weakens confidence or reproducibility, fixable | no dispersion, no effect size, generic threats to validity, incomplete artifact, density that hides the main points |
| **S3** | Minor | clarity, presentation, completeness | acronym undefined at first use, float never referenced, incomplete bib entry |
| **S4** | Suggestion | optional improvement | an extra figure, a stronger title |

Downgrade one level when the paper states the gap itself and justifies it in the text
("we did not evaluate X because Y"). Never downgrade S0.

### Verdict per domain

| Verdict | Rule |
|---|---|
| **Strong Reject** | any S0, or two or more S1 |
| **Weak Reject** | one S1, or three or more S2 |
| **Weak Accept** | one or two S2, no S0/S1 |
| **Strong Accept** | only S3/S4, or nothing |

A domain that does not apply (the SR pack in an experimental paper) is reported as `n/a`, not as
Strong Accept.

### Overall verdict
- **Gate:** any S0 anywhere → overall **Strong Reject**, status *not submittable*.
- Otherwise the overall verdict is the **worst** of the gate domains (P, V, H, R, E) and of
  K, M and X. W and the packs can lower the result by one level and cannot raise it.
- Report the confidence of each reviewer (1–5). Flag a spread of two or more verdict levels
  between reviewers for the human: that is where a real panel splits.

### Translating into the venue's own form
Fill the form the venue actually uses, recorded in `venue/`. When the venue's form is unknown,
use the JEMS-style form.

| Form field | Fed by |
|---|---|
| Relevance to the venue (1–3) | V08, K07 |
| Readability and organization (1–5) | W |
| Related work (1–5) | K03–K06, R |
| Technical content (1–5) | M, X, packs |
| Originality and contribution (1–5) | K |
| Overall (1 Strong Reject … 5 Accept) | overall verdict: Strong Reject 1, Weak Reject 2, Weak Accept 4, Strong Accept 5; 3 = borderline, when reviewers split |
| Confidence (1–3) | the R1 confidence, rescaled |

**Other forms:**
- **0–10 ranking** (e.g. an engineering congress): 2 / 4 / 6.5 / 8.5 for the four verdicts.
- **Journal decisions**: Strong Accept = Accept/Minor, Weak Accept = Minor/Major, Weak Reject = Major/Reject & Resubmit, Strong Reject = Reject.

---

## 5. Fix classes — what `--apply` may do

| Class | What it is | Under `--apply` |
|---|---|---|
| **A — mechanical** | changes no meaning: build errors, broken `\cite`/`\ref`, overfull boxes, missing figure path, acronym expanded at first use, bibliography metadata corrected *from the record fetched in this run*, uncited `\bibitem` removed, template spacing restored, anonymity switch, PDF metadata, spelling, venue style | applied |
| **B — authorial wording** | changes how strong or how framed a statement is: soften an overclaim in the abstract, qualify a baseline as an optimistic bound, rename a confounded variable ("vehicle" → "dataset"), remove editorial meta-language, define a concept the paper inherited, add an existing limitation to the abstract, cut a figure that adds nothing | applied on the branch, **each one recorded as a `proposed` decision** with the before/after text. The human accepts it with `promote` or reverts it. It must never change a number, add a claim, remove a stated limitation or change the title or authors |
| **C — needs data or a person** | a new experiment, a re-run, a measurement, a reference not yet verified, the text of a standard, a co-author's figure source, a venue choice, a title | **never applied.** It becomes a todo `t-NNNN` naming what would close it and who can do it |

Rules for applying:
- Start from a clean tree, or record what was dirty. Create `virtual-review/<date>` from the
  current branch. Offer commits per class; do not make them. A commit never carries an AI
  co-author trailer.
- If the manuscript lives in a collaborative editor, fetch it first and work on the fetched
  copy. Pushing back is a separate step the human asks for.
- When a fix needs a citation, add it only if R4 fetched and verified its record in this run.
  Otherwise the fix is class C.
- A class B fix that a previous round's human rejected (`rejected` in `reviews/`) is not
  re-applied. The reason is quoted in the new record instead.

---

## 6. The domains and their checks

Format: **Id · Sev · Fix · Check** — *how*. "lint Hnn" means `review lint` already decides it.
Type tags: (auto) a script decides it; (semi) the agent locates and judges lightly; (judg)
expert judgment.

### P — Pre-flight on the memory (gate)

| Id | Sev | Fix | Check |
|---|---|---|---|
| P01 | S0 | C | `venue/` names **one current** target, with the source and date of each rule and a list of what is *not verified*. An old target is marked superseded, not left under a new header. (semi) |
| P02 | S1 | C | The review regime (open / single / double anonymous) is read from the venue's current call, not carried over from the previous venue. (semi) |
| P03 | S2 | C | The decisions this version rests on are `accepted`; none is left `proposed`. (auto: `status`) |
| P04 | S2 | A | `CLAUDE.md`/project notes and `article-docs/` agree on venue, authors and status; where they disagree, the memory is corrected or the divergence is recorded. (semi) |
| P05 | S1 | C | The deadline is known and not past. Page, abstract and reference limits are recorded as numbers. (semi) |
| P06 | S2 | C | If this project is a fork of another (v2, resubmission), the record says which one it supersedes, and text reused from it is known (V09). (semi) |
| P07 | S1 | C | The collaborative editor has no co-author edits newer than the local copy. (semi: `overleaf.md`) |
| P08 | S3 | C | One published paper from the target venue has been dissected: sections, word counts, number of references, figures, what it does that this paper does not (`venue/exemplar.md`). (judg) |

### V — Venue fit and formal compliance (gate)

| Id | Sev | Fix | Check |
|---|---|---|---|
| V01 | S0 | B | Page count within the limit, in the venue's class file and options, counted on the PDF. Main body and references/appendix are counted as the venue counts them. (auto: lint `--pages-max`) |
| V02 | S1 | A | The venue's template is unmodified: no negative `\vspace`, `\linespread`, geometry or float-spacing changes. (auto: lint H08) |
| V03 | S0 | C | Length is **also not too short** for the venue. One real paper of 5 pages was rejected as "superficial" where the venue's median was 12. (semi) |
| V04 | S0 | B | Abstract within the word limit; keywords within the count and format the venue requires. (auto: lint `--abstract-max`) |
| V05 | S0 | B | Mandatory sections present with the venue's exact names: ethics considerations, open science / data availability, LLM-usage statement, author biographies, contact section, conflicts of interest, funding. (semi) |
| V06 | S1 | A | Required metadata: ORCID for every author where IEEE asks for it, corresponding author, affiliations in the venue's format. (semi) |
| V07 | S0 | A | Reference style and order as the venue wants (numbered by first citation, alphabetical, author–year). File-format and size limits for the submission (e.g. ≤ 2 MB, DOCX required). (semi) |
| V08 | S0 | C | **Scope fit.** The type of contribution is one the venue accepts. Examples recorded in projects: a journal of industrial informatics rejects a pure measurement study; a security venue rejects ML robustness work with no adversary. (judg) |
| V09 | S0 | C | No undisclosed overlap with another submission or publication of the same group, including forks of this project. Plagiarism-checker thresholds (e.g. ≤ 15 %) are respected. (semi) |
| V10 | S0 | A | No hidden text and no instruction aimed at an LLM reviewer. (auto: lint H17) |
| V11 | S2 | B | Commercial tone avoided where the venue forbids it (each product named once, no marketing adjectives). (semi) |

### H — Build and document hygiene (gate)

| Id | Sev | Fix | Check |
|---|---|---|---|
| H01 | S0 | A/C | No placeholder survives: `TODO`, `TBD`, `\todo`, `\tbd`, `\PH{}`, `\phn`, `\hl`, red markup, "to be done", "Scopus still to be searched". A placeholder standing for an **unmeasured number** is class C, never "filled". One real submission went out with `\tbd` in the abstract and was desk-rejected. (auto) |
| H02 | S0 | A | Build log clean: no undefined citation or reference, no missing file, no fatal error; the log is newer than the sources. Overfull boxes are S2. (auto) |
| H03 | S0 | A | The rendered PDF has no `[?]`, no `??`, no visible TODO, and is newer than the sources. (auto) |
| H04 | S0 | A | Every cited key is in the bibliography. Every `\bibitem` is cited in the text: a reference list longer than the citations reads as padding, and one venue rejected a paper for it. (auto) |
| H05 | S3 | A | Every figure and table is referenced in the text and its file exists. (auto) |
| H06 | S1 | B | No editorial meta-language: "in response to review", "previous round", "reviewers pointed out", "not available to the authors". That belongs in the response letter. (auto) |
| H13 | S0 | C | No credential in the manuscript or the memory. If one is found, remove it and rotate it, because it is already in git history. (auto) |
| H14 | S1 | A | All fonts embedded, no Type 3 bitmap fonts, PDF not encrypted, metadata correct for the review regime. (auto) |
| H18 | S2 | A | Built from a clean checkout: no uncommitted figure, no file only on one machine, no test PDFs or `remove-before-submission/` folders in the source package. (semi) |

### R — References and citation integrity (gate)

| Id | Sev | Fix | Check |
|---|---|---|---|
| R01 | S0 | A/C | **Every** entry exists: title, authors, year and venue match Crossref, DBLP, arXiv or the publisher. Checked on 100 % of entries, not a sample. Invented co-authors, wrong titles and nonexistent papers were found in real projects. A wrong field is corrected from the record (A); an entry that cannot be found is removed together with its claim, or kept as a todo (C). (semi: `bib-verify-entries`) |
| R02 | S1 | A | Every DOI resolves and resolves to *this* work. A preprint with a published version is cited as the published version. (semi) |
| R03 | S1 | C | No cited work is retracted or under an expression of concern without the paper saying so. (semi: `citation-retraction-check`) |
| R04 | S1 | B | **The source says what the sentence says.** Numbers attributed to a reference come from that reference and not from a neighbouring one. A criterion is reported in the direction the source states it. A study is described as the kind of study it is. Every sentence that attributes a number or a finding to a citation is checked against the cited text. (judg: `citation-context-check`) |
| R05 | S1 | C | Every claim of a gap ("no prior work", "the first") survived a dated search of the literature named in the record. Real case: a reviewer pointed to the post-quantum secure-boot protocols the paper said did not exist. (judg: `lit-search-*`) |
| R06 | S1 | C | Paragraphs that assert facts carry citations. Quantitative claims about risk, cost or prevalence cite a source, or come from the paper's own data. (semi) |
| R07 | S2 | C | Foundational definitions cite their origin. Example: a paper titled on "forensic readiness" cites who defined forensic readiness. (judg) |
| R08 | S2 | C | No low-credibility or predatory venue among the references that carry an argument. (semi) |
| R09 | S2 | C | Self-citation is pertinent and not excessive. Under anonymous review it is in the third person (E02). (semi) |
| R10 | S1 | C | Standards are cited by the right clause, checked against the official table of contents. Real case: an IDS cited to the validation clause instead of the monitoring clause. (semi) |
| R11 | S2 | C | URLs to tools, datasets and standards are live and have an access date. A mutable web page is not a primary source where the venue forbids it. (semi; lint lists the URLs) |
| R12 | S0 | C | The paper is **self-contained**. No concept, taxonomy, metric or scenario it needs is defined only in an unpublished, "in press" or inaccessible work. It is defined operationally here. (judg) |

### K — Contribution, claims and novelty

| Id | Sev | Fix | Check |
|---|---|---|---|
| K01 | S1 | B | The problem, objective or research questions are explicit in the introduction. Each RQ can fail: an RQ answered "yes" by construction is reframed as *how well* or *within what limits*. (semi) |
| K02 | S1 | B/C | Contributions are numbered, specific, falsifiable, and each points to the section that supports it. A contribution with no section of evidence is cut or supported. (semi) |
| K03 | S1 | C | **Novelty is demonstrated, not asserted.** A table compares the closest works dimension by dimension, and the text states the delta. "We integrate known practices" needs exactly this. (judg) |
| K04 | S1 | C | Direct competitors discussed in the text appear in the comparison table and are cited. (semi) |
| K05 | S1 | B | **Evidence is proportional to the claim.** The component named in the title or the first contribution is evaluated experimentally, not illustrated. A broad framework needs integrated evidence, not a mosaic. Otherwise the framing narrows to what was measured. This was the reason for a real desk reject. (judg) |
| K06 | S1 | B | The title promises only what the paper delivers: no "measurement-based" without measurements, no "systematic review" without a finished systematic review (SR01). (judg) |
| K07 | S1 | B | Abstract, introduction and conclusion state each result at the strength the results section supports. No headline rests on the weakest part of the setup. (judg: `claim-evidence-audit`) |
| K08 | S2 | B | Strong words ("first", "novel", "state of the art", "significantly", "guarantees", "outperforms") are each backed by a result, a citation or a test. (auto hint: lint H11) |
| K09 | S2 | C | Adjectives that carry the argument are quantified: "low-cost" has a cost, "negligible" has a ratio to the budget, "real-time" has a deadline. (semi) |
| K10 | S2 | B | A reference architecture or framework comes with a proof of concept or an evaluation, or is framed explicitly as a proposal. (judg) |
| K11 | S2 | B | Open problems the paper raises come with at least a concrete direction. (judg) |
| K12 | S2 | B | Fashionable topics appear only where they belong. Real case: a post-quantum paragraph in a paper about isolation was "out of context" to the expert. (judg) |
| K13 | S3 | — | The reviewer can state the paper's **strengths to protect**: honest limitations, the clean artifact, the precise scope. They are listed in the report so that no later fix erodes them. (judg) |

### M — Method, validity and statistics

| Id | Sev | Fix | Check |
|---|---|---|---|
| M01 | S1 | B | The method is named (experiment, case study, benchmark, simulation, design science, systematic review) and fits the question. (semi) |
| M02 | S1 | C | Data collection and analysis are described well enough to replicate. For a synthetic testbed this covers traffic generation, attack execution, randomization, seeds and the construction of ground truth. (judg) |
| M03 | S1 | B/C | **Results that are true by construction are not evidence.** Differences the design guarantees are separated from those it does not, and only the latter are claimed. (judg) |
| M04 | S1 | B | Confirmatory and exploratory analyses are separated. An analysis added after the confirmatory runs, written with knowledge of the testbed, is labelled exploratory and does not carry the headline. (judg) |
| M05 | S1 | C | Pre-registration claims ("predictions recorded before the runs") have dated proof, such as a commit or a timestamped file. (semi) |
| M06 | S0 | B | **The method is described in the past tense only if it was executed.** A step that has not run is written as planned, or the paper waits. (judg) |
| M07 | S1 | B/C | **Confounds.** The variable the text names (vehicle, platform, attack) can be isolated by the design. Otherwise the text names what was actually varied, such as the dataset, and lists the confounds. (judg) |
| M08 | S1 | C | Simplifications of the testbed that favour the result (a fixed IP per account, a single seed, attacks repeated on the training ID) are discussed. The result is presented as an optimistic bound where they apply. (judg) |
| M09 | S1 | C | Stochastic methods run several times, with the number of runs and the seeds stated. A single sample is not quoted to six decimals as a property of the system. (semi) |
| M10 | S2 | A/C | Every mean or median has its dispersion, and the caption says which dispersion it is (SD, SE, IQR, CI). The value is recomputed from the per-run data where it exists (A); otherwise C. (semi) |
| M11 | S2 | C | Claimed differences have a test suited to the design, an effect size with a CI, a correction for multiple comparisons, and checked assumptions. (semi: `stats-sanity-check`) |
| M12 | S2 | B | Summary statistics fit the data: a geometric mean for normalized ratios, no "up to X %" when the distribution is 4/6/7/49 %. Precision is no finer than the error. (semi) |
| M13 | S1 | B/C | Threats to validity cover construct, internal, external and conclusion validity. Each is tied to this design with a mitigation; a boilerplate list does not count. (judg: `validity-threats-sweep`) |
| M14 | S2 | B | Deviations between plan and execution are reported. (semi) |
| M15 | S2 | C | Sensitivity of the conclusions to key parameters (thresholds, window sizes, timeouts) is shown or bounded. (judg) |
| M16 | S1 | C | **Too good to be true is audited.** For 100 %, F1 = 1.000, zero misses or improvements of three orders of magnitude, check leakage, in-sample evaluation, separability by construction and a weakened baseline before the number stays. Lint H16 lists the candidates. (judg) |
| M17 | S2 | B | Absolute numbers that belong to the host are reported as ratios that survive another machine. Example: 0.9 % of the message period, rather than "below 0.1 ms". (judg) |
| M18 | S2 | B/C | Alternative explanations of the main result are discussed. (judg) |

### X — Evidence, numbers and artifacts

| Id | Sev | Fix | Check |
|---|---|---|---|
| X01 | S0 | C | **Every number traces.** Each number in the paper names the file and key (or script and command) that produces it. A number no current script reproduces is either reproduced or removed. A figure drawn from data that does not exist is S0. (semi: `numbers-traceability`) |
| X02 | S1 | C | Key results are **re-run** where the environment allows. Real projects found wrong counts and a false latency bound only on re-running, never by reading. (semi) |
| X03 | S1 | A | Counts are counts: "19 experiments" read off the highest experiment number while 14 exist is the canonical error. The same column never mixes two definitions (unique IDs versus simulated ECU IDs). (semi) |
| X04 | S1 | B | **Denominators are explicit.** A metric computed on a subset is not placed next to the size of the whole corpus as if it covered it. Reviewers read that juxtaposition as dishonesty, not imprecision. (judg) |
| X05 | S1 | C | The public artifact matches the submitted manuscript. Its tag or commit is the one the paper cites, every script the paper names exists in it, and the version numbers agree. (semi) |
| X06 | S1 | C | The artifact link resolves without the authors' session and has a DOI pinned to a version (Zenodo or similar). Under anonymous review it is an anonymized mirror that stays in sync (E03). (semi) |
| X07 | S2 | C | The artifact README maps each table and figure to a command and an expected run time. Reproduction comes in tiers: regenerate from saved results in minutes, recompute from datasets, run on hardware (optional). Dependencies are pinned and there is one entry point. (semi) |
| X08 | S1 | C | No secret, internal URL, personal path or AI co-author trailer in the artifact or its history (lint H13, H19). An artifact already cited by a submission is archived, never deleted. (auto + semi) |
| X09 | S2 | C | Reproducibility metadata survived page cuts: interpreter and library versions, seeds and schedules. Diff against the previous version for what the compression removed. (semi) |
| X10 | S2 | C | Hardware-dependent results offer recorded traces or an emulation mode, so an evaluator can check them without the board. (semi) |

### W — Writing, presentation and figures

| Id | Sev | Fix | Check |
|---|---|---|---|
| W01 | S2 | B | A reader gets the **three or four main points** from the abstract without effort: no long sentences packed with numbers and qualifiers. (judg) |
| W02 | S3 | A | Every acronym is defined at first use, in the text and before its first float. (auto hint: lint H09) |
| W03 | S3 | A | Terms and notation are consistent; every symbol is defined before use. (semi) |
| W04 | S1 | B | **It does not read as unsupervised AI output.** The text uses specific examples, makes the authors' own judgments, compares rather than lists, and gives no generic survey paragraphs. In one real review this impression alone produced the decisive Strong Reject. (judg; `tortured-phrase-screen` as a hint) |
| W05 | S2 | B | No self-defeating sentence: a limitation is justified by scope, not by circumstance ("the standard was not available to us"). (auto hint: lint H06) |
| W06 | S2 | B | Each figure earns its space. A box diagram that repeats a sentence is cut, and the space goes to definitions and method details. (judg) |
| W07 | S2 | A/C | Figures are vector, legible in greyscale, colour-blind safe, with fonts of at least 7 pt at print size. Axes are labelled with units, and truncated axes and log scales are marked. A raster replacing a vector source is fixed with the source (C). (semi) |
| W08 | S3 | A | Captions are self-contained: what is measured, *n*, and what the error bars are. (semi) |
| W09 | S3 | A | Language: grammar, US/UK consistency, the venue's style (serial comma, en dashes, number formatting). Changes here must leave the number set identical (§2, step 7). (semi: `language-pass`) |

### E — Ethics, anonymity and AI policy (gate)

| Id | Sev | Fix | Check |
|---|---|---|---|
| E01 | S0 | A | Under anonymous review: no name, affiliation, funder, acknowledgment, identifying URL or PDF metadata (lint H07, H14). The anonymity switch is a single macro (`\anontrue`). (auto) |
| E02 | S0 | B | Under anonymous review, the paper does not say "our previous work [x]". It cites in the third person or blinds the reference. (auto) |
| E03 | S0 | A | Under a **non**-anonymous regime the paper is not anonymized out of habit from the last venue, and the code-availability note carries the real URL. (semi) |
| E04 | S0 | A | No AI system is an author or co-author, anywhere: paper, artifact, commit trailers. (auto: lint H19) |
| E05 | S1 | B | AI use is disclosed **where this venue requires it**, at the level it was actually used. Code generation is not "language editing". Examples: IEEE puts it in the Acknowledgments; other venues use a dedicated section. Never remove a disclosure that an earlier submission already carried. (semi: `ai-use-disclosure`) |
| E06 | S1 | C | AI-generated or AI-edited figures are declared in the caption. No primary data image is AI-generated. (semi) |
| E07 | S0 | C | Studies with people have ethics approval (IRB/CEP) stated without breaking anonymity, plus consent and PII protection. (semi) |
| E08 | S0 | C | Vulnerabilities found were disclosed to the vendor, or a disclosure plan is stated where the venue requires one. No CVE id appears where the venue forbids it before disclosure (lint H12). (semi) |
| E09 | S1 | B | The ethics section exists in the venue's format where it is mandatory: stakeholders, harms, mitigations, the decision to publish. (semi) |

---

## 7. Domain packs

Activated by the article type recorded in `venue/` or `ARTICLE-MEMORY.md`, or detected from the
text. Several packs can apply to one paper.

### SR — Systematic reviews and mapping studies (PRISMA 2020, PRISMA-S, Kitchenham, Petersen)

| Id | Sev | Fix | Check |
|---|---|---|---|
| SR01 | S0 | B | A paper calls itself a systematic review only if the review is **finished**: screening complete, every database searched, every RQ answered with numbers and synthesis. Otherwise it is retitled, for example to "literature-grounded architecture". This was a real instant reject. (semi) |
| SR02 | S1 | C | The protocol is defined a priori and made available, and deviations are reported. (semi) |
| SR03 | S1 | C | The full search string for each database is given, with the platform, the date, limits and filters. (auto: grep the text) |
| SR04 | S1 | C | Inclusion and exclusion criteria are explicit and operational. (semi) |
| SR05 | S1 | C | Screening and extraction are done by **two or more independent reviewers** with an agreement measure (κ) and conflict resolution. A single screener is justified as a limitation, and an LLM used as a second screener is declared with its divergence rate. (semi) |
| SR06 | S2 | A | A PRISMA flow diagram is present and its numbers add up at each stage. (auto: arithmetic) |
| SR07 | S2 | C | Snowballing and other complementary methods are done; the search is validated against a known set. (semi) |
| SR08 | S2 | C | The quality or risk of bias of the primary studies is assessed with an instrument chosen a priori. Venue rank is not a proxy. (semi) |
| SR09 | S1 | C | The synthesis is real: a framework, a classification, or a meta-analysis where it fits. A list of studies with a sentence each is not a synthesis. (judg) |
| SR10 | S2 | C | The supplementary package is available: protocol, strings, screening results, extraction sheet, scripts. (semi) |

### ML — Machine learning (NeurIPS checklist, REFORMS, Pineau, Arp et al.)

| Id | Sev | Fix | Check |
|---|---|---|---|
| ML01 | S1 | C | **No leakage:** no preprocessing or feature selection fitted on the test set, no duplicates across splits, no temporal leakage, no in-sample "held-out" set. Real case: an F1 of 1.000 reported as held-out was a training-set fit. (judg) |
| ML02 | S1 | C | The dataset is described: statistics, splits, exclusions, prevalence, origin. The choice is motivated. (semi) |
| ML03 | S1 | C | Baselines are fair: the same tuning budget, including simple non-ML baselines, and no baseline reduced until it loses ("strawman"). (judg) |
| ML04 | S2 | C | Hyperparameters: the range searched, the selection method (not on the test set), the final values per model. (semi) |
| ML05 | S2 | B | Metrics suit the problem: imbalance, cost of false positives, base-rate fallacy. F1 is not compared across prevalences. (judg) |
| ML06 | S2 | C | Number of training and evaluation runs, the seeding method, compute used. (semi) |
| ML07 | S2 | C | Generalization and distribution shift are discussed. Evaluation on unseen captures is not optional. (judg) |
| ML08 | S1 | B | An LLM used as part of the method is declared: model, version, prompts, date. (semi) |
| ML09 | S2 | C | New datasets or models come with a datasheet or model card and a license. (semi) |

### SC — Security (USENIX/S&P/NDSS/CCS calls, Carlini et al., Arp et al.)

| Id | Sev | Fix | Check |
|---|---|---|---|
| SC01 | S1 | C | The threat model is explicit: capabilities, knowledge, access, goals, trust assumptions, what is out of scope. (semi) |
| SC02 | S1 | B/C | Every attack cited carries its **preconditions**: required privilege, physical access, the mitigation in silicon or firmware. Real case: a fault-injection attack cited without its kernel-privilege precondition. (judg) |
| SC03 | S1 | B | The adversary model maps explicitly onto the threat table and onto the controls: adversary → threat → control. (judg) |
| SC04 | S1 | C | Defenses are evaluated against adaptive attackers who know the defense. (judg) |
| SC05 | S2 | C | Attacks show practicality: real targets, versions, success rate, cost. (judg) |
| SC06 | S2 | C | Adversary profiles are anchored in documented real attacks. (semi) |
| SC07 | S1 | B | A Systematization-of-Knowledge paper is titled "SoK:" where the venue requires it, and it contributes a taxonomy or a new viewpoint, not a description. (judg) |

### AU — Automotive and safety (ISO/SAE 21434, ISO 26262, ISO 21448, UN R155/R156, AUTOSAR)

| Id | Sev | Fix | Check |
|---|---|---|---|
| AU01 | S1 | B | Platforms, middleware and protocols are classified correctly. Example: AUTOSAR Adaptive is an execution platform whose communication goes through `ara::com` over SOME/IP or DDS; it is not "a communication standard". (judg) |
| AU02 | S1 | B | Isolation claims cover both **spatial** isolation (MMU, SMMU/IOMMU, bus firewalls) and **temporal** isolation (deterministic scheduling, cache partitioning, interrupt control). Microkernels and TEEs are contrasted by their roots of trust, and TEEs are acknowledged to run rich software. (judg) |
| AU03 | S1 | B | The secure-boot chain is the one the platform actually uses. Example: the closed authenticated boot through TF-A (BL1 → BL2 → BL31 → BL32 → BL33) on Arm automotive SoCs, not a generic late-launch model. (judg) |
| AU04 | S2 | A | Domain acronyms are defined, and ambiguous ones are disambiguated. Examples: the EVITA profiles; SHE versus HSM; HW ECC as error-correcting memory versus elliptic-curve acceleration; TA as a GlobalPlatform Trusted Application. (semi) |
| AU05 | S1 | C | Standards are mapped with their scopes kept apart (regulation versus engineering life cycle). Clause numbers are checked (R10). A standard not mapped is justified by scope. (semi) |
| AU06 | S1 | B/C | A scenario borrowed from a source stays inside that source's ODD. The authors' own assumptions are marked as theirs. (judg) |
| AU07 | S1 | C | The evaluation platform matches the claim: real ECU, bus, HIL or a recognized public dataset. Otherwise the simulation is justified and the claim limited. (judg) |
| AU08 | S2 | C | A TARA follows the standard's structure: assets, damage and threat scenarios, attack paths, feasibility, risk and treatment. (semi) |
| AU09 | S2 | C | Claims of ASIL or safety compliance are framed as design intent unless there is a safety case. (judg) |

### SY — Systems, embedded and benchmarking (Heiser's benchmarking crimes, SIGPLAN checklist)

| Id | Sev | Fix | Check |
|---|---|---|---|
| SY01 | S1 | C | The baseline is fair and equally configured (same compiler flags and tuning), and it is the state of the art or the choice is justified. (judg) |
| SY02 | S1 | C | The platform is fully specified: CPU/MCU and clock, memory, OS/RTOS, compiler and flags, library versions. (semi) |
| SY03 | S2 | C | Benchmarks are standard, or the subset is justified. Microbenchmarks are not sold as application performance. (judg) |
| SY04 | S2 | C | All relevant effects are measured, not only the favourable one: latency and throughput, memory and flash, energy, WCET and jitter. (semi) |
| SY05 | S2 | C | Warm-up and steady state are handled, with enough repetitions and per-benchmark results, plus absolute numbers alongside the relative ones. (semi) |
| SY06 | S1 | B/C | Simulation and hardware results are never mixed without labels. Each number states whether it came from silicon, emulation (e.g. QEMU) or simulation. Determinism claims are scoped to the conditions measured (bare metal without interrupts ≠ RTOS). (judg) |
| SY07 | S2 | C | The measurement setup is described: instrument, resolution, grounding and calibration, and an independent timestamp source where timing is the result. (semi) |

---

## 8. Lessons from real reviews

Each row is a real event, anonymized. Venue types are kept because the lesson depends on them.

| # | What happened | Checks |
|---|---|---|
| 1 | A paper titled as a systematic review was submitted while screening was "ongoing" and one database was listed as "to be done". Instant reject. | SR01, H01 |
| 2 | A systematic review, a reference architecture, a threat matrix and PQC measurements were packed into 6 pages: "overly ambitious, leaving each part without depth". | K05, V03, K12 |
| 3 | An expert reviewer found platforms misclassified, TEEs oversimplified, a wrong boot model and undefined acronyms, and called the paper "largely AI-driven … limited human oversight". Strong Reject at high confidence, outweighing two Weak Accepts. | W04, AU01–AU04, W02 |
| 4 | A fault-injection attack was cited without its privilege preconditions. | SC02 |
| 5 | About ten citations, including the one for the code and data, printed as `[?]`: "unpublishable as-is". | H02, H03, H04 |
| 6 | Core concepts were defined only in the authors' "in press" paper, which reviewers could not access. | R12 |
| 7 | The headline result rested on an analysis added after the confirmatory runs, which benefited from a testbed simplification (one fixed IP per account). | M04, M08, K07 |
| 8 | Most differences between the compared profiles held "by construction". | M03 |
| 9 | "In response to review" and "the standard was not available to the authors" were printed in the paper. | H06, W05 |
| 10 | A generic flow diagram took space that the method details needed; the testbed's traffic generation, randomization and ground truth were missing. | W06, M02 |
| 11 | Two reviewers asked what exactly was new over known practices. | K03, K04 |
| 12 | A journal desk-rejected a broad framework paper because its main component was "illustrative rather than experimentally evaluated". The submitted version still held `\tbd` placeholders. | K05, H01 |
| 13 | An engineering congress rejected a review twice for no stated selection method, references never cited in the text, wrong template, and 5 pages where about 12 were expected. | SR03–SR05, H04, V02, V03 |
| 14 | Internal audits found invented co-authors, wrong titles and nonexistent references in agent-drafted bibliographies, in about ten projects. | R01 |
| 15 | Numbers were credited to the wrong reference; a source's criterion was inverted; a robustness study was described as something else. | R04 |
| 16 | A scenario was placed outside the ODD of the system it borrowed. | AU06 |
| 17 | A standard was cited by the wrong clause. | R10 |
| 18 | An F1 of 1.000 reported as held-out was a training-set fit. A cross-dataset failure was attributed to "the vehicle" when the design could not isolate the vehicle. | ML01, M07, M16 |
| 19 | "19 experiments" was read off the highest experiment number; 14 existed. A unique-ID column mixed two definitions and supported a false claim. | X03 |
| 20 | An accuracy computed on 0.5 M frames sat next to "16.8 M frames" in the abstract. | X04 |
| 21 | "Latency below 0.1 ms" was a single fast sample; ten runs measured 0.156 ms. Re-running exposed it, reading did not. | X02, M09, M17 |
| 22 | Seeds and versions disappeared when the paper was cut to the page limit; so did the table that carried the contribution. | X09 |
| 23 | The public repository was two manuscript versions behind, and a script the paper named returned 404. | X05 |
| 24 | An artifact repository carried an AI co-author trailer. Removing the AI disclosure was considered and rejected: the earlier submission already carried it. | E04, E05, X08 |
| 25 | A paper was anonymized for one venue and kept anonymized for the next venue, which was not anonymous; its code note had no URL. | P02, E03 |
| 26 | An abstract of 302 words went to a venue with a 250-word limit; author biographies and ORCIDs were missing. | V04, V05, V06 |
| 27 | "Low-cost" was claimed four times with no cost anywhere; one RQ could only be answered yes. | K09, K01 |
| 28 | A method section described screening steps in the past tense before they had run. | M06 |
| 29 | Placeholder audits counted 154 `\phn` and 27 `\PH` in one manuscript, and one figure drawn from data that did not exist. | H01, X01 |
| 30 | Credentials were found in committed project memory, and one internal note was publicly reachable. | H13, X08 |

When a real review arrives, quote it in `reviews/` (CONSTITUTION rule 18). If it raises
something no check above catches, add a row here and a check upstream in article-docs. A lesson
written only in one project's memory is lost to the next project.

---

## 9. Reviewer anti-patterns (applied to the virtual reviewers)

A finding is dropped at lead verification (step 4) if it:

- is not **specific and actionable**: it must name the section or line and what is missing.
  "Lacks novelty" without the identical prior work is not a finding.
- is an **invalid criticism**: an arbitrary sample size with no power argument, rejecting a
  replication or a negative result for being one, preferring a different method, demanding
  that a case study generalize.
- **contradicts another finding** ("too long" and "missing details" on the same section).
- reviews the paper the reviewer would have written rather than the one submitted.
- asks for analyses unrelated to the research questions.
- treats the checklist as a "gotcha" instead of as support for judgment.

---

## 10. Output formats

### Finding
```
VR-<domain>-<nn> · <check id> · S<0-4> · class <A|B|C> · <reviewer> · confidence <1-5>
Where:    <file>:<line> | PDF p.<n> §<section>
Evidence: "<the exact text>"  or  <data file → key → value>
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
venue: <venue> (<review regime>)
panel: R0 <model>, R1 <model>, R2 <model>, R3 <model>, R4 <model>, R5 <model>
gate: blocked | open
overall: Strong Reject | Weak Reject | Weak Accept | Strong Accept
---

# Virtual review — round <N>

## Verdicts
| Domain | Verdict | S0 | S1 | S2 | S3 | Main reason |
|---|---|---:|---:|---:|---:|---|

## Venue form (as the real reviewers would fill it)

## Strengths to protect

## Findings
<one block per finding, the format above, grouped by domain>

## Applied
- class A: <list> · class B: <list, each with its d-NNNN>
- branch: virtual-review/<date>; number-set regression: identical | <differences, each justified>

## Decisions
- **[#d-NNNN]** date: <YYYY-MM-DD> · status: proposed · author: <the human who asked for the review>
  **<the class B change>**
  Before: "<…>"  After: "<…>". Why: <finding id>. Cost: <what it gives up>.

## Todos
- **[#t-NNNN]** status: open · author: <name> — <class C item, what closes it, who can>
```

### Report to the human
One verdict table, then the overall verdict and the gate, then the venue-form scores, then
"applied", "waiting on you", and "waiting on data". Last come the three changes that would
move the overall verdict most, cheapest first. Use the human's language. No finding appears in
the report that is not in the record.

---

## 11. Sources

Reporting and empirical standards:
- ACM SIGSOFT Empirical Standards: github.com/acmsigsoft/EmpiricalStandards
- PRISMA 2020 and PRISMA-S: prisma-statement.org
- Kitchenham & Charters, EBSE-2007-01
- Petersen et al., IST 2015, doi:10.1016/j.infsof.2015.03.007
- Runeson & Höst, EMSE 2009, doi:10.1007/s10664-008-9102-8

Machine learning:
- NeurIPS Paper Checklist: neurips.cc/public/guides/PaperChecklist
- REFORMS: reforms.cs.princeton.edu
- Pineau, ML Reproducibility Checklist
- AAAI Reproducibility Checklist
- Model Cards (arXiv:1810.03993); Datasheets for Datasets (arXiv:1803.09010)
- Arp et al., "Dos and Don'ts of ML in Computer Security", USENIX Security 2022 (dodo-mlsec.org)

Security venues:
- Calls for papers of USENIX Security, IEEE S&P, NDSS and ACM CCS
- Carlini et al., "On Evaluating Adversarial Robustness" (arXiv:1902.06705)
- The Menlo Report

Artifacts:
- ACM Artifact Review and Badging v1.1
- USENIX Security artifact evaluation (secartifacts.github.io)

Systems and statistics:
- Heiser, "Systems Benchmarking Crimes"
- SIGPLAN Empirical Evaluation Checklist
- Arcuri & Briand, ICSE 2011
- Dror et al., ACL 2018

Generative AI and publication ethics:
- ICMJE; COPE, "Authorship and AI tools"
- Elsevier, IEEE, ACM and Springer Nature generative-AI policies

Citation integrity:
- Crossref with Retraction Watch data
- Think.Check.Submit

On reviewing:
- Smith, "The Task of the Referee"
- Allman, "Thoughts on Reviewing"
- Cormode, "How NOT to review a paper"
- Keshav, "How to Read a Paper"
- IEEE PDF eXpress / Xplore requirements
