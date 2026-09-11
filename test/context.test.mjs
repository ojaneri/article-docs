import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, readFileSync, readdirSync, mkdirSync } from 'node:fs';
import { join, run, tempDir, cleanup, CLI, inProject, gitProject } from './helpers.mjs';

const BIG_MODULE = `# storage — persistence

${'Prose about the storage layer that goes on at length. '.repeat(120)}

## Schema
${'A table description. '.repeat(80)}

## Decisions

- **[#d-0001]** date: 2026-09-01 · status: accepted · author: dana
  **SQLite over a JSON file.**
  Concurrent writes.

- **[#d-0002]** date: 2026-09-01 · status: proposed · author: dana
  **Timestamps in UTC.**
  Not yet reviewed.

- **[#d-0003]** date: 2026-09-01 · status: superseded · author: dana
  **The old thing.**
  Replaced.
`;

function project() {
  const { dir } = gitProject();
  run(CLI, ['init', dir, '--name', 'app'], dir);
  mkdirSync(join(dir, 'article-docs', '.local'), { recursive: true });
  writeFileSync(join(dir, 'article-docs', '.local', 'user.json'),
    JSON.stringify({ user_id: 'dana', display_name: 'Dana', role: 'Owner' }));
  writeFileSync(join(dir, 'article-docs', 'sections', 'storage.md'), BIG_MODULE);
  inProject(dir, ['reindex']);
  return dir;
}

const pack = (dir) => {
  const d = join(dir, 'article-docs', 'context-packs');
  return readFileSync(join(d, readdirSync(d).find(f => f.endsWith('.md'))), 'utf8');
};

