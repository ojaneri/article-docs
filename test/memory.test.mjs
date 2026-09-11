import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, readFileSync, cpSync, rmSync } from 'node:fs';
import { join, run, tempDir, cleanup, CLI, inProject, REPO } from './helpers.mjs';

const MODULE_MD = `# auth — sign-in

## Decisions

- **[#d-0001]** date: 2026-08-14 · status: accepted · author: dana
  **Sessions in a signed cookie.**
  Rationale here.

## Todos

- **[#t-0001]** status: open · author: dana — Rotate the signing key quarterly
`;

const SKILL = (over = {}) => JSON.stringify({
  id: 'run-tests', name: 'Run the suite', category: 'testing',
  summary: 'Run every test.', triggers: ['test'], owner: 'dana',
  status: 'active', confidence: 'high', last_verified: '2026-08-20',
  commands: ['npm test'], files: ['test/'], outputs: ['a green run'],
  risks: [], prompt: 'Run before every release.', ...over,
});

function project() {
  const dir = tempDir();
  run(CLI, ['init', dir, '--name', 'app'], dir);
  return dir;
}

describe('reindex', () => {
  test('extracts sections, decisions, todos and skills', () => {
    const dir = project();
    writeFileSync(join(dir, 'article-docs', 'sections', 'auth.md'), MODULE_MD);
    writeFileSync(join(dir, 'article-docs', 'skills', 'skills.jsonl'), SKILL() + '\n');
    inProject(dir, ['reindex']);
    const rows = readFileSync(join(dir, 'article-docs', 'index.jsonl'), 'utf8')
      .trim().split('\n').map(JSON.parse);
    const byType = t => rows.filter(r => r.type === t);
    assert.equal(byType('section').length, 1);
    assert.equal(byType('decision').length, 1);
    assert.equal(byType('todo').length, 1);
    assert.equal(byType('skill').length, 1);
    const d = byType('decision')[0];
    assert.equal(d.id, 'd-0001');
    assert.equal(d.status, 'accepted');
    assert.equal(d.date, '2026-08-14');
    cleanup(dir);
  });

  test('backs the index up before overwriting it', () => {
    const dir = project();
    inProject(dir, ['reindex']);
    const res = inProject(dir, ['reindex']);
    assert.match(res.stdout, /Backed up/);
    cleanup(dir);
  });
});

describe('validate', () => {
  test('passes on a freshly initialised project', () => {
    const dir = project();
    assert.equal(inProject(dir, ['validate']).code, 0);
    cleanup(dir);
  });

  test('fails when a skill is missing a required field', () => {
    const dir = project();
    const bad = JSON.parse(SKILL()); delete bad.risks;
    writeFileSync(join(dir, 'article-docs', 'skills', 'skills.jsonl'), JSON.stringify(bad) + '\n');
    const res = inProject(dir, ['validate']);
    assert.equal(res.code, 1, 'a missing required field must fail the build');
    assert.match(res.stdout, /missing field "risks"/);
    cleanup(dir);
  });

  test('an empty risks array is valid — that is how a safe skill is marked', () => {
    const dir = project();
    writeFileSync(join(dir, 'article-docs', 'skills', 'skills.jsonl'), SKILL({ risks: [] }) + '\n');
    assert.equal(inProject(dir, ['validate']).code, 0);
    cleanup(dir);
  });

  test('fails on malformed JSONL', () => {
    const dir = project();
    writeFileSync(join(dir, 'article-docs', 'skills', 'skills.jsonl'), '{not json}\n');
    assert.equal(inProject(dir, ['validate']).code, 1);
    cleanup(dir);
  });

  test('fails when the index points at a file that is gone', () => {
    const dir = project();
    writeFileSync(join(dir, 'article-docs', 'sections', 'auth.md'), MODULE_MD);
    inProject(dir, ['reindex']);
    rmSync(join(dir, 'article-docs', 'sections', 'auth.md'));
    const res = inProject(dir, ['validate']);
    assert.equal(res.code, 1);
    cleanup(dir);
  });
});

describe('skills', () => {
  test('flags a skill as STALE past the 120-day threshold', () => {
    const dir = project();
    const old = new Date(Date.now() - 200 * 86400000).toISOString().slice(0, 10);
    const fresh = new Date().toISOString().slice(0, 10);
    writeFileSync(join(dir, 'article-docs', 'skills', 'skills.jsonl'),
      SKILL({ id: 'old-one', last_verified: old }) + '\n' +
      SKILL({ id: 'new-one', last_verified: fresh }) + '\n');
    const { stdout } = inProject(dir, ['skills', 'list']);
    assert.match(stdout.split('\n').find(l => l.includes('old-one')), /STALE/);
    assert.doesNotMatch(stdout.split('\n').find(l => l.includes('new-one')), /STALE/);
    cleanup(dir);
  });

  test('verify moves last_verified to today', () => {
    const dir = project();
    writeFileSync(join(dir, 'article-docs', 'skills', 'skills.jsonl'), SKILL({ last_verified: '2020-01-01' }) + '\n');
    inProject(dir, ['skills', 'verify', 'run-tests']);
    const sk = JSON.parse(readFileSync(join(dir, 'article-docs', 'skills', 'skills.jsonl'), 'utf8').trim());
    assert.equal(sk.last_verified, new Date().toISOString().slice(0, 10));
    cleanup(dir);
  });

  test('search matches on triggers, not just the name', () => {
    const dir = project();
    writeFileSync(join(dir, 'article-docs', 'skills', 'skills.jsonl'), SKILL({ triggers: ['smoke check'] }) + '\n');
    assert.match(inProject(dir, ['skills', 'search', 'smoke']).stdout, /run-tests/);
    cleanup(dir);
  });
});

describe('the shipped example', () => {
  test('reindexes and validates cleanly', () => {
    const dir = tempDir();
    cpSync(join(REPO, 'examples', 'thermal-paper'), dir, { recursive: true });
    cpSync(join(REPO, 'bin'), join(dir, 'article-docs', 'bin'), { recursive: true });
    assert.equal(inProject(dir, ['reindex']).code, 0);
    const res = inProject(dir, ['validate']);
    assert.equal(res.code, 0, res.stdout);
    cleanup(dir);
  });
});

describe('doctor', () => {
  test('reports a missing required file as FAIL', () => {
    const dir = project();
    rmSync(join(dir, 'article-docs', 'index.jsonl'));
    assert.match(inProject(dir, ['doctor']).stdout, /index\.jsonl\s+FAIL/);
    cleanup(dir);
  });
});
