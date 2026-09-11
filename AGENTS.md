# article-docs

You are working on **article-docs** itself — the framework, not a project that uses it.

## The one hard constraint
**No dependencies.** Node built-ins only, in `bin/` and `test/`. Never add a
package, however convenient. This is what makes article-docs installable by copying a directory.

## Layout
| Path | Is |
|---|---|
| `bin/artdocs.mjs` | the whole CLI, one file on purpose |
| `template/` | what `init` copies into a user's project — `{{PROJECT_NAME}}` is substituted |
| `examples/thermal-paper/` | a synthetic filled-in article memory; everything in it is invented |
| `test/` | `node:test`, run with `npm test` |
| `SPEC-v4.2.md` | a design document. **Not implemented.** Never describe it as behaviour. |

## Rules
- The vocabulary is the product: `sections/`, `claims/`, `experiments/`, `venue/`,
  `references/`. A change that reintroduces software wording (`modules`, `apis`, `deploy`)
  is a regression, not a synonym.
- Changing `template/` changes what every future `init` produces. Check the tests in
  `test/init.test.mjs` still describe reality.
- article-docs makes no network calls and starts no server. If a change would add either,
  it does not belong here — that is the whole security posture.
- Nothing in this repository may reference a real deployment, hostname, IP address, email
  address or credential. CI greps for these; so should you.
- Run `npm test` before proposing a change.

## Attribution
Commits are authored by the person who wrote them. **Never add an AI agent as an author,
co-author or collaborator** — no `Co-Authored-By:` trailer naming a model or assistant, and
no agent-session trailers.

## Style
Match the surrounding code. Mark a deliberate simplification inline with `ponytail:` plus
the known limit and the path out of it.
