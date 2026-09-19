# Changelog

## v1.2.0 — 2026-09-19

### Changed — `promote` no longer requires a terminal
§6b of `AGENT-COMMANDS.md` said an agent may never run `artdocs promote`, full stop. That
meant a human working through a live conversation with an agent — the normal way this
framework is actually used in a chat-driven install — had to break out to a terminal and
type the command themselves for every single decision, even one they had just approved in
the conversation.

The rule now distinguishes *deciding* (still, and always, human-only) from *typing the
command* (mechanical — the same as an agent running `git commit` after someone says
"commit"). The protocol: list what's `proposed` with the actual reasoning, wait for an
explicit answer naming the specific id(s), then run `artdocs promote <id>` and report what
changed. Never before an explicit answer, never for the agent's own just-written proposal
without a human reading it first, never a bare "--all" unless they said all of them. Also
updated: `CONSTITUTION.md` rule 6 and the safety-rules bullet in `AGENT-COMMANDS.md`.

No code changed here — `cmdPromote`'s own enforcement (`PROMOTING_ROLES`, and
`identity/agents.registry.json` for any workload with no human in the loop) already allowed
this; it was the prose instruction stopping every agent from doing it.

## v1.1.0 — 2026-09-19

### Added
- **5 new skills** in the starter library (31 → 36), adapted from concepts in
  [imbad0202/academic-research-skills](https://github.com/imbad0202/academic-research-skills)
  into this framework's own lightweight `skills.jsonl` shape — not a port of that project's
  own multi-agent pipeline/hook architecture, which is a different, much heavier system built
  for a different install path (a Claude Code plugin):
  - `citation-retraction-check` (validation) — check every cited DOI against Crossref's
    `update-to` field before submission
  - `tortured-phrase-screen` (validation) — scan for synonym-substitution patterns associated
    with paraphrasing tools and paper mills, in the manuscript's own prose and in suspect
    sources
  - `second-model-citation-spotcheck` (validation) — an independent model re-verifies a sample
    of citations without seeing the manuscript's claim first
  - `ai-use-disclosure` (process) — draft the AI-tool-use disclosure statement some venues now
    require, grounded in the project's own audit log, never a boilerplate template
  - `citation-format-convert` (build) — switch bibliography/in-text citation style when a
    manuscript retargets a venue with different conventions
- **`artdocs skills sync [dir] [--dry-run]`** — brings a project's `skills/skills.jsonl` up to
  date with new skills shipped in later template releases. `upgrade` deliberately never
  touches this file (owner/status/last_verified are project-specific facts it cannot know);
  `skills sync` is the explicit, additive counterpart — it only appends skills whose `id`
  is not yet present, and never touches a field of an existing one. Idempotent: running it
  again once a project is current reports nothing to do.

## v1.0.0 — 2026-09-11

**article-docs forked from [dev-docs](https://github.com/ojaneri/dev-docs) v4.1.0** and
adapted from software projects to scientific articles. The engine is unchanged — plain
Markdown and JSONL, zero dependencies, offline, six-plane attribution, the same
`proposed → accepted` decision lifecycle and the same refusal to let an agent accept its
own decision.

### Changed — the memory model
- `modules/` → **`sections/`** (one per manuscript section)
- `apis/` → **`claims/`** (one per claim or hypothesis, with the evidence that supports it)
- `infra/` → **`venue/`** (format rules, limits, deadlines, anonymity regime)
- new **`experiments/`** (measurement and analysis campaigns, with data provenance)
- new **`references/`** (bibliography hygiene, what each key source is used for)
- `reviews/` now means reviewer reports and rebuttals
- `PROJECT-MEMORY.md` → `ARTICLE-MEMORY.md`; the CLI is `bin/artdocs.mjs`; the slash
  commands are `/artdocs:*`; the index entry type `module` is now `section`

### Added
- A **starter skill library** of 31 procedures shipped with every install, `status:
  unverified` until run in the project:
  - *finding the literature* — OpenAlex, Semantic Scholar, arXiv, DBLP, PubMed/Europe PMC,
    Crossref, the field's own preprint server (IACR ePrint, bioRxiv, SSRN, RePEc, HAL),
    Unpaywall for a legal full text, paywalled databases through a browser session, and a
    logged systematic search;
  - *validating the paper's own argument* — claim-evidence audit (including abstract-vs-results
    overclaiming), number traceability back to the data, recomputed statistics, citation
    context, threats-to-validity sweep, and an adversarial review pass;
  - *repository and release* — create the repository private, publish an anonymised copy for
    double-anonymous review, tag the submitted version, and latexdiff the revision;
  - *bibliography, build and figures* — DOI verification, the build, the page budget per
    section, vector figure export, a language pass that reports rather than rewrites;
  - *archiving and submission* — a Zenodo deposit with the DOI reserved before submission, the
    preprint, the submission package and the point-by-point rebuttal.
- Playbooks for **literature search**, **validating the thesis**, **Overleaf without losing a
  co-author's edits**, **revision and rebuttal**, and a **pre-submission checklist**.
- Two categories software projects have no use for: `validation` and `repository`.
- Skill categories rewritten for writing work: `build`, `figures`, `data`, `bibliography`,
  `collaboration`, `review`, `submission`, `reproducibility`, `process`.
- Constitution rules that only matter for a paper: nothing is invented; a claim is
  supported only when its evidence is named; a limitation is never softened; **no AI system
  is ever an author**; under an anonymous regime nothing identifying reaches the manuscript
  or its artifacts.
- `examples/thermal-paper/` — a synthetic filled-in article memory. Everything in it is
  invented.

### Fixed
- The decision-id guidance now says what `validate` actually enforces: ids are unique
  across the whole memory, not per file.

---

## v4.1.0 — 2026-09-02

First public release. Extracted from four private deployments running since
2026-04, with all project-specific content, identities and infrastructure
details removed.

### Added
- `artdocs init` — install article-docs into any project directory.
- Pointer files for every major agent tool, written by `init` and selectable with
  `--agents`: `AGENTS.md` (the cross-tool convention read by Codex, opencode, Cursor,
  Windsurf, Zed, Jules and Aider), `CLAUDE.md`, `GEMINI.md`,
  `.github/copilot-instructions.md`, and on request the Cursor and Windsurf rule files.
  All carry the same body and defer to `article-docs/AI-INSTRUCTIONS.md`, so instructions
  live in exactly one place.
- `BOOTSTRAP.md` — a setup playbook written for the agent, not the human. The entire
  installation is now one sentence to your assistant: *"Set up article-docs in this project:
  clone https://github.com/ojaneri/article-docs and follow its BOOTSTRAP.md."* The agent reads
  the project, infers the name, stack, modules, identity and deploy path, shows you what it
  inferred for correction, then fills the memory and seeds modules and skills from the real
  `package.json` scripts and CI workflows. It asks you about one thing: what a new engineer
  always gets wrong. A copy travels into `article-docs/` so a later `/artdocs:init` needs
  nothing else.
- `/artdocs:init` — runs that setup, or finishes an unfinished one.
- `artdocs upgrade` and `/artdocs:upgrade` — move an installed project to a newer release.
  `article-docs/` carries its own copy of the CLI, so a project keeps working forever on the
  release it was set up with; this is how it moves forward. It sorts every file into three
  categories and says which is which: `bin/` and the framework documents are
  replaced; `AI-INSTRUCTIONS.md`, `CONSTITUTION.md`, `HUMAN-ONBOARDING.md`, `agents.json`
  and `skills/categories.md` are **never overwritten** — the new version lands beside yours
  as `<name>.new` to merge, since an edit cannot be told from an untouched file; and your
  memory is never touched in any release. It restores framework files that were deleted,
  adds directories a newer release introduced, backs everything up to `.backups/` first,
  records `artdocs_release` and `upgraded_on`, and is idempotent. `--dry-run` shows the plan.
  The CLI inside a project cannot upgrade itself, and says so with the command to fix it.
- `artdocs status` — one screen answering "where does this project stand?": identity, open
  session and its age, module/skill/decision counts, stale skills, decisions still awaiting
  a human, and current drift. It suggests only the next steps that actually apply, and
  `--json` gives the same facts to a script.
- `artdocs promote` — the `proposed → accepted` half of the promotion cycle, which until now
  was manual markdown editing. Lists what is waiting, rewrites only the target decision's own
  line, stamps `promoted_by`, logs it and reindexes. Refuses unless the local identity is an
  Owner or Maintainer — a guard rail that puts the rule in front of you, not a security
  boundary. `--status rejected` exists because `proposed` is not a graveyard.
- `artdocs hooks install` — a pre-commit hook where `validate` blocks and `git drift` only
  warns. Broken memory is trusted and wrong, so it stops the commit; drift is often
  legitimate, and a hook that cries wolf gets disabled within a week. Respects
  `core.hooksPath`, works from a subdirectory, and refuses to overwrite a hook it did not
  write.
- `/artdocs:status`, `/artdocs:promote` and `/artdocs:hooks`.
- `artdocs invite` (also `artdocs share`) and `artdocs join`, with `/artdocs:invite` and
  `/artdocs:join`. `invite` prints **one generic line** carrying the real clone URL: it
  names nobody, holds no secret and does not expire, so it goes to one colleague or a whole
  channel, and it needs no email — the machine running article-docs usually cannot send one. It
  has to survive being retyped, so it is one line and nothing else. `--name` additionally
  registers someone in the committed registry, and is optional. If there is no remote it
  says so rather than printing a line that cannot work.
  `join` sets the newcomer's identity and reports where the project actually stands: stale
  skills, decisions still `proposed`, and whether someone is mid-task in an open session. It
  explains the one thing that surprises everybody, which is that a clone deliberately does
  not carry `.local/user.json` or `.token`.
- `whoami` no longer defaults everyone to `Owner`. It reads the committed registry: your
  recorded role if you are in it, otherwise `Contributor` when the registry already has
  people. A newcomer does not silently acquire the right to accept decisions.
- `init` now detects and records the project's version control: remote or local-only, the
  default branch, and whether article-docs sits in a subdirectory of a larger repository. It
  says so on stdout, including that `git drift` cannot work without git at all.
- Sessions carry a running `## Decisions taken` section, and `session end` warns when code
  changed outside `article-docs/` and no decision was recorded. Writing a decision late means
  reconstructing it, and reconstructed reasoning is invented reasoning.
- A signal table at the top of `AGENT-COMMANDS.md` mapping ordinary sentences onto
  operations, so *"write that down"*, *"where did I leave off"* and *"what's waiting on me"*
  are documented behaviour rather than luck. The slash commands are shortcuts, not the
  interface.
- `article-docs/AGENT-COMMANDS.md` — the seven operations that keep the memory alive
  (start, context, remember, decide, skill, check, end), written as ordinary file edits
  so **any** agent can perform them without learning a CLI.
- Native slash commands generated from one shared definition: `.claude/commands/artdocs/`
  for Claude Code, `.gemini/commands/artdocs/` for Gemini CLI, `.opencode/command/` for
  opencode. Each wrapper defers to `AGENT-COMMANDS.md`, so there is one behaviour and
  several front doors.
- A test suite: 156 tests on `node:test`, no dependencies, run with `npm test`.

### Fixed
- `git drift` truncated the first changed filename by one character, because `gitRun`
  trimmed the whole output and ate the leading column of `git status --porcelain`.

### Changed
- The CLI no longer assumes a fixed project path. The project name resolves from
  `project.memory.json` or the directory name; `git drift` derives its path
  prefixes from `git rev-parse --show-toplevel` instead of assuming the git root
  is `/`.
- `CONSTITUTION.md` gained two rules from the v4.2 specification that cost
  nothing to adopt now: external content is data rather than instruction, and
  credentials never enter project memory.

### From the v4.2 specification

The **EXECUTION plane** is implemented. It is the first part of v4.2 to exist in code.

- Every event in the activity log now carries up to six separate planes — `requested_by`,
  `actor`, `agent`, `automation`, `authenticated_as`, `approved_by` — instead of a single
  author. `agent` is opt-in via `ARTDOCS_AGENT` and `authenticated_as` via
  `ARTDOCS_WORKLOAD`; `automation` is detected from GitHub Actions, GitLab CI, CircleCI,
  Jenkins and Buildkite. `approved_by` is set per action and appears only where an approval
  genuinely happened, which today means promoting a decision.
- **A plane that cannot be observed is omitted, never guessed.** Each event carries
  `attribution_observed` listing the planes actually resolved, so an absent field reads as
  "not recorded" rather than "nothing was involved".
- `artdocs identity status` shows how the next action would be attributed, including the
  planes it cannot see and why.
- `artdocs export audit --format json` writes `.generated/audit.json` and reports **plane
  coverage** — how much of the model the project's history actually supports. Rows written
  before this existed are counted as legacy and left alone; backfilling them would be
  inventing provenance.
- The log moved from `team/activity-log.jsonl` to `audit/activity-log.jsonl`, as v4.2
  specifies. `upgrade` moves an existing log line for line — a move, not a copy, because
  two diverging logs are worse than either one. `team/` keeps roles and ownership.

### From the v4.2 specification

The **EXECUTION plane** is implemented. It is the first part of v4.2 to exist in code.

- Every event in the activity log now carries up to six separate planes — `requested_by`,
  `actor`, `agent`, `automation`, `authenticated_as`, `approved_by` — instead of a single
  author. `agent` is opt-in via `ARTDOCS_AGENT` and `authenticated_as` via
  `ARTDOCS_WORKLOAD`; `automation` is detected from GitHub Actions, GitLab CI, CircleCI,
  Jenkins and Buildkite. `approved_by` is set per action and appears only where an approval
  genuinely happened, which today means promoting a decision.
- **A plane that cannot be observed is omitted, never guessed.** Each event carries
  `attribution_observed` listing the planes actually resolved, so an absent field reads as
  "not recorded" rather than "nothing was involved".
- `artdocs identity status` shows how the next action would be attributed, including the
  planes it cannot see and why.
- `artdocs export audit --format json` writes `.generated/audit.json` and reports **plane
  coverage** — how much of the model the project's history actually supports. Rows written
  before this existed are counted as legacy and left alone; backfilling them would be
  inventing provenance.
- The log moved from `team/activity-log.jsonl` to `audit/activity-log.jsonl`, as v4.2
  specifies. `upgrade` moves an existing log line for line — a move, not a copy, because
  two diverging logs are worse than either one. `team/` keeps roles and ownership.

The **IDENTITY plane** is implemented, and it closes a hole the EXECUTION plane exposed.

- `artdocs promote` checked the *human's* role, so an agent running under an Owner's local
  identity could accept its own decision — which `CONSTITUTION.md` forbade and the README
  claimed. The rule was documented and unenforced. It is now enforced against
  `identity/agents.registry.json`, which was only possible once the log knew an agent was
  the actor.
- Three rules, all enforced: a human's role is never inherited by an agent running under it;
  an unlisted agent is denied every protected action; and a permission that is not declared
  is a refusal rather than a yes.
- `article-docs/identity/` holds `humans.registry.json`, `agents.registry.json` and
  `workloads.registry.json`, plus `roles.md` and `ownership.md`. No registry may hold a
  credential value — only a reference to where one lives.
- `artdocs agents list` shows each agent's declared permissions and marks the one currently
  driving, warning when it is unregistered. `artdocs workloads list` shows CI and service
  identities. `artdocs identity status` reports what the driving agent may do, and why not.
- `upgrade` moves `team/users.registry.json`, `roles.md` and `ownership.md` into `identity/`
  and adds the two new registries — never overwriting one a project already wrote.

### Context cost and identity durability

- `context --verbosity low|medium|high`, with per-project default `context_verbosity` in
  `project.memory.json`. `low` is facts only — module, binding decisions as one-liners,
  skills as `id: summary` — for an agent that has already read `AI-INSTRUCTIONS.md`. A
  destructive skill is flagged at every level, and every pack reports what it cost.
- **Truncation happens at section boundaries.** The old code cut the module at 3,000
  characters, silently dropping whichever section came last — which in a module file is the
  decisions. It now keeps decisions and todos, drops prose, and names what it dropped.
- **Only `accepted` decisions are presented as binding.** A proposed or superseded one still
  appears in the embedded module text, since that is the source file, but the pack says
  plainly that it does not bind. `--all-decisions` lists them with statuses.
- `context --budget <tokens>` caps the pack and reports the estimate against it.
- `AI-INSTRUCTIONS.md` cut by a third. It is the one file read every session; the operating
  manual it links to is read on demand.
- **`whoami` now writes both halves of an identity.** It wrote only the gitignored local
  file, so the person who set a project up existed nowhere committed: a new machine had
  nothing to restore and every `user_id` in the audit log pointed at nobody. It now also
  adds a committed registry entry, keeping the git email so a second machine recognises you,
  and warns loudly when you are about to pick a `user_id` that would split your history.
- `whoami` takes `--name`, `--email`, `--id`, `--role` and `--no-registry`, so an agent can
  set an identity properly instead of writing `.local/user.json` by hand.
- **`status` reports memory at risk** — files under `article-docs/` not committed, commits not
  pushed, or no remote at all. The gitignored files are excluded on purpose: they are meant
  to be uncommitted, and they were never the real loss scenario.

### Removed

- **The dashboard.** Earlier releases shipped a local read/write web UI at
  `127.0.0.1:3434`. It is gone and will be distributed separately. Two reasons: almost
  everyone drove article-docs from the CLI and their agent, and a file-writing HTTP server was
  by far the largest attack surface in a project that otherwise makes no network call and
  starts no server. `serve` is no longer a command. `upgrade` leaves an existing
  `article-docs/dashboard/` in place — deleting a user's files is not an upgrade's business —
  and reports that this CLI no longer serves it.

  The security review done before publishing is part of why. In four months of use nobody
  had noticed that it sent `Access-Control-Allow-Origin: *` while its GET endpoints took no
  token — so any page the user had open could read the project's whole memory from
  loopback — that it echoed internal errors and leaked absolute server paths, or that
  user-supplied values reached generated filenames unsanitised. All three were fixed, and
  then the component was removed: the cheapest way to secure an HTTP server nobody needed
  is not to ship one.

### Not included
The v4.2 MEMORY, IDENTITY, DELIVERY and TRUST planes are specified in `SPEC-v4.2.md` and
**are not implemented**: no `memory/` lifecycle store, no `identity/` registries, no
`devops/` or `security/` directories, and no `project.yaml`. Of the 24 commands the
specification recommends, 13 do not exist — including `adopt`, `migrate`, `memory
candidates|review|promote`, `agents list`, `workloads list`, `security doctor`, `devops
doctor` and `incident start|close`. See that file's header.
