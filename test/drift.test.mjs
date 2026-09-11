import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { writeFileSync, appendFileSync, mkdirSync } from 'node:fs';
import { join, run, tempDir, cleanup, CLI, inProject, gitProject, noGitAbove } from './helpers.mjs';

describe('git drift', () => {
  test('reports the first changed file with its full name', () => {
    // Regression: gitRun trimmed the whole output, eating the leading space of
    // `git status --porcelain`'s status column on the first line only. With the
    // old fixed slice(3), a modified `src.js` was reported as `rc.js`.
    const { dir } = gitProject();
    run(CLI, ['init', dir], dir);
    appendFileSync(join(dir, 'src.js'), 'export const b = 2\n');
    const { stdout } = inProject(dir, ['git', 'drift']);
    assert.match(stdout, /(^|\s)src\.js/m, 'the filename was truncated');
    assert.doesNotMatch(stdout, /(^|\s)rc\.js/m);
    cleanup(dir);
  });

  test('follows a rename to its destination', () => {
    const { dir, git } = gitProject();
    run(CLI, ['init', dir], dir);
    git('mv', 'src.js', 'renamed.js');
    const { stdout } = inProject(dir, ['git', 'drift']);
    assert.match(stdout, /renamed\.js/);
    cleanup(dir);
  });

  test('does not flag changes inside article-docs as drift', () => {
    const { dir, git } = gitProject();
    run(CLI, ['init', dir], dir);
    git('add', '-A'); git('commit', '-qm', 'add article-docs');
    appendFileSync(join(dir, 'article-docs', 'ARTICLE-MEMORY.md'), '\nupdated\n');
    const { stdout } = inProject(dir, ['git', 'drift']);
    assert.match(stdout, /No drift/);
    cleanup(dir);
  });

  test('a source change with a matching memory update is not drift', () => {
    const { dir, git } = gitProject();
    run(CLI, ['init', dir], dir);
    mkdirSync(join(dir, 'src'), { recursive: true });
    writeFileSync(join(dir, 'src', 'auth.js'), 'export const login = 1\n');
    git('add', '-A'); git('commit', '-qm', 'baseline');
    appendFileSync(join(dir, 'src', 'auth.js'), 'export const logout = 2\n');
    writeFileSync(join(dir, 'article-docs', 'sections', 'src.md'), '# src\n');
    const { stdout } = inProject(dir, ['git', 'drift']);
    assert.match(stdout, /No drift/);
    cleanup(dir);
  });

  test('says so instead of crashing outside a git repository', () => {
    const dir = tempDir();
    run(CLI, ['init', dir], dir);
    const res = inProject(dir, ['git', 'drift'], noGitAbove(dir));
    assert.equal(res.code, 0);
    assert.match(res.stdout, /not in a git repository|Skipping drift check/);
    cleanup(dir);
  });

  test('works when article-docs sits in a subdirectory of a larger repository', () => {
    // The prefix must come from `git rev-parse --show-toplevel`, not from an
    // assumption that the project root is the git root.
    const { dir, git } = gitProject();
    const sub = join(dir, 'packages', 'api');
    mkdirSync(sub, { recursive: true });
    writeFileSync(join(sub, 'index.js'), 'export const x = 1\n');
    git('add', '-A'); git('commit', '-qm', 'sub');
    run(CLI, ['init', sub], sub);
    appendFileSync(join(sub, 'index.js'), 'export const y = 2\n');
    const { stdout } = inProject(sub, ['git', 'drift']);
    assert.match(stdout, /index\.js/);
    // A change outside this project must not be attributed to it.
    assert.doesNotMatch(stdout, /src\.js/);
    cleanup(dir);
  });
});
