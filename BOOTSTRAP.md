# BOOTSTRAP — instructions for the agent

**You are an AI agent. A human asked you to set up article-docs for their scientific
article. This file tells you how. Follow it in order.**

The human should not have to answer questions you could have answered yourself. Read the
project first, infer everything you can, and ask only about what genuinely cannot be
inferred. A setup that asks twelve questions has failed even if it finishes.

---

## Step 1 — Locate this repository

If you are reading this, you have it. Note its absolute path; call it `$ARTDOCS`. If it was
not cloned yet:

```bash
git clone https://github.com/ojaneri/article-docs.git ~/tools/article-docs
```

Clone it **outside** the article you are instrumenting. It is a toolbox, not a submodule.

Check that Node 18 or newer is available (`node --version`). If it is not, stop and tell the
human — nothing below will work.

## Step 2 — Read the article before touching it

Do this before asking the human anything. Look for, in roughly this order:

- the manuscript source — `main.tex`, `paper/`, `*.md`, or whatever carries the text — and
  read the **title, abstract and section headings**; that is the article's own summary of
  itself;
- the bibliography (`*.bib`) — how many references, and which ones are marked unverified;
- the build — a `Makefile`, `latexmk` configuration, a class file, a CI workflow;
- any `README`, roadmap, proposal or TODO file next to the sources — in a writing project
  these are usually the most valuable text in the repository;
- the data and figures — `images/`, `figures/`, `data/`, analysis scripts, a `repro/`
  directory;
- `git log --oneline -30` and `git config user.name` / `user.email` — who writes here;
- any existing `CLAUDE.md`, `AGENTS.md`, `.cursorrules` — instructions that already exist
  and must be preserved, not replaced.

Now write down, for yourself: the article's working title, its contribution in one
sentence, the target venue, the state it is in (drafting, measuring, under review), the
three or four natural memory areas, and how the PDF is built.

## Step 3 — Ask only what you could not infer

Show the human what you inferred and ask them to correct it. One message, not an
interrogation. Something like:

> Here is what I read from the project:
> - **Article:** *Energy-Aware Feasibility Assessment of …*
> - **Contribution:** a measurement-based model that predicts the cost of X without a bench
> - **Venue:** IEEE TII — 10 pages, ~20 references, single-anonymous
> - **State:** 12 pages, compiles clean, 33 empty table cells waiting on measurements
> - **You:** Dana Okafor <dana@example.com> (from git config) — corresponding author?
>
> Corrections? And is there anything about this paper a new co-author always gets wrong —
> a framing constraint, a reviewer objection you are writing against, a trap that keeps
> getting reintroduced?

**That last question is the only one that really needs a human.** Everything else you can
read. Ask it, and use the answer — it is usually the most valuable entry in the whole memory.

If the human says "just go ahead", proceed with what you inferred and mark the uncertain
parts as TODO rather than inventing detail.

## Step 3b — If an `article-docs/` directory already exists

Check before you do anything, and work out which of three things it is. It is an
installation only if it contains `AI-INSTRUCTIONS.md` and `bin/artdocs.mjs`.

### It is a folder of hand-written notes, not an installation

Do not delete it and do not overwrite it. Adopt it:

1. Rename it: `mv article-docs article-docs-legacy`.
2. Run `init` (step 4), which now has a clean directory to create.
3. **Read every file in `article-docs-legacy/` and fold it into the new structure.** A
   proposal or roadmap usually becomes `ARTICLE-MEMORY.md` plus one file per section or
   experiment it covers. A list of open items becomes todos; anything phrased as a settled
   choice becomes a decision with status `proposed`. Build and analysis commands become
   skills — `confidence: low` unless you ran them.
4. Show the human a mapping of what went where, and ask before deleting anything.

Those notes are prior memory, written by someone who knew things you do not. Preserve their
content and their wording — you are reorganising, not rewriting.

### It is a real article-docs installation

