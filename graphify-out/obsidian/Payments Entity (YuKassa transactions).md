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

# Payments Entity (YuKassa transactions)

## Connections
- [[Bookings Entity]] - `references` [EXTRACTED]
- [[Bookings Entity (trial training requests)]] - `references_fk` [EXTRACTED]
- [[PostgreSQL 16 Database]] - `stores` [EXTRACTED]
- [[PostgreSQL 16 Database_1]] - `stores` [EXTRACTED]
- [[YuKassa Payment System (optional)]] - `processed_by` [EXTRACTED]

#graphify/document #graphify/EXTRACTED #community/Database_Schema