import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, readFileSync, existsSync, rmSync, mkdirSync, appendFileSync, readdirSync } from 'node:fs';
import { join, run, tempDir, cleanup, CLI, inProject, gitProject } from './helpers.mjs';

/** An installation that is behind: old CLI, missing files, and edits of its own. */
function stale() {
  const { dir } = gitProject();
  run(CLI, ['init', dir, '--name', 'legacy'], dir);
  writeFileSync(join(dir, 'article-docs', 'bin', 'artdocs.mjs'), '// an older CLI\n');
  rmSync(join(dir, 'article-docs', 'AGENT-COMMANDS.md'));
  rmSync(join(dir, 'article-docs', 'reviews'), { recursive: true });
  appendFileSync(join(dir, 'article-docs', 'AI-INSTRUCTIONS.md'), '\n## Project specifics\nWe deploy with Fly.io.\n');
  writeFileSync(join(dir, 'article-docs', 'sections', 'billing.md'), '# billing — invoicing\n');
  writeFileSync(join(dir, 'article-docs', 'skills', 'skills.jsonl'), JSON.stringify({
    id: 'mine', name: 'Mine', category: 'testing', summary: 's', triggers: ['t'], owner: 'o',
    status: 'active', confidence: 'high', last_verified: '2026-09-01',
    commands: ['c'], files: ['f'], outputs: ['o'], risks: [], prompt: 'p',
  }) + '\n');
  const pm = join(dir, 'article-docs', 'project.memory.json');
  const d = JSON.parse(readFileSync(pm, 'utf8'));
  d.artdocs_version = '4.0';
  writeFileSync(pm, JSON.stringify(d, null, 2));
  return dir;
}

