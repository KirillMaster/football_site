---
source_file: "docs/ARCHITECTURE.md"
type: "document"
community: "Database Schema"
location: "Section 2.2"
tags:
  - graphify/document
  - graphify/EXTRACTED
  - community/Database_Schema
---

# Bookings Entity (trial training requests)

## Connections
- [[Payments Entity (YuKassa transactions)]] - `references_fk` [EXTRACTED]
- [[PostgreSQL 16 Database_1]] - `stores` [EXTRACTED]
- [[Privacy Policy (152-FZ compliance)]] - `legally_required_for` [INFERRED]
- [[Training Groups Entity]] - `references_fk` [EXTRACTED]

#graphify/document #graphify/EXTRACTED #community/Database_Schema