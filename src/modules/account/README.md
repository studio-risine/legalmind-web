# Account Module

The Account module provides a complete set of functionality for managing user accounts in the LegalTrack application. It includes server actions, React Query hooks, TypeScript types, and comprehensive testing.

## 📁 Module Structure

```
account/
├── actions/                  # Server Actions for CRUD operations
│   ├── delete-account-action.ts
│   ├── get-account-by-id-action.ts
│   ├── insert-account-action.ts
│   ├── list-accounts-action.ts
│   ├── update-account-action.ts
│   ├── index.ts
│   └── __tests__/           # Action tests
├── components/              # UI Components
│   ├── auth-box.tsx
│   ├── auth-separator.tsx
│   ├── background-image-display.tsx
│   ├── login-view.tsx
│   ├── register-view.tsx
│   ├── reset-password-view.tsx
│   ├── update-password-view.tsx
│   └── index.ts
├── hooks/                   # React Query hooks
│   ├── use-account-mutations.ts
│   ├── use-account-queries.ts
│   ├── index.ts
│   └── __tests__/          # Hook tests
├── layout/                  # Layout components
│   ├── account-layout.tsx
│   └── index.ts
├── types/                   # Type definitions
├── utils/                   # Utility functions
│   └── get-current-account.ts
└── index.ts                # Module exports
```

## 🔧 Installation & Setup

Import the module components:

```typescript
// Actions
import {
  insertAccountAction,
  updateAccountAction,
  deleteAccountAction,
  getAccountByIdAction,
  listAccountsAction
} from '@modules/account/actions'

// Hooks
import {
  useAccountMutations,
  useAccountQuery,
  useAccountsQuery,
  useInsertAccount,
  useUpdateAccount,
  useDeleteAccount
} from '@modules/account/hooks'

// Types
import type { Account, AccountInsert, AccountUpdate } from '@modules/account'
```

## 📊 Data Types

### Account Schema

```typescript
type Account = {
  id: string                    // UUID v7
  displayName: string | null    // User's display name
  name: string | null          // Full name
  email: string                // Unique email address
  created_at: Date            // Creation timestamp
  updated_at: Date            // Last update timestamp
}

type AccountInsert = {
  displayName?: string | null
  name?: string | null
  email: string               // Required
}

type AccountUpdate = {
  id: string                  // Required
  displayName?: string | null
  name?: string | null
  email?: string
}
```

## 🎯 Server Actions

All actions follow a standardized response pattern:

```typescript
type ActionResponse<T> = {
  success: boolean
  error?: string
  data?: T
}
```

### Insert Account

```typescript
import { insertAccountAction } from '@modules/account/actions'

const result = await insertAccountAction({
  email: 'user@example.com',
  name: 'John Doe',
  displayName: 'Johnny'
})

if (result.success) {
  console.log('Account created:', result.data)
} else {
  console.error('Error:', result.error)
}
```

### Update Account

```typescript
import { updateAccountAction } from '@modules/account/actions'

const result = await updateAccountAction({
  id: 'account-id',
  displayName: 'New Display Name'
})

if (result.success) {
  console.log('Account updated:', result.data)
}
```

### Delete Account

```typescript
import { deleteAccountAction } from '@modules/account/actions'

const result = await deleteAccountAction({ id: 'account-id' })

if (result.success) {
  console.log('Account deleted successfully')
}
```

### Get Account by ID

```typescript
import { getAccountByIdAction } from '@modules/account/actions'

const result = await getAccountByIdAction({ id: 'account-id' })

if (result.success && result.data) {
  console.log('Account found:', result.data)
}
```

### List Accounts

```typescript
import { listAccountsAction } from '@modules/account/actions'

const result = await listAccountsAction()

if (result.success) {
  console.log('Accounts:', result.data) // Account[]
}
```

## 🪝 React Query Hooks

### Queries (Data Fetching)

#### useAccountQuery - Get Single Account