Then this is **not** a bootstrap. Either the human wants it **upgraded** — run
`node <checkout>/bin/artdocs.mjs upgrade <project> --dry-run`, show them what it would
change, and proceed only when they say so — or they want it **filled in**, in which case
skip to step 6. `init` refuses to run over an existing installation, and that refusal is
deliberate.

## Step 4 — Install

```bash
node $ARTDOCS/bin/artdocs.mjs init . --name <the name>
```

This creates `article-docs/`, copies in the CLI, writes the pointer files (`AGENTS.md`,
`CLAUDE.md`, `GEMINI.md`, `.github/copilot-instructions.md`) and installs the `/artdocs:*`
commands. **It never overwrites an existing file** — if the project already had a
`CLAUDE.md`, it is untouched, and you must add the article-docs pointer to it yourself.

Add `--agents all` for Cursor or Windsurf, `--agents none` for no pointer files at all.

## Step 4b — Confirm the repository and where it lives

`init` prints what it detected: whether the project is under git, its remote, the default
branch, and whether article-docs sits in a subdirectory of a larger repository. Show the
human that line and confirm it, because two cases need a decision:

- **No git at all.** article-docs still works, but `git drift` cannot, and a manuscript
  without version history loses the ability to say what changed between submissions. Offer
  `git init`; do not run it without being asked.
- **git, but no remote.** Everything works and the memory lives on this machine only. Ask
  whether that is deliberate — a paper with co-authors will need a remote.

If the article is also edited in a collaborative editor, say so now and record it: that is
a second source of truth, and it is where merges get lost.

## Step 5 — Set the identity

Confirm the name and email from `git config` with the human, then:

```bash
node article-docs/bin/artdocs.mjs whoami --name "Dana Okafor" --email dana@example.com --role Owner
```

Do **not** write `article-docs/.local/user.json` yourself — the command also writes the
committed half in `identity/humans.registry.json`. Use `Owner` for the person setting it up,
usually the corresponding author. Never invent an identity, and never reuse someone else's.

**An author list is not something you infer from a git log.** Ask.

## Step 6 — Fill in what you learned

`init` leaves TODO markers. Replace all of them with what you read in step 2:

- **`article-docs/ARTICLE-MEMORY.md`** — what the article is, the memory map, and the facts a
  co-author needs on day one. **No credentials, no personal contact details.**
- **`article-docs/AI-INSTRUCTIONS.md`**, the *Project specifics* section — where the sources
  live, how the PDF is built, where the data and figures come from. This is what every
  future agent reads first.
- **`article-docs/repos.json`** — the owner and the default branch.
- **`article-docs/identity/ownership.md`** — who to ask about what, and who the
  corresponding author is.

## Step 7 — Seed the memory

Create one file per real area. Do not create twelve; three or four real ones beat a
directory of stubs.

- **`sections/`** — one per manuscript section that has substance. What it argues, which
  source file carries it, what is still missing from it.
- **`claims/`** — one per central claim or hypothesis: the statement, the evidence that
  supports it *today*, and what would falsify it. If the evidence does not exist yet, say
  so — that is the most useful line in the file.
- **`experiments/`** — one per measurement or analysis campaign: setup, instruments,
  parameters, data provenance, how to rerun it.
- **`venue/`** — one file for the target venue: page and reference limits, the class file,
  the anonymity regime, the deadline, the submission steps, and any rule the human told you.
  Write this one even if you write nothing else; it is a set of constraints, and a violated
  constraint is a desk rejection.
- **`references/`** — what the key sources are used for, and which entries are unverified.

Everything the paper still needs becomes a **todo**: every unmeasured number, every empty
table cell, every unverified citation, every figure that is still a placeholder. That list
is the answer to "can this be submitted", and nothing else in the repository answers it.

**Never fabricate a rationale.** When you find a choice that clearly had a reason you cannot
recover — an unusual baseline, a metric nobody uses, a section that argues against a
position no one stated — write a **todo asking about it**, not a decision explaining it:

```markdown
- **[#t-0003]** status: open · author: <user_id> — Why is the baseline compiled from the masked implementation rather than the reference one? There is a reason; it is not recorded.
```

