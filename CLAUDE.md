# Claude Code — ФК Арсенал-92 · RuFlo V3.5

## Language

Always respond in **Russian**. No exceptions, even for technical topics, error messages, or code comments in output.

---

## Skill-First Workflow

**Before starting ANY task — check skills. If a skill matches, invoke it FIRST, then proceed.**

### Priority order:

| Priority | Skill | When to invoke |
|----------|-------|----------------|
| **1** | `/graphify` | Любой поиск по кодовой базе, анализ архитектуры, "покажи где X", "как устроено Y", навигация по файлам проекта — сначала graphify, потом Grep/Glob |
| **2** | UI/UX skill | Анализ дизайна, оценка компонентов, улучшение визуального интерфейса |
| **3** | SEO skill | Мета-теги, schema.org, sitemap, Core Web Vitals, индексация |
| **4** | `/sparc:architect` | Проектирование новых фич, рефакторинг, архитектурные решения |
| **5** | `/github:code-review` | Ревью PR, анализ качества кода |

### Правила:
- Не молчи про скилл — если он применим, скажи явно и предложи
- Для сложных задач комбинируй скиллы: `/graphify` для понимания базы → `/sparc:architect` для плана → реализация
- Если несколько скиллов применимы — кратко перечисли с описанием в 1 строку

### graphify — первичный инструмент разведки кодовой базы:
- Используй graphify для построения/обновления графа знаний ПЕРЕД глубоким поиском
- `graphify query "..."` — семантический поиск по базе
- `graphify --update` — инкрементальное обновление при изменениях
- Grep/Glob — только для точечных lookups по конкретному символу/файлу, когда цель известна заранее

---

## Prompt Engineering

<output_verbosity_spec>
- Default: 3–6 sentences or ≤5 bullets for typical answers.
- For simple "yes/no + short explanation" questions: ≤2 sentences.
- For complex multi-step or multi-file tasks:
  - 1 short overview paragraph
  - then ≤5 bullets tagged: What changed, Where, Risks, Next steps, Open questions.
- Avoid long narrative paragraphs; prefer compact bullets and short sections.
- Do not rephrase the user's request unless it changes semantics.
- Never narrate routine tool calls ("читаю файл...", "запускаю тесты...").
</output_verbosity_spec>

<user_updates_spec>
- Send brief updates (1–2 sentences) only when:
  - You start a new major phase of work, or
  - You discover something that changes the plan.
- Each update must include at least one concrete outcome ("Нашёл X", "Подтвердил Y", "Обновил Z").
- Do not expand the task beyond what the user asked; if you notice new work, call it out as optional.
</user_updates_spec>

