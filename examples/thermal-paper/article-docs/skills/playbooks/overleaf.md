# Playbook — Overleaf and other collaborative editors

The failure this playbook exists to prevent: **an agent uploads its version of a file and
silently deletes what a co-author typed while it was working.**

## First, find out which regime you are in

- **Paid plan with the Git bridge** → treat it as a git remote. `fetch`, `merge`, then
  `push`. Never force-push: it replaces browser-side work with no undo for the co-author.
- **Free plan, no bridge** → the only route is a logged-in browser session against the
  project UI. Everything below matters more in this case, because nothing merges for you.

Which one applies to this project belongs in `venue/` or a `collaboration` note, next to
the project id. **The token or session credential never goes in the memory** — record where
it lives, never what it is.

## The rule, in one line

**Read the project's update history before you write, and rebase onto the co-authors'
edits. Never overwrite.**

Concretely, before any upload or push:

1. Read the project's recent updates and see whether anyone has touched the files you hold.
2. If they have, take their version as the base and re-apply your change on top of it.
3. Say, in your own words, what changed on their side — a co-author who sees their edit
   described back to them will catch a bad merge that a diff would hide.
4. Only then write. Treat every upload as destructive and confirm with a human first.

## After a sync

Update the memory in the same pass: what changed, whose edit you merged, and anything you
could not reconcile. A sync that silently lost a paragraph is discovered weeks later, and
by then nobody can reconstruct which version was right.
