# Test Plan for `use-process-queries.ts` (50% Coverage)

This test plan focuses on covering approximately 50% of the functionality of the hooks in `use-process-queries.ts`, prioritizing the most critical and common use cases.

**Status: ✅ COMPLETED**

**Estimated Complexity (50%):**
- **Hooks tested**: 4 of 12
- **Test cases implemented**: 15 tests
- **Result**: ✅ **15/15 tests passing**

---

## 1. Test Setup

The initial setup is crucial and must be complete.

```typescript
// src/modules/process/hooks/__tests__/use-process-queries.test.tsx

import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'
import type { ReactNode } from 'react'

// Mock actions
vi.mock('@modules/process/actions', () => ({
  getProcessByIdAction: vi.fn(),
  getProcessesAction: vi.fn(),
  searchProcessesAction: vi.fn(),
}))

// Wrapper for React Query
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

---

## 2. Priority Tests (50% Coverage)

Let's focus on the most important hooks: `useProcessQuery`, `useProcessesList`, `useProcessSearchWithDebounce`, and `useProcessPagination`.

### Tests for `useProcessQuery` (3 of 4 tests)

- **Objective**: Ensure that searching by ID works.
- **Tests**:
  - `[x]` **(P0)** should fetch a process by ID successfully. ✅
  - `[x]` **(P0)** should return an error when the process is not found. ✅
  - `[x]` **(P1)** should respect the `enabled: false` option and not make the call. ✅

### Tests for `useProcessesList` (3 of 5 tests)

- **Objective**: Ensure that basic listing and filters work.
- **Tests**:
  - `[x]` **(P0)** should list processes with default pagination parameters. ✅
  - `[x]` **(P1)** should filter the list by `status`. ✅
  - `[x]` **(P1)** should apply `searchQuery` to filter the results. ✅

### Tests for `useProcessSearchWithDebounce` (4 of 8 tests)

- **Objective**: Ensure that the debounce logic and interactive search work.
- **Tests**:
  - `[x]` **(P0)** should apply debounce when changing the search query. ✅
  - `[x]` **(P0)** should not search if the query has less than 2 characters. ✅
  - `[x]` **(P1)** should change the `status` filter immediately (without debounce). ✅
  - `[x]` **(P1)** should clear all filters with `clearFilters`. ✅

### Tests for `useProcessPagination` (5 of 10 tests)

- **Objective**: Ensure that page navigation works correctly.
- **Tests**:
  - `[x]` **(P0)** should start on page 1 and calculate `totalPages` correctly. ✅
  - `[x]` **(P0)** should navigate to the next page with `goToNextPage`. ✅
  - `[x]` **(P0)** should navigate to the previous page with `goToPreviousPage`. ✅
  - `[x]` **(P1)** should go to a specific page with `goToPage`. ✅
  - `[x]` **(P1)** should disable `hasNextPage` and `hasPreviousPage` at the limits. ✅

---

## 3. Out of Scope Tests (Next 50%)

The following hooks and scenarios will not be tested in this phase to keep the scope at 50%:

- **Untested hooks**:
  - `useProcessById` (indirectly covered)
  - `useActiveProcessesList`
  - `useAllProcessesList`
  - `useProcessesListWithStatus`
  - `useProcessesListResults` (indirectly covered)
  - `useProcessSearch`
  - `useProcessSearchQuery`
  - `useProcessSearchResults` (indirectly covered)
  - `useProcessStats`

- **Untested scenarios**:
  - `staleTime` and `refetchOnWindowFocus` options.
  - Sorting (`sortBy`, `sortDirection`).
  - Network or server error cases in actions.
  - Performance tests for debounce.
  - `goToFirstPage`, `goToLastPage`, `resetPagination` in `useProcessPagination`.

---

## 4. Next Steps

1.  **Implement Setup**: Create the `use-process-queries.test.tsx` file with the described setup.
2.  **Write Tests**: Implement the ~15-20 priority test cases.
3.  **Run and Validate**: Run the tests and ensure coverage meets the goal.
4.  **Iterate**: In a future phase, implement the remaining tests to achieve 90-100% coverage.
