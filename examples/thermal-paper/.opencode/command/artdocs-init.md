---
description: Set up or finish setting up article-docs in this project
---

Set up article-docs for this article. $ARGUMENTS

If `article-docs/` does not exist yet, find the article-docs distribution (ask me for its path if you cannot) and follow its **`BOOTSTRAP.md`** from step 1.

If a `article-docs/` directory exists but is **not** an installation — no `AI-INSTRUCTIONS.md`, no `bin/artdocs.mjs`, just hand-written notes — follow step 3b of `BOOTSTRAP.md`: rename it to `article-docs-legacy/`, install, then fold its content into the new structure and show me the mapping before deleting anything.

If `article-docs/` already exists, this is a finishing pass: follow **steps 2, 3 and 6 to 10 of `article-docs/BOOTSTRAP.md`**, which was installed alongside the memory. Concretely — read the project, show me what you inferred and ask only what you could not, then replace every remaining TODO in `article-docs/ARTICLE-MEMORY.md`, the *Project specifics* section of `article-docs/AI-INSTRUCTIONS.md`, `article-docs/repos.json` and `article-docs/team/`, seed the sections, claims, experiments and venue, and make the starter skills true for this project, and run `reindex` and `validate`.

Hold to the rules at the end of BOOTSTRAP.md: infer before asking, never fabricate a rationale, never mark a decision `accepted`, never put a credential in the memory, and set a skill's confidence to `low` if you did not actually run it. Tell me at the end which parts you inferred rather than verified.
