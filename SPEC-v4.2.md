> ## Not implemented
>
> This file is the **article-docs v4.2 specification** — a design document, dated
> 2026-08-24. **None of it is implemented in this repository.** The software in
> this repository is v4.1: the `memory/`, `identity/`, `devops/` and `security/`
> planes described below do not exist, and no command creates them.
>
> It is included because the distance between what is specified and what is
> actually deployed is the object of an ongoing field study. Read it as a
> statement of intent, never as documentation of behaviour.
>
> **Two exceptions, as of 2026-09-03.** The **EXECUTION plane** of section 20 is
> implemented — six-plane attribution in `audit/activity-log.jsonl`, plus `identity status`
> and `export audit`. So is the **IDENTITY plane** of section 23: `identity/` with human,
> agent and workload registries, `agents list`, `workloads list`, and enforcement of the
> separation rule that a human's role is not inherited by an agent running under it.
>
> Everything else below remains design only: no `memory/` lifecycle (no OBSERVATION →
> CANDIDATE → VALIDATED → CANONICAL, no scopes, no memory packs, no Memory Distiller), no
> `devops/`, no `security/`, no `project.yaml`, and 11 of the 24 commands in section 27 do
> not exist.
>
> **The dashboard described in sections 09 and 14 is not shipped.** It existed in earlier
> releases and was removed: most people drove article-docs from the CLI and their agent, and a
> file-writing HTTP server was the largest attack surface in a project that otherwise makes
> no network call and starts no server. It may be distributed separately. Read every mention
> of a dashboard or visualizer below as design, not as something you can run.
>
> The text is verbatim from the source document, with one change: a personal email
> address in an identity example was replaced with `you@example.com`.

---

**article-docs**
**v4.2 - Engineering Memory OS**
*AI-native, Git-backed, local-first engineering memory, identity, delivery and trust system for software teams*
|  |
| :- |
| **NEW IN v4.2**    Continuous Learning Memory · Scoped Shared Memory · Human/Agent/Workload Identity · Credential Separation · DevOps & DevSecOps Baseline · Project Bootstrap · Legacy Adoption · Safe Migration · CI/CD Learning · SBOM & Provenance · Governance and Audit · Lazy Senior Developer Protocol |

|  |  |
| :- | :- |
| **Field** | **Value** |
| Version | article-docs v4.2 - Engineering Memory OS |
| Author | Osvaldo J. Filho |
| Date | August 24, 2026 |
| Audience | Engineering teams, AI agents, technical leaders, product owners |
| License | MIT - use freely with attribution |

*Authored for the next generation of AI-assisted engineering workflows.*
# **Contents**
  - 00 - The v4 Philosophy
  - 01 - Executive Summary
  - 02 - What Changed in v4.0
  - 03 - Core Architecture
  - 04 - Directory Structure
  - 05 - Team Identity and Audit
  - 06 - Skills Database
  - 07 - Context Packs
  - 08 - Session Lifecycle
  - 09 - Visualizer Architecture
  - 10 - Local Shell CLI
  - 11 - Multi-repo Strategy
  - 12 - Governance, Security and Quality
  - 13 - v4 Bootstrap Prompt
  - 14 - Prompt to Create the Node Visualizer
  - 15 - Prompt to Create the Local Shell Tools
  - 16 - Prompt to Create the Skills Database
  - 17 - Validation and Migration Prompts
  - 18 - Recommended Roadmap
  - 19 - Lazy Senior Developer Protocol
  - 20 - v4.2 Architecture: Memory, Identity, Delivery and Trust
  - 21 - Continuous Learning Memory Engine
  - 22 - Shared Memory Scopes and Memory Packs
  - 23 - Identity, User Tracking and Credential Separation
  - 24 - Project Initialization, Git Adoption and Migration
  - 25 - DevOps Operating Model
  - 26 - DevSecOps Baseline and Supply-Chain Trust
  - 27 - v4.2 CLI, Bootstrap and Validation Prompts
# **00 - The v4 Philosophy**
article-docs v4.0 upgrades the framework from an AI-first documentation folder into a Article Memory OS. The goal is to give every project a durable, local-first memory layer that humans and AI agents can read, update, validate and use as operating context.
|  |
| :- |
| **Core v4 principle**    The repo is not only code. The repo is also memory: decisions, skills, sessions, ownership, context, evidence, health and governance. |

The system remains plain-file and Git-backed. Markdown is still the human-readable source of truth, while JSONL and generated indexes provide machine-readable views for dashboards, agents and automation.
|  |  |
| :- | :- |
| **Layer** | **Purpose** |
| Markdown memory | Human-readable project knowledge, decisions, bugs, TODOs, snippets and sessions. |
| JSONL indexes | Fast machine-readable search, filtering and graph generation. |
| Skills database | Project-specific capabilities, procedures, prompts, commands and operational know-how. |
| Context packs | Task-focused bundles of only the memory an AI agent needs. |
| Dashboard | Visual interface for reading, editing, graphing, auditing and launching workflows. |
| CLI | Local shell entry point for validate, reindex, context, session and doctor operations. |

# **01 - Executive Summary**
Every AI coding agent starts cold unless the project provides structured context. Every team accumulates decisions, bugs, conventions and operational knowledge that are easily lost across chats, branches, tickets and commits. article-docs v4.0 solves this by creating a local-first memory layer inside the repository.
## **The v4 Solution**
article-docs v4.0 is a Git-native Article Memory OS. It stores project memory, team identity, skills, session summaries, decision records and task-specific AI context packs directly in the repository. A local Node visualizer provides the human interface, while local shell tools provide automation and CI-friendly checks.
|  |  |
| :- | :- |
| **Business benefit** | **Impact** |
| Lower AI re-orientation cost | Agents receive focused context packs instead of vague prompts or entire repositories. |
| Team traceability | Every decision, save, note and session can be tied to a local project identity. |
| Better onboarding | New developers can browse modules, skills, known bugs, graph relationships and current rules. |
| Reduced documentation drift | Git-aware checks detect code changes without matching memory updates. |
| Operational knowledge capture | Project-specific skills record commands, procedures, troubleshooting and prompts. |
| No SaaS dependency | Plain files, Git and local runtime remain the default. |

