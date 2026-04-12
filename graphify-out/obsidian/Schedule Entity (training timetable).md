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

# Schedule Entity (training timetable)

## Connections
- [[Coaches Entity]] - `references_fk` [EXTRACTED]
- [[PostgreSQL 16 Database]] - `stores` [EXTRACTED]
- [[PostgreSQL 16 Database_1]] - `stores` [EXTRACTED]
- [[Training Groups Entity]] - `references_fk` [EXTRACTED]

#graphify/document #graphify/EXTRACTED #community/Database_Schema