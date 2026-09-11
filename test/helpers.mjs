import { mkdtempSync, rmSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync, execFile } from 'node:child_process';

export const REPO = dirname(dirname(fileURLToPath(import.meta.url)));
export const CLI  = join(REPO, 'bin', 'artdocs.mjs');

/** Run any node script, returning { code, stdout, stderr } instead of throwing. */
/**
 * Variables that make attribution non-deterministic. The suite itself runs in CI,
 * where GITHUB_ACTIONS is set — so without this, every test asserting the
 * plain-human case fails on CI and passes locally.
 */
const AMBIENT = ['CI', 'GITHUB_ACTIONS', 'GITHUB_WORKFLOW', 'GITLAB_CI', 'CI_JOB_NAME',
                 'CIRCLECI', 'JENKINS_URL', 'BUILDKITE', 'ARTDOCS_AGENT', 'ARTDOCS_WORKLOAD'];

export function run(script, args, cwd, env) {
  const clean = { ...process.env };
  for (const k of AMBIENT) delete clean[k];
  try {
    const stdout = execFileSync(process.execPath, [script, ...args], {
      cwd, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...clean, ...env },
    });
    return { code: 0, stdout, stderr: '' };
  } catch (e) {
    return { code: e.status ?? 1, stdout: e.stdout ?? '', stderr: e.stderr ?? '' };
  }
}

/** The CLI installed inside a project — the only place it works from. */
export const inProject = (dir, args, env) => run(join(dir, 'article-docs', 'bin', 'artdocs.mjs'), args, dir, env);

/**
 * Stop git from walking above the temp directory when looking for a repository.
 * Without this the test depends on whether the machine happens to have a git
 * repository above /tmp — which some servers do.
 */
export const noGitAbove = (dir) => ({ GIT_CEILING_DIRECTORIES: dirname(dir) });

/** A throwaway directory, cleaned up by the caller via cleanup(). */
export function tempDir() {
  return mkdtempSync(join(tmpdir(), 'artdocs-test-'));
}

export function cleanup(dir) {
  rmSync(dir, { recursive: true, force: true });
}

/** A temp directory that is a git repo with one commit, so `git status` is meaningful. */
export function gitProject() {
  const dir = tempDir();
  const git = (...a) => execFileSync('git', ['-C', dir, ...a], { stdio: 'pipe' });
  git('init', '-q', '-b', 'main');
  git('config', 'user.email', 'test@example.com');
  git('config', 'user.name', 'test');
  writeFileSync(join(dir, 'src.js'), 'export const a = 1\n');
  git('add', '-A');
  git('commit', '-qm', 'init');
  return { dir, git };
}

export { writeFileSync, readFileSync, existsSync, join, execFile };
