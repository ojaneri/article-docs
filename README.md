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

Every install starts with a library of procedures, marked `unverified` until they are run in
your project:

- **Literature search** — OpenAlex (key-less, broad), Semantic Scholar (citation graph, for
  snowballing), arXiv (preprints), Crossref (authoritative metadata and publisher BibTeX),
  and paywalled databases (IEEE Xplore, ACM DL, Scopus, Google Scholar) through a browser
  session with institutional access.
- **Bibliography verification** — every entry checked against its DOI before submission.
- **Collaboration** — Overleaf over the Git bridge, or through a browser session when the
  account has none, with the one rule that prevents the expensive accident: *read the
  update history and rebase onto your co-authors' edits; never overwrite.*
- **Build, figures, artifact archiving, submission** — the last two marked destructive, so
  no agent runs them without asking.

Plus playbooks: a literature-search strategy, the collaborative-editor merge, and a
pre-submission checklist that covers anonymity, authorship and disclosure.

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
artdocs promote [<id>] [--all] [--status <s>]      humans only
artdocs skills list | search <q> | verify <id>     STALE after 120 days
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
