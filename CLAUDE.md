# Claude Code — ФК Арсенал-92 (RuFlo V3.5)

Always reply in Russian, including technical topics, error messages, code comments in output.

## Skills
Before ANY task check skills; if one matches, invoke it FIRST. Say so explicitly and offer it; if several apply, list each in one line. Combine for complex tasks: `/graphify` (understand code) -> `/sparc:architect` (plan) -> implement.
1. `/graphify`: any codebase search, architecture analysis, "where is X", "how does Y work", file navigation. Run before Grep/Glob; those are only for pinpoint lookups of a known symbol/file.
2. UI/UX skill: design analysis, component review, visual improvements.
3. SEO skill: meta tags, schema.org, sitemap, Core Web Vitals, indexing.
4. `/sparc:architect`: new features, refactoring, architecture decisions.
5. `/github:code-review`: PR review, code quality.
graphify: build/update the knowledge graph BEFORE deep search. `graphify query "..."` = semantic search; `graphify --update` = incremental refresh.

## Response style
- Typical answer: 3-6 sentences or <=5 bullets. Yes/no question: <=2 sentences. Complex multi-step/multi-file task: one short overview paragraph, then <=5 bullets tagged What changed, Where, Risks, Next steps, Open questions.
- No long narrative; do not rephrase the request unless semantics change; never narrate routine tool calls ("читаю файл...", "запускаю тесты...").
- Brief updates (1-2 sentences, each with a concrete outcome like "Нашёл X") only when starting a major phase or finding something that changes the plan.
- For inputs >~10k tokens: outline relevant sections first, restate constraints, anchor claims to files/lines.

