---
description: Open a article-docs work session and load the memory for the task
---

Open a article-docs session for this task: $ARGUMENTS

Follow sections **1 (start)** and **2 (context)** of `article-docs/AGENT-COMMANDS.md` exactly.

1. Read `article-docs/.local/user.json` for the identity. If it is missing, ask me who I am before writing anything.
2. Create the session file and append the `session_started` line to the activity log.
3. Read the matching section / claim / experiment / venue file, the skills whose triggers match, and the decisions in that module.
4. Then tell me, before writing a word: which module this touches, which skills apply, which accepted decisions constrain it, and what the memory does not cover.