# **02 - What Changed in v4.0**
|  |  |  |
| :- | :- | :- |
| **Area** | **v3.4 Team Edition** | **v4.0 Article Memory OS** |
| Core purpose | Team collaboration and audit | Complete project memory, skills and AI context operating layer |
| Dashboard | Visualizer/editor | Primary control center with context builder, skills, health, Git and sessions |
| Skills | Not central | First-class project skills database |
| AI workflow | Agent reads instructions | Agent receives generated context packs and session protocols |
| Session memory | Informal logs | Formal session start/end files and summaries |
| CLI | Optional helper | Defined local shell tool with core commands |
| Multi-repo | Supported conceptually | Explicit repo map, cross-repo graph and drift checks |
| Governance | Roles and logs | Constitution, review board, stale knowledge review and quality score |

# **03 - Core Architecture**
v4.0 has four cooperating interfaces: files, dashboard, CLI and AI prompts. None replaces the others. Together they provide human readability, local automation and AI agent compatibility.
project memory flow:  
  
Human opens dashboard  
  -\> dashboard reads index and files  
  -\> user starts a session or edits memory  
  -\> Node server saves with local user identity  
  -\> activity log records author/action/file/time  
  -\> CLI can validate/reindex/export  
  -\> AI agent receives context pack  
  -\> session end updates memory and skills
|  |  |  |
| :- | :- | :- |
| **Component** | **Recommended implementation** | **Reason** |
| Dashboard frontend | Plain HTML, CSS and ES modules | No build step, easy for AI agents to generate and maintain. |
| Local backend | Node.js server.mjs using built-in modules first | Best default for local file APIs, Git commands and JavaScript UI integration. |
| Shell CLI | Node script artdocs.mjs plus optional shell wrappers | Cross-platform automation without requiring global installs. |
| Storage | Markdown, JSON, JSONL | Readable, diffable, Git-friendly and agent-friendly. |
| Security | Localhost-only server with token and path allowlist | Avoid accidental remote exposure or arbitrary file writes. |

# **04 - Directory Structure**
project-root/  
├── article-docs/  
│   ├── AI-INSTRUCTIONS.md  
│   ├── ARTICLE-MEMORY.md  
│   ├── CONSTITUTION.md  
│   ├── HUMAN-ONBOARDING.md  
│   ├── CHANGELOG.md  
│   ├── index.jsonl  
│   ├── project.memory.json  
│   ├── repos.json  
│   ├── agents.json  
│   ├── modules/  
│   ├── apis/  
│   ├── infra/  
│   ├── skills/  
│   │   ├── skills.jsonl  
│   │   ├── categories.md  
│   │   ├── templates/  
│   │   └── playbooks/  
│   ├── context-packs/  
│   ├── sessions/  
│   ├── reviews/  
│   ├── boards/  
│   ├── team/  
│   │   ├── users.registry.json  
│   │   ├── roles.md  
│   │   ├── ownership.md  
│   │   └── activity-log.jsonl  
│   ├── dashboard/  
│   │   ├── index.html  
│   │   ├── app.js  
│   │   ├── styles.css  
│   │   └── server.mjs  
│   ├── bin/  
│   │   └── artdocs.mjs  
│   ├── \_attachments/  
│   ├── \_archive/  
│   ├── .generated/  
│   ├── .backups/       \# gitignored  
│   ├── .local/         \# gitignored  
│   └── .token          \# gitignored  
└── \[Agent pointer files: CLAUDE.md, AGENTS.md, GEMINI.md, etc.\]
# **05 - Team Identity and Audit**
v4.0 keeps the local active user outside Git. This is essential because users may clone the same repository, but each clone must know who is currently working locally.
On startup:  
1\. Check article-docs/.local/user.json.  
2\. If missing, read git config user.name and user.email as suggestions.  
3\. Ask the user to confirm or edit the identity.  
4\. Match against article-docs/team/users.registry.json.  
5\. Save the active identity locally.  
6\. Use that identity for saves, logs, decisions, reviews and sessions.
**Local identity file**
article-docs/.local/user.json  \# ignored by Git  
{  
  "user\_id": "osvaldo",  
  "display\_name": "Osvaldo",  
  "email": "you@example.com",  
  "role": "Owner",  
  "created\_at": "2026-05-20T20:10:00-03:00"  
}
**Activity log**
article-docs/team/activity-log.jsonl  
{"event":"file\_saved","file":"article-docs/modules/auth.md","user\_id":"osvaldo","author":"Osvaldo","timestamp":"2026-05-20T20:20:00-03:00"}  
{"event":"decision\_created","entry\_id":"a1b2c3","file":"article-docs/modules/auth.md","user\_id":"andre","author":"Andre","timestamp":"2026-05-20T20:25:00-03:00"}
# **06 - Skills Database**
The skills database is the major new v4 feature. It captures project-specific operational knowledge: how to run, test, deploy, debug, audit, review, migrate, seed, backup, restore and explain the project.
|  |
| :- |
| **Definition**    A skill is a reusable project capability with triggers, instructions, commands, expected outputs, files touched, risks, owners and AI prompts. |

article-docs/skills/skills.jsonl  
{"id":"run-local","name":"Run project locally","category":"development","summary":"Start frontend, backend and database for local development.","triggers":\["run locally","start dev","localhost"\],"owner":"Osvaldo","status":"active","confidence":"high","last\_verified":"2026-05-20","commands":\["npm install","npm run dev"\],"files":\["package.json",".env.example"\],"outputs":\["App available at http://localhost:3000"\],"risks":\["Requires local env file"\],"prompt":"Use this skill when the user asks to run the project locally."}  
{"id":"db-reset","name":"Reset local database","category":"database","summary":"Drop, recreate and seed the local development database.","triggers":\["reset database","seed db","fresh db"\],"owner":"Andre","status":"active","confidence":"medium","last\_verified":"2026-05-20","commands":\["npm run db:reset","npm run db:seed"\],"files":\["prisma/schema.prisma","prisma/seed.ts"\],"outputs":\["Seeded local database"\],"risks":\["Destroys local data"\],"prompt":"Confirm the environment is local before running destructive database commands."}
|  |  |
| :- | :- |
| **Skill field** | **Meaning** |
| id | Stable lowercase identifier used by CLI, dashboard and AI agents. |
| name | Human-readable skill title. |
| category | development, testing, deployment, security, data, debugging, docs, legal, product or custom. |
| triggers | Words or intents that should cause an AI agent to consider this skill. |
| owner | Person responsible for keeping the skill accurate. |
| status | active, draft, deprecated or archived. |
| confidence | high, medium or low depending on how verified the skill is. |
| commands | Safe commands or references to scripts. Dangerous commands must be marked with risks. |
| files | Files usually involved when executing the skill. |
| prompt | Instruction block the AI agent should use when applying the skill. |