## Scope
- Implement EXACTLY and ONLY what is asked: no extra features, components, UX embellishments; call out new work as optional.
- Explore the existing design system (Tailwind config, globals.css, component patterns) first. Brand: brand-blue (#1e3a5f), brand-red (#c0392b), white; no new tokens.
- Ambiguity: pick the simplest valid interpretation, or ask 1-3 precise questions, or give 2-3 interpretations with labeled assumptions.
- Never fabricate figures, line numbers, references; when unsure say "Based on current code...".

## Tools
- Prefer tools over internal knowledge for fresh or user-specific data.
- Batch ALL independent reads, searches, edits, Bash commands, and agent spawns in ONE message.
- After a write: state what changed, where, follow-up validation.
- Exploration: graphify first, then Grep/Glob.
- DB: Docker + psql with credentials from `C:\Pet\secrets\secrets.txt`.
- Spawn agents once, then wait; never poll status.

## Secrets (`C:\Pet\secrets\secrets.txt`, local, never commit)
Read it before any infrastructure access.
- SSH: `ssh root@147.45.229.110` (password from the `ssh root@...` line); `sshpass -p 'PASSWORD' ssh root@147.45.229.110 'COMMAND'`
- PostgreSQL: `docker run --rm postgres:16-alpine psql 'postgresql://gen_user:PASSWORD@188.225.75.81:5432/football' -c 'SELECT ...'` (password from secrets.txt, `#` -> `%23`)
- S3: endpoint `https://s3.twcstorage.ru`, bucket/keys from secrets.txt
- Timeweb panel: login `dd38889`, password from secrets.txt
- Read via `Read("C:\\Pet\\secrets\\secrets.txt")`.

## Project
- Stack: Next.js 15 (App Router, TypeScript) + .NET 9 (DDD, EF Core) + PostgreSQL + Docker + nginx
- Domain: ФК Арсенал-92, детская футбольная школа, г. Севастополь
- Server: `147.45.229.110` (root SSH). DB: `postgresql://gen_user@188.225.75.81:5432/football`
- Deploy: GitHub Actions -> GHCR -> SSH pull -> `docker compose up -d --no-deps nextjs dotnet-api`
- Nginx: `config/nginx/fcarsenal92.ru.conf` is the file deployed to the server.
- Admin: `admin@fcarsenal92.ru` (GitHub Secret ADMIN_EMAIL)

## Rules
- Do what was asked, nothing more.
- Never create files unless necessary; prefer editing existing ones. Create documentation (`*.md`, README) only when asked.
- Keep working files and tests out of the root folder.
- Read a file before editing it.
- Never commit secrets, credentials, `.env` files; never hardcode keys.
- Run tests after code changes; verify build before commit.
- After every commit: `git push origin master` (triggers CI/CD).
- Validate user input at system boundaries; sanitize file paths against directory traversal.

## File organization
`/src` source, `/tests` tests, `/docs` documentation, `/config` configuration, `/scripts` scripts, `/examples` examples.

## Architecture
- DDD, bounded contexts; files <500 lines; typed interfaces for all public APIs; TDD London School (mock-first) for new code; event sourcing for state changes; input validation at system boundaries only.
- Frontend: `src/frontend/src/app/` pages (App Router), `src/frontend/src/components/` reusable components, `src/frontend/src/lib/api.ts` all API calls (SSR: API_INTERNAL_URL, client: relative URL), `src/frontend/src/types/` types.
- Backend: `Arsenal.API` (Controllers, Program.cs), `Arsenal.Application` (Commands, Queries, DTOs), `Arsenal.Domain` (Entities, Value Objects), `Arsenal.Infrastructure` (EF Core, DbInitializer, Repositories).

## Build & test
```bash
cd src/frontend && npm run build && npm run lint
dotnet build src/backend && dotnet test src/backend
docker compose -f docker-compose.yml build   # locally before push
```

## Swarm (RuFlo V3.5)
- Complex tasks (>3 files or >1 domain): MUST use swarm. Init: `npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 8 --strategy specialized`
- Topology hierarchical (anti-drift); maxAgents 6-8; consensus `raft` for hive-mind; `run_in_background: true` for ALL Agent calls; after spawn STOP, no more tool calls or status checks.
- Model routing: tier 1 Edit tool (direct, <1ms) for simple transforms; tier 2 Haiku (~500ms) for simple tasks (<30% complexity); tier 3 Sonnet/Opus (2-5s) for architecture, security, complex reasoning.

## RuFlo memory and tools
- Active skills: graphify (priority for search), UI/UX analysis, SEO, swarm-orchestration.
- ToolSearch: "memory search" -> memory_store, memory_search, memory_search_unified; "swarm" -> swarm_init, swarm_status, swarm_health; "+aidefence" -> aidefence_scan, aidefence_is_safe; "hooks intelligence" -> hooks_intelligence, neural_train.
- MCP tools: Memory `memory_store`, `memory_search`, `memory_search_unified`; Swarm `swarm_init`, `swarm_status`, `agent_spawn`; Hive-Mind `hive-mind_init`, `hive-mind_consensus`; Hooks `hooks_route`, `hooks_post-task`, `hooks_intelligence`.
- CLI: `npx @claude-flow/cli@latest memory search --query "..."`, `npx @claude-flow/cli@latest agent spawn -t coder --name my-coder`, `npx @claude-flow/cli@latest doctor --fix`

## UI/UX skill
Invoke when the user asks to evaluate/improve design, complains about component looks, or pages/sections are added.
- Colors `brand-blue` (#1e3a5f), `brand-red` (#c0392b) only via CSS variables
- Animations `transition-all duration-200`; card hover `hover:shadow-xl hover:-translate-y-1`
- Interactive focus `focus:outline-none focus:ring-2 focus:ring-brand-red focus:ring-offset-2`

## SEO skill
Invoke when adding pages, changing sitemap.ts, working with robots.txt, Open Graph, canonical URLs, or any layout.tsx change. Per-page checklist:
- `export const metadata: Metadata` with title + description
- Schema.org JSON-LD via `<JsonLd />`
- Entry in `src/frontend/src/app/sitemap.ts`
- Image alt texts in Russian

## Support
RuFlo docs https://github.com/ruvnet/ruflo; CI/CD status https://github.com/KirillMaster/football_site/actions
