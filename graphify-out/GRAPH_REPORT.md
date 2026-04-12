# Graph Report - .  (2026-04-12)

## Corpus Check
- 7 files · ~50,000 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 103 nodes · 167 edges · 11 communities detected
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 13 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Backend Architecture|Backend Architecture]]
- [[_COMMUNITY_Database Schema|Database Schema]]
- [[_COMMUNITY_Club Identity & Content|Club Identity & Content]]
- [[_COMMUNITY_Deployment & Client|Deployment & Client]]
- [[_COMMUNITY_SEO & Analytics|SEO & Analytics]]
- [[_COMMUNITY_Design Audit & Issues|Design Audit & Issues]]
- [[_COMMUNITY_Server Setup|Server Setup]]
- [[_COMMUNITY_Pricing & Academies|Pricing & Academies]]
- [[_COMMUNITY_UI Icons|UI Icons]]
- [[_COMMUNITY_UI Icons|UI Icons]]
- [[_COMMUNITY_UI Icons|UI Icons]]

## God Nodes (most connected - your core abstractions)
1. `FC Arsenal-92 Children's Football Club` - 20 edges
2. `PostgreSQL 16 Database` - 19 edges
3. `PostgreSQL 16 Database` - 16 edges
4. `.NET 9 Web API Backend (Clean Architecture)` - 13 edges
5. `.NET 9 Web API Backend` - 11 edges
6. `Docker Compose Deployment (4 containers)` - 10 edges
7. `New Website Project (fcarsenal92.ru)` - 10 edges
8. `Next.js 15 Frontend` - 9 edges
9. `Next.js 15 Frontend (React, TypeScript, App Router)` - 9 edges
10. `SEO Optimization Strategy (Google + Yandex)` - 9 edges

## Surprising Connections (you probably didn't know these)
- `FC Arsenal-92 Children's Football Club` --equipped_by--> `Nike Equipment and Uniforms`  [INFERRED]
  docs/PROJECT_SPEC.md → docs/assets/promo_2.jpg
- `Accessibility Issues (WCAG violations)` --semantically_similar_to--> `SEO Optimization Strategy (Google + Yandex)`  [INFERRED] [semantically similar]
  docs/DESIGN_REVIEW_AUTO.md → docs/PROJECT_SPEC.md
- `FC Arsenal-92 Children's Football Club` --branding--> `Arsenal-92 Club Logo`  [EXTRACTED]
  docs/PROJECT_SPEC.md → docs/assets/Logo_Arsenal_2.jpg
- `Team and Training Photos` --depicts--> `FC Arsenal-92 Children's Football Club`  [EXTRACTED]
  docs/assets/11.jpg → docs/PROJECT_SPEC.md
- `Player Zaliznyak (#18)` --player_of--> `FC Arsenal-92 Children's Football Club`  [EXTRACTED]
  docs/assets/zaliznyak_1.jpg → docs/PROJECT_SPEC.md

## Hyperedges (group relationships)
- **Docker Infrastructure Stack** — docker_compose, nginx_proxy, nextjs_15_frontend, dotnet_9_api, postgresql_16 [EXTRACTED 1.00]
- **Database Schema Entity Model** — pages_entity, news_entity, coaches_entity, training_groups_entity, schedule_entity, pricing_plans_entity, booking_entity, reviews_entity, gallery_entity, shop_products_entity, payments_entity, site_settings_entity, contacts_entity, admin_users_entity, partners_entity [EXTRACTED 1.00]
- **SEO and Analytics Ecosystem** — seo_strategy, schema_org, google_analytics, yandex_metrika, core_web_vitals, google_business, yandex_business [EXTRACTED 1.00]

## Communities