```typescript
import { useAccountQuery } from '@modules/account/hooks'

function AccountProfile({ accountId }: { accountId: string }) {
  const { data: account, isLoading, error } = useAccountQuery(accountId, {
    enabled: !!accountId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  if (!account) return <div>Account not found</div>

  return (
    <div>
      <h1>{account.displayName || account.name}</h1>
      <p>{account.email}</p>
    </div>
  )
}
```

#### useAccountsQuery - Get All Accounts

```typescript
import { useAccountsQuery } from '@modules/account/hooks'

function AccountsList() {
  const { data: accounts = [], isLoading, error } = useAccountsQuery({
    staleTime: 2 * 60 * 1000, // 2 minutes
  })

  if (isLoading) return <div>Loading accounts...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <ul>
      {accounts.map((account) => (
        <li key={account.id}>
          {account.displayName || account.name} - {account.email}
        </li>
      ))}
    </ul>
  )
}
```

### Mutations (Data Modification)

#### useInsertAccount - Create New Account

```typescript
import { useInsertAccount } from '@modules/account/hooks'

function CreateAccountForm() {
  const insertAccount = useInsertAccount({
    onSuccess: (account) => {
      console.log('Account created:', account)
      // Navigate to account page or show success message
    },
    onError: (error) => {
      console.error('Failed to create account:', error.message)
    }
  })

  const handleSubmit = (data: AccountInsert) => {
    insertAccount.mutate(data)
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      const formData = new FormData(e.currentTarget)
      handleSubmit({
        email: formData.get('email') as string,
        name: formData.get('name') as string,
        displayName: formData.get('displayName') as string,
      })
    }}>
      <input name="email" type="email" placeholder="Email" required />
      <input name="name" placeholder="Full Name" />
      <input name="displayName" placeholder="Display Name" />
      <button type="submit" disabled={insertAccount.isPending}>
        {insertAccount.isPending ? 'Creating...' : 'Create Account'}
      </button>
    </form>
  )
}
```

#### useUpdateAccount - Update Existing Account

```typescript
import { useUpdateAccount } from '@modules/account/hooks'

function EditAccountForm({ account }: { account: Account }) {
  const updateAccount = useUpdateAccount({
    onSuccess: (updatedAccount) => {
      console.log('Account updated:', updatedAccount)
    }
  })

  const handleUpdate = (updates: Partial<AccountUpdate>) => {
    updateAccount.mutate({
      id: account.id,
      ...updates
    })
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      const formData = new FormData(e.currentTarget)
      handleUpdate({
        displayName: formData.get('displayName') as string,
        name: formData.get('name') as string,
      })
    }}>
      <input
        name="displayName"
        defaultValue={account.displayName || ''}
        placeholder="Display Name"
      />
      <input
        name="name"
        defaultValue={account.name || ''}
        placeholder="Full Name"
      />
      <button type="submit" disabled={updateAccount.isPending}>
        {updateAccount.isPending ? 'Updating...' : 'Update Account'}
      </button>
    </form>
  )
}
```

#### useDeleteAccount - Delete Account

```typescript
import { useDeleteAccount } from '@modules/account/hooks'

function DeleteAccountButton({ accountId }: { accountId: string }) {
  const deleteAccount = useDeleteAccount({
    onSuccess: () => {
      console.log('Account deleted successfully')
      // Navigate away or update UI
    }
  })

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      deleteAccount.mutate({ id: accountId })
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleteAccount.isPending}
      className="bg-red-500 text-white px-4 py-2 rounded"
    >
      {deleteAccount.isPending ? 'Deleting...' : 'Delete Account'}
    </button>
  )
}
```

#### useAccountMutations - All Mutations Combined

```typescript
import { useAccountMutations } from '@modules/account/hooks'

function AccountManager() {
  const { insert, update, delete: deleteAccount } = useAccountMutations({
    onSuccess: (data, operation) => {
      console.log(`Account ${operation} successful:`, data)
    },
    onError: (error, operation) => {
      console.error(`Account ${operation} failed:`, error.message)
    }
  })

  return (
    <div>
      <button onClick={() => insert.mutate({ email: 'new@example.com' })}>
        Create Account
      </button>
      <button onClick={() => update.mutate({ id: 'account-id', name: 'New Name' })}>
        Update Account
      </button>
      <button onClick={() => deleteAccount.mutate({ id: 'account-id' })}>
        Delete Account
      </button>
    </div>
  )
}
```

