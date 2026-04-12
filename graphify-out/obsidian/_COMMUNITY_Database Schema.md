---
type: community
cohesion: 0.20
members: 19
---

# Database Schema

**Cohesion:** 0.20 - loosely connected
**Members:** 19 nodes

## Members
- [[AdminUsers Entity (superadmineditor roles)]] - document - docs/ARCHITECTURE.md
- [[Bookings Entity]] - document - docs/PROJECT_SPEC.md
- [[Bookings Entity (trial training requests)]] - document - docs/ARCHITECTURE.md
- [[Coaches Entity]] - document - docs/ARCHITECTURE.md
- [[Contacts Entity (singleton, phones, social links)]] - document - docs/ARCHITECTURE.md
- [[Feature Toggle System (SiteSettings.features_enabled)]] - document - docs/PROJECT_SPEC.md
- [[Gallery Entity (albums + items)]] - document - docs/ARCHITECTURE.md
- [[NewsBlog Entity]] - document - docs/ARCHITECTURE.md
- [[Pages Entity (static CMS pages)]] - document - docs/ARCHITECTURE.md
- [[Partners Entity (Medobory, A2)]] - document - docs/ARCHITECTURE.md
- [[Payments Entity (YuKassa transactions)]] - document - docs/ARCHITECTURE.md
- [[PostgreSQL 16 Database_1]] - document - docs/ARCHITECTURE.md
- [[PostgreSQL 16 Database]] - document - docs/PROJECT_SPEC.md
- [[Rationale Feature toggles for optional features]] - document - docs/PROJECT_SPEC.md
- [[Reviews Entity (parentplayer testimonials)]] - document - docs/ARCHITECTURE.md
- [[Schedule Entity (training timetable)]] - document - docs/ARCHITECTURE.md
- [[Shop Products Entity (equipment catalog)]] - document - docs/PROJECT_SPEC.md
- [[SiteSettings Entity (singleton, feature flags)]] - document - docs/ARCHITECTURE.md
- [[Training Groups Entity]] - document - docs/ARCHITECTURE.md

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Database_Schema
SORT file.name ASC
```

## Connections to other communities
- 5 edges to [[_COMMUNITY_Backend Architecture]]
- 3 edges to [[_COMMUNITY_Deployment & Client]]
- 2 edges to [[_COMMUNITY_Pricing & Academies]]
- 1 edge to [[_COMMUNITY_Design Audit & Issues]]
- 1 edge to [[_COMMUNITY_Club Identity & Content]]

## Top bridge nodes
- [[PostgreSQL 16 Database_1]] - degree 19, connects to 4 communities
- [[PostgreSQL 16 Database]] - degree 16, connects to 3 communities
- [[Payments Entity (YuKassa transactions)]] - degree 5, connects to 1 community
- [[Bookings Entity (trial training requests)]] - degree 4, connects to 1 community
- [[Feature Toggle System (SiteSettings.features_enabled)]] - degree 3, connects to 1 community