<design_and_scope_constraints>
- Explore any existing design systems and understand it deeply (Tailwind config, globals.css, component patterns).
- Implement EXACTLY and ONLY what the user requests.
- No extra features, no added components, no UX embellishments.
- Style aligned to brand: brand-blue (#1e3a5f), brand-red (#c0392b), white. No inventing new tokens.
- If any instruction is ambiguous, choose the simplest valid interpretation.
</design_and_scope_constraints>

<uncertainty_and_ambiguity>
- If the question is ambiguous or underspecified, ask up to 1–3 precise clarifying questions OR present 2–3 plausible interpretations with clearly labeled assumptions.
- Never fabricate exact figures, line numbers, or external references when uncertain.
- When unsure, prefer "Based on current code..." instead of absolute claims.
</uncertainty_and_ambiguity>

<tool_usage_rules>
- Prefer tools over internal knowledge whenever you need fresh or user-specific data.
- Parallelize ALL independent reads/searches in ONE message — never sequential if not dependent.
- After any write/update tool call, briefly restate: what changed, where, any follow-up validation.
- For codebase exploration: graphify FIRST, then Grep/Glob for pinpoint lookups.
- For DB operations: use Docker + psql with credentials from C:\Pet\secrets\secrets.txt.
</tool_usage_rules>

<long_context_handling>
- For inputs longer than ~10k tokens (multi-file tasks, large diffs):
  - First, produce a short internal outline of sections relevant to the request.
  - Re-state constraints explicitly before answering.
  - Anchor claims to specific files/lines rather than speaking generically.
</long_context_handling>

---

## Secrets — C:\Pet\secrets\secrets.txt

**Все учётные данные проекта хранятся локально в `C:\Pet\secrets\secrets.txt`.**

Перед любой операцией требующей доступа к инфраструктуре — читай этот файл.

| Что | Как использовать |
|-----|-----------------|
| SSH на сервер | `ssh root@147.45.229.110` + пароль из строки `ssh root@...` |
| PostgreSQL | `docker run --rm postgres:16-alpine psql 'postgresql://gen_user:PASSWORD@188.225.75.81:5432/football'` |
| S3 хранилище | endpoint `https://s3.twcstorage.ru`, bucket/keys из secrets.txt |
| Timeweb панель | логин `dd38889` + пароль из secrets.txt |

```bash
# Прочитать секреты:
Read("C:\\Pet\\secrets\\secrets.txt")

# Подключиться к БД:
docker run --rm postgres:16-alpine psql 'postgresql://gen_user:VXfV!4Tf8%23GLIU@188.225.75.81:5432/football' -c 'SELECT ...'

# SSH на сервер (через sshpass или password в secrets):
sshpass -p 'PASSWORD' ssh root@147.45.229.110 'COMMAND'
```

> ⚠️ НИКОГДА не коммить содержимое secrets.txt в git. Файл локальный, не в репозитории.

---

## Project Context

**Stack:** Next.js 15 (App Router, TypeScript) + .NET 9 (DDD, EF Core) + PostgreSQL + Docker + nginx

**Domain:** ФК Арсенал-92 — детская футбольная школа, г. Севастополь

**Server:** `147.45.229.110` (root SSH — пароль в secrets.txt)

**DB:** `postgresql://gen_user@188.225.75.81:5432/football` (пароль в secrets.txt, `#` → `%23` в URL)

**Deploy:** GitHub Actions → GHCR → SSH pull → `docker compose up -d --no-deps nextjs dotnet-api`

**Nginx config:** `config/nginx/fcarsenal92.ru.conf` — именно этот файл деплоится на сервер

**Admin:** `admin@fcarsenal92.ru` (email из GitHub Secret ADMIN_EMAIL)

---

## Behavioral Rules (Always Enforced)

- Do what has been asked; nothing more, nothing less
- NEVER create files unless absolutely necessary
- ALWAYS prefer editing an existing file to creating a new one
- NEVER proactively create documentation (`*.md`) or README unless explicitly asked
- NEVER save working files or tests to the root folder
- ALWAYS read a file before editing it
- NEVER commit secrets, credentials, or .env files
- NEVER continuously poll agent status — spawn once, wait for result
- ALWAYS run tests after code changes; verify build before commit
- После каждого коммита — `git push origin master` для запуска CI/CD

---

## File Organization

| Purpose | Directory |
|---------|-----------|
| Source code | `/src` |
| Tests | `/tests` |
| Documentation | `/docs` |
| Configuration | `/config` |
| Scripts | `/scripts` |
| Examples | `/examples` |

---

## Architecture

- **Pattern**: Domain-Driven Design, bounded contexts
- **Files**: keep under 500 lines
- **APIs**: typed interfaces for all public APIs
- **Testing**: TDD London School (mock-first) for new code
- **State**: event sourcing for state changes
- **Validation**: input validation at system boundaries only

### Frontend structure:
- `src/frontend/src/app/` — Next.js pages (App Router)
- `src/frontend/src/components/` — переиспользуемые компоненты
- `src/frontend/src/lib/api.ts` — все API вызовы (SSR: API_INTERNAL_URL, client: relative URL)
- `src/frontend/src/types/` — TypeScript типы

### Backend structure:
- `Arsenal.API` — Controllers, Program.cs
- `Arsenal.Application` — Commands, Queries, DTOs
- `Arsenal.Domain` — Entities, Value Objects
- `Arsenal.Infrastructure` — EF Core, DbInitializer, Repositories

---

## Build & Test

```bash
# Frontend
cd src/frontend && npm run build && npm run lint

# Backend
dotnet build src/backend && dotnet test src/backend

# Docker (локально перед пушем)
docker compose -f docker-compose.yml build
```

---

## Security Rules

- NEVER hardcode API keys, secrets, or credentials in source files
- NEVER commit .env files or files containing secrets
- Always validate user input at system boundaries
- Always sanitize file paths to prevent directory traversal

---

## Concurrency — 1 MESSAGE = ALL RELATED OPERATIONS

- All operations MUST be concurrent/parallel in a single message
- ALWAYS spawn ALL agents in ONE message via Agent tool
- ALWAYS batch ALL file reads/writes/edits in ONE message
- ALWAYS batch ALL Bash commands in ONE message

---

## Swarm Orchestration (RuFlo V3.5)

### Инициализация:
```bash
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 8 --strategy specialized
```

### Правила:
- Для сложных задач (>3 файлов, >1 домен) — ОБЯЗАТЕЛЬНО используй swarm
- Topology: hierarchical для coding swarms (anti-drift)
- maxAgents: 6-8 для tight coordination
- Consensus: `raft` для hive-mind
- `run_in_background: true` для ВСЕХ Agent calls
- После spawn — СТОП. Не добавляй tool calls, не проверяй статус

### 3-Tier Model Routing:

| Tier | Handler | Latency | Use Cases |
|------|---------|---------|-----------|
| **1** | Edit tool (direct) | <1ms | Simple transforms — no LLM |
| **2** | Haiku | ~500ms | Simple tasks (<30% complexity) |
| **3** | Sonnet/Opus | 2-5s | Architecture, security, complex reasoning |

---

## RuFlo V3.5 — Memory & Tools

### Активные скиллы этого проекта:
- **graphify** — knowledge graph кодовой базы (ПРИОРИТЕТ для поиска)
- **UI/UX analysis** — дизайн аудит и улучшения
- **SEO** — технический SEO, schema.org, sitemap
- **swarm-orchestration** — multi-agent coordination

### Memory tools (через ToolSearch):

```
ToolSearch("memory search")      → memory_store, memory_search, memory_search_unified
ToolSearch("swarm")              → swarm_init, swarm_status, swarm_health
ToolSearch("+aidefence")         → aidefence_scan, aidefence_is_safe
ToolSearch("hooks intelligence") → hooks_intelligence, neural_train
```

### Key MCP tools:

| Category | Tools |
|----------|-------|
| Memory | `memory_store`, `memory_search`, `memory_search_unified` |
| Swarm | `swarm_init`, `swarm_status`, `agent_spawn` |
| Hive-Mind | `hive-mind_init`, `hive-mind_consensus` |
| Hooks | `hooks_route`, `hooks_post-task`, `hooks_intelligence` |

### CLI:
```bash
npx @claude-flow/cli@latest memory search --query "..."
npx @claude-flow/cli@latest agent spawn -t coder --name my-coder
npx @claude-flow/cli@latest doctor --fix
```

---

## UI/UX Skill — Activation Rules

Invoke UI/UX skill when:
- Пользователь просит оценить / улучшить дизайн
- Есть жалобы на внешний вид компонентов
- Добавляются новые страницы или секции

Design system enforcement:
- Цвета: `brand-blue` (#1e3a5f), `brand-red` (#c0392b) — только через CSS переменные
- Анимации: `transition-all duration-200` как стандарт
- Hover states: `hover:shadow-xl hover:-translate-y-1` для карточек
- Focus: `focus:outline-none focus:ring-2 focus:ring-brand-red focus:ring-offset-2` для интерактивных элементов

---

## SEO Skill — Activation Rules

Invoke SEO skill when:
- Добавляются новые страницы (нужны метатеги + schema.org)
- Изменяется sitemap.ts
- Работа с robots.txt, Open Graph, canonical URLs
- Любые изменения в layout.tsx

SEO checklist для каждой страницы:
- `export const metadata: Metadata` с title + description
- Schema.org JSON-LD через `<JsonLd />`
- Запись в `src/frontend/src/app/sitemap.ts`
- Image alt-тексты на русском

---

## Support

- RuFlo docs: https://github.com/ruvnet/ruflo
- CI/CD status: https://github.com/KirillMaster/football_site/actions