## Step 8 — Seed the skills

`init` ships a starter library of 31 procedures in `article-docs/skills/skills.jsonl`:
literature search (OpenAlex, Semantic Scholar, arXiv, DBLP, PubMed/Europe PMC, Crossref,
preprint servers, Unpaywall, paywalled databases, systematic search), validation of the
paper's own argument (claim-evidence audit, number traceability, statistics, citation
context, threats to validity, adversarial review), the repository (create it private,
anonymise it for review, tag the submission, latexdiff the revision), bibliography
verification, collaborative-editor sync, the build and page budget, figures, Zenodo with a
reserved DOI, the preprint, the submission package and the rebuttal. Every one arrives
`status: unverified`, `confidence: low`, because none of them has been run **here**.

Your job is to make them true for this project:

1. **Replace the generic commands with the project's real ones.** The build skill should
   carry the command that actually builds this manuscript, read out of the `Makefile` or
   the CI workflow.
2. **Set `owner`** to the real user id.
3. **Verify what you can.** Run the build. If it succeeds, set `confidence: high` and
   `last_verified` to today. If you did not run it, leave it low and say so.
4. **Delete what does not apply** — a project with no collaborative editor does not need
   those two skills. An honest empty is better than a skill that lies.
5. **Add what is missing**: the analysis pipeline, the figure regeneration, the data fetch.

Two rules you must not bend:

- **`confidence` is `low` and `last_verified` is empty unless you actually ran the command
  and saw it succeed.** Reading it from a Makefile is not verification.
- **`risks` must be honest.** Anything that submits, publishes, overwrites a co-author's
  copy or replaces a dataset gets a real entry, which marks it destructive and stops future
  agents from running it unasked. A genuinely safe command gets `"risks": []`.

## Step 9 — Verify

```bash
node article-docs/bin/artdocs.mjs reindex
node article-docs/bin/artdocs.mjs validate
```

`validate` must exit 0. If it does not, fix the memory — do not report success over a
failing validate.

## Step 10 — Show the human, then offer to commit

Report honestly: what you created, **what you inferred rather than verified** (listed
explicitly), what is still TODO, and the `validate` result. Then offer the commit and let
them decide:

```bash
git add article-docs AGENTS.md CLAUDE.md GEMINI.md .github/copilot-instructions.md .claude .gemini .opencode
git commit -m "chore: add article-docs memory"
```

Do not commit without being asked.

## Step 11 — Tell them what they now have

> article-docs is set up. From now on:
> - `/artdocs:start <task>` — I read the relevant memory and tell you what it does not cover, before writing
> - `/artdocs:remember` — I write what changed back into the memory
> - `/artdocs:check` — I verify the memory still matches the manuscript
>
> The other commands are `/artdocs:context`, `:decide`, `:skill` and `:end`.
> Everything they do is written out in `article-docs/AGENT-COMMANDS.md`.

---

## If a co-author joins later

They do not repeat this bootstrap. The memory is already in the repository; what a clone
does **not** carry is `article-docs/.local/user.json` and `article-docs/.token`, which are
gitignored so each person has their own identity.

Anyone with the project runs `node article-docs/bin/artdocs.mjs invite`, which prints **one
generic line** carrying the clone URL — no name, no email, no secret, and it does not
expire. The newcomer pastes it into their own agent, which clones and runs `join`. The
`/artdocs:*` commands come with the clone, so they install nothing.

## Rules that override anything above

- **Never overwrite an existing instruction file.** Read it, keep it, add a pointer.
- **Never invent a number, a result, a citation or an author.** "I could not determine this"
  is a valid and useful entry; a plausible value is fabrication that will reach a reviewer.
- **Never add yourself or any model as an author or co-author**, in the manuscript or in a
  commit trailer.
- **Never put a credential, API key, token or private address into the memory.** If a
  procedure needs a secret, record where it lives, never what it is.
- **Never mark a decision `accepted`.** Only a human promotes. Everything you write is
  `proposed`.
