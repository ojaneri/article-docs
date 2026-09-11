---
description: Write what just changed into the project memory
---

Update the article-docs memory for the work we just did on the manuscript. $ARGUMENTS

Follow section **3 (remember)** of `article-docs/AGENT-COMMANDS.md`.

1. Run `node article-docs/bin/artdocs.mjs git drift` to see which sources changed without their memory.
2. For each, update the matching file under `article-docs/sections/`, `claims/`, `experiments/`, `venue/` or `references/` — creating it if none exists. Write what a person would need in six months: what changed, what it depends on, what would break. Do not paste the diff.
3. If we made a non-obvious or hard-to-reverse choice, also record a decision (section 4), status `proposed`.
4. Run `reindex` then `validate` and show me the result.
