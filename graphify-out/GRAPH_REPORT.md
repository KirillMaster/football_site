# Graph Report - C:/pet/football_site  (2026-04-12)

## Corpus Check
- 33 files · ~171,122 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 58 nodes · 73 edges · 9 communities detected
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Club Identity & Operations|Club Identity & Operations]]
- [[_COMMUNITY_Database Schema|Database Schema]]
- [[_COMMUNITY_Infrastructure & Architecture|Infrastructure & Architecture]]
- [[_COMMUNITY_Admin & Payments|Admin & Payments]]
- [[_COMMUNITY_SEO & Search Engines|SEO & Search Engines]]
- [[_COMMUNITY_Pricing & Academies|Pricing & Academies]]
- [[_COMMUNITY_UI Icons (Field)|UI Icons (Field)]]
- [[_COMMUNITY_UI Icons (Whistle)|UI Icons (Whistle)]]
- [[_COMMUNITY_UI Icons (Trophy)|UI Icons (Trophy)]]

## God Nodes (most connected - your core abstractions)
1. `PostgreSQL 16 Database` - 16 edges
2. `FC Arsenal-92` - 15 edges
3. `.NET 9 Web API Backend` - 11 edges
4. `Next.js 15 Frontend` - 9 edges
5. `Docker Compose Deployment` - 6 edges
6. `SEO Optimization Strategy` - 5 edges
7. `Nginx Reverse Proxy` - 4 edges
8. `Pricing Plans Entity` - 4 edges
9. `Admin Panel SPA` - 3 edges
10. `YuKassa Payment System` - 3 edges

## Surprising Connections (you probably didn't know these)
- `FC Arsenal-92` --equipped_by--> `Nike Equipment and Uniforms`  [INFERRED]
  docs/PROJECT_SPEC.md → docs/assets/promo_2.jpg
- `FC Arsenal-92` --branding--> `Arsenal-92 Club Logo`  [EXTRACTED]
  docs/PROJECT_SPEC.md → docs/assets/Logo_Arsenal_2.jpg
- `Team and Training Photos` --depicts--> `FC Arsenal-92`  [EXTRACTED]
  docs/assets/11.jpg → docs/PROJECT_SPEC.md
- `Player Zaliznyak (#18)` --player_of--> `FC Arsenal-92`  [EXTRACTED]
  docs/assets/zaliznyak_1.jpg → docs/PROJECT_SPEC.md
- `Current Site Screenshot` --depicts--> `Current Tilda Website`  [EXTRACTED]
  docs/assets/site_screenshot_full.jpeg → docs/PROJECT_SPEC.md

## Hyperedges (group relationships)
- **Docker Infrastructure Stack** — docker_compose, nginx_proxy, nextjs_frontend, dotnet_backend, postgresql_db [EXTRACTED 1.00]
- **Database Schema Entities** — pages_entity, news_entity, coaches_entity, training_groups_entity, schedule_entity, pricing_plans_entity, bookings_entity, reviews_entity, gallery_entity, payments_entity, admin_users_entity, site_settings_entity, contacts_entity, partners_entity [EXTRACTED 1.00]
- **Club Identity and Branding** — fc_arsenal_92, club_logo, design_system, nike_equipment, children_first_philosophy [INFERRED 0.80]

## Communities

### Community 0 - "Club Identity & Operations"
Cohesion: 0.18
Nodes (14): Children-First Philosophy, Arsenal-92 Club Logo, FC Arsenal-92, Kuliev Igor Ramizovich, Nike Equipment and Uniforms, Player Zaliznyak (#18), Private Academy Goal, Sevastopol (+6 more)

### Community 1 - "Database Schema"
Cohesion: 0.19
Nodes (13): Admin Users Entity, Bookings Entity, Coaches Entity, Contacts Entity, Gallery Entity, News Entity, Pages Entity, Partners Entity (+5 more)

### Community 2 - "Infrastructure & Architecture"
Cohesion: 0.24
Nodes (12): Clean Architecture Pattern, CQRS Pattern, Design System (Color Palette), Docker Compose Deployment, .NET 9 Web API Backend, Entity Framework Core ORM, GitHub Actions CI/CD, Next.js 15 Frontend (+4 more)

### Community 3 - "Admin & Payments"
Cohesion: 0.33
Nodes (6): Admin Panel SPA, Feature Toggle System, Internationalization (ru/en), JWT Authentication, Payments Entity, YuKassa Payment System

### Community 4 - "SEO & Search Engines"
Cohesion: 0.4
Nodes (5): Core Web Vitals, Google Integration, Schema.org Structured Data, SEO Optimization Strategy, Yandex Integration

### Community 5 - "Pricing & Academies"
Cohesion: 0.4
Nodes (5): Partner Academies, Pricing Plans Entity, PRO Plan (6000 RUB), Standard Plan (4000 RUB), Standard+ Plan (5400 RUB)

### Community 6 - "UI Icons (Field)"
Cohesion: 1.0
Nodes (1): Football Field Icon (SVG)

### Community 7 - "UI Icons (Whistle)"
Cohesion: 1.0
Nodes (1): Whistle Icon (SVG)

### Community 8 - "UI Icons (Trophy)"
Cohesion: 1.0
Nodes (1): Trophy/Win Icon (SVG)

## Knowledge Gaps
- **28 isolated node(s):** `Yandex Integration`, `Google Integration`, `Schema.org Structured Data`, `Pages Entity`, `News Entity` (+23 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `UI Icons (Field)`** (1 nodes): `Football Field Icon (SVG)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `UI Icons (Whistle)`** (1 nodes): `Whistle Icon (SVG)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `UI Icons (Trophy)`** (1 nodes): `Trophy/Win Icon (SVG)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `PostgreSQL 16 Database` connect `Database Schema` to `Infrastructure & Architecture`, `Admin & Payments`, `Pricing & Academies`?**
  _High betweenness centrality (0.426) - this node is a cross-community bridge._
- **Why does `FC Arsenal-92` connect `Club Identity & Operations` to `Infrastructure & Architecture`, `Pricing & Academies`?**
  _High betweenness centrality (0.407) - this node is a cross-community bridge._
- **Why does `.NET 9 Web API Backend` connect `Infrastructure & Architecture` to `Club Identity & Operations`, `Database Schema`, `Admin & Payments`?**
  _High betweenness centrality (0.399) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `Next.js 15 Frontend` (e.g. with `SEO Optimization Strategy` and `Design System (Color Palette)`) actually correct?**
  _`Next.js 15 Frontend` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Yandex Integration`, `Google Integration`, `Schema.org Structured Data` to the rest of the system?**
  _28 weakly-connected nodes found - possible documentation gaps or missing edges._