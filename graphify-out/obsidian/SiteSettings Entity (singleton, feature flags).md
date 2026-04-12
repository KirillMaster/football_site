---
source_file: "docs/ARCHITECTURE.md"
type: "document"
community: "Database Schema"
location: "Section 4"
tags:
  - graphify/document
  - graphify/EXTRACTED
  - community/Database_Schema
---

# SiteSettings Entity (singleton, feature flags)

## Connections
- [[Feature Toggle System (SiteSettings.features_enabled)]] - `stored_in` [EXTRACTED]
- [[PostgreSQL 16 Database]] - `stores` [EXTRACTED]
- [[PostgreSQL 16 Database_1]] - `stores` [EXTRACTED]

#graphify/document #graphify/EXTRACTED #community/Database_Schema