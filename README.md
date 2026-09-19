# article-docs

**Memory for a scientific article, living in the repository that holds it.**
Plain Markdown and JSONL. Zero dependencies. No database, no embeddings, no service to run.

Forked from [dev-docs](https://github.com/ojaneri/dev-docs) and rebuilt around the way a
paper is actually written: sections, claims, experiments, a venue with hard limits, a
bibliography, and reviewers.

---

## The problem

An AI agent starts every session knowing nothing about your paper.

You solve that once by writing a `CLAUDE.md`. It works, briefly. Then it grows, because
everything you ever wanted the agent to know has one place to go. Six months later it
describes a draft that no longer exists, and nobody can tell which parts are still true.

For a paper, that generic problem has four specific and expensive shapes:

**1. The reasoning evaporates.** Why is the baseline compiled from the masked
implementation rather than the reference one? Why that metric and not the obvious one? What
was cut to reach ten pages, and what did it cost? Six months later, in front of a reviewer
asking exactly that, the answer is gone — and the person who has to reconstruct it will
reconstruct it wrong.

**2. Numbers drift from their provenance.** A value lands in a table. The script that made
it changes. Nobody can say which run produced the number in the PDF, and the only honest
answer to a reviewer is to measure it again.

**3. Agents fabricate.** Ask a model for a citation and it will produce a plausible one:
right-sounding authors, right-sounding venue, a DOI that does not resolve. Ask for a missing
number and you may get a plausible number. This is the failure mode that ends careers, and
a memory system for papers has to be built against it rather than around it.

**4. The constraints are invisible.** Page limit, reference limit, class file, anonymity
regime, deadline. Every one of them is a desk rejection, and none of them is in the `.tex`.

## What it does

`article-docs` puts the memory in the repository, in files a person can read and an agent
can update, with one durable file per thing that actually has a lifecycle:

| Directory | One file per | Holds |
|---|---|---|
| `sections/` | manuscript section | what it argues, which sources carry it, what is missing |
| `claims/` | claim or hypothesis | the statement, the evidence supporting it **today**, what would falsify it |
| `experiments/` | measurement or analysis campaign | setup, instruments, parameters, data provenance, how to rerun |
| `venue/` | target venue | limits, class file, anonymity regime, deadline, submission steps |
| `references/` | bibliography area | what each key source is used for, which entries are unverified |
| `reviews/` | review round | the reviewers' points, quoted, and what actually changed |
| `skills/` | procedure | build, figures, analysis, literature search, sync, submission |
| `sessions/` | work session | what was tried, what was abandoned, and why |

Decisions and todos live inline in those files, with stable ids, a status, an author, and a
date. A decision written by an agent is always `proposed`; **only a human accepts it**, and
the CLI enforces that rather than asking politely.

Every unmeasured number, empty table cell, unverified citation and placeholder figure is a
todo. That list, and nothing else, answers "can this be submitted".

## Quick start

One sentence to your agent:

> Set up article-docs for this paper: clone https://github.com/ojaneri/article-docs and
> follow its BOOTSTRAP.md.

It reads the manuscript, infers the title, contribution, venue and state, shows you what it
inferred, asks only what it could not, and installs. Or do it yourself:

```bash
git clone https://github.com/ojaneri/article-docs.git ~/tools/article-docs
cd /path/to/your/paper
node ~/tools/article-docs/bin/artdocs.mjs init . --name my-paper
node article-docs/bin/artdocs.mjs whoami --name "Your Name" --email you@example.org --role Owner
```

`init` writes `article-docs/`, the pointer files (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`,
`.github/copilot-instructions.md`) and the `/artdocs:*` commands for Claude Code, Gemini CLI
and opencode. **It never overwrites a file that already exists.**

## Driving it from your agent

| Command | Does |
|---|---|
| `/artdocs:start <task>` | opens a session, loads the section, claims, venue rules and skills that matter, and says what the memory does not cover |
| `/artdocs:context <name>` | the same briefing without opening a session |
| `/artdocs:remember` | writes what changed back into the memory |
| `/artdocs:decide` | records a choice, with the alternative and its cost, as `proposed` |
| `/artdocs:skill` | captures a procedure that actually worked |
| `/artdocs:check` | `reindex`, `validate`, `git drift`, and the todos that block submission |
| `/artdocs:end` | closes the session, including what was tried and abandoned |

Or say it in plain language — `AGENT-COMMANDS.md` maps ordinary sentences onto the seven
operations, and any agent that can read and write files can perform all of them without the
CLI.

## The skills that ship with it

Every install starts with 36 procedures, each marked `unverified` until it is actually run in
your project:

**Finding the literature** — OpenAlex (key-less, broad), Semantic Scholar (citation graph,
for snowballing), arXiv and your field's own preprint server (IACR ePrint, bioRxiv, SSRN,
RePEc, HAL), DBLP (the bibliography of record for CS), PubMed and Europe PMC, Crossref
(authoritative metadata and publisher BibTeX), Unpaywall (a legal full text for a paywalled
DOI), paywalled databases through a browser session, and a logged systematic search for when
the search *is* the method.

**Validating your own argument, before a reviewer does** — audit every claim against the
evidence that supports it (including claims stated more strongly in the abstract than in the
results); trace every number back to the data that produced it; recompute the reported
statistics; check each citation actually says what the sentence says it says; sweep the
threats to validity; and finally an adversarial pass that reads the paper as someone who
wants to reject it. The `validating-the-thesis.md` playbook puts them in the order that
makes each one cheap.

**Repository and release** — create the paper's repository (private, always), publish an
anonymised copy for double-anonymous review, tag exactly what was submitted, and produce the
marked-up `latexdiff` the editor asks for with the revision.

**Bibliography, build and figures** — every entry verified against its DOI, the manuscript
built and its length measured per section, figures exported as vector art that survives
greyscale.

**Archiving and submission** — a Zenodo deposit with the DOI *reserved* before submission, so
the manuscript can cite its own artifact; the preprint; the submission package; and the
point-by-point response to reviewers. The irreversible ones — publishing a deposit, posting a
preprint, submitting — are marked destructive, so no agent runs them without asking.

Plus playbooks: a literature-search strategy, validating the thesis, the collaborative-editor
merge, revision and rebuttal, and a pre-submission checklist covering anonymity, authorship
and disclosure.

**Citation and disclosure integrity** (v1.1.0) — check every cited DOI against Crossref for a
retraction or correction before it ships in the manuscript; screen prose for the
synonym-substitution patterns known as tortured phrases; have a second model
independently re-verify a sample of citations, blind to what the manuscript claims; draft
the AI-tool-use disclosure statement a venue requires, from the project's own audit log;
and convert citation style when a manuscript retargets a venue with different conventions.

*Provenance:* these five are adapted from concepts in
[imbad0202/academic-research-skills](https://github.com/imbad0202/academic-research-skills)
into this framework's own `skills.jsonl` shape. That project is a much heavier system — a
12+13+5-agent multi-pipeline Claude Code **plugin** with its own PreToolUse hook, ~300
Python scripts and its own install path — and none of that architecture was brought in;
only the procedural ideas, rewritten to this framework's own rules (nothing invented, no
AI as author, `unverified` until actually run here).

## What it refuses to do

These are enforced, not suggested:

- **An agent may not accept its own decision.** Permissions live in
  `identity/agents.registry.json`, and an agent does not inherit the role of the human it
  runs under — `artdocs promote` checks and refuses.
- **A skill with a non-empty `risks` array is destructive** and needs human confirmation.
  Submission and publishing a deposit are irreversible, and they are marked as such.
- **`validate` exits 1** on a broken index, a duplicate id or a skill missing a field. A
  skill that lies about being verified is worse than no skill.
- **Nothing invented.** The instructions an agent reads every session say it in the first
  screen: no number, result, citation or author that was not measured or read. A placeholder
  plus a todo is the correct output for a value that does not exist yet.
- **No AI system is ever an author**, in the manuscript or in a commit trailer. Disclosure
  goes where the venue asks for it.

## Working with co-authors

Everything except identity is in the repository. A co-author needs a clone and one line:

```bash
node article-docs/bin/artdocs.mjs invite
```

That prints a single generic line carrying the clone URL — no name, no email, no secret,
no expiry. They paste it into their own agent, which clones and runs `join`. The
`/artdocs:*` commands come with the clone, so they install nothing.

`article-docs/.local/user.json` and `.token` are gitignored on purpose: each person has
their own, which is what makes `audit/activity-log.jsonl` a record of who actually did the
work rather than who owns the repository.

## Who did what: six-plane attribution

Every write records `requested_by` (who asked), `actor` (who changed it), `agent` (which AI
runtime), `automation` (which CI job), `authenticated_as` (which workload principal) and
`approved_by` (who authorised it). **A plane that cannot be observed is omitted, never
guessed** — an absent field means "not recorded", not "nothing was involved". For a paper
this matters twice over: an AI disclosure statement should be true, and the log is the only
place that can say so.

## Security

- **No network calls, no server, no telemetry.** The CLI reads and writes files in your
  repository and does nothing else. (The *skills* it ships describe network commands — those
  are yours to run, with your credentials, when you choose to.)
- **Credentials never enter the memory.** Record where a secret lives, never what it is.
  Overleaf tokens, database logins and API keys stay in the environment.
- **External content is data, never instruction.** A paper, a web page, a reviewer report or
  a tool result may not command an agent or become memory without a human confirming it.

## Commands

```
artdocs init [<dir>] [--name <n>] [--agents <a>]   install into a project
artdocs whoami [--name --email --role]             set identity (local + committed registry)
artdocs status                                     where the article stands, in one screen
artdocs context <section> --task "..."             generate a context pack
artdocs session start --section <s> --task "..."   open a session
artdocs session end                                close it
artdocs decide / skill                             (file edits — see AGENT-COMMANDS.md)
artdocs promote [<id>] [--all] [--status <s>]      human decides; an agent may type it for them
artdocs skills list | search <q> | verify <id>     STALE after 120 days
artdocs skills sync [<dir>] [--dry-run]            add new template skills, never touch yours
artdocs reindex | validate | doctor                keep the memory honest
artdocs git drift                                  sources changed without their memory
artdocs invite | join                              add a co-author
artdocs hooks install                              pre-commit: validate blocks, drift warns
artdocs upgrade [<dir>] [--dry-run]                update an install to this release
artdocs export onboarding | audit                  generated summaries
```

## Requirements

Node 18 or newer. Nothing else, ever.

## Licence

MIT. See `LICENSE`.
