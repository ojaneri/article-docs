# HUMAN-ONBOARDING — {{PROJECT_NAME}}

This project uses **article-docs** for durable, Git-backed memory of a scientific article.

## 5-minute start

```bash
node article-docs/bin/artdocs.mjs whoami       # set your local identity (not committed)
node article-docs/bin/artdocs.mjs doctor       # health-check
node article-docs/bin/artdocs.mjs status       # where the article stands
node article-docs/bin/artdocs.mjs skills list  # operational know-how, STALE flagged
```

## What lives where

| Path | Holds |
|---|---|
| `ARTICLE-MEMORY.md` | the human overview — start here |
| `sections/` | one file per manuscript section |
| `claims/` | claims and their named evidence |
| `experiments/` | measurement campaigns and how to rerun them |
| `venue/` | target venue rules, deadlines, anonymity regime |
| `references/` | bibliography areas and unverified entries |
| `reviews/` | reviewer points and responses |
| `skills/skills.jsonl` | runnable operational procedures |
| `sessions/` | a record of each meaningful work session |
| `identity/` | human, agent and workload registries |
| `audit/activity-log.jsonl` | six-plane attribution for every write |
| `CONSTITUTION.md` | the rules everyone follows |
| `index.jsonl` | generated machine index — rebuild with `reindex` |

## Working with someone else

Everything except your identity is in the repository, so a co-author needs a clone and two
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

`article-docs/.local/user.json` and `article-docs/.token` are gitignored on purpose: each
person has their own, which is what makes `audit/activity-log.jsonl` a record of who
actually did the work rather than who owns the repository.

Roles are in `identity/roles.md`. Only an Owner or Maintainer may move a decision from
`proposed` to `accepted`.

## Golden rule

Never invent a number, result, citation or author. A placeholder plus a todo is always the
correct output for a value that does not exist yet.