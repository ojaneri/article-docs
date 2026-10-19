# Skill Template

Copy this file to create a new skill entry in `skills/skills.jsonl`.

## Schema

```json
{
  "id": "unique-slug",
  "name": "Human-readable skill name",
  "category": "bibliography | build | analysis | submission | venue | identity",
  "summary": "One-line description of what this skill does",
  "triggers": ["phrase that activates this skill", "another trigger"],
  "owner": "user_id from humans.registry.json",
  "status": "unverified | active | deprecated",
  "confidence": "low | medium | high",
  "last_verified": "YYYY-MM-DD or empty",
  "commands": ["shell command or procedure step"],
  "files": ["memory directories this skill touches"],
  "outputs": ["what the skill produces"],
  "risks": [],
  "prompt": "Guidance for the agent running this skill"
}
```

## Fields

- **id**: unique kebab-case identifier, stable across renames
- **triggers**: phrases an agent matches against user input to select this skill
- **status**: `unverified` until run successfully; `active` when confirmed; `deprecated` when superseded
- **confidence**: `low` if inferred or second-hand; `medium` if tested once; `high` if repeatedly verified
- **risks**: list destructive side effects; a non-empty array means "ask human before running"
- **commands**: exact shell commands or procedural steps; prefer reproducible over clever
- **prompt**: context the agent needs beyond the commands — caveats, ordering, what not to do

## Example

See `skills/skills.jsonl` for live examples. The literature-search skills are good starting points: they have no risks, clear triggers and verifiable outputs.