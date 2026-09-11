# Examples

## `taskr/`

A small fictional CLI with its `article-docs/` filled in, so you can see the file formats
without setting up a project. Nothing here is real — the people, the email addresses and
the project are invented.

It also carries the generated agent commands (`.claude/`, `.gemini/`, `.opencode/`) and
`article-docs/AGENT-COMMANDS.md`, so you can see exactly what `init` produces.

It shows:
- a **module** (`modules/storage.md`) carrying decisions and todos inline, in the format
  `reindex` parses;
- an **accepted** decision and a **proposed** one, since only a human promotes;
- two **skills**, one safe (`"risks": []`) and one destructive (publishing a release);
- a **session** that records a bug, its cause and what was verified.

The CLI is not copied in here — it resolves its project root from its own location, so it
has to live at `article-docs/bin/`, which is where `init` puts it. To run commands against
this example, copy it in first:

```bash
cd examples/taskr
cp -r ../../bin article-docs/bin
node article-docs/bin/artdocs.mjs reindex
node article-docs/bin/artdocs.mjs validate
node article-docs/bin/artdocs.mjs skills list
rm -rf article-docs/bin article-docs/.backups     # keep the example clean
```
