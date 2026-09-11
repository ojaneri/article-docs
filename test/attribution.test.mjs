import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, readFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { join, run, tempDir, cleanup, CLI, inProject, gitProject } from './helpers.mjs';

const MODULE = `# app

## Decisions

- **[#d-0001]** date: 2026-09-03 · status: proposed · author: dana
  **A choice.**
  A reason.
`;

function project() {
  const { dir } = gitProject();
  run(CLI, ['init', dir, '--name', 'app'], dir);
  mkdirSync(join(dir, 'article-docs', '.local'), { recursive: true });
  writeFileSync(join(dir, 'article-docs', '.local', 'user.json'),
    JSON.stringify({ user_id: 'dana', display_name: 'Dana', role: 'Owner' }));
  return dir;
}

const log = (dir) => readFileSync(join(dir, 'article-docs', 'audit', 'activity-log.jsonl'), 'utf8')
  .trim().split('\n').filter(Boolean).map(JSON.parse);

describe('six-plane attribution', () => {
  test('the log lives in audit/, as v4.2 specifies', () => {
    const dir = project();
    assert.ok(existsSync(join(dir, 'article-docs', 'audit', 'activity-log.jsonl')));
    assert.ok(!existsSync(join(dir, 'article-docs', 'team', 'activity-log.jsonl')));
    cleanup(dir);
  });

  test('a human working alone is the requester and the actor', () => {
    const dir = project();
    inProject(dir, ['session', 'start', '--module', 'app', '--task', 't']);
    const e = log(dir)[0];
    assert.equal(e.requested_by, 'human/dana');
    assert.equal(e.actor, 'human/dana');
    assert.equal(e.agent, undefined, 'no agent was involved, so none may be claimed');
    cleanup(dir);
  });

  test('an agent is the actor while the human stays the requester', () => {
    const dir = project();
    inProject(dir, ['session', 'start', '--module', 'app', '--task', 't'],
      { ARTDOCS_AGENT: 'claude-code-local-01' });
    const e = log(dir)[0];
    assert.equal(e.requested_by, 'human/dana', 'the human still asked for it');
    assert.equal(e.actor, 'agent/claude-code-local-01');
    assert.equal(e.agent, 'agent/claude-code-local-01');
    cleanup(dir);
  });

  test('CI is detected and recorded as automation', () => {
    const dir = project();
    inProject(dir, ['session', 'start', '--module', 'app', '--task', 't'],
      { GITHUB_ACTIONS: 'true', GITHUB_WORKFLOW: 'deploy.yml' });
    assert.equal(log(dir)[0].automation, 'github-actions/deploy.yml');
    cleanup(dir);
  });

  test('the workload principal is separate from the agent', () => {
    const dir = project();
    inProject(dir, ['session', 'start', '--module', 'app', '--task', 't'],
      { ARTDOCS_AGENT: 'claude', ARTDOCS_WORKLOAD: 'production-deployer' });
    const e = log(dir)[0];
    assert.equal(e.agent, 'agent/claude');
    assert.equal(e.authenticated_as, 'workload/production-deployer');
    cleanup(dir);
  });

  test('approved_by appears only where an approval genuinely happened', () => {
    const dir = project();
    inProject(dir, ['session', 'start', '--module', 'app', '--task', 't']);
    writeFileSync(join(dir, 'article-docs', 'sections', 'app.md'), MODULE);
    inProject(dir, ['reindex']);
    inProject(dir, ['promote', 'd-0001']);
    const events = log(dir);
    assert.equal(events.find(e => e.event === 'session_start').approved_by, undefined);
    assert.equal(events.find(e => e.event === 'decision_promoted').approved_by, 'human/dana');
    cleanup(dir);
  });

  test('records which planes were observed, so absent is not confused with none', () => {
    const dir = project();
    inProject(dir, ['session', 'start', '--module', 'app', '--task', 't'],
      { ARTDOCS_AGENT: 'claude' });
    const e = log(dir)[0];
    assert.deepEqual(e.attribution_observed, ['requested_by', 'actor', 'agent']);
    cleanup(dir);
  });

  test('keeps author and user_id, so v4.1 readers still work', () => {
    const dir = project();
    inProject(dir, ['session', 'start', '--module', 'app', '--task', 't']);
    const e = log(dir)[0];
    assert.equal(e.user_id, 'dana');
    assert.equal(e.author, 'Dana');
    cleanup(dir);
  });
});

