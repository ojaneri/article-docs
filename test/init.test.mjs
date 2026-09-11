import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, writeFileSync, join, run, tempDir, cleanup, CLI, inProject, gitProject } from './helpers.mjs';
import { appendFileSync, readdirSync, mkdirSync } from 'node:fs';

describe('artdocs init', () => {
  let dir;
  before(() => { dir = tempDir(); run(CLI, ['init', dir, '--name', 'my-app'], dir); });
  after(() => cleanup(dir));

  test('creates the memory directories', () => {
    for (const d of ['sections', 'claims', 'venue', 'experiments', 'references', 'skills', 'sessions', 'identity', 'audit', 'context-packs', 'boards', 'reviews', '_archive']) {
      assert.ok(existsSync(join(dir, 'article-docs', d)), `missing ${d}/`);
    }
  });

  test('copies the CLI into the project', () => {
    assert.ok(existsSync(join(dir, 'article-docs', 'bin', 'artdocs.mjs')));
  });

  test('ships no server: there is nothing to bind and nothing to expose', () => {
    assert.ok(!existsSync(join(dir, 'article-docs', 'dashboard')));
  });

  test('substitutes the project name and leaves no placeholder behind', () => {
    for (const f of ['AI-INSTRUCTIONS.md', 'CONSTITUTION.md', 'HUMAN-ONBOARDING.md', 'ARTICLE-MEMORY.md', 'repos.json']) {
      const text = readFileSync(join(dir, 'article-docs', f), 'utf8');
      assert.ok(!text.includes('{{'), `${f} still has a placeholder`);
      if (f.endsWith('.md')) assert.match(text, /my-app/, `${f} lost the project name`);
    }
  });

  test('ships a .gitignore that covers every secret path', () => {
    const gi = readFileSync(join(dir, 'article-docs', '.gitignore'), 'utf8');
    for (const item of ['.local/', '.token', '.backups/']) assert.ok(gi.includes(item), `${item} not ignored`);
  });

  test('writes pointer files at the project root', () => {
    for (const f of ['CLAUDE.md', 'AGENTS.md']) {
      assert.match(readFileSync(join(dir, f), 'utf8'), /article-docs\/AI-INSTRUCTIONS\.md/);
    }
  });

  test('refuses to overwrite an existing article-docs', () => {
    const res = run(CLI, ['init', dir], dir);
    assert.equal(res.code, 1);
    assert.match(res.stderr, /Refusing to overwrite/);
  });
});

test('init never clobbers an existing pointer file', () => {
  const dir = tempDir();
  writeFileSync(join(dir, 'CLAUDE.md'), 'MY OWN INSTRUCTIONS\n');
  run(CLI, ['init', dir], dir);
  assert.equal(readFileSync(join(dir, 'CLAUDE.md'), 'utf8'), 'MY OWN INSTRUCTIONS\n');
  assert.match(readFileSync(join(dir, 'AGENTS.md'), 'utf8'), /article-docs/);
  cleanup(dir);
});

test('the project name defaults to the directory name', () => {
  const dir = tempDir();
  run(CLI, ['init', dir], dir);
  const name = JSON.parse(readFileSync(join(dir, 'article-docs', 'project.memory.json'), 'utf8')).name;
  assert.equal(name, dir.split('/').pop());
  cleanup(dir);
});

test('a --flag before the directory is not mistaken for it', () => {
  const dir = tempDir();
  // `init --name x <dir>`: a naive positional scan would take "x" as the target.
  const res = run(CLI, ['init', '--name', 'chosen', dir], dir);
  assert.equal(res.code, 0, res.stderr);
  assert.equal(JSON.parse(readFileSync(join(dir, 'article-docs', 'project.memory.json'), 'utf8')).name, 'chosen');
  cleanup(dir);
});

test('init refuses to run from an installed copy, which has no template', () => {
  const dir = tempDir();
  run(CLI, ['init', dir], dir);
  const res = inProject(dir, ['init', join(dir, 'elsewhere')]);
  assert.equal(res.code, 1);
  assert.match(res.stderr, /distribution/);
  cleanup(dir);
});

test('init fails on a target that does not exist', () => {
  const dir = tempDir();
  const res = run(CLI, ['init', join(dir, 'nope')], dir);
  assert.equal(res.code, 1);
  assert.match(res.stderr, /does not exist/);
  cleanup(dir);
});

