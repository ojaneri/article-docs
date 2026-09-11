---
description: Record an architectural decision in the project memory
---

Record this decision in article-docs: $ARGUMENTS

Follow section **4 (decide)** of `article-docs/AGENT-COMMANDS.md`.

Append it to the Decisions section of the relevant memory file with the next free `d-NNNN` id. **Status must be `proposed`** — you may never write `accepted`; only I promote a decision.

Write the rationale properly: what the alternative was, what it would have cost, and what this decision gives up. A decision with no stated cost is a note, not a decision.

If this supersedes an earlier decision, mark that one `superseded` and link the ids both ways. Then run `reindex`.

In a writing project the decisions worth recording are the framing, the contribution list, the baseline, the metric, the notation, what got cut to fit the page limit, and every constraint the venue or a co-author imposes.