describe('identity status', () => {
  test('shows every plane, including the ones it cannot observe', () => {
    const dir = project();
    const { stdout } = inProject(dir, ['identity', 'status']);
    for (const p of ['requested_by', 'actor', 'agent', 'automation', 'authenticated_as', 'approved_by']) {
      assert.match(stdout, new RegExp(p));
    }
    assert.match(stdout, /not recorded/);
    assert.match(stdout, /could not observe it/, 'must say absent means unobserved, not none');
    cleanup(dir);
  });

  test('--json gives the resolved planes to a script', () => {
    const dir = project();
    const data = JSON.parse(inProject(dir, ['identity', 'status', '--json'],
      { ARTDOCS_AGENT: 'claude' }).stdout);
    assert.equal(data.planes.agent, 'agent/claude');
    assert.equal(data.local_identity.user_id, 'dana');
    cleanup(dir);
  });
});

describe('export audit', () => {
  test('reports how much of the six-plane model the history supports', () => {
    const dir = project();
    inProject(dir, ['session', 'start', '--module', 'app', '--task', 't'], { ARTDOCS_AGENT: 'claude' });
    const { stdout } = inProject(dir, ['export', 'audit', '--format', 'json']);
    assert.match(stdout, /Plane coverage/);
    const data = JSON.parse(readFileSync(join(dir, 'article-docs', '.generated', 'audit.json'), 'utf8'));
    assert.equal(data.plane_coverage.agent, 1);
    assert.equal(data.plane_coverage.automation, 0);
    cleanup(dir);
  });

  test('counts legacy rows rather than backfilling them', () => {
    const dir = project();
    writeFileSync(join(dir, 'article-docs', 'audit', 'activity-log.jsonl'),
      JSON.stringify({ event: 'file_saved', user_id: 'dana', author: 'Dana', timestamp: '2026-07-01T10:00:00Z' }) + '\n');
    const { stdout } = inProject(dir, ['export', 'audit', '--format', 'json']);
    assert.match(stdout, /1 row\(s\) predate six-plane attribution/);
    assert.match(stdout, /inventing provenance/);
    const data = JSON.parse(readFileSync(join(dir, 'article-docs', '.generated', 'audit.json'), 'utf8'));
    assert.equal(data.legacy_rows, 1);
    assert.equal(data.log[0].requested_by, undefined, 'a legacy row must not gain invented planes');
    cleanup(dir);
  });
});

describe('upgrading a v4.1 install', () => {
  test('moves the log to audit/ and keeps every line', () => {
    const dir = project();
    // Recreate the v4.1 layout.
    const v41 = join(dir, 'article-docs', 'team', 'activity-log.jsonl');
    const v42 = join(dir, 'article-docs', 'audit', 'activity-log.jsonl');
    const old = JSON.stringify({ event: 'file_saved', user_id: 'dana', author: 'Dana', timestamp: '2026-07-01T10:00:00Z' }) + '\n';
    mkdirSync(join(dir, 'article-docs', 'team'), { recursive: true });   // v4.1 had no identity/
    writeFileSync(v41, old);
    rmSync(v42);
    rmSync(join(dir, 'article-docs', 'audit'), { recursive: true });

    const { stdout } = run(CLI, ['upgrade', dir], dir);
    assert.match(stdout, /moved from team\//);
    assert.equal(readFileSync(v42, 'utf8'), old, 'history was not preserved');
    assert.ok(!existsSync(v41), 'two diverging logs is worse than one');
    cleanup(dir);
  });
});

describe('running inside CI', () => {
  test('the automation becomes the actor when no agent declared itself', () => {
    const dir = project();
    inProject(dir, ['session', 'start', '--module', 'app', '--task', 't'],
      { GITHUB_ACTIONS: 'true', GITHUB_WORKFLOW: 'ci.yml' });
    const e = log(dir)[0];
    assert.equal(e.actor, 'automation/github-actions/ci.yml');
    assert.equal(e.requested_by, 'human/dana', 'the human who queued it still asked');
    cleanup(dir);
  });

  test('a declared agent outranks the automation as actor', () => {
    const dir = project();
    inProject(dir, ['session', 'start', '--module', 'app', '--task', 't'],
      { GITHUB_ACTIONS: 'true', GITHUB_WORKFLOW: 'ci.yml', ARTDOCS_AGENT: 'claude' });
    const e = log(dir)[0];
    assert.equal(e.actor, 'agent/claude', 'the agent did the editing, the runner only hosted it');
    assert.equal(e.automation, 'github-actions/ci.yml', 'and the runner is still recorded');
    cleanup(dir);
  });

  test('an unnamed CI platform is recorded as such rather than guessed', () => {
    const dir = project();
    inProject(dir, ['session', 'start', '--module', 'app', '--task', 't'], { CI: 'true' });
    assert.equal(log(dir)[0].automation, 'ci/unidentified');
    cleanup(dir);
  });
});