## **Skill Categories**
|  |  |
| :- | :- |
| **Category** | **Examples** |
| development | Run locally, create module, add route, generate client, start service. |
| testing | Run unit tests, run e2e, generate coverage, reproduce bug. |
| debugging | Trace logs, inspect queue, diagnose auth, analyze failed request. |
| database | Migrate, seed, backup, restore, create fixture, verify schema. |
| deployment | Build, release, rollback, check health, tag version. |
| security | Secret scan, dependency audit, auth review, permissions review. |
| documentation | Generate context pack, update module memory, export onboarding. |
| legal/compliance | Prepare evidence, hash attachment, export audit package. |

## **Skill Lifecycle**
DRAFT -\> ACTIVE -\> DEPRECATED -\> ARCHIVED  
  
Rules:  
\- A skill starts as DRAFT if generated automatically.  
\- A human reviewer promotes it to ACTIVE.  
\- A skill must have last\_verified.  
\- Skills older than the review threshold are flagged as stale.  
\- Dangerous skills must include risks and confirmation rules.  
\- The AI may suggest skills but should not silently run destructive skills.
# **07 - Context Packs**
A context pack is a task-specific memory bundle generated for an AI agent. It prevents overloading the agent with irrelevant documentation and makes work reproducible.
article-docs/context-packs/auth-bugfix.context.md  
\# Context Pack: Auth Bugfix  
  
\#\# Goal  
Fix authentication bug related to expired JWT.  
  
\#\# User  
Osvaldo  
  
\#\# Relevant modules  
\- article-docs/modules/auth.md  
\- article-docs/apis/internal-auth.md  
  
\#\# Relevant skills  
\- skill: run-local  
\- skill: run-auth-tests  
\- skill: inspect-jwt-flow  
  
