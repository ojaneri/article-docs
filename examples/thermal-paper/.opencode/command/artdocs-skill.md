---
description: Capture an operational procedure you just verified
---

Capture this as a article-docs skill: $ARGUMENTS

Follow section **5 (skill)** of `article-docs/AGENT-COMMANDS.md`.

Append one JSON line to `article-docs/skills/skills.jsonl` with every required field present. Set `last_verified` to today only if you actually ran it and saw it succeed — if you did not, say so and set `confidence` to `low`.

Fill `risks` honestly. A non-empty array marks the skill destructive, which means no agent may run it without asking. A safe procedure still needs `"risks": []`.

Write `triggers` as the words a person would actually say, not the formal name. Then run `validate`.

The starter library already covers literature search (OpenAlex, Semantic Scholar, arXiv, Crossref, paywalled databases), bibliography verification, collaborative-editor sync, the build, figures, artifact archiving and submission. Check whether this belongs in an existing skill before adding a new one, and never mark a skill verified because you read the command somewhere.
