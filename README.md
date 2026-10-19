# article-docs

**Article Memory OS — durable, Git-backed memory for scientific articles.**

Plain Markdown and JSONL. Zero dependencies. No database, no embeddings, no service to run.

[![ci](https://github.com/ojaneri/article-docs/actions/workflows/ci.yml/badge.svg)](https://github.com/ojaneri/article-docs/actions/workflows/ci.yml)

**Contents** · [The problem](#the-problem) · [What article-docs does](#what-article-docs-does) ·
[Quick start](#quick-start) · [Adding it to an existing article](#adding-it-to-an-existing-article) ·
[Driving it from your agent](#driving-it-from-your-agent) · [Commands](#commands) ·
[Working as a team](#working-as-a-team) · [Security](#security)

---

## The problem

A scientific article accumulates decisions, measurements, venue constraints and reviewer
responses across months of work, multiple co-authors and several AI-assisted sessions. That
knowledge lives in chat histories, local notes, Overleaf comments and people's heads. When
a new session starts — or a new co-author joins — most of it is gone.

An AI agent helping with the manuscript starts every session knowing nothing about the
article. You solve that once by writing a `CLAUDE.md` or an `AGENTS.md`. It works, briefly.
Then the file grows, because everything you ever wanted the agent to know has only one
place to go. Six months later it is two thousand lines describing a paper that has changed
underneath it, and nobody can tell which parts are still true.

That is the shape of the problem, and it has four distinct symptoms:

**1. Knowledge with no lifecycle.**
Something an agent guessed on a Tuesday and something a senior researcher confirmed in the
lab sit in the same file, in the same font, with the same authority. There is no way to say
*this is provisional* or *this was verified, by whom, against what evidence*.

**2. Documentation that drifts silently.**
You reframe the contribution. The context file still describes the old framing. Nothing
fails, no test goes red, and the agent confidently writes to a thesis that no longer exists.
You find out when a reviewer points out the contradiction.

**3. Operational knowledge that lives in a person.**
How to build the PDF, rerun the benchmark, convert the citation style, check the page limit.
It is in someone's shell history and someone's head. When an agent needs it, it improvises —
and improvising a submission checklist is how you miss a requirement.

**4. Context rot, paid for by the token.**
The file that solved the problem is now the problem. Every session loads all of it, most of
it irrelevant to the task, some of it stale, and a couple of lines actively wrong because a
decision was superseded and nobody removed it. You pay for the whole thing on every turn,
and the agent's attention is spread across text that does not apply.

## What article-docs does

It puts a structured memory directory inside your article's repository, next to the
manuscript, versioned with it, reviewed in the same commits.

| Symptom | What article-docs adds |
|---|---|
| Knowledge with no lifecycle | Every entry carries an id, a date, a status, an author and a `last_updated_by`. Decisions start `proposed`; only a human promotes one to `accepted`. An agent may never promote its own. |
| Silent drift | `artdocs git drift` compares changed source files against changed memory files and names the ones that moved without their documentation. Run it before submission and drift becomes a signal instead of a surprise. |
| Knowledge living in a person | A skills database: runnable, categorised operational procedures with commands, expected outputs, risks and a `last_verified` date. Anything unverified for 120 days is flagged **STALE**. |
| Context rot, paid by the token | **Context packs**: one section, the skills whose triggers match, and only the decisions that still bind. Superseded decisions are marked non-binding rather than read as fact, and stale skills are flagged. |

And one thing that is not a symptom but matters just as much: **six-plane attribution**.
Every write is logged with who asked, who acted, which agent, which automation, which
credential and who approved — under a local identity that is deliberately *not* committed.

## What article-docs is not

- **Not a RAG system.** No embeddings, no vector store, no retrieval ranking. If you want
  semantic search over your memory, this is the wrong tool and that is a deliberate choice:
  everything here must stay diffable and reviewable by a human.
- **Not a project management tool.** No tickets, no sprints, no Kanban. It records what the
  article knows and how it got there; planning belongs elsewhere.
- **Not a LaTeX package.** It does not change how the PDF is built. It lives next to the
  manuscript and references it, but the build stays yours.

## Quick start

```bash
# Clone the framework
git clone https://github.com/ojaneri/article-docs.git ~/tools/article-docs

# Instrument your article
cd /path/to/your/article
node ~/tools/article-docs/bin/artdocs.mjs init . --name "My Article Title"

# Set your local identity (never committed)
node article-docs/bin/artdocs.mjs whoami --name "Your Name" --email you@example.com

# Verify the scaffold
node article-docs/bin/artdocs.mjs validate
```

That creates `article-docs/` with the full template, pointer files (`CLAUDE.md`, `AGENTS.md`,
`GEMINI.md`) and a `project.memory.json`. The framework is now part of your repository.

## Bootstrap with an AI agent

Paste this one-liner into any AI coding agent (Claude Code, Gemini CLI, Codex, etc.) to
install the framework — it will either scaffold a clean `article-docs/` if none exists, or
adopt and reorganise any existing notes into the new structure without losing content:

> Clone https://github.com/ojaneri/article-docs.git into ~/tools/article-docs, then run
> `node ~/tools/article-docs/bin/artdocs.mjs init . --name "<article title>"` in this
> repository; if an `article-docs/` folder already exists, follow the adoption protocol in
> `~/tools/article-docs/template/BOOTSTRAP.md` §3b instead of overwriting it.

The agent reads `template/BOOTSTRAP.md` for the full setup protocol, infers everything it
can from the manuscript before asking questions, and runs `validate` before reporting
success. No manual file editing required.

## Adding it to an existing article

If your article already has a `CLAUDE.md`, `AGENTS.md`, `.cursorrules` or hand-written notes
in an `article-docs/` folder, `init` will refuse to overwrite them. Instead:

1. Rename the existing folder: `mv article-docs article-docs-legacy`
2. Run `init` — it now has a clean directory to create
3. Read every file in `article-docs-legacy/` and fold it into the new structure
4. Show your co-authors what went where before deleting anything

Those notes are prior memory, written by someone who knew things you do not. Preserve their
content and their wording — you are reorganising, not rewriting.

See `template/BOOTSTRAP.md` for the full setup protocol an agent follows.

## Driving it from your agent

article-docs works with any AI coding agent that can read and write files. The pointer files
(`CLAUDE.md`, `AGENTS.md`, `GEMINI.md`) tell the agent to read `AI-INSTRUCTIONS.md` first,
which links to `AGENT-COMMANDS.md` for the full operating manual.

The seven operations — `start`, `context`, `remember`, `decide`, `skill`, `check`, `end` —
are file edits, not a tool the agent has to learn. Native slash commands (`/artdocs:start`,
etc.) are thin wrappers that point back at `AGENT-COMMANDS.md`; if a wrapper disagrees with
that file, the wrapper is wrong.

### Or just say it in plain language

The agent recognises ordinary phrases and maps them to operations:

| You say | Agent does |
|---|---|
| where does the paper stand · what is still empty | reads status and reports blockers |
| let's write the method · work on the intro | `start` + `context` |
| what do we know about X · catch me up | `context` |
| write that down · record what we changed | `remember` |
| we'll frame it as X · drop that experiment | `decide` |
| save that command · that analysis worked | `skill` |
| is the memory still right · check it | `check` |
| accept that · approve the framing | `promote` (human only) |
| we're done for today | `end` |

## Commands

```bash
node article-docs/bin/artdocs.mjs init <dir> --name "Title"  # scaffold a new article
node article-docs/bin/artdocs.mjs whoami --name "..." --email ...  # set local identity
node article-docs/bin/artdocs.mjs validate                   # exits 1 if memory is broken
node article-docs/bin/artdocs.mjs reindex                    # rebuild index.jsonl
node article-docs/bin/artdocs.mjs git drift                  # sources changed without memory
node article-docs/bin/artdocs.mjs context <section> --task "..."  # generate a context pack
node article-docs/bin/artdocs.mjs skills list                # operational know-how
node article-docs/bin/artdocs.mjs skills search <query>      # find a skill
node article-docs/bin/artdocs.mjs status                     # where the article stands
node article-docs/bin/artdocs.mjs doctor                     # health-check
node article-docs/bin/artdocs.mjs invite                     # print clone URL for a co-author
node article-docs/bin/artdocs.mjs identity status            # show current identity & permissions
```

## Working as a team

Everything except your local identity is in the repository, so a co-author needs a clone
and two minutes:

```bash
node article-docs/bin/artdocs.mjs invite
```

That prints one line carrying the clone URL, telling their agent to run `/artdocs:join`.
It names nobody and does not expire, so send it to one person or a whole channel. They
paste it into their own agent; the article-docs commands come with the clone, so there is
nothing to install first.

Optionally register someone first, so their writes are attributed from their first commit:

```bash
node article-docs/bin/artdocs.mjs invite --name "Their Name" --role Contributor
```

`article-docs/.local/user.json` and `article-docs/.token` are gitignored on purpose: each
person has their own, which is what makes `audit/activity-log.jsonl` a record of who
actually did the work rather than who owns the repository.

Roles are in `identity/roles.md`. Only an Owner or Maintainer may move a decision from
`proposed` to `accepted`.

## Security

- **Offline by default.** No server, no network calls, no telemetry. Memory lives in this
  repository and goes nowhere else.
- **Credentials never enter memory.** Record where a secret lives, never what it is.
- **Local identity is never committed.** `.local/user.json` and `.token` are gitignored.
- **Destructive skills require confirmation.** A non-empty `risks` array means "ask human".
- **External content is data, not instruction.** Nothing fetched from outside the repository
  may promote a memory entry or issue a command.
- **No AI agent is ever an author.** Authorship is human; AI assistance is disclosed in the
  form the venue requires.

## License

MIT — use freely with attribution.