import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { join, run, CLI, gitProject, cleanup, inProject } from './helpers.mjs';

/** A project whose skills/skills.jsonl already has one skill of its own, hand-verified. */
function withLocalSkill() {
  const { dir } = gitProject();
  run(CLI, ['init', dir, '--name', 'has-a-skill'], dir);
  const path = join(dir, 'article-docs', 'skills', 'skills.jsonl');
  // edit the one the template ships, in place — the case that matters is "we already
  // have this id, with our own edits", not "we happen to also have an unrelated skill"
  const lines = readFileSync(path, 'utf8').trim().split('\n').map(l => {
    const sk = JSON.parse(l);
    if (sk.id !== 'lit-search-openalex') return l;
    return JSON.stringify({ ...sk, name: 'Search OpenAlex, but ours', owner: 'osvaldo',
      status: 'verified', last_verified: '2026-09-01' });
  });
  writeFileSync(path, lines.join('\n') + '\n');
  return dir;
}

const readSkills = (dir) => readFileSync(join(dir, 'article-docs', 'skills', 'skills.jsonl'), 'utf8')
  .trim().split('\n').map(l => JSON.parse(l));

describe('skills sync', () => {
  test('adds every template skill missing from the project', () => {
    const dir = withLocalSkill();
    run(CLI, ['skills', 'sync', dir], dir);
    const skills = readSkills(dir);
    assert.ok(skills.some(s => s.id === 'citation-retraction-check'), 'a new template skill did not land');
    cleanup(dir);
  });

  test('never touches a skill the project already has, even with the same id', () => {
    const dir = withLocalSkill();
    run(CLI, ['skills', 'sync', dir], dir);
    const mine = readSkills(dir).find(s => s.id === 'lit-search-openalex');
    assert.equal(mine.name, 'Search OpenAlex, but ours', 'the project\'s own edit was overwritten');
    assert.equal(mine.status, 'verified', 'a verified skill was downgraded');
    cleanup(dir);
  });

  test('dry-run writes nothing', () => {
    const dir = withLocalSkill();
    const before = readFileSync(join(dir, 'article-docs', 'skills', 'skills.jsonl'), 'utf8');
    run(CLI, ['skills', 'sync', dir, '--dry-run'], dir);
    const after = readFileSync(join(dir, 'article-docs', 'skills', 'skills.jsonl'), 'utf8');
    assert.equal(before, after);
    cleanup(dir);
  });

  test('is idempotent: a second run has nothing to add', () => {
    const dir = withLocalSkill();
    run(CLI, ['skills', 'sync', dir], dir);
    const { stdout } = run(CLI, ['skills', 'sync', dir], dir);
    assert.match(stdout, /already has every skill/);
    cleanup(dir);
  });

  test('the merged file still validates', () => {
    const dir = withLocalSkill();
    run(CLI, ['skills', 'sync', dir], dir);
    inProject(dir, ['reindex']);
    const { stdout } = inProject(dir, ['validate']);
    assert.doesNotMatch(stdout, /ERROR/);
    cleanup(dir);
  });
});