## 🎨 Hook Options

### Query Options

```typescript
type UseAccountQueryOptions = {
  enabled?: boolean                    // Enable/disable query
  staleTime?: number                  // Cache duration in ms
  refetchOnWindowFocus?: boolean      // Refetch on window focus
  queryOptions?: UseQueryOptions      // Additional React Query options
}

type UseAccountsQueryOptions = {
  enabled?: boolean
  staleTime?: number
  refetchOnWindowFocus?: boolean
  queryOptions?: UseQueryOptions
}
```

### Mutation Options

```typescript
type UseMutationOptions = {
  onSuccess?: (data: Account, variables: any) => void
  onError?: (error: Error, variables: any) => void
  onSettled?: (data: Account | undefined, error: Error | null) => void
}
```

## 🧪 Testing

The module includes comprehensive test coverage:

### Action Tests
- ✅ Insert account with valid data
- ✅ Insert account with invalid data
- ✅ Update account successfully
- ✅ Update non-existent account
- ✅ Delete account successfully
- ✅ Delete non-existent account
- ✅ Get account by ID
- ✅ Get non-existent account
- ✅ List all accounts

### Hook Tests
- ✅ useAccountQuery with valid ID
- ✅ useAccountQuery with invalid ID
- ✅ useAccountsQuery with data
- ✅ useAccountsQuery with empty result
- ✅ useInsertAccount success/error scenarios
- ✅ useUpdateAccount success/error scenarios
- ✅ useDeleteAccount success/error scenarios
- ✅ useAccountMutations combined operations

### Running Tests

```bash
# Run all account tests
pnpm test src/modules/account

# Run action tests only
pnpm test src/modules/account/actions

# Run hook tests only
pnpm test src/modules/account/hooks

# Run with coverage
pnpm test:coverage src/modules/account
```

## 🔄 Cache Management

React Query automatically manages cache for you, but you can manually control it:

```typescript
import { useQueryClient } from '@tanstack/react-query'

function AccountManager() {
  const queryClient = useQueryClient()

  // Invalidate all account queries
  const refreshAccounts = () => {
    queryClient.invalidateQueries({ queryKey: ['accounts'] })
  }

  // Invalidate specific account
  const refreshAccount = (accountId: string) => {
    queryClient.invalidateQueries({ queryKey: ['accounts', accountId] })
  }

  // Update cache directly
  const updateAccountCache = (accountId: string, newData: Partial<Account>) => {
    queryClient.setQueryData(['accounts', accountId], (old: Account) => ({
      ...old,
      ...newData
    }))
  }

  return (
    <div>
      <button onClick={refreshAccounts}>Refresh All</button>
      <button onClick={() => refreshAccount('account-id')}>Refresh One</button>
    </div>
  )
}
```

## 🛠 Architecture Patterns

The account module follows established patterns:

### 1. **Standardized Response Format**
All actions return consistent `{ success, error?, data? }` format

### 2. **Type Safety**
Full TypeScript coverage with Zod schema validation

### 3. **Error Handling**
Comprehensive error handling in both actions and hooks

### 4. **Testing Strategy**
- Unit tests with mocked repositories
- Integration tests with real database (.env.test)
- Comprehensive coverage of positive/negative/edge cases

### 5. **React Query Integration**
- Automatic cache management
- Background refetching
- Optimistic updates
- Error boundaries

## 🔗 Related Modules

- **Auth Module**: Handles authentication and authorization
- **Space Module**: Manages workspace/tenant relationships
- **Client Module**: Reference implementation for similar patterns

## 📚 Further Reading

- [React Query Documentation](https://tanstack.com/query/latest)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Zod Schema Validation](https://zod.dev/)
- [Testing with Vitest](https://vitest.dev/)

---

**Note**: This module is production-ready with full CRUD operations, React Query hooks, comprehensive testing, and complete TypeScript support.
