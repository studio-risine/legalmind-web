# Clients Module — Actions and Hooks

This README documents the API of the `src/modules/client` module, focusing on Server Actions and React hooks for queries and mutations. It replaces and consolidates the essential content previously available in `docs/clients/README.md`.

Note: this module is multi-tenant and actions depend on the current account context (via `getCurrentAccountId`).

## Server Actions

Actions live under `src/modules/client/actions` and are exported by `index.ts`.

- `getClientsAction(input)`
  - Parameters: `{ searchQuery?: string; sortBy?: 'created_at' | 'name'; sortDirection?: 'asc' | 'desc'; page?: number; perPage?: number }`
  - Returns: `{ data: Client[] | null; total: number | null; error?: string }`
  - Notes: pagination based on `page` and `perPage`; search by `name`, `email`, `phone`, `tax_id`.

- `searchClientsAction(input)`
  - Parameters: `{ q?: string; status?: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'; page?: number; pageSize?: number }`
  - Returns: `{ customers: Client[]; total: number; hasMore: boolean; error?: string }`
  - Notes: ideal for search UX with/without status; sorts by `created_at` desc; computes `hasMore`.

- `getClientByIdAction({ id })`
  - Parameters: `{ id: string }`
  - Returns: `Client | null`

- `insertClientAction(input)`
  - Parameters: `ClientInsertInput` (accepted fields: `name`, `email?`, `phone?`, `tax_id?`)
  - Returns: `{ success: boolean; data?: Client; error?: string }`
  - Notes: associates the client to the current account and revalidates `/dashboard/clients`.

- `updateClientAction(input)`
  - Parameters: `ClientUpdateInput` (`{ id: string }` + editable fields `name?`, `email?`, `phone?`)
  - Returns: `{ success: boolean; data?: Client; error?: string }`

- `deleteClientAction({ id })`
  - Parameters: `{ id: string }`
  - Returns: `{ success: boolean; error?: string }`

- `toggleClientStatusAction({ id, status })`
  - Parameters: `{ id: string; status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED' }`
  - Returns: `{ success: boolean; data?: Client; error?: string }`

Relevant types exported by actions:
- `ClientInsertInput`
- `ClientUpdateInput`
- `ToggleClientStatusInput`
- `SearchClientsInput`, `SearchClientsOutput`
- `UpdateClientOutput`, `InsertClientOutput`, `DeleteClientOutput`, `ToggleClientStatusOutput`

## Hooks (React)

Hooks are exported by `src/modules/client/hooks/index.ts` and are split between queries and mutations.

### Queries

- `useClientById(id, options?)`
  - Fetches a client by ID. Returns `{ client, isLoading, isError, error, refetch, isFetching }`.

- `useClientsList(options?)`
  - Paginated list with `{ status?, limit=50, offset=0, search?, enabled=true, staleTime }`. Returns `{ data: { customers, total }, ... }` via react-query.

- `useActiveClientsList(options?)`, `useAllClientsList(options?)`, `useClientsListWithStatus(status, options?)`
  - Conveniences over `useClientsList`.

- `useClientsListResults(options?)`
  - Friendly result with `{ customers, total, isLoading, isError, isEmpty, hasCustomers, error, refetch, isFetching }`.

- `useClientSearch(options?)`
  - Paginated search with `{ q?, status?, pageSize=20, enabled=true, staleTime }`. Requires `q` (>= 1 char) or `status`.

- `useInfiniteClientSearch(options?)`
  - Infinite version (react-query `useInfiniteQuery`). Computes next pages based on `hasMore`.

- `useClientSearchQuery(options?)`
  - Alias to `useClientSearch`.

- `useClientSearchResults(options?)`
  - Search result with `{ customers, total, hasMore, isLoading, isError, isEmpty, error, refetch }`.

- `useClientSearchWithDebounce(options?)`
  - Controlled interface with debounce for search. Returns `{ query, status, hasActiveFilters, handleQueryChange, handleStatusChange, clearFilters, customers, total, hasMore, ... }`.

- `useClientPagination(options?)`
  - Page-based pagination from a list: `{ currentPage, totalPages, pageSize, hasNextPage, hasPreviousPage, goToPage, goToNextPage, goToPreviousPage, goToFirstPage, goToLastPage, resetPagination, customers, total, ... }`.

- `useClientStats(options?)`
  - Derived stats (total, by status, recent in 30 days, active %) from a list (limit 1000).