describe('pointer files for other agent tools', () => {
  test('writes the cross-tool default set', () => {
    const dir = tempDir();
    run(CLI, ['init', dir], dir);
    for (const f of ['AGENTS.md', 'CLAUDE.md', 'GEMINI.md', '.github/copilot-instructions.md']) {
      assert.ok(existsSync(join(dir, f)), `missing ${f}`);
      assert.match(readFileSync(join(dir, f), 'utf8'), /article-docs\/AI-INSTRUCTIONS\.md/);
    }
    cleanup(dir);
  });

  test('--agents all adds the editor rule files too', () => {
    const dir = tempDir();
    run(CLI, ['init', dir, '--agents', 'all'], dir);
    assert.ok(existsSync(join(dir, '.cursor', 'rules', 'article-docs.mdc')));
    assert.ok(existsSync(join(dir, '.windsurf', 'rules', 'article-docs.md')));
    cleanup(dir);
  });

  test('--agents takes a narrow list', () => {
    const dir = tempDir();
    run(CLI, ['init', dir, '--agents', 'claude,gemini'], dir);
    assert.ok(existsSync(join(dir, 'CLAUDE.md')));
    assert.ok(existsSync(join(dir, 'GEMINI.md')));
    assert.ok(!existsSync(join(dir, 'AGENTS.md')), 'wrote a pointer that was not asked for');
    cleanup(dir);
  });

  test('--agents none writes no pointer file at all', () => {
    const dir = tempDir();
    run(CLI, ['init', dir, '--agents', 'none'], dir);
    for (const f of ['AGENTS.md', 'CLAUDE.md', 'GEMINI.md']) assert.ok(!existsSync(join(dir, f)));
    assert.ok(existsSync(join(dir, 'article-docs')), 'the memory itself must still be created');
    cleanup(dir);
  });

  test('rejects an unknown agent instead of silently ignoring it', () => {
    const dir = tempDir();
    const res = run(CLI, ['init', dir, '--agents', 'clod'], dir);
    assert.equal(res.code, 1);
    assert.match(res.stderr, /Unknown agent/);
    cleanup(dir);
  });

  test('every pointer file carries the same body', () => {
    const dir = tempDir();
    run(CLI, ['init', dir, '--agents', 'all'], dir);
    const bodies = ['AGENTS.md', 'CLAUDE.md', 'GEMINI.md', '.github/copilot-instructions.md']
      .map(f => readFileSync(join(dir, f), 'utf8'));
    assert.equal(new Set(bodies).size, 1, 'pointer files drifted from each other');
    cleanup(dir);
  });
});

