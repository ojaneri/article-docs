# Contributing

Issues and pull requests are welcome.

## Before you open a PR

```bash
npm test
```

156 tests, no dependencies, runs on Node 18 through 24 in a few seconds.

The suite is where the project's claims are kept honest: every rule the CLI is supposed to enforce (an agent cannot
promote a decision, `init` cannot overwrite a populated memory, the hook cannot overwrite
someone else's), and the regressions that were actually found in use. If you change
behaviour, the test that described the old behaviour is the thing to update first.

## The one hard constraint

**No dependencies.** Node built-ins only, in `bin/` and `test/`. This is what
keeps article-docs installable by copying a directory, auditable in an afternoon, and immune to
the supply chain. A pull request that adds a package will be declined regardless of how
useful the package is.

## Attribution

Commits are authored by the person who wrote them. **Do not add an AI agent as an author,
co-author or collaborator** — no `Co-Authored-By:` trailer naming a model or assistant, and
no agent-session trailers. Tools assist; people are accountable for what they merge.

## Style

Match the surrounding code. Two things the existing code does deliberately:

- `artdocs.mjs` is one file on purpose. Resist splitting it until three or more commands
  share non-trivial logic.
- A deliberate simplification is marked inline with `ponytail:` plus the known limit and
  the path out of it. If you take a shortcut, say so there rather than in the PR body.

## Security

article-docs makes no network calls, starts no server and has no dependencies. That is the
posture, and a change that adds any of the three does not belong here. If you find a way to
make it write outside `article-docs/`, or a path where a credential could end up in committed
memory, open an issue — with a failing test if you can.
