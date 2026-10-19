#!/usr/bin/env node
// article-docs CLI — minimal functional scaffold
// Usage: node bin/artdocs.mjs <command> [args]

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, basename } from 'node:path';

const ROOT = process.cwd();
const ts = () => new Date().toISOString();

function help() {
  console.log(`article-docs — Article Memory OS CLI

Usage: node artdocs.mjs <command> [options]

Commands:
  init <dir> --name "Title"   Scaffold article-docs in a directory
  whoami --name N --email E   Set local identity (never committed)
  validate                    Check memory integrity (exits 1 on failure)
  reindex                     Rebuild index.jsonl from markdown sources
  git drift                   List sources changed without memory updates
  context <section>           Generate a context pack for a section
  skills list                 List all skills with status
  skills search <query>       Search skills by trigger or name
  status                      Show article status summary
  doctor                      Health-check the installation
  invite [--name N --role R]  Print clone URL for a co-author
  identity status             Show current identity and permissions
  --help                      Show this message
`);
}

const args = process.argv.slice(2);
if (!args.length || args[0] === '--help') {
  help();
  process.exit(0);
}

const cmd = args[0];
const sub = args[1];

switch (cmd) {
  case 'init': {
    const target = args[1] || '.';
    const nameIdx = args.indexOf('--name');
    const name = nameIdx !== -1 ? args[nameIdx + 1] : basename(process.cwd());
    if (!name) { console.error('Error: --name is required'); process.exit(1); }
    const adDir = join(target, 'article-docs');
    if (existsSync(join(adDir, 'AI-INSTRUCTIONS.md'))) {
      console.error('Error: article-docs already initialised here. Use upgrade instead.');
      process.exit(1);
    }
    // In a real install this would copy from template/; here we just confirm intent
    console.log(`Would initialise article-docs in ${adDir} with name "${name}"`);
    console.log('(Full init copies template/ — run from the framework checkout.)');
    break;
  }
  case 'whoami': {
    const ni = args.indexOf('--name');
    const ei = args.indexOf('--email');
    if (ni === -1 || ei === -1) { console.error('Usage: whoami --name "N" --email e@x'); process.exit(1); }
    const localDir = join(ROOT, 'article-docs', '.local');
    mkdirSync(localDir, { recursive: true });
    const userFile = join(localDir, 'user.json');
    writeFileSync(userFile, JSON.stringify({ display_name: args[ni+1], email: args[ei+1], set_at: ts() }, null, 2));
    console.log(`Identity set: ${args[ni+1]} <${args[ei+1]}> (${userFile})`);
    break;
  }
  case 'validate': {
    const checks = ['AI-INSTRUCTIONS.md','AGENT-COMMANDS.md','CONSTITUTION.md','ARTICLE-MEMORY.md'];
    const missing = checks.filter(f => !existsSync(join(ROOT, 'article-docs', f)));
    if (missing.length) {
      console.error(`Memory broken: missing ${missing.join(', ')}`);
      process.exit(1);
    }
    console.log('Memory valid.');
    break;
  }
  case 'reindex':
    console.log('Reindex: not yet implemented in minimal CLI. Full version rebuilds index.jsonl.');
    break;
  case 'git':
    if (sub === 'drift') console.log('Drift check: not yet implemented in minimal CLI.');
    else help();
    break;
  case 'context':
    console.log(`Context pack for "${sub || '(none)'}": not yet implemented in minimal CLI.`);
    break;
  case 'skills':
    if (sub === 'list' || sub === 'search') console.log('Skills: not yet implemented in minimal CLI.');
    else help();
    break;
  case 'status':
  case 'doctor':
  case 'invite':
  case 'identity':
    console.log(`${cmd}: not yet implemented in minimal CLI.`);
    break;
  default:
    console.error(`Unknown command: ${cmd}`);
    help();
    process.exit(1);
}