describe('agent commands', () => {
  test('installs native commands for each tool that has them', () => {
    const dir = tempDir();
    run(CLI, ['init', dir], dir);
    for (const f of ['.claude/commands/artdocs/start.md',
                     '.gemini/commands/artdocs/start.toml',
                     '.opencode/command/artdocs-start.md']) {
      assert.ok(existsSync(join(dir, f)), `missing ${f}`);
    }
    cleanup(dir);
  });

  test('installs all seven operations', () => {
    const dir = tempDir();
    run(CLI, ['init', dir], dir);
    for (const c of ['start', 'context', 'remember', 'decide', 'skill', 'check', 'end']) {
      assert.ok(existsSync(join(dir, '.claude', 'commands', 'artdocs', `${c}.md`)), `missing ${c}`);
    }
    cleanup(dir);
  });

  test('every command defers to the playbook rather than restating it', () => {
    const dir = tempDir();
    run(CLI, ['init', dir], dir);
    for (const c of ['start', 'remember', 'decide', 'skill', 'check', 'end']) {
      const text = readFileSync(join(dir, '.claude', 'commands', 'artdocs', `${c}.md`), 'utf8');
      assert.match(text, /AGENT-COMMANDS\.md/, `${c} does not point at the playbook`);
    }
    cleanup(dir);
  });

  test('uses each tool\'s own argument placeholder', () => {
    const dir = tempDir();
    run(CLI, ['init', dir], dir);
    assert.match(readFileSync(join(dir, '.claude/commands/artdocs/start.md'), 'utf8'), /\$ARGUMENTS/);
    assert.match(readFileSync(join(dir, '.gemini/commands/artdocs/start.toml'), 'utf8'), /\{\{args\}\}/);
    cleanup(dir);
  });

  test('the generated TOML is valid enough to carry the prompt intact', () => {
    const dir = tempDir();
    run(CLI, ['init', dir], dir);
    const toml = readFileSync(join(dir, '.gemini/commands/artdocs/decide.toml'), 'utf8');
    assert.match(toml, /^description = "/m);
    assert.match(toml, /^prompt = '''$/m);
    assert.ok(toml.trimEnd().endsWith("'''"), 'the literal string was left unterminated');
    cleanup(dir);
  });

  test('--agents none installs no commands either', () => {
    const dir = tempDir();
    run(CLI, ['init', dir, '--agents', 'none'], dir);
    assert.ok(!existsSync(join(dir, '.claude')));
    assert.ok(!existsSync(join(dir, '.gemini')));
    cleanup(dir);
  });

  test('the playbook ships with the memory, not just with the commands', () => {
    const dir = tempDir();
    run(CLI, ['init', dir, '--agents', 'none'], dir);
    const text = readFileSync(join(dir, 'article-docs', 'AGENT-COMMANDS.md'), 'utf8');
    for (const op of ['start', 'context', 'remember', 'decide', 'skill', 'check', 'end']) {
      assert.match(text, new RegExp(`\`${op}\``), `the playbook omits ${op}`);
    }
    assert.ok(!text.includes('{{'), 'placeholder left in the playbook');
    cleanup(dir);
  });
});

describe('bootstrap', () => {
  test('the setup playbook travels into the project', () => {
    const dir = tempDir();
    run(CLI, ['init', dir], dir);
    const text = readFileSync(join(dir, 'article-docs', 'BOOTSTRAP.md'), 'utf8');
    assert.match(text, /You are an AI agent/);
    cleanup(dir);
  });

  test('installs a /artdocs:init command for the finishing pass', () => {
    const dir = tempDir();
    run(CLI, ['init', dir], dir);
    const text = readFileSync(join(dir, '.claude', 'commands', 'artdocs', 'init.md'), 'utf8');
    assert.match(text, /BOOTSTRAP\.md/);
    assert.match(text, /already exists/, 'the command must handle the re-run case');
    cleanup(dir);
  });

  test('the playbook forbids the four things that would make setup harmful', () => {
    const dir = tempDir();
    run(CLI, ['init', dir], dir);
    const text = readFileSync(join(dir, 'article-docs', 'BOOTSTRAP.md'), 'utf8');
    assert.match(text, /Never overwrite an existing instruction file/);
    assert.match(text, /Never put a credential/);
    assert.match(text, /Never fabricate a rationale/);
    assert.match(text, /Never mark a decision `accepted`/);
    cleanup(dir);
  });
});

describe('version control detection', () => {
  test('records a remote when there is one', () => {
    const { dir, git } = gitProject();
    git('remote', 'add', 'origin', 'https://example.com/acme/app.git');
    run(CLI, ['init', dir, '--name', 'app'], dir);
    const repo = JSON.parse(readFileSync(join(dir, 'article-docs', 'repos.json'), 'utf8'))[0];
    assert.equal(repo.hosting, 'remote');
    assert.equal(repo.remotes[0].url, 'https://example.com/acme/app.git');
    assert.ok(repo.default_branch, 'no default branch recorded');
    cleanup(dir);
  });

  test('says local-only when there is no remote', () => {
    const { dir } = gitProject();
    run(CLI, ['init', dir, '--name', 'app'], dir);
    const repo = JSON.parse(readFileSync(join(dir, 'article-docs', 'repos.json'), 'utf8'))[0];
    assert.equal(repo.hosting, 'local-only');
    assert.deepEqual(repo.remotes, []);
    cleanup(dir);
  });

  test('reports the situation on stdout so the human sees it', () => {
    const { dir } = gitProject();
    const { stdout } = run(CLI, ['init', dir, '--name', 'app'], dir);
    assert.match(stdout, /LOCAL ONLY/);
    cleanup(dir);
  });
});

describe('bringing in a second engineer', () => {
  test('invite adds them to the committed registry', () => {
    const { dir, git } = gitProject();
    git('remote', 'add', 'origin', 'https://example.com/acme/app.git');
    run(CLI, ['init', dir, '--name', 'app'], dir);
    inProject(dir, ['invite', '--name', 'Sam Ferreira', '--role', 'Contributor']);
    const reg = JSON.parse(readFileSync(join(dir, 'article-docs', 'identity', 'humans.registry.json'), 'utf8'));
    const sam = reg.users.find(u => u.user_id === 'sam');
    assert.ok(sam, 'not added to the registry');
    assert.equal(sam.role, 'Contributor');
    cleanup(dir);
  });

  test('invite prints one pasteable line carrying the real clone URL', () => {
    const { dir, git } = gitProject();
    git('remote', 'add', 'origin', 'https://example.com/acme/app.git');
    run(CLI, ['init', dir, '--name', 'app'], dir);
    const { stdout } = inProject(dir, ['invite']);
    const line = stdout.split('\n').find(l => l.includes('https://example.com/acme/app.git'));
    assert.ok(line, 'no line carries the clone URL');
    assert.match(line, /\/artdocs:join/, 'the line must tell them what to run');
    cleanup(dir);
  });

  test('invite works with no email, since the machine may have none', () => {
    const { dir, git } = gitProject();
    git('remote', 'add', 'origin', 'https://example.com/acme/app.git');
    run(CLI, ['init', dir, '--name', 'app'], dir);
    const res = inProject(dir, ['invite', '--name', 'Sam Ferreira']);
    assert.equal(res.code, 0);
    const sam = JSON.parse(readFileSync(join(dir, 'article-docs', 'identity', 'humans.registry.json'), 'utf8'))
      .users.find(u => u.user_id === 'sam');
    assert.ok(sam);
    assert.equal(sam.email, undefined, 'must not invent an email');
    assert.match(res.stdout, /No email recorded/);
    cleanup(dir);
  });

  test('invite refuses to pretend, with no remote to clone from', () => {
    const { dir } = gitProject();
    run(CLI, ['init', dir, '--name', 'app'], dir);
    const { stdout } = inProject(dir, ['invite']);
    assert.match(stdout, /NO GIT REMOTE/);
    assert.match(stdout, /git remote add origin/);
    cleanup(dir);
  });

  test('invite does not add the same person twice', () => {
    const { dir } = gitProject();
    run(CLI, ['init', dir, '--name', 'app'], dir);
    const args = ['invite', '--name', 'Sam'];
    inProject(dir, args);
    inProject(dir, args);
    const reg = JSON.parse(readFileSync(join(dir, 'article-docs', 'identity', 'humans.registry.json'), 'utf8'));
    assert.equal(reg.users.filter(u => u.user_id === 'sam').length, 1);
    cleanup(dir);
  });

  test('join tells a fresh clone where the project stands', () => {
    const { dir } = gitProject();
    run(CLI, ['init', dir, '--name', 'app'], dir);
    const { stdout } = inProject(dir, ['join']);
    assert.match(stdout, /HUMAN-ONBOARDING\.md/);
    assert.match(stdout, /open sessions/);
    assert.match(stdout, /\.local\/user\.json/, 'must explain the missing identity');
    cleanup(dir);
  });

  test('installs the invite and join commands', () => {
    const dir = tempDir();
    run(CLI, ['init', dir], dir);
    for (const c of ['invite', 'join']) {
      assert.ok(existsSync(join(dir, '.claude', 'commands', 'artdocs', `${c}.md`)), `missing ${c}`);
    }
    cleanup(dir);
  });
});

/** whoami creates .local/; these tests bypass the interactive prompt. */
function setIdentity(dir) {
  mkdirSync(join(dir, 'article-docs', '.local'), { recursive: true });
  writeFileSync(join(dir, 'article-docs', '.local', 'user.json'),
    JSON.stringify({ user_id: 'dana', display_name: 'Dana', email: 'd@example.com', role: 'Owner' }));
}

describe('decision debt', () => {
  test('warns when code changed but nothing was written down', () => {
    const { dir, git } = gitProject();
    run(CLI, ['init', dir, '--name', 'app'], dir);
    setIdentity(dir);
    inProject(dir, ['session', 'start', '--module', 'app', '--task', 'add retries']);
    appendFileSync(join(dir, 'src.js'), 'export const b = 2\n');
    const { stdout } = inProject(dir, ['session', 'end']);
    assert.match(stdout, /records no decision/);
    cleanup(dir);
  });

  test('the commented-out example is not counted as a decision', () => {
    const { dir } = gitProject();
    run(CLI, ['init', dir, '--name', 'app'], dir);
    setIdentity(dir);
    inProject(dir, ['session', 'start', '--module', 'app', '--task', 't']);
    appendFileSync(join(dir, 'src.js'), 'x\n');
    const { stdout } = inProject(dir, ['session', 'end']);
    assert.doesNotMatch(stdout, /1 decision\(s\) taken/);
    cleanup(dir);
  });

  test('counts a real decision line and says to promote it', () => {
    const { dir } = gitProject();
    run(CLI, ['init', dir, '--name', 'app'], dir);
    setIdentity(dir);
    inProject(dir, ['session', 'start', '--module', 'app', '--task', 't']);
    const f = join(dir, 'article-docs', 'sessions',
      readdirSync(join(dir, 'article-docs', 'sessions')).find(x => x.endsWith('.md')));
    writeFileSync(f, readFileSync(f, 'utf8').replace('## Files changed',
      '- Backoff over a fixed delay — because the API rate-limits\n\n## Files changed'));
    const { stdout } = inProject(dir, ['session', 'end']);
    assert.match(stdout, /1 decision\(s\) taken/);
    assert.match(stdout, /status: proposed/);
    cleanup(dir);
  });
});

describe('the playbook covers the cases it claims to', () => {
  const playbook = (dir) => readFileSync(join(dir, 'article-docs', 'BOOTSTRAP.md'), 'utf8');

  test('tells the agent how to read an existing manuscript', () => {
    const dir = tempDir();
    run(CLI, ['init', dir], dir);
    const text = playbook(dir);
    assert.match(text, /Do not create twelve/);
    assert.match(text, /Never fabricate a rationale/);
    assert.match(text, /git log/, 'must say to mine the history');
    cleanup(dir);
  });

  test('tells it to ask rather than explain what it cannot recover', () => {
    const dir = tempDir();
    run(CLI, ['init', dir], dir);
    assert.match(playbook(dir), /todo asking about it/);
    cleanup(dir);
  });

  test('the operations playbook maps plain language onto operations', () => {
    const dir = tempDir();
    run(CLI, ['init', dir], dir);
    const text = readFileSync(join(dir, 'article-docs', 'AGENT-COMMANDS.md'), 'utf8');
    assert.match(text, /Recognising what is being asked/);
    for (const phrase of ['where did I leave off', "what's waiting on me", 'write that down']) {
      assert.ok(text.includes(phrase), `the signal table omits "${phrase}"`);
    }
    cleanup(dir);
  });
});

describe('the invite line is generic', () => {
  const withRemote = () => {
    const { dir, git } = gitProject();
    git('remote', 'add', 'origin', 'https://example.com/acme/app.git');
    run(CLI, ['init', dir, '--name', 'app'], dir);
    return dir;
  };

  test('needs no name at all', () => {
    const dir = withRemote();
    const res = inProject(dir, ['invite']);
    assert.equal(res.code, 0);
    assert.match(res.stdout, /https:\/\/example\.com\/acme\/app\.git/);
    cleanup(dir);
  });

  test('names nobody, so it can go to a whole team', () => {
    const dir = withRemote();
    inProject(dir, ['invite', '--name', 'Sam Ferreira', '--role', 'Contributor']);
    const line = inProject(dir, ['invite']).stdout
      .split('\n').find(l => l.includes('https://example.com/acme/app.git'));
    assert.doesNotMatch(line, /Sam|Ferreira|sam/, 'the join line must not be tied to a person');
    cleanup(dir);
  });

  test('registering someone is optional and says so', () => {
    const dir = withRemote();
    assert.match(inProject(dir, ['invite']).stdout, /Optional: register someone/);
    cleanup(dir);
  });

  test('share is the same command', () => {
    const dir = withRemote();
    const a = inProject(dir, ['invite']).stdout;
    const b = inProject(dir, ['share']).stdout;
    assert.equal(a, b);
    cleanup(dir);
  });
});

describe('a article-docs/ that is not an installation', () => {
  test('init still refuses, so nothing hand-written is destroyed', () => {
    const dir = tempDir();
    mkdirSync(join(dir, 'article-docs'), { recursive: true });
    writeFileSync(join(dir, 'article-docs', 'README.md'), '# hand-written notes\n');
    const res = run(CLI, ['init', dir], dir);
    assert.equal(res.code, 1);
    assert.equal(readFileSync(join(dir, 'article-docs', 'README.md'), 'utf8'), '# hand-written notes\n');
    cleanup(dir);
  });

  test('the playbook tells the agent how to adopt those notes', () => {
    const dir = tempDir();
    run(CLI, ['init', dir], dir);
    const text = readFileSync(join(dir, 'article-docs', 'BOOTSTRAP.md'), 'utf8');
    assert.match(text, /article-docs-legacy/);
    assert.match(text, /hand-written notes, not an installation/);
    assert.match(text, /ask before deleting/);
    cleanup(dir);
  });
});

describe('drift on an untracked project', () => {
  test('admits it cannot see, instead of reporting a false all-clear', () => {
    const { dir, git } = gitProject();
    // A project directory that git knows only as one untracked entry.
    const sub = join(dir, 'site');
    mkdirSync(sub, { recursive: true });
    writeFileSync(join(sub, 'app.js'), 'x\n');
    run(CLI, ['init', sub, '--name', 'site'], sub);
    const { stdout } = inProject(sub, ['git', 'drift']);
    assert.match(stdout, /DRIFT UNKNOWN/);
    assert.doesNotMatch(stdout, /No drift/, 'an unrunnable check must not read as a pass');
    assert.match(stdout, /git commit/);
    cleanup(dir);
  });
});
