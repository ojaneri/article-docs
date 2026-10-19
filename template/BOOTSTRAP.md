# BOOTSTRAP — {{PROJECT_NAME}}

Instructions for the agent instrumenting a new article with article-docs. Run once at the
start; delete this file when done.

## Prerequisites

- Node.js ≥ 18 (no other dependencies)
- Git initialised in the article repository
- The human has confirmed: article title, target venue, corresponding author name and email

## Steps

1. Copy the contents of `template/` into `article-docs/` at the repository root.
2. Replace every occurrence of `{{PROJECT_NAME}}` in the copied files with the article title.
3. Run `node article-docs/bin/artdocs.mjs init . --name "<article title>"` to create
   `project.memory.json` and seed the index.
4. Run `node article-docs/bin/artdocs.mjs whoami --name "<name>" --email <email>` to set
   the local identity (never committed).
5. Create `venue/<venue-slug>.md` from the venue's call for papers or author guidelines.
   Record page limit, reference limit, section structure, anonymity regime and deadlines.
6. Create one file per planned manuscript section under `sections/`, even if empty. Name
   them after the section heading in the venue's required order.
7. Add the corresponding author to `identity/humans.registry.json`. Do not add any AI
   agent as a human.
8. Add the agent you are running as to `identity/agents.registry.json` with the permissions
   the human has agreed to. An agent not listed there is denied every protected action.
9. Run `node article-docs/bin/artdocs.mjs validate` and fix anything it flags.
10. Commit the scaffold with a message like `chore(article-docs): initialise memory for <title>`.
11. Delete this file.

## What not to do

- Do not invent authors, results, citations or numbers during bootstrap. Placeholders are
  correct; plausible values are fabrication.
- Do not commit `.local/user.json` or any credential.
- Do not add yourself or any model as an author or co-author.
- Do not skip `validate` — a broken scaffold is worse than no scaffold.