### Community 0 - "Backend Architecture"
Cohesion: 0.14
Nodes (23): Admin Panel SPA (React, client-side), Clean Architecture Pattern (Domain/Application/Infrastructure/API), CQRS Pattern (MediatR commands/queries), Design System (Color Palette: Red #E10005, Navy #101A7A), .NET 9 Web API Backend (Clean Architecture), .NET 9 Web API Backend, Entity Framework Core ORM, Feature Toggle System (+15 more)

### Community 1 - "Database Schema"
Cohesion: 0.2
Nodes (19): AdminUsers Entity (superadmin/editor roles), Bookings Entity (trial training requests), Bookings Entity, Coaches Entity, Contacts Entity (singleton, phones, social links), Feature Toggle System (SiteSettings.features_enabled), Gallery Entity (albums + items), News/Blog Entity (+11 more)

### Community 2 - "Club Identity & Content"
Cohesion: 0.14
Nodes (17): Children-First Philosophy, Arsenal-92 Club Logo, FC Arsenal-92 Children's Football Club, International Camps (Spain/Seville, Turkey), Kuliev Igor Ramizovich (Director & Head Coach), Nike Equipment and Uniforms, Player Zaliznyak (#18), Private Academy Goal (+9 more)

### Community 3 - "Deployment & Client"
Cohesion: 0.2
Nodes (11): Client Requirements Document (FOR_CLIENT.md), DNS Configuration (A records to 45.10.40.194), Docker Compose Deployment (4 containers), Domain fcarsenal92.ru (Timeweb), English Language Version of Site, GitHub Actions CI/CD Pipeline, Privacy Policy (152-FZ compliance), Server Setup Log (Ubuntu 24.04 LTS) (+3 more)

### Community 4 - "SEO & Analytics"
Cohesion: 0.24
Nodes (10): Core Web Vitals (LCP, FID, CLS targets), Google Analytics 4 Integration, Google Business Profile (local SEO), Google Integration, Schema.org Structured Data (JSON-LD), SEO Optimization Strategy, SEO Optimization Strategy (Google + Yandex), Yandex.Business Profile (local SEO) (+2 more)

### Community 5 - "Design Audit & Issues"
Cohesion: 0.29
Nodes (8): Accessibility Issues (WCAG violations), Current Tilda Website (fcarsenal-92.tilda.ws), Automated Design Quality Review (Score 52/100), Form Security Issues (no reCAPTCHA, no required fields), Knowledge Graph Report (58 nodes, 73 edges, 9 communities), New Website Project (fcarsenal92.ru), Rationale: Migration from Tilda due to SEO/accessibility deficiencies, Priority Remediation Plan (P0-P2)

### Community 6 - "Server Setup"
Cohesion: 0.43
Nodes (6): create_connection(), main(), Server setup script for FC Arsenal-92 football site. Connects via paramiko and c, Create a fresh SSH connection with keepalive., Run a command via SSH with auto-reconnect. ssh_holder is a list [ssh] so we can, run_command()

### Community 7 - "Pricing & Academies"
Cohesion: 0.4
Nodes (5): Partner Academies (Krasnodar, Rostov, CSKA, Lokomotiv, etc.), Pricing Plans Entity (Standard/Standard+/PRO), PRO Plan (6000 RUB), Standard Plan (4000 RUB), Standard+ Plan (5400 RUB)

### Community 8 - "UI Icons"
Cohesion: 1.0
Nodes (1): Football Field Icon (SVG)

### Community 9 - "UI Icons"
Cohesion: 1.0
Nodes (1): Whistle Icon (SVG)

### Community 10 - "UI Icons"
Cohesion: 1.0
Nodes (1): Trophy/Win Icon (SVG)

## Knowledge Gaps
- **32 isolated node(s):** `Yandex Integration`, `Google Integration`, `Standard Plan (4000 RUB)`, `Standard+ Plan (5400 RUB)`, `Tournaments and Competitions` (+27 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `UI Icons`** (1 nodes): `Football Field Icon (SVG)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `UI Icons`** (1 nodes): `Whistle Icon (SVG)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `UI Icons`** (1 nodes): `Trophy/Win Icon (SVG)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `FC Arsenal-92 Children's Football Club` connect `Club Identity & Content` to `Backend Architecture`, `Design Audit & Issues`, `Pricing & Academies`?**
  _High betweenness centrality (0.288) - this node is a cross-community bridge._
- **Why does `New Website Project (fcarsenal92.ru)` connect `Design Audit & Issues` to `Backend Architecture`, `Database Schema`, `Club Identity & Content`, `Deployment & Client`, `SEO & Analytics`?**
  _High betweenness centrality (0.204) - this node is a cross-community bridge._
- **Why does `PostgreSQL 16 Database` connect `Database Schema` to `Backend Architecture`, `Deployment & Client`, `Design Audit & Issues`, `Pricing & Academies`?**
  _High betweenness centrality (0.187) - this node is a cross-community bridge._
- **What connects `Yandex Integration`, `Google Integration`, `Standard Plan (4000 RUB)` to the rest of the system?**
  _32 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Backend Architecture` be split into smaller, more focused modules?**
  _Cohesion score 0.14 - nodes in this community are weakly interconnected._
- **Should `Club Identity & Content` be split into smaller, more focused modules?**
  _Cohesion score 0.14 - nodes in this community are weakly interconnected._