Note about Query Keys: hooks use the base key `['customers', ...]` for historical compatibility.

### Mutations

- `useClientMutation()`
  - Exposes:
    - Create: `createClient`, `createClientAsync`
    - Update: `updateClient`, `updateClientAsync`
    - Delete: `deleteClient`, `deleteClientAsync`
    - Toggle Status: `toggleClientStatus`, `toggleClientStatusAsync`
  - Combined states: `{ isLoading, isCreating, isUpdating, isDeleting, isTogglingStatus }`
  - Cache policy: invalidates `['customers']` and updates `['customers','byId',{id}]` where applicable.

## Usage Examples

### Detail by ID

```tsx
function ClientDetails({ id }: { id: string }) {
  const { client, isLoading, isError } = useClientById(id)
  if (isLoading) return <div>Loading...</div>
  if (isError || !client) return <div>Client not found</div>
  return (
    <article>
      <h1>{client.name}</h1>
      {client.email && <p>{client.email}</p>}
      {client.phone && <p>{client.phone}</p>}
    </article>
  )
}
```

### List with Pagination

```tsx
function ClientsList() {
  const { customers, total, currentPage, totalPages, goToNextPage, goToPreviousPage, isLoading } =
    useClientPagination({ pageSize: 20 })

  if (isLoading) return <div>Loading...</div>
  return (
    <div>
      <ul>{customers.map(c => <li key={c.id}>{c.name}</li>)}</ul>
      <footer>
        <button disabled={currentPage===1} onClick={goToPreviousPage}>Previous</button>
        <span>{currentPage} / {totalPages}</span>
        <button disabled={!total || currentPage===totalPages} onClick={goToNextPage}>Next</button>
      </footer>
    </div>
  )}
```

### Debounced Search

```tsx
function ClientsSearch() {
  const {
    query,
    status,
    handleQueryChange,
    handleStatusChange,
    customers,
    total,
    hasActiveFilters,
    isLoading,
  } = useClientSearchWithDebounce({ debounceMs: 300 })

  return (
    <section>
      <input placeholder="Search" defaultValue={query} onChange={e => handleQueryChange(e.target.value)} />
      <select value={status ?? ''} onChange={e => handleStatusChange(e.target.value as any)}>
        <option value="">All</option>
        <option value="ACTIVE">Active</option>
        <option value="INACTIVE">Inactive</option>
        <option value="ARCHIVED">Archived</option>
      </select>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <ul>{customers.map(c => <li key={c.id}>{c.name}</li>)}</ul>
      )}

      {hasActiveFilters && <p>Total: {total}</p>}
    </section>
  )}
```

### Mutations (CRUD)

```tsx
function ClientEditor({ client }: { client?: Client }) {
  const { createClient, updateClient, deleteClient, toggleClientStatus, isLoading } = useClientMutation()

  return (
    <div>
      <button disabled={isLoading} onClick={() => createClient({ name: 'New Client' })}>
        Create
      </button>
      {client && (
        <>
          <button disabled={isLoading} onClick={() => updateClient({ id: client.id, data: { name: 'Edited' } })}>
            Update
          </button>
          <button disabled={isLoading} onClick={() => deleteClient(client.id)}>
            Delete
          </button>
          <button disabled={isLoading} onClick={() => toggleClientStatus({ id: client.id, status: 'ACTIVE' })}>
            Activate
          </button>
        </>
      )}
    </div>
  )}
```

## Best Practices

- Always handle `isLoading`, `isError`, and empty states (`isEmpty`) in your components.
- For searches, apply debounce (`useClientSearchWithDebounce`) to avoid excessive requests.
- Respect the cache key `['customers']` and avoid unintended overwrites.
- In pages sensitive to updates, consider `refetchOnWindowFocus: false` and an appropriate `staleTime`.

## Tests

This module includes tests for both actions and hooks.

- Run all tests: `pnpm test`
- Coverage: `pnpm test:coverage`

Patterns (summary):
- Actions: Drizzle mocks and validation of happy/empty/error paths.
- Hooks: use `QueryClientProvider` and mock `@/modules/client/actions` to control responses.
- Debounce: `vi.useFakeTimers()` and time advancements.
- Pagination: validate page transitions and parameters passed to `getClientsAction`.

## Migration Note

- This module replaces the old “Customer” module; update imports and types to `client`.