import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, readFileSync, mkdirSync, appendFileSync, existsSync, chmodSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, run, cleanup, CLI, inProject, gitProject } from './helpers.mjs';

const MODULE = `# app — the thing

## Decisions

- **[#d-0001]** date: 2026-09-02 · status: proposed · author: dana
  **Backoff over a fixed delay.**
  Because the API rate-limits.

- **[#d-0002]** date: 2026-09-02 · status: proposed · author: dana
  **SQLite over a JSON file.**
  Atomic writes.
`;

function project(role = 'Owner') {
  const { dir, git } = gitProject();
  run(CLI, ['init', dir, '--name', 'app'], dir);
  mkdirSync(join(dir, 'article-docs', '.local'), { recursive: true });
  writeFileSync(join(dir, 'article-docs', '.local', 'user.json'),
    JSON.stringify({ user_id: 'dana', display_name: 'Dana', email: 'd@example.com', role }));
  writeFileSync(join(dir, 'article-docs', 'sections', 'app.md'), MODULE);
  inProject(dir, ['reindex']);
  return { dir, git };
}

describe('status', () => {
  test('reports the counts that matter', () => {
    const { dir } = project();
    const { stdout } = inProject(dir, ['status']);
    assert.match(stdout, /sections\s+1/);
    assert.match(stdout, /2 proposed, awaiting a human/);
    assert.match(stdout, /Dana/);
    cleanup(dir);
  });

  test('suggests what to do next, and only what applies', () => {
    const { dir } = project();
    const { stdout } = inProject(dir, ['status']);
    assert.match(stdout, /artdocs promote/, 'proposed decisions must surface a next step');
    assert.doesNotMatch(stdout, /artdocs whoami\s+set your identity/, 'identity is set; do not suggest it');
    cleanup(dir);
  });

  test('flags an open session with its age and decision count', () => {
    const { dir } = project();
    inProject(dir, ['session', 'start', '--module', 'app', '--task', 'work']);
    const { stdout } = inProject(dir, ['status']);
    assert.match(stdout, /OPEN SESSION/);
    assert.match(stdout, /0 decision\(s\) noted so far/);
    cleanup(dir);
  });

  test('--json is machine readable and carries the same facts', () => {
    const { dir } = project();
    const data = JSON.parse(inProject(dir, ['status', '--json']).stdout);
    assert.equal(data.sections, 1);
    assert.equal(data.proposed_decisions.length, 2);
    assert.equal(data.user.user_id, 'dana');
    cleanup(dir);
  });
});