describe('upgrade', () => {
  test('replaces the CLI, which is the point', () => {
    const dir = stale();
    run(CLI, ['upgrade', dir], dir);
    const cli = readFileSync(join(dir, 'article-docs', 'bin', 'artdocs.mjs'), 'utf8');
    assert.doesNotMatch(cli, /^\/\/ an older CLI/);
    assert.match(cli, /Article Memory OS/);
    cleanup(dir);
  });

  test('never touches your memory', () => {
    const dir = stale();
    run(CLI, ['upgrade', dir], dir);
    assert.equal(readFileSync(join(dir, 'article-docs', 'sections', 'billing.md'), 'utf8'), '# billing — invoicing\n');
    assert.match(readFileSync(join(dir, 'article-docs', 'skills', 'skills.jsonl'), 'utf8'), /"id":"mine"/);
    cleanup(dir);
  });

  test('never overwrites a document you were meant to edit', () => {
    const dir = stale();
    run(CLI, ['upgrade', dir], dir);
    const text = readFileSync(join(dir, 'article-docs', 'AI-INSTRUCTIONS.md'), 'utf8');
    assert.match(text, /We deploy with Fly\.io/, 'the project\'s own edit was destroyed');
    assert.ok(existsSync(join(dir, 'article-docs', 'AI-INSTRUCTIONS.md.new')), 'no .new offered to merge');
    cleanup(dir);
  });

  test('says which files need merging by hand', () => {
    const dir = stale();
    const { stdout } = run(CLI, ['upgrade', dir], dir);
    assert.match(stdout, /Needs your eyes/);
    assert.match(stdout, /AI-INSTRUCTIONS\.md\.new/);
    cleanup(dir);
  });

  test('restores framework files that were deleted, and adds new directories', () => {
    const dir = stale();
    run(CLI, ['upgrade', dir], dir);
    assert.ok(existsSync(join(dir, 'article-docs', 'AGENT-COMMANDS.md')));
    assert.ok(existsSync(join(dir, 'article-docs', 'reviews')));
    cleanup(dir);
  });

  test('records the release it upgraded to', () => {
    const dir = stale();
    run(CLI, ['upgrade', dir], dir);
    const d = JSON.parse(readFileSync(join(dir, 'article-docs', 'project.memory.json'), 'utf8'));
    assert.match(d.artdocs_release, /^\d+\.\d+\.\d+$/);
    assert.ok(d.upgraded_on);
    cleanup(dir);
  });

  test('backs up everything it replaced', () => {
    const dir = stale();
    run(CLI, ['upgrade', dir], dir);
    const backups = readdirSync(join(dir, 'article-docs', '.backups'));
    assert.ok(backups.some(f => f.startsWith('bin.')), 'the old CLI was not kept');
    cleanup(dir);
  });

  test('--dry-run writes nothing at all', () => {
    const dir = stale();
    const { stdout } = run(CLI, ['upgrade', dir, '--dry-run'], dir);
    assert.match(stdout, /dry run/);
    assert.equal(readFileSync(join(dir, 'article-docs', 'bin', 'artdocs.mjs'), 'utf8'), '// an older CLI\n');
    assert.ok(!existsSync(join(dir, 'article-docs', 'AGENT-COMMANDS.md')));
    cleanup(dir);
  });

  test('is idempotent: a second run reports nothing to do', () => {
    const dir = stale();
    run(CLI, ['upgrade', dir], dir);
    rmSync(join(dir, 'article-docs', 'AI-INSTRUCTIONS.md.new'));
    writeFileSync(join(dir, 'article-docs', 'AI-INSTRUCTIONS.md'),
      readFileSync(join(CLI, '..', '..', 'template', 'AI-INSTRUCTIONS.md'), 'utf8').split('{{PROJECT_NAME}}').join('legacy'));
    const { stdout } = run(CLI, ['upgrade', dir], dir);
    assert.match(stdout, /nothing — already current/);
    assert.doesNotMatch(stdout, /Needs your eyes/);
    cleanup(dir);
  });

  test('leaves the project working afterwards', () => {
    const dir = stale();
    run(CLI, ['upgrade', dir], dir);
    assert.equal(inProject(dir, ['reindex']).code, 0);
    const res = inProject(dir, ['validate']);
    assert.equal(res.code, 0, res.stdout);
    assert.match(inProject(dir, ['status']).stdout, /sections\s+1/);
    cleanup(dir);
  });

  test('refuses on a directory that has no article-docs', () => {
    const dir = tempDir();
    const res = run(CLI, ['upgrade', dir], dir);
    assert.equal(res.code, 1);
    assert.match(res.stderr, /Use `init`/);
    cleanup(dir);
  });

  test('the installed CLI cannot upgrade itself, and says why', () => {
    const dir = stale();
    run(CLI, ['upgrade', dir], dir);
    const res = inProject(dir, ['upgrade']);
    assert.equal(res.code, 1);
    assert.match(res.stderr, /cannot upgrade itself/);
    assert.match(res.stderr, /git clone/);
    cleanup(dir);
  });
});

describe('a project that still has the old dashboard', () => {
  test('upgrade leaves it alone and says it is no longer served', () => {
    // Deleting a user's files is not an upgrade's business. But an orphaned
    // directory nobody explains becomes a mystery, so it is named.
    const dir = stale();
    mkdirSync(join(dir, 'article-docs', 'dashboard'), { recursive: true });
    writeFileSync(join(dir, 'article-docs', 'dashboard', 'server.mjs'), '// old\n');
    const { stdout } = run(CLI, ['upgrade', dir], dir);
    assert.match(stdout, /dashboard\/ — no longer shipped/);
    assert.equal(readFileSync(join(dir, 'article-docs', 'dashboard', 'server.mjs'), 'utf8'), '// old\n');
    cleanup(dir);
  });

  test('serve is gone from the CLI', () => {
    const dir = stale();
    run(CLI, ['upgrade', dir], dir);
    const res = inProject(dir, ['serve']);
    assert.notEqual(res.code, 0, 'serve must no longer be a command');
    cleanup(dir);
  });
});
