---
description: Load the memory relevant to a task without opening a session
argument-hint: <module> <what you want to do>
---

Load the article-docs memory relevant to: $ARGUMENTS

Follow section **2 (context)** of `article-docs/AGENT-COMMANDS.md`.

Read the matching section / claim / experiment / venue file, every skill in `article-docs/skills/skills.jsonl` whose triggers match, and the decisions in that module. Report which skills you selected and which accepted decisions constrain the work. Name anything the memory does not cover — that gap is what we will write down afterwards.

If I asked for a durable copy, run `node article-docs/bin/artdocs.mjs context <module> --task "..."`. Add `--verbosity low` if I said to keep it short or that tokens matter, `--verbosity high` if the territory is unfamiliar. Tell me what the pack cost — the command prints it.