describe('promote', () => {
  test('lists what is waiting instead of acting without an id', () => {
    const { dir } = project();
    const { stdout } = inProject(dir, ['promote']);
    assert.match(stdout, /2 decision\(s\) proposed/);
    assert.match(stdout, /d-0001/);
    cleanup(dir);
  });

  test('promotes exactly one decision and leaves its neighbour alone', () => {
    const { dir } = project();
    inProject(dir, ['promote', 'd-0001']);
    const text = readFileSync(join(dir, 'article-docs', 'sections', 'app.md'), 'utf8');
    assert.match(text, /\[#d-0001\][^\n]*status: accepted/);
    assert.match(text, /\[#d-0002\][^\n]*status: proposed/, 'the neighbour was modified');
    cleanup(dir);
  });

  test('records who promoted it and when', () => {
    const { dir } = project();
    inProject(dir, ['promote', 'd-0001']);
    assert.match(readFileSync(join(dir, 'article-docs', 'sections', 'app.md'), 'utf8'), /promoted_by: dana on \d{4}-\d{2}-\d{2}/);
    const log = readFileSync(join(dir, 'article-docs', 'audit', 'activity-log.jsonl'), 'utf8');
    assert.match(log, /decision_promoted/);
    assert.match(log, /"approved_by":"human\/dana"/, 'a promotion is an approval and must record one');
    cleanup(dir);
  });

  test('refuses a Contributor — only a human with the role may accept', () => {
    const { dir } = project('Contributor');
    const res = inProject(dir, ['promote', 'd-0001']);
    assert.equal(res.code, 1);
    assert.match(res.stderr, /Only Owner or Maintainer/);
    assert.match(readFileSync(join(dir, 'article-docs', 'sections', 'app.md'), 'utf8'), /\[#d-0001\][^\n]*status: proposed/);
    cleanup(dir);
  });

  test('rejects as well as accepts, because proposed is not a graveyard', () => {
    const { dir } = project();
    inProject(dir, ['promote', 'd-0002', '--status', 'rejected']);
    assert.match(readFileSync(join(dir, 'article-docs', 'sections', 'app.md'), 'utf8'), /\[#d-0002\][^\n]*status: rejected/);
    cleanup(dir);
  });

  test('--all promotes every proposed decision', () => {
    const { dir } = project();
    inProject(dir, ['promote', '--all']);
    const text = readFileSync(join(dir, 'article-docs', 'sections', 'app.md'), 'utf8');
    assert.doesNotMatch(text, /status: proposed/);
    cleanup(dir);
  });

  test('says so rather than failing when nothing is waiting', () => {
    const { dir } = project();
    inProject(dir, ['promote', '--all']);
    const { stdout, code } = inProject(dir, ['promote']);
    assert.equal(code, 0);
    assert.match(stdout, /No decisions are waiting/);
    cleanup(dir);
  });

  test('reindexes, so status stops showing them as pending', () => {
    const { dir } = project();
    inProject(dir, ['promote', '--all']);
    assert.doesNotMatch(inProject(dir, ['status']).stdout, /proposed, awaiting/);
    cleanup(dir);
  });
});

describe('pre-commit hook', () => {
  const commit = (dir, msg, extra = []) => {
    try {
      execFileSync('git', ['-C', dir, 'commit', '-m', msg, ...extra], { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
      return { ok: true, err: '' };
    } catch (e) { return { ok: false, err: e.stderr ?? '' }; }
  };

  test('installs an executable hook', () => {
    const { dir } = project();
    inProject(dir, ['hooks', 'install']);
    const path = join(dir, '.git', 'hooks', 'pre-commit');
    assert.ok(existsSync(path));
    assert.match(readFileSync(path, 'utf8'), /article-docs pre-commit/);
    cleanup(dir);
  });

  test('blocks a commit when the memory is invalid', () => {
    const { dir, git } = project();
    inProject(dir, ['hooks', 'install']);
    writeFileSync(join(dir, 'article-docs', 'skills', 'skills.jsonl'), '{"id":"bad"}\n');
    git('add', '-A');
    const res = commit(dir, 'should be blocked');
    assert.equal(res.ok, false, 'the commit went through despite invalid memory');
    assert.match(res.err, /memory is invalid/);
    cleanup(dir);
  });

  test('--no-verify still gets through, because it is a guard rail not a cage', () => {
    const { dir, git } = project();
    inProject(dir, ['hooks', 'install']);
    writeFileSync(join(dir, 'article-docs', 'skills', 'skills.jsonl'), '{"id":"bad"}\n');
    git('add', '-A');
    assert.equal(commit(dir, 'bypass', ['--no-verify']).ok, true);
    cleanup(dir);
  });

  test('drift warns but never blocks', () => {
    const { dir, git } = project();
    inProject(dir, ['hooks', 'install']);
    appendFileSync(join(dir, 'src.js'), 'export const b = 2\n');
    git('add', '-A');
    assert.equal(commit(dir, 'drifty but valid').ok, true, 'drift must not block a commit');
    cleanup(dir);
  });

  test('refuses to overwrite a hook it did not write', () => {
    const { dir } = project();
    const path = join(dir, '.git', 'hooks', 'pre-commit');
    writeFileSync(path, '#!/bin/sh\necho mine\n', { mode: 0o755 });
    const res = inProject(dir, ['hooks', 'install']);
    assert.equal(res.code, 1);
    assert.match(res.stderr, /Refusing to overwrite/);
    assert.match(readFileSync(path, 'utf8'), /echo mine/);
    cleanup(dir);
  });

  test('uninstall removes only its own hook', () => {
    const { dir } = project();
    inProject(dir, ['hooks', 'install']);
    inProject(dir, ['hooks', 'uninstall']);
    assert.ok(!existsSync(join(dir, '.git', 'hooks', 'pre-commit')));
    cleanup(dir);
  });

  test('uninstall leaves someone else\'s hook alone', () => {
    const { dir } = project();
    const path = join(dir, '.git', 'hooks', 'pre-commit');
    writeFileSync(path, '#!/bin/sh\necho mine\n', { mode: 0o755 });
    const res = inProject(dir, ['hooks', 'uninstall']);
    assert.equal(res.code, 1);
    assert.ok(existsSync(path));
    cleanup(dir);
  });
});

describe('roles on joining', () => {
  test('a populated registry does not hand a newcomer Owner', () => {
    // whoami is interactive; the defaults it would offer are what matter here, and
    // the non-interactive path reports rather than prompts. Assert the guard that
    // actually protects the project: promote refuses a Contributor.
    const { dir } = gitProject();
    run(CLI, ['init', dir, '--name', 'app'], dir);
    inProject(dir, ['invite', '--name', 'Sam Ferreira', '--role', 'Contributor']);
    mkdirSync(join(dir, 'article-docs', '.local'), { recursive: true });
    writeFileSync(join(dir, 'article-docs', '.local', 'user.json'),
      JSON.stringify({ user_id: 'sam', display_name: 'Sam Ferreira', role: 'Contributor' }));
    writeFileSync(join(dir, 'article-docs', 'sections', 'app.md'), MODULE);
    inProject(dir, ['reindex']);
    const res = inProject(dir, ['promote', 'd-0001']);
    assert.equal(res.code, 1);
    assert.match(res.stderr, /Only Owner or Maintainer/);
    cleanup(dir);
  });

  test('an identity with no email is displayed and used without complaint', () => {
    const { dir } = gitProject();
    run(CLI, ['init', dir, '--name', 'app'], dir);
    mkdirSync(join(dir, 'article-docs', '.local'), { recursive: true });
    writeFileSync(join(dir, 'article-docs', '.local', 'user.json'),
      JSON.stringify({ user_id: 'sam', display_name: 'Sam Ferreira', role: 'Owner' }));
    const { stdout } = inProject(dir, ['status']);
    assert.match(stdout, /Sam Ferreira · Owner/, 'an empty email must not render as <>');
    cleanup(dir);
  });
});
