import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, readFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { join, run, cleanup, CLI, inProject, gitProject } from './helpers.mjs';

const MODULE = `# app

## Decisions

- **[#d-0001]** date: 2026-09-03 · status: proposed · author: dana
  **A choice.**
  A reason.
`;

function project(agents = null) {
  const { dir } = gitProject();
  run(CLI, ['init', dir, '--name', 'app'], dir);
  mkdirSync(join(dir, 'article-docs', '.local'), { recursive: true });
  writeFileSync(join(dir, 'article-docs', '.local', 'user.json'),
    JSON.stringify({ user_id: 'dana', display_name: 'Dana', role: 'Owner' }));
  writeFileSync(join(dir, 'article-docs', 'sections', 'app.md'), MODULE);
  if (agents) {
    writeFileSync(join(dir, 'article-docs', 'identity', 'agents.registry.json'),
      JSON.stringify({ agents }, null, 2));
  }
  inProject(dir, ['reindex']);
  return dir;
}

const decisionStatus = (dir) =>
  /\[#d-0001\][^\n]*status: (\w+)/.exec(readFileSync(join(dir, 'article-docs', 'sections', 'app.md'), 'utf8'))[1];

describe('an agent does not inherit a human role', () => {
  test('an unregistered agent cannot promote, even under an Owner', () => {
    // This was a real hole: the check read the human's role and never asked
    // whether an agent was the one actually acting.
    const dir = project();
    const res = inProject(dir, ['promote', 'd-0001'], { ARTDOCS_AGENT: 'claude-code-local-01' });
    assert.equal(res.code, 1);
    assert.match(res.stderr, /not listed in identity\/agents\.registry\.json/);
    assert.equal(decisionStatus(dir), 'proposed', 'the decision was promoted anyway');
    cleanup(dir);
  });

  test('a registered agent forbidden by its own permissions cannot promote', () => {
    const dir = project([{ id: 'claude', permissions: { memory_promote_canonical: false } }]);
    const res = inProject(dir, ['promote', 'd-0001'], { ARTDOCS_AGENT: 'claude' });
    assert.equal(res.code, 1);
    assert.match(res.stderr, /memory_promote_canonical is false/);
    assert.equal(decisionStatus(dir), 'proposed');
    cleanup(dir);
  });

  test('a permission that is simply not declared is a refusal, not a yes', () => {
    const dir = project([{ id: 'claude', permissions: { git_commit: true } }]);
    const res = inProject(dir, ['promote', 'd-0001'], { ARTDOCS_AGENT: 'claude' });
    assert.equal(res.code, 1);
    assert.match(res.stderr, /is not declared/);
    cleanup(dir);
  });

  test('an agent explicitly granted the permission may promote', () => {
    const dir = project([{ id: 'reviewer', permissions: { memory_promote_canonical: true } }]);
    const res = inProject(dir, ['promote', 'd-0001'], { ARTDOCS_AGENT: 'reviewer' });
    assert.equal(res.code, 0, res.stderr);
    assert.equal(decisionStatus(dir), 'accepted');
    cleanup(dir);
  });

  test('a human with no agent declared is unaffected', () => {
    const dir = project();
    assert.equal(inProject(dir, ['promote', 'd-0001']).code, 0);
    assert.equal(decisionStatus(dir), 'accepted');
    cleanup(dir);
  });

  test('the human role still governs when a human is acting', () => {
    const dir = project();
    writeFileSync(join(dir, 'article-docs', '.local', 'user.json'),
      JSON.stringify({ user_id: 'sam', display_name: 'Sam', role: 'Contributor' }));
    const res = inProject(dir, ['promote', 'd-0001']);
    assert.equal(res.code, 1);
    assert.match(res.stderr, /Only Owner or Maintainer/);
    cleanup(dir);
  });
});

describe('agents list', () => {
  test('says nothing is registered, and what that implies', () => {
    const dir = project([]);
    const { stdout } = inProject(dir, ['agents', 'list']);
    assert.match(stdout, /No agents registered/);
    assert.match(stdout, /denied every protected action/);
    cleanup(dir);
  });

  test('shows the declared permissions that matter', () => {
    const dir = project([
      { id: 'claude', runtime: 'claude-code', permissions: { git_push: false, memory_promote_canonical: false } },
      { id: 'reviewer', runtime: 'batch', permissions: { git_push: true, memory_promote_canonical: true } },
    ]);
    const { stdout } = inProject(dir, ['agents', 'list']);
    assert.match(stdout, /claude/);
    assert.match(stdout, /reviewer/);
    assert.match(stdout, /promote canonical/);
    cleanup(dir);
  });

  test('marks the agent currently driving, and warns when it is unregistered', () => {
    const dir = project([{ id: 'reviewer', permissions: {} }]);
    const { stdout } = inProject(dir, ['agents', 'list'], { ARTDOCS_AGENT: 'stranger' });
    assert.match(stdout, /"stranger" is NOT registered/);
    cleanup(dir);
  });
});

describe('workloads list', () => {
  test('explains what belongs there and what never does', () => {
    const dir = project();
    const { stdout } = inProject(dir, ['workloads', 'list']);
    assert.match(stdout, /never a credential value/);
    cleanup(dir);
  });

  test('lists registered workloads', () => {
    const dir = project();
    writeFileSync(join(dir, 'article-docs', 'identity', 'workloads.registry.json'), JSON.stringify({
      workloads: [{ id: 'production-deployer', platform: 'github-actions', environment: 'production', credential_reference: 'oidc://aws/role/deploy' }],
    }));
    const { stdout } = inProject(dir, ['workloads', 'list']);
    assert.match(stdout, /production-deployer/);
    assert.match(stdout, /oidc:/);
    cleanup(dir);
  });
});

describe('identity status with the registries', () => {
  test('reports whether the driving agent may promote, and why not', () => {
    const dir = project([{ id: 'claude', permissions: { memory_promote_canonical: false } }]);
    const { stdout } = inProject(dir, ['identity', 'status'], { ARTDOCS_AGENT: 'claude' });
    assert.match(stdout, /may NOT promote memory to canonical/);
    assert.match(stdout, /never inherited by an agent/);
    cleanup(dir);
  });

  test('counts what is registered across the three registries', () => {
    const dir = project([{ id: 'a', permissions: {} }, { id: 'b', permissions: {} }]);
    assert.match(inProject(dir, ['identity', 'status']).stdout, /2 agent\(s\)/);
    cleanup(dir);
  });
});

describe('upgrading a v4.1 install to the IDENTITY plane', () => {
  test('moves the human registry, roles and ownership into identity/', () => {
    const dir = project();
    const dd = join(dir, 'article-docs');
    // Recreate the v4.1 layout.
    mkdirSync(join(dd, 'team'), { recursive: true });
    const registry = JSON.stringify({ users: [{ user_id: 'dana', display_name: 'Dana', role: 'Owner' }] });
    writeFileSync(join(dd, 'team', 'users.registry.json'), registry);
    writeFileSync(join(dd, 'team', 'roles.md'), '# Roles\n');
    rmSync(join(dd, 'identity'), { recursive: true });

    const { stdout } = run(CLI, ['upgrade', dir], dir);
    assert.match(stdout, /identity\/humans\.registry\.json \(moved/);
    assert.equal(readFileSync(join(dd, 'identity', 'humans.registry.json'), 'utf8'), registry);
    assert.ok(!existsSync(join(dd, 'team', 'users.registry.json')));
    assert.ok(existsSync(join(dd, 'identity', 'agents.registry.json')), 'the new registry was not added');
    cleanup(dir);
  });

  test('never overwrites an agents registry the project already wrote', () => {
    const dir = project([{ id: 'mine', permissions: { memory_promote_canonical: true } }]);
    run(CLI, ['upgrade', dir], dir);
    const agents = JSON.parse(readFileSync(join(dir, 'article-docs', 'identity', 'agents.registry.json'), 'utf8')).agents;
    assert.equal(agents[0].id, 'mine');
    cleanup(dir);
  });
});
