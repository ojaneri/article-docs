# HUMAN-ONBOARDING — thermal-paper

This project uses **article-docs v4.1 (Article Memory OS)** for durable, Git-backed memory.

## 5-minute start
```bash
node article-docs/bin/artdocs.mjs whoami       # set your local identity (not committed)
node article-docs/bin/artdocs.mjs doctor       # health-check
node article-docs/bin/artdocs.mjs status       # where the project stands
node article-docs/bin/artdocs.mjs skills list  # operational know-how, STALE flagged
```

## What lives where
| Path | Holds |
|---|---|
| `ARTICLE-MEMORY.md` | the human overview — start here |
| `sections/` | one file per manuscript section, with decisions and todos inline |
| `claims/` | the claims and hypotheses, and the evidence that supports each |
| `experiments/` | measurement and analysis campaigns, with their provenance |
| `venue/` | the target venue: format rules, limits, deadlines, anonymity regime |
| `references/` | bibliography hygiene and what each key source is used for |
| `reviews/` | reviewer reports and the response to each point |
| `skills/skills.jsonl` | runnable procedures: build, figures, analysis, submission |
| `sessions/` | a record of each meaningful work session |
| `team/` | roles, author ownership, append-only activity log |
| `context-packs/` | generated task briefings for agents |
| `CONSTITUTION.md` | the rules everyone follows |
| `index.jsonl` | generated machine index — rebuild with `reindex` |

## Working with someone else

Everything except your identity is in the repository, so a teammate needs a clone and two
minutes:

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

`article-docs/.local/user.json` and `article-docs/.token` are gitignored on purpose: each person has
their own, which is what makes `audit/activity-log.jsonl` a record of who actually did the
work rather than who owns the repository.

Roles are in `team/roles.md`. Only an Owner or Maintainer may move a decision from
`proposed` to `accepted`.

## Golden rules
- Nothing is invented: no number, result, citation or page range that was not measured or
  read. A placeholder plus a todo is always the correct answer to a missing value.
- A claim is supported only when the evidence that supports it is named.
- No agent is ever an author. Disclose AI assistance the way the venue requires.
- Under double-anonymous review, nothing identifying enters the manuscript or its artifacts.

See `AI-INSTRUCTIONS.md` for the full set.