\#\# Relevant decisions  
\- \[\#a1b2c3\] Token expiration strategy  
\- \[\#d4e5f6\] Session invalidation model  
  
\#\# Files likely involved  
\- backend/src/auth/\*  
\- backend/src/middleware/auth.ts  
  
\#\# Instructions to AI Agent  
Do not change token format without adding a new DECISION.  
Update article-docs after implementation.
# **08 - Session Lifecycle**
Every meaningful AI or human work session should have a start and end record. This turns temporary chats into persistent project memory.
article-docs/sessions/2026-05-20-osvaldo-auth-bugfix.md  
\# Session: 2026-05-20 - Osvaldo - Auth Bugfix  
  
\*\*User:\*\* Osvaldo  
\*\*Agent:\*\* Claude Code  
\*\*Module:\*\* Auth  
\*\*Started:\*\* 2026-05-20T20:40:00-03:00  
\*\*Ended:\*\* 2026-05-20T21:25:00-03:00  
  
\#\# Goal  
Fix JWT invalidation bug after password change.  
  
\#\# Skills used  
\- inspect-jwt-flow  
\- run-auth-tests  
  
\#\# Files changed  
\- backend/src/auth/token.ts  
\- backend/src/users/password.ts  
  
\#\# Decisions added  
\- \[\#a1b2c3\] Increment token version after password change  
  
\#\# Follow-up  
\- Add integration test for mobile refresh flow.
# **09 - Visualizer Architecture**
The recommended visualizer is a local web dashboard with a tiny Node.js backend. PHP may exist as an optional compatibility adapter, but Node is the reference implementation because it matches the JavaScript frontend, is easy for AI agents to generate, and works well with local file and Git operations.
|  |  |  |
| :- | :- | :- |
| **Mode** | **Purpose** | **Capabilities** |
| Static mode | Read-only browsing | Render Markdown, graph, search and Kanban without saving. |
| Local Node mode | Recommended daily mode | Read/write files, backups, user identity, logs, validation, Git status and context packs. |
| AI-mediated mode | Locked-down environments | Dashboard generates a patch/prompt for the AI agent to apply manually. |

**Recommended Node API**
GET  /api/health  
GET  /api/index  
GET  /api/file?path=article-docs/modules/auth.md  
POST /api/save  
GET  /api/user  
POST /api/user  
POST /api/log  
POST /api/reindex  
POST /api/validate  
POST /api/context-pack  
POST /api/session/start  
POST /api/session/end  
GET  /api/git/status  
GET  /api/skills  
POST /api/skills  
POST /api/skill/verify
# **10 - Local Shell CLI**
The local shell tool should be implemented as article-docs/bin/artdocs.mjs. It can be invoked with Node directly or through simple wrapper scripts. It should not require global installation.
node article-docs/bin/artdocs.mjs doctor  
node article-docs/bin/artdocs.mjs whoami  
node article-docs/bin/artdocs.mjs serve  
node article-docs/bin/artdocs.mjs validate  
node article-docs/bin/artdocs.mjs reindex  
node article-docs/bin/artdocs.mjs skills list  
node article-docs/bin/artdocs.mjs skills search auth  
node article-docs/bin/artdocs.mjs context auth --task "fix jwt bug"  
node article-docs/bin/artdocs.mjs session start --module auth --task "fix jwt bug"  
node article-docs/bin/artdocs.mjs session end  
node article-docs/bin/artdocs.mjs git drift  
node article-docs/bin/artdocs.mjs export onboarding --format md
# **11 - Multi-repo Strategy**
v4.0 supports monorepos, polyrepos, nested Git repositories, submodules and central-plus-local article-docs structures.
article-docs/repos.json  
\[  
  {  
    "id": "frontend",  
    "path": "frontend/",  
    "type": "git-subdir",  
    "default\_branch": "main",  
    "owner": "Andre",  
    "artdocs": "frontend/article-docs",  
    "modules": \["ui", "auth-client"\]  
  },  
  {  
    "id": "backend",  
    "path": "backend/",  
    "type": "git-subdir",  
    "default\_branch": "main",  
    "owner": "Osvaldo",  
    "artdocs": "backend/article-docs",  
    "modules": \["auth", "payments", "users"\]  
  }  
\]
|  |
| :- |
| **Recommended rule**    Use central article-docs for project-level memory and local article-docs inside sub-repositories for implementation-specific memory. Cross-link them through repos.json and index.jsonl. |

# **12 - Governance, Security and Quality**
|  |  |
| :- | :- |
| **Feature** | **Purpose** |
| Project Constitution | Defines non-negotiable rules for decisions, reviews, security and AI-generated changes. |
| Decision Review Board | Keeps proposed decisions separate from approved authoritative decisions. |
| Knowledge Quality Score | Scores each module based on freshness, owner, decisions, TODOs, links and drift. |
| Stale Knowledge Detection | Flags ACTIVE decisions not reviewed within the configured threshold. |
| Security Classification | Marks entries as PUBLIC, INTERNAL, CONFIDENTIAL or SECRET. |
| Evidence Attachments | Stores logs, screenshots, exports and hashes linked to entries or sessions. |

Security rules for the dashboard:  
\- Bind to localhost by default.  
\- Require article-docs/.token for write operations.  
\- Never write outside the project root.  
\- Only allow paths inside article-docs or explicitly configured repo paths.  
\- Create a backup before every save.  
\- Scan for obvious secrets before saving.  
\- Log every write with local user identity.  
\- Never commit article-docs/.local, .token or .backups.
# **13 - v4 Bootstrap Prompt**
BOOTSTRAP PROMPT - article-docs v4.0 Article Memory OS  
  
Bootstrap article-docs v4.0 for this repository.  
Execute all phases in order. Do not delete existing documentation.  
  
PHASE 1 - RECONNAISSANCE  
Scan the project tree. Identify stack, modules, APIs, infrastructure, package managers, test commands, build commands, deployment hints, existing docs, existing AI rule files and nested Git repositories.  
  
PHASE 2 - DIRECTORY STRUCTURE  
Create article-docs with modules, apis, infra, skills, context-packs, sessions, reviews, boards, team, dashboard, bin, \_attachments, \_archive, .generated, .local and .backups.  
Add to .gitignore: article-docs/.local/, article-docs/.backups/, article-docs/.token, article-docs/.generated/tmp/.  
  
PHASE 3 - PROJECT MEMORY FILES  
Create project.memory.json, AI-INSTRUCTIONS.md, ARTICLE-MEMORY.md, CONSTITUTION.md, HUMAN-ONBOARDING.md, CHANGELOG.md, index.jsonl, repos.json and agents.json.  
  
PHASE 4 - LOCAL IDENTITY  
Create first-run protocol. Do not commit active local user identity. The dashboard and CLI must create article-docs/.local/user.json on first use, suggesting git config user.name and user.email.  
  
PHASE 5 - TEAM REGISTRY  
Create article-docs/team/users.registry.json, roles.md, ownership.md and activity-log.jsonl. Ask the user the initial Owner if no user is known.  
  
PHASE 6 - MODULE MEMORY  
Create module/api/infra Markdown files based on the real codebase. Add DECISION, BUG, TODO and SNIPPET sections. Every entry must have ID, date, status, author and last\_updated\_by.  
  
PHASE 7 - SKILLS DATABASE  
Create article-docs/skills/skills.jsonl and initial skills for running, testing, building, debugging, database, deployment, documentation and security based on the detected project.  
  
PHASE 8 - VISUALIZER  
Create the Node dashboard in article-docs/dashboard using index.html, app.js, styles.css and server.mjs. Implement reader, editor, graph, Kanban, skills, sessions, context packs, activity and Git status views.  
  
PHASE 9 - LOCAL SHELL CLI  
Create article-docs/bin/artdocs.mjs with doctor, whoami, serve, validate, reindex, skills, context, session, git drift and export commands.  
  
PHASE 10 - VALIDATE AND REPORT  
Run validation. Report created modules, skills, users, repositories, context pack templates, dashboard files and CLI commands.
# **14 - Prompt to Create the Node Visualizer**
PROMPT - CREATE NODE VISUALIZER FOR article-docs v4.0  
  
Create the article-docs v4.0 local web visualizer.  
Files to create:  
\- article-docs/dashboard/index.html  
\- article-docs/dashboard/styles.css  
\- article-docs/dashboard/app.js  
\- article-docs/dashboard/server.mjs  
  
Requirements:  
1\. No build step.  
2\. Use vanilla HTML/CSS/JavaScript with ES modules.  
3\. server.mjs must use Node.js built-in modules where possible.  
4\. Bind only to 127.0.0.1 by default.  
5\. Serve the dashboard at http://127.0.0.1:3434.  
6\. Implement path allowlist so the server cannot read or write outside the project root.  
7\. Require article-docs/.token for write operations. Create it on first run if missing.  
8\. Create article-docs/.local/user.json on first use by suggesting git config user.name and git config user.email.  
9\. Read article-docs/index.jsonl, skills/skills.jsonl, team/activity-log.jsonl and repos.json.  
10\. Provide views: Reader, Editor, Graph, Kanban, Skills, Sessions, Context Packs, Activity, Git, Health.  
11\. Before saving a file, create a timestamped backup in article-docs/.backups/.  
12\. Log every save to article-docs/team/activity-log.jsonl with user\_id, author, file, event and timestamp.  
13\. Add a context pack generator that lets the user choose module, task type, skills and agent.  
14\. Add a skills browser with search, category filters and stale skill warnings.  
15\. Add a Git drift panel showing changed source files whose matching article-docs modules were not updated.  
16\. Implement /api/health, /api/index, /api/file, /api/save, /api/user, /api/log, /api/skills, /api/context-pack, /api/session/start, /api/session/end, /api/git/status and /api/validate.  
17\. Keep the UI modern, responsive, dark-mode first and usable on laptop screens.  
18\. After creating the files, print instructions to run: node article-docs/dashboard/server.mjs.
# **15 - Prompt to Create the Local Shell Tools**
PROMPT - CREATE LOCAL SHELL CLI FOR article-docs v4.0  
  
Create the local shell tooling for article-docs v4.0.  
Main file:  
\- article-docs/bin/artdocs.mjs  
  
Optional wrappers:  
\- article-docs/bin/artdocs.sh  
\- article-docs/bin/artdocs.cmd  
  
Requirements:  
1\. Use Node.js built-in modules where possible.  
2\. Do not require global npm install.  
3\. Commands:  
   - doctor  
   - whoami  
   - serve  
   - validate  
   - reindex  
   - skills list  
   - skills search \<query\>  
   - skills verify \<skill-id\>  
   - context \<module\> --task "..."  
   - session start --module \<module\> --task "..."  
   - session end  
   - git drift  
   - export onboarding --format md  
4\. whoami must read article-docs/.local/user.json or create it interactively using git config suggestions.  
5\. validate must check entry IDs, statuses, author fields, broken links, stale skills, malformed JSONL and missing owners.  
6\. reindex must rebuild article-docs/index.jsonl from modules, apis, infra, boards, skills and repos.  
7\. context must generate a context pack in article-docs/context-packs/.  
8\. session start must create a session file and log the event.  
9\. session end must summarize changed files, decisions, skills used and follow-up tasks.  
10\. git drift must compare changed source files with changed article-docs files and warn about undocumented code changes.  
11\. serve must launch article-docs/dashboard/server.mjs.  
12\. All commands must be safe by default and must not delete user files.  
13\. Print helpful usage text when no command is provided.
# **16 - Prompt to Create the Skills Database**
PROMPT - CREATE PROJECT SKILLS DATABASE  
  
Create the article-docs v4.0 skills database for this project.  
  
Files:  
\- article-docs/skills/skills.jsonl  
\- article-docs/skills/categories.md  
\- article-docs/skills/templates/skill-template.md  
\- article-docs/skills/playbooks/README.md  
  
Steps:  
1\. Inspect package.json, composer.json, requirements.txt, go.mod, Dockerfile, docker-compose.yml, Makefile, README and scripts folders.  
2\. Identify repeatable project skills: run locally, install dependencies, test, build, lint, deploy, rollback, reset database, seed database, inspect logs, debug auth, debug payments, update docs, generate context pack, run security scan.  
3\. For each skill, create one JSONL object with id, name, category, summary, triggers, owner, status, confidence, last\_verified, commands, files, outputs, risks and prompt.  
4\. Use DRAFT status when uncertain. Use ACTIVE only when the command or workflow is clearly supported by project files.  
5\. Mark destructive skills with risk warnings and confirmation requirements.  
6\. Add a categories.md explaining each category.  
7\. Add a Markdown skill template for future manual skills.  
8\. Create at least 8 initial skills if the project has enough information.  
9\. Report which skills were created and which need human verification.
# **17 - Validation and Migration Prompts**
PROMPT - VALIDATE article-docs v4.0  
  
Validate the article-docs v4.0 system.  
Check:  
\- Required directories and files exist.  
\- .local, .token and .backups are gitignored.  
\- index.jsonl is valid JSONL and references existing files.  
\- Every entry has ID, date, status, author and last\_updated\_by.  
\- Status values match the type-specific allowed states.  
\- No duplicate IDs exist across entries.  
\- Wiki links point to existing entries or files.  
\- users.registry.json is valid.  
\- activity-log.jsonl is valid JSONL.  
\- skills.jsonl is valid and every skill has id, name, category, triggers, owner, status, confidence and last\_verified.  
\- Skills older than the review threshold are flagged as stale.  
\- repos.json is valid and nested Git repositories are mapped.  
\- Dashboard files exist.  
\- CLI exists and prints help.  
\- Git drift warnings are reported.  
  
Do not change files unless explicitly asked. Report issues in a table.
PROMPT - MIGRATE article-docs v3.4 TO v4.0  
  
Migrate this repository from article-docs v3.4 Team Edition to article-docs v4.0 Article Memory OS.  
Preserve all existing content.  
  
1\. Create a backup branch or Git commit before changes.  
2\. Add v4 directories: skills, context-packs, sessions, reviews, bin and .generated.  
3\. Create project.memory.json, ARTICLE-MEMORY.md, CONSTITUTION.md, repos.json and agents.json if missing.  
4\. Upgrade team identity rules: active identity must live in article-docs/.local/user.json and remain gitignored.  
5\. Add author and last\_updated\_by to entries where missing.  
6\. Build skills.jsonl from project files and existing docs.  
7\. Create context pack templates.  
8\. Create or update dashboard with v4 views.  
9\. Create local shell CLI.  
10\. Rebuild index.jsonl.  
11\. Validate and report remaining manual fixes.
# **18 - Recommended Roadmap**
|  |  |  |
| :- | :- | :- |
| **Version** | **Theme** | **Main additions** |
| v4.0 | Article Memory OS | Skills database, context packs, sessions, Node dashboard, CLI and Git drift. |
| v4.1 | Quality and Evidence | Knowledge quality score, evidence hashing, export packages, stale decision review and Lazy Senior Developer Protocol. |
| v4.2 | Engineering Memory OS | Continuous Learning Memory, scoped shared memory, identity and execution provenance, safe init/adopt/migrate workflows, DevOps/DevSecOps, CI/CD learning, SBOM and provenance. |
| v4.3 | Governance Workflows | Approval flows, role policies, decision review board and release gates. |
| v5.0 | Agent Protocol Edition | Optional MCP server, semantic search, embeddings, plugin architecture and real-time collaboration. |

|  |
| :- |
| **Final positioning**    article-docs v4.0 should not compete with documentation sites. It should become the local-first, Git-backed memory layer for humans and AI agents working on real software projects. |

# **19 - Lazy Senior Developer Protocol**
This protocol governs how AI agents and human developers should approach every implementation task in a article-docs project. It encodes the principle that the best code is the code you do not write.
|  |
| :- |
| **Core principle**    Act as a senior developer who is lazy in the best sense: efficient, pragmatic and allergic to overengineering. Prefer removing code to adding it. The simplest solution that solves the real problem is always the correct solution. |

## **Decision Sequence**
Before writing any code, evaluate each question in order. Stop at the first that applies.
|  |  |  |
| :- | :- | :- |
| **\#** | **Question** | **Action if YES** |
| 1 | Does this really need to be implemented? | Do not implement it. |
| 2 | Does the standard library already solve it? | Use it. |
| 3 | Does the browser, OS, framework or platform already offer this natively? | Use the native feature. |
| 4 | Does an already-installed dependency solve it well? | Use it before adding another dependency. |
| 5 | Can it be solved with one simple, readable line? | Do it that way. |
| 6 | None of the above applies. | Write the minimum new code that works. |

## **Rules**
|  |  |
| :- | :- |
| **Rule** | **Detail** |
| Remove before adding | Prefer removing code to adding code. |
| No unsolicited abstractions | Do not create abstractions, layers, helpers, factories, wrappers or architectural patterns that were not explicitly requested. |
| No unnecessary dependencies | Do not add dependencies without a real need. A new package must solve something the existing stack cannot. |
| No boilerplate | Avoid boilerplate, extra files and solutions that are more generic than the problem requires. |
| Prefer simple and readable | Choose solutions that are simple, readable and easy to maintain over clever or impressive ones. |
| Question complex requests | When a complex request could be replaced by a smaller solution, propose the alternative first. |

## **Non-Negotiable Exceptions**
The lazy protocol never applies to the following. These always receive full attention regardless of perceived complexity.
|  |  |
| :- | :- |
| **Area** | **Why it is never skipped** |
| Security | Cutting corners on security is never a simplification; it is deferred cost with compound interest. |
| Validation at trust boundaries | Every external input must be validated. Skipping this is not laziness; it is negligence. |
| Error handling that prevents data loss | Silent failures that corrupt or destroy data are never acceptable regardless of time pressure. |
| Accessibility | UI that is unusable for people with disabilities is a defect, not a scope reduction. |
| Tests for non-trivial logic | Logic that is hard to reason about by inspection must have tests. Skipping them is borrowing confidence you do not have. |
| Explicit requirements | If the user explicitly asked for something, deliver it. The lazy protocol applies to unsolicited complexity, not to agreed scope. |

## **The ponytail: Convention**
When making an intentional simplification that has a known limitation, mark it inline with a comment using the prefix ponytail: followed by the known limit and the evolution path. This makes deliberate tradeoffs visible without requiring a separate document.
|  |
| :- |
| **Example usage**    // ponytail: stores sessions in memory only; does not persist across restarts. Evolve to JSONL append if persistence is required.    // ponytail: linear scan is fine for fewer than 500 skills. Switch to Map lookup if the skills database exceeds that threshold. |

20 - v4.2 Architecture: Memory, Identity, Delivery and Trust
article-docs v4.2 evolves Article Memory OS into an Engineering Memory OS. The repository remains the durable, Git-backed source of project context, but the operating model is now divided into five cooperating planes:
MEMORY — observations, validated knowledge, skills, decisions, context packs, incidents and learned patterns.
IDENTITY — humans, AI agents, service identities and local clone identity.
EXECUTION — requester, actor, automation runtime, authenticated principal and approver attribution.
DELIVERY — Git, CI/CD, environments, releases, deployments, rollback and incidents.
TRUST — DevSecOps policies, secrets boundaries, supply-chain evidence, SBOM, provenance and governance.
Non-negotiable separation rule:
knowledge \!= user \!= agent \!= credential \!= execution \!= approval.
A developer asking an AI agent to modify code is not the same thing as the agent that performs the edit. An agent creating a workflow is not the same identity as the workload identity that later deploys it. A team member may own a module without sharing local credentials with teammates. v4.2 records each layer separately.
Recommended top-level structure:
project-root/
├── article-docs/
│   ├── project.yaml
│   ├── AI-INSTRUCTIONS.md
│   ├── ARTICLE-MEMORY.md
│   ├── CONSTITUTION.md
│   ├── HUMAN-ONBOARDING.md
│   ├── CHANGELOG.md
│   ├── index.jsonl
│   ├── repos.json
│   ├── memory/
│   │   ├── observations.jsonl
│   │   ├── candidates.jsonl
│   │   ├── canonical.jsonl
│   │   ├── scopes.yaml
│   │   └── packs/
│   ├── skills/
│   ├── context-packs/
│   ├── sessions/
│   ├── identity/
│   │   ├── humans.registry.json
│   │   ├── agents.registry.json
│   │   ├── workloads.registry.json
│   │   ├── roles.md
│   │   └── ownership.md
│   ├── audit/
│   │   └── activity-log.jsonl
│   ├── devops/
│   │   ├── environments.yaml
│   │   ├── pipeline.md
│   │   ├── releases.md
│   │   ├── rollback.md
│   │   ├── runbooks/
│   │   └── incidents/
│   ├── security/
│   │   ├── policies.yaml
│   │   ├── threat-model.md
│   │   ├── exceptions/
│   │   ├── sbom/
│   │   └── attestations/
│   ├── migration/
│   ├── dashboard/
│   ├── bin/
│   ├── .generated/
│   ├── .backups/       \# gitignored
│   ├── .local/         \# gitignored
│   └── .token          \# gitignored
└── \[CLAUDE.md, AGENTS.md, GEMINI.md or other agent pointers\]
21 - Continuous Learning Memory Engine
v4.2 introduces controlled self-learning. AI agents may discover useful knowledge, but they must not silently convert an inference into authoritative project truth.
Memory lifecycle:
OBSERVATION -\> CANDIDATE -\> VALIDATED -\> CANONICAL -\> DEPRECATED -\> ARCHIVED
OBSERVATION records something seen during work: a failed command, repeated test behavior, a deployment symptom, a workaround, a code relationship or a potential reusable insight.
CANDIDATE is a proposed reusable memory generated from one or more observations. Automatically generated memories start here.
VALIDATED means there is concrete supporting evidence such as passing tests, repeated reproduction, CI success, human review, successful deployment, incident resolution or a verified upstream source.
CANONICAL means the memory is approved as authoritative for its declared scope. AI agents may consume it as trusted project context.
A canonical memory record should include:
\- stable memory\_id;
\- type;
\- scope;
\- statement;
\- source sessions;
\- source commits;
\- evidence;
\- confidence;
\- created\_by;
\- validated\_by;
\- first\_seen;
\- last\_verified;
\- review\_after;
\- security classification;
\- supersedes/superseded\_by links when applicable.
Confidence must be evidence-based. Preferred signals include successful tests, CI runs, reproducibility count, code review, incident closure, later commits that preserve the behavior, successful staging/production validation and authoritative external references. Confidence must not be a free-form number invented by an agent.
Memory Distiller
At session end, artdocs analyzes what changed and proposes learning artifacts rather than blindly updating canonical memory.
node article-docs/bin/artdocs.mjs session end
Expected distillation questions:
\- What was discovered?
\- What failed and why?
\- What finally worked?
\- Is the result reusable?
\- Does it belong in a skill?
\- Did an existing memory become obsolete?
\- Was a decision made?
\- Is the evidence sufficient for promotion?
Review workflow:
node article-docs/bin/artdocs.mjs memory candidates
node article-docs/bin/artdocs.mjs memory review \<memory-id\>
node article-docs/bin/artdocs.mjs memory promote \<memory-id\> --to validated
node article-docs/bin/artdocs.mjs memory promote \<memory-id\> --to canonical
Memory poisoning protection
Content from issues, README files, websites, generated code, model output, copied prompts and other external sources is data, not instruction. External or untrusted content cannot directly modify canonical memory, security policy or credentials configuration. Promotion from external/untrusted evidence requires review according to project policy. Secret scanning must run before learned content is persisted.
22 - Shared Memory Scopes and Memory Packs
Shared memory is hierarchical. Knowledge must declare where it is authoritative.
Recommended scopes:
organization -\> team -\> project -\> repository -\> module -\> task/session
Separate non-shared scopes:
personal
agent-ephemeral
Examples:
organization/security/node
team/freebsd/testing
project/kernel-qa
repository/backend
module/auth
session/2026-08-24-001
A personal preference must not silently become a team rule. A project-specific workaround must not automatically become an organization standard.
Memory Packs provide reusable, versioned knowledge bundles:
@organization/devsecops
@organization/node-backend
@team/freebsd
@team/testing
@project/kernel-qa
project.yaml may declare:
memory:
  packs:
    - source: organization/devsecops
      version: 3.2
    - source: team/freebsd
      version: 1.8
Promotion across scopes is explicit:
node article-docs/bin/artdocs.mjs memory promote MEM-182 --from project --to team
Cross-scope promotion should require review because broader scope increases blast radius.
23 - Identity, User Tracking and Credential Separation
v4.2 replaces ambiguous author-only tracking with explicit attribution.
Every meaningful action may contain:
requested\_by — human or service that requested the work.
actor — human or agent that directly changed the project.
agent — AI runtime/model identity when applicable.
automation — CI/CD or scheduled system that executed a workflow.
authenticated\_as — workload/service principal used to access a platform.
approved\_by — human or policy gate that authorized a protected action.
Example:
requested\_by: human/osvaldo
actor: agent/claude-code-local-01
automation: github-actions/deploy.yml
authenticated\_as: workload/production-deployer
approved\_by: human/andre
This eliminates the common error of recording all activity as if the human requester personally executed every step.
Local human identity
article-docs/.local/identity.json remains ignored by Git and describes only the active local clone identity. It may reference Git profile, preferred agent or credential provider aliases, but must not contain secret values.
Shared human registry
article-docs/identity/humans.registry.json stores stable IDs, display names, public/team identifiers, roles and ownership. It must not contain passwords, API tokens, private keys or cloud access keys.
Agent registry
article-docs/identity/agents.registry.json records agent capabilities and boundaries. Recommended fields include provider, runtime, filesystem permission, shell permission, network permission, Git commit/push permission, environment access and memory promotion permission.
Example policy:
filesystem: write
shell: true
network: restricted
git\_commit: true
git\_push: false
deploy\_staging: false
deploy\_production: false
memory\_write\_candidates: true
memory\_promote\_canonical: false
Workload identities
article-docs/identity/workloads.registry.json describes CI/CD identities such as GitHub Actions, GitLab runners, Kubernetes service accounts or cloud deployment principals.
Credential rule
Credentials never belong in project memory or user identity records. Store only references to approved credential systems such as OS keychains, secret managers, vaults, cloud workload identity or CI platform secret stores. Prefer short-lived federated credentials/OIDC for automation rather than long-lived cloud keys when supported.
24 - Project Initialization, Git Adoption and Migration
v4.2 defines three different entry paths. They must not be conflated.
A. NEW PROJECT — artdocs init
Use when starting a new repository or when the directory has no meaningful existing codebase.
Recommended flow:
1\. Detect Git. If absent, offer to initialize it.
2\. Detect language/runtime/package manager.
3\. Detect Docker, IaC, cloud tooling and GitHub/GitLab CLI if present.
4\. Create or validate .gitignore and .editorconfig.
5\. Create article-docs/project.yaml and the v4.2 directory structure.
6\. Create local identity without committing credentials.
7\. Create initial human/agent/workload registries.
8\. Generate initial memory, module records and skills from the detected stack.
9\. Configure a Git strategy in project.yaml.
10\. Generate CONTRIBUTING.md, SECURITY.md and CODEOWNERS when appropriate.
11\. Generate baseline CI and security workflows only when the project/platform is known; otherwise generate proposals, not guessed production configuration.
12\. Run doctor, validate and secret scan.
13\. Create the initial commit only with explicit user approval.
14\. Print commands for adding the remote and first push.
Reference commands:
git init
git branch -M main
node article-docs/bin/artdocs.mjs init
node article-docs/bin/artdocs.mjs doctor
node article-docs/bin/artdocs.mjs validate
artdocs must orchestrate Git, not replace it.
B. EXISTING PROJECT WITHOUT article-docs — artdocs adopt
Use when a repository already contains code and history but has never used article-docs.
node article-docs/bin/artdocs.mjs adopt
Adoption must perform reconnaissance before writing:
\- inspect repository tree and Git history;
\- detect modules, owners, CI/CD, environments, release scripts and operational docs;
\- detect existing agent instruction files;
\- detect nested repositories/submodules;
\- detect security tooling and existing policies;
\- infer candidate skills from real commands/configuration;
\- produce architecture/memory candidates instead of inventing facts;
\- never rewrite existing docs destructively;
\- generate a report of inferred vs verified information.
C. EXISTING article-docs — artdocs migrate
Use when upgrading v3.x, v4.0 or v4.1.
node article-docs/bin/artdocs.mjs migrate --to 4.2
Migration protocol:
1\. Detect current article-docs version and Git status.
2\. Refuse destructive migration on an unresolved dirty tree unless --allow-dirty is explicitly used.
3\. Create a migration backup branch, tag or verified commit reference.
4\. Snapshot article-docs into .backups/migration-\<timestamp\>/.
5\. Run pre-migration validation and store the report.
6\. Preserve all existing documentation, IDs and authorship whenever possible.
7\. Map team/users.registry.json into identity/humans.registry.json without copying secrets.
8\. Convert ambiguous activity records to the new attribution model where evidence exists; otherwise preserve legacy attribution and mark provenance as legacy/unknown.
9\. Add memory lifecycle stores and import prior project memory as VALIDATED or CANONICAL only when prior status supports it; otherwise import as CANDIDATE.
10\. Add shared scopes, memory packs configuration, workload registry, DevOps and security directories.
11\. Upgrade CLI/dashboard commands and schemas.
12\. Rebuild indexes.
13\. Run secret scan, schema validation, link validation and Git drift checks.
14\. Produce MIGRATION-REPORT.md with changed files, preserved items, unresolved mappings and rollback instructions.
15\. Do not delete the backup until the user explicitly chooses cleanup.
Rollback:
node article-docs/bin/artdocs.mjs migrate rollback \<migration-id\>
Migration must be idempotent where feasible. Re-running a completed migration should detect already-upgraded structures rather than duplicate them.
25 - DevOps Operating Model
DevOps is first-class memory in v4.2. A project should explicitly describe its environments, build/test pipeline, release model, deployment mechanism, rollback procedure, runbooks and incident process.
Recommended pipeline sequence:
commit
 -\> formatting/lint
 -\> unit tests
 -\> secret scan
 -\> SAST
 -\> dependency/SCA scan
 -\> IaC/container scan when applicable
 -\> build
 -\> SBOM generation
 -\> artifact storage
 -\> provenance/attestation
 -\> staging
 -\> integration/smoke tests
 -\> approval gate when required
 -\> production
 -\> post-deploy validation
 -\> memory/incident feedback
Environment separation
Define local, CI, development, staging and production separately. Do not assume that local credentials, data or configuration can be reused in production.
article-docs/devops/environments.yaml should document environment purpose, deployment path, data sensitivity, approval requirements, observability links and credential reference type without containing secret values.
Release records should bind version/tag, source commit, CI run, artifact digest, SBOM, provenance/attestation, approver, deployment timestamp and rollback target.
Incident learning
node article-docs/bin/artdocs.mjs incident start \<name\>
node article-docs/bin/artdocs.mjs incident close \<id\>
Incident closure should create or propose:
\- timeline;
\- root cause;
\- affected components;
\- fix and rollback information;
\- detection gaps;
\- preventive actions;
\- memory candidates;
\- new/updated skills;
\- monitoring improvements.
26 - DevSecOps Baseline and Supply-Chain Trust
v4.2 treats security as a lifecycle property rather than a final review step. Projects should align secure development practices with a recognized framework such as NIST SSDF and should document project-specific exceptions.
Security profiles:
BASIC
STANDARD
HIGH
CRITICAL
Typical STANDARD expectations:
\- protected default branch;
\- pull request workflow;
\- required CI checks;
\- secret scanning;
\- dependency/SCA scanning;
\- SAST where supported;
\- CODEOWNERS or equivalent ownership control;
\- least-privilege workflow permissions.
Typical HIGH/CRITICAL additions where appropriate:
\- required independent review;
\- signed commits/tags or equivalent verified provenance;
\- SBOM generation;
\- artifact attestations/provenance;
\- immutable artifact promotion;
\- OIDC/workload federation instead of long-lived cloud credentials;
\- protected deployment environments;
\- explicit production approval;
\- stricter agent permissions;
\- security exception expiry/review.
GitHub Actions and equivalent CI guidance:
\- default workflow permissions to minimum required;
\- avoid broad write-all permissions;
\- pin third-party actions/dependencies to immutable revisions when possible;
\- protect deployment environments;
\- separate build identity from deployment identity;
\- avoid exposing secrets to untrusted pull requests;
\- prefer federated short-lived credentials for cloud access;
\- log who requested, approved and executed deployments.
Supply-chain evidence
For build artifacts, record:
source commit -\> builder/workflow -\> artifact digest -\> SBOM -\> provenance/attestation -\> deployment.
Use recognized provenance approaches such as SLSA-compatible attestations when appropriate. SBOM and provenance are evidence artifacts; they do not by themselves prove software is secure.
DevSecOps doctor checks should report, where technically detectable:
\[FAIL\] secret committed or detected in tracked file
\[FAIL\] production workflow uses long-lived credential where forbidden by policy
\[WARN\] CI workflow has broader permissions than required
\[WARN\] third-party action/reference is mutable
\[WARN\] default branch lacks required review/check protection
\[PASS\] CODEOWNERS/ownership policy present
\[PASS\] SBOM/provenance enabled when required by profile
27 - v4.2 CLI, Bootstrap and Validation Prompts
Recommended v4.2 commands:
node article-docs/bin/artdocs.mjs init
node article-docs/bin/artdocs.mjs adopt
node article-docs/bin/artdocs.mjs migrate --to 4.2
node article-docs/bin/artdocs.mjs migrate rollback \<id\>
node article-docs/bin/artdocs.mjs doctor
node article-docs/bin/artdocs.mjs whoami
node article-docs/bin/artdocs.mjs identity status
node article-docs/bin/artdocs.mjs agents list
node article-docs/bin/artdocs.mjs workloads list
node article-docs/bin/artdocs.mjs validate
node article-docs/bin/artdocs.mjs reindex
node article-docs/bin/artdocs.mjs memory candidates
node article-docs/bin/artdocs.mjs memory review \<id\>
node article-docs/bin/artdocs.mjs memory promote \<id\> --to validated
node article-docs/bin/artdocs.mjs skills list
node article-docs/bin/artdocs.mjs context \<module\> --task "..."
node article-docs/bin/artdocs.mjs session start --module \<module\> --task "..."
node article-docs/bin/artdocs.mjs session end
node article-docs/bin/artdocs.mjs git drift
node article-docs/bin/artdocs.mjs security doctor
node article-docs/bin/artdocs.mjs devops doctor
node article-docs/bin/artdocs.mjs incident start \<name\>
node article-docs/bin/artdocs.mjs incident close \<id\>
node article-docs/bin/artdocs.mjs export onboarding --format md
node article-docs/bin/artdocs.mjs export audit --format json
BOOTSTRAP PROMPT — article-docs v4.2
Bootstrap or upgrade article-docs v4.2 for this repository. First determine whether this is INIT, ADOPT or MIGRATE mode. Never destroy existing documentation. Never copy secrets into article-docs. Inspect the real repository before generating project-specific facts.
Execute:
1\. RECONNAISSANCE — stack, Git, modules, tests, CI/CD, infra, environments, docs, agent files, nested repos and security tooling.
2\. MODE — INIT for new project, ADOPT for established repository without article-docs, MIGRATE for existing article-docs.
3\. BACKUP — for ADOPT/MIGRATE, create recoverable Git/file backup before changes.
4\. STRUCTURE — create v4.2 Memory, Identity, DevOps, Security, Migration and existing Project Memory directories.
5\. IDENTITY — create local identity separately from shared human, agent and workload registries. Never store secret values.
6\. MEMORY — preserve existing knowledge, create observations/candidates/validated/canonical stores and scopes. Generated learning begins as CANDIDATE unless evidence and policy justify another status.
7\. SKILLS — derive repeatable capabilities only from real project evidence.
8\. DELIVERY — document Git strategy, environments, pipeline, release and rollback paths.
9\. DEVSECOPS — establish a security profile, least privilege, secret boundaries, dependency/SAST checks where applicable, SBOM/provenance policy and CI workload identity guidance.
10\. TOOLING — upgrade dashboard and CLI with init/adopt/migrate, memory, identity, devops, security and incident functions.
11\. VALIDATION — schema, links, duplicate IDs, secrets, stale memory, Git drift, agent permissions, CI permissions and migration integrity.
12\. REPORT — describe what was created, inferred, migrated, preserved, left unresolved and how to roll back.
UPDATED FINAL POSITIONING
article-docs v4.2 is a local-first, Git-backed Engineering Memory OS for humans and AI agents. Its purpose is not merely to document software. It converts engineering work — development, tests, CI, deployment, incidents and reviews — into persistent, scoped and auditable organizational knowledge while keeping human identity, AI agency, workload execution and credentials explicitly separated.
The core v4.2 principle is:
Every useful engineering discovery may become memory, but only evidence and governance may make it authoritative.
