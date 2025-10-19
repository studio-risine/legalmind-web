# Clients Module (Canonical Usage)

This document defines the expected usage patterns for the Clients module going forward. It replaces all previous references to a "Customer" module.

## Goals
- Provide strong CRUD APIs for clients
- Integrate with processes and deadlines
- Support performant search and pagination

## Proposed Server Actions (Next.js)

```ts
// modules/clients/actions.ts
export async function createClientAction(input: {
  name: string
  email?: string
  phone?: string
  taxId?: string
  type?: 'INDIVIDUAL' | 'COMPANY'
}) { /* insert via Drizzle */ }

export async function updateClientAction(input: {
  id: string
  name?: string
  email?: string
  phone?: string
  taxId?: string
  type?: 'INDIVIDUAL' | 'COMPANY'
}) { /* update via Drizzle */ }

export async function deleteClientAction(id: string) { /* soft/hard delete */ }
```

## Proposed Actions (Server)

```ts
// src/modules/client/actions
export { getClientByIdAction, getClientsAction, searchClientsAction }
export { insertClientAction, updateClientAction, deleteClientAction, toggleClientStatusAction }
```

## Proposed Hooks (React)

```ts
// src/modules/client/hooks
// Consolidated in two files: use-client-queries.ts and use-client-mutations.ts

// Queries
export {
  useClientById,
  useClientsList,
  useClientsListResults,
  useClientSearch,
  useClientSearchResults,
  useInfiniteClientSearch,
  useClientSearchWithDebounce,
  useClientPagination,
  useClientStats,
} from '@/modules/client/hooks'

// Mutations
export { useClientMutation } from '@/modules/client/hooks'
```

## Example UI Usage

```tsx
function ClientDetails({ id }: { id: string }) {
  const { data: client, isLoading } = useClientById(id)
  if (isLoading) return <div>Loading...</div>
  if (!client) return <div>Client not found</div>
  return (
    <article>
      <h1>{client.name}</h1>
      {client.email && <p>{client.email}</p>}
      {client.phone && <p>{client.phone}</p>}
    </article>
  )
}
```

## Migration Notes (from Customer)
- Rename files and directories from `customer` to `clients`
- Update imports and types accordingly
- Replace old examples with the APIs above

## Related Schema
- See `docs/database/schema.md` for the `clients` table definition and indices.
```

## Testing

This module includes unit tests for both server actions and React hooks. To run the tests:

- Run all tests: `npm run test`
- Run with coverage: `npm run test:coverage`

### Setup

- The test environment is configured in `vitest.config.ts` and `vitest.setup.ts`.
- We mock the current account context via `getCurrentAccountId` to ensure consistent multi-tenant behavior.

### Actions tests

Actions are tested under `src/modules/client/actions/__tests__`. Each test mocks the Drizzle database layer and verifies:

- "Happy path" (rows returned) and failure paths (rows empty or action returns null)
- Revalidation calls for Next.js (when applicable)
- Correct pagination and search logic (`searchClientsAction`, `getClientsAction`)

Example pattern:

```ts
vi.mock('@/modules/client/actions', () => ({ /* ... */ }))
// or mock db methods used internally by the action

// Arrange
vi.mocked(getClientsAction).mockResolvedValueOnce({ data: [{ id: 'c1', /* ... */ }], total: 1 })

// Act
const result = await getClientsAction({ searchQuery: 'Alice', page: 1, perPage: 20 })

// Assert
expect(result.total).toBe(1)
```

### Hooks tests

Hooks are tested under `src/modules/client/hooks/__tests__`. We wrap hooks with a `QueryClientProvider` and mock the module `@/modules/client/actions` to control the hook responses.

Wrapper utility:

```tsx
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
```

- For debounced search (`useClientSearchWithDebounce`), use `vi.useFakeTimers()` and advance timers to trigger the debounced callback.
- For pagination (`useClientPagination`), validate page transitions and boundaries and ensure `getClientsAction` is called with the correct `page` and `perPage`.
- For stats (`useClientStats`), mock aggregated clients and assert derived metrics like `byStatus`, `recentCount`, and `activePercentage`.

### Type safety in tests

- Use realistic `Client` fixtures with all required fields (id, account_id, type, status, name, created_at, and optional email/phone/tax_id/notes; timestamps created_at, updated_at, deleted_at).
- Avoid `any` by using explicit mocks and narrow casts (e.g., `null as unknown as never` for negative paths where the hook expects a value).