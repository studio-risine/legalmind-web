# Process Module

Module for managing legal processes in the LegalMind platform.

## Structure

- `actions/` - Server actions for queries and mutations
- `components/` - UI components (DataTable, StatusBadge, forms)
- `repositories/` - Data access layer (Drizzle)
- `factories/` - Test data factories
- `forms/` - Form components with validation

## Features

- List processes with tenant isolation
- Display process details (title, CNJ, client, status)
- Status management (ACTIVE, ARCHIVED, ON_HOLD)
- Multi-tenant data scoping

## Usage

```typescript
import { queryProcesses } from '@modules/process'

// Server component
const { data } = await queryProcesses({ spaceId, page: 1, perPage: 10 })
```