describe('context packs', () => {
  test('lists only binding decisions, and says the rest do not bind', () => {
    // The decisions live inside the module markdown, so they travel with it. What the
    // pack controls is which are presented as settled — and a superseded decision read
    // as settled is worse than one that is missing.
    const dir = project();
    inProject(dir, ['context', 'storage', '--task', 'add vacuum']);
    const text = pack(dir);
    const binding = text.slice(text.indexOf('## Binding Decisions'), text.indexOf('## Not in this pack'));
    assert.match(binding, /d-0001/, 'the accepted decision must be listed');
    assert.doesNotMatch(binding, /d-0002/, 'a proposed decision is not binding');
    assert.doesNotMatch(binding, /d-0003/, 'a superseded decision is not binding');
    assert.match(text, /2 further decision\(s\)/, 'must say how many it set aside');
    assert.match(text, /do\s*\n?\s*not bind/, 'must warn that the module text still shows them');
    cleanup(dir);
  });

  test('--all-decisions opts back in', () => {
    const dir = project();
    inProject(dir, ['context', 'storage', '--task', 't', '--all-decisions']);
    const text = pack(dir);
    for (const id of ['d-0001', 'd-0002', 'd-0003']) assert.match(text, new RegExp(id));
    cleanup(dir);
  });

  test('truncating keeps the decisions and drops the prose', () => {
    // The old code cut at 3000 characters, which dropped whatever came last —
    // and in a module file that is the Decisions section.
    const dir = project();
    inProject(dir, ['context', 'storage', '--task', 'tight', '--budget', '400']);
    const text = pack(dir);
    assert.match(text, /## Decisions/, 'the decisions were truncated away');
    assert.match(text, /Sections omitted/, 'must name what it dropped');
    cleanup(dir);
  });

  test('names what exists outside the pack', () => {
    const dir = project();
    writeFileSync(join(dir, 'article-docs', 'sections', 'billing.md'), '# billing\n');
    inProject(dir, ['reindex']);
    inProject(dir, ['context', 'storage', '--task', 't']);
    const text = pack(dir);
    assert.match(text, /## Not in this pack/);
    assert.match(text, /billing/, 'the agent must know billing exists to ask for it');
    cleanup(dir);
  });

  test('reports the token cost against the budget', () => {
    const dir = project();
    const { stdout } = inProject(dir, ['context', 'storage', '--task', 't']);
    assert.match(stdout, /~\d+ tokens of a ~4000 budget/);
    cleanup(dir);
  });

  test('says so when the framing alone blows the budget', () => {
    const dir = project();
    const { stdout } = inProject(dir, ['context', 'storage', '--task', 't', '--budget', '200']);
    assert.match(stdout, /Over budget/);
    cleanup(dir);
  });

  test('rejects a nonsense budget instead of silently ignoring it', () => {
    const dir = project();
    const res = inProject(dir, ['context', 'storage', '--task', 't', '--budget', 'lots']);
    assert.equal(res.code, 1);
    cleanup(dir);
  });
});

describe('identity survives the machine', () => {
  test('whoami writes the committed half, not just the local one', () => {
    const dir = tempDir();
    run(CLI, ['init', dir, '--name', 'app'], dir);
    run(join(dir, 'article-docs', 'bin', 'artdocs.mjs'),
      ['whoami', '--name', 'Dana Okafor', '--email', 'dana@example.com', '--role', 'Owner'], dir);
    const reg = JSON.parse(readFileSync(join(dir, 'article-docs', 'identity', 'humans.registry.json'), 'utf8'));
    const dana = reg.users.find(u => u.user_id === 'dana');
    assert.ok(dana, 'the person exists nowhere committed');
    assert.equal(dana.email, 'dana@example.com', 'the email is how a new machine matches you');
    assert.equal(dana.role, 'Owner');
    cleanup(dir);
  });

  test('replaces the TODO placeholder rather than sitting beside it', () => {
    const dir = tempDir();
    run(CLI, ['init', dir, '--name', 'app'], dir);
    run(join(dir, 'article-docs', 'bin', 'artdocs.mjs'), ['whoami', '--name', 'Dana', '--role', 'Owner'], dir);
    const users = JSON.parse(readFileSync(join(dir, 'article-docs', 'identity', 'humans.registry.json'), 'utf8')).users;
    assert.equal(users.length, 1);
    assert.equal(users[0].user_id, 'dana');
    cleanup(dir);
  });

  test('--no-registry declines, and says what that costs', () => {
    const dir = tempDir();
    run(CLI, ['init', dir, '--name', 'app'], dir);
    const { stdout } = run(join(dir, 'article-docs', 'bin', 'artdocs.mjs'),
      ['whoami', '--name', 'Dana', '--no-registry'], dir);
    assert.match(stdout, /nobody else can resolve/);
    cleanup(dir);
  });
});

describe('memory at risk', () => {
  test('flags memory that is not committed anywhere', () => {
    const { dir } = gitProject();
    run(CLI, ['init', dir, '--name', 'app'], dir);
    const { stdout } = inProject(dir, ['status']);
    assert.match(stdout, /AT RISK/);
    assert.match(stdout, /not committed/);
    cleanup(dir);
  });

  test('flags a project with no remote once it is committed', () => {
    const { dir, git } = gitProject();
    run(CLI, ['init', dir, '--name', 'app'], dir);
    git('add', '-A'); git('commit', '-qm', 'memory');
    const { stdout } = inProject(dir, ['status']);
    assert.match(stdout, /exists only on this machine/);
    cleanup(dir);
  });

  test('ignores the gitignored local files, which are not the risk', () => {
    const { dir, git } = gitProject();
    run(CLI, ['init', dir, '--name', 'app'], dir);
    git('add', '-A'); git('commit', '-qm', 'memory');
    mkdirSync(join(dir, 'article-docs', '.local'), { recursive: true });
    writeFileSync(join(dir, 'article-docs', '.local', 'user.json'), '{}');
    const data = JSON.parse(inProject(dir, ['status', '--json']).stdout);
    assert.equal(data.at_risk.uncommitted.length, 0, '.local/ is meant to be uncommitted');
    cleanup(dir);
  });
});

describe('verbosity', () => {
  const gen = (dir, v) => {
    inProject(dir, ['context', 'storage', '--task', 't', ...(v ? ['--verbosity', v] : [])]);
    return pack(dir);
  };

  test('low is smaller than medium and keeps the facts', () => {
    const dir = project();
    const lo = gen(dir, 'low');
    const md = gen(dir, 'medium');
    assert.ok(lo.length < md.length, `low (${lo.length}) should be smaller than medium (${md.length})`);
    assert.match(lo, /binding decisions:/);
    assert.match(lo, /d-0001/, 'terse must not mean incomplete');
    assert.doesNotMatch(lo, /Instructions to AI Agent/, 'no protocol boilerplate at low');
    assert.doesNotMatch(lo, /Lazy Senior Developer/, 'the agent already read that once');
    cleanup(dir);
  });

  test('medium keeps the framing', () => {
    const dir = project();
    assert.match(gen(dir, 'medium'), /Instructions to AI Agent/);
    cleanup(dir);
  });

  test('high lists every decision with its status', () => {
    const dir = project();
    const hi = gen(dir, 'high');
    for (const id of ['d-0001', 'd-0002', 'd-0003']) assert.match(hi, new RegExp(id));
    cleanup(dir);
  });

  test('medium is the default', () => {
    const dir = project();
    const { stdout } = inProject(dir, ['context', 'storage', '--task', 't']);
    assert.match(stdout, /medium verbosity/);
    cleanup(dir);
  });

  test('the project can set its own default, so nobody has to remember the flag', () => {
    const dir = project();
    const pm = join(dir, 'article-docs', 'project.memory.json');
    const d = JSON.parse(readFileSync(pm, 'utf8'));
    d.context_verbosity = 'low';
    writeFileSync(pm, JSON.stringify(d, null, 2));
    const { stdout } = inProject(dir, ['context', 'storage', '--task', 't']);
    assert.match(stdout, /low verbosity/);
    cleanup(dir);
  });

  test('the flag beats the project default', () => {
    const dir = project();
    const pm = join(dir, 'article-docs', 'project.memory.json');
    const d = JSON.parse(readFileSync(pm, 'utf8'));
    d.context_verbosity = 'low';
    writeFileSync(pm, JSON.stringify(d, null, 2));
    assert.match(inProject(dir, ['context', 'storage', '--task', 't', '--verbosity', 'high']).stdout, /high verbosity/);
    cleanup(dir);
  });

  test('rejects an unknown level rather than falling back silently', () => {
    const dir = project();
    const res = inProject(dir, ['context', 'storage', '--task', 't', '--verbosity', 'terse']);
    assert.equal(res.code, 1);
    assert.match(res.stderr, /must be one of/);
    cleanup(dir);
  });

  test('a destructive skill is flagged at every level', () => {
    const dir = project();
    writeFileSync(join(dir, 'article-docs', 'skills', 'skills.jsonl'), JSON.stringify({
      id: 'restore', name: 'Restore', category: 'storage', summary: 'Restore the db.',
      triggers: ['storage'], owner: 'dana', status: 'active', confidence: 'high',
      last_verified: '2026-09-01', commands: ['restore.sh'], files: ['db'], outputs: ['ok'],
      risks: ['overwrites the live database'], prompt: 'Ask first.',
    }) + '\n');
    inProject(dir, ['reindex']);
    for (const v of ['low', 'medium', 'high']) {
      assert.match(gen(dir, v), /DESTRUCTIVE|destructive/, `${v} hid a destructive skill`);
    }
    cleanup(dir);
  });
});
