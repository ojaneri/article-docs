# Skill template

One JSON object per line in `skills/skills.jsonl`. **Every field below is required** —
`artdocs validate` exits 1 when one is missing. A **non-empty `risks`** array marks the
skill as destructive; those require explicit human confirmation before an agent runs them.
A safe skill carries `"risks": []`.

```json
{
  "id": "kebab-case-id",
  "name": "Short imperative name",
  "category": "build",
  "summary": "One sentence: what this does and when to reach for it.",
  "triggers": ["words a human or agent would actually say"],
  "owner": "user_id",
  "status": "active",
  "confidence": "high",
  "last_verified": "YYYY-MM-DD",
  "commands": ["# comment", "make -C paper"],
  "files": ["paths this touches"],
  "outputs": ["what you should see when it worked"],
  "risks": ["one line per way this can destroy something (overwrite a co-author's copy, replace a dataset, submit); [] when it cannot"],
  "prompt": "Guidance for an agent about to run this."
}
```

`last_verified` older than 120 days is flagged **STALE** by `artdocs skills list`.
Re-run the skill, confirm it still works, then `artdocs skills verify <id>`.
