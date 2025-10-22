# Account Hooks - Guia de Uso

Este módulo fornece hooks para gerenciar operações de account usando React Query.

## 🔧 Imports

```typescript
import {
  useAccountMutations,
  useAccountQuery,
  useAccountsQuery,
  useInsertAccount,
  useUpdateAccount,
  useDeleteAccount,
} from '@/modules/account/hooks'
```

## 📋 Queries (Buscar dados)

### useAccountQuery - Buscar account por ID
```typescript
function AccountDetails({ accountId }: { accountId: string }) {
  const { data: account, isLoading, error } = useAccountQuery(accountId)

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  if (!account) return <div>Account not found</div>

  return (
    <div>
      <h1>{account.name}</h1>
      <p>{account.email}</p>
      <p>Display: {account.displayName}</p>
    </div>
  )
}
```

### useAccountsQuery - Listar todas as accounts
```typescript
function AccountsList() {
  const { data: accounts = [], isLoading, error } = useAccountsQuery()

  if (isLoading) return <div>Loading accounts...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <ul>
      {accounts.map((account) => (
        <li key={account.id}>
          {account.name} - {account.email}
        </li>
      ))}
    </ul>
  )
}
```

## ✏️ Mutations (Modificar dados)

### useInsertAccount - Criar nova account
```typescript
function CreateAccountForm() {
  const insertAccount = useInsertAccount()

  const handleSubmit = (data: { name: string; email: string }) => {
    insertAccount.mutate(data, {
      onSuccess: (newAccount) => {
        console.log('Account created:', newAccount)
        // Redirect ou outras ações
      },
      onError: (error) => {
        console.error('Failed to create account:', error)
      }
    })
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      const formData = new FormData(e.currentTarget)
      handleSubmit({
        name: formData.get('name') as string,
        email: formData.get('email') as string,
      })
    }}>
      <input name="name" placeholder="Account name" required />
      <input name="email" type="email" placeholder="Email" required />
      <button type="submit" disabled={insertAccount.isPending}>
        {insertAccount.isPending ? 'Creating...' : 'Create Account'}
      </button>
    </form>
  )
}
```

### useUpdateAccount - Atualizar account existente
```typescript
function EditAccountForm({ accountId }: { accountId: string }) {
  const { data: account } = useAccountQuery(accountId)
  const updateAccount = useUpdateAccount()

  const handleUpdate = (updates: { name?: string; email?: string }) => {
    updateAccount.mutate(
      { id: accountId, ...updates },
      {
        onSuccess: () => {
          console.log('Account updated successfully')
        }
      }
    )
  }

  if (!account) return <div>Loading...</div>

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      const formData = new FormData(e.currentTarget)
      handleUpdate({
        name: formData.get('name') as string,
        email: formData.get('email') as string,
      })
    }}>
      <input name="name" defaultValue={account.name || ''} />
      <input name="email" defaultValue={account.email || ''} />
      <button type="submit" disabled={updateAccount.isPending}>
        {updateAccount.isPending ? 'Updating...' : 'Update Account'}
      </button>
    </form>
  )
}
```

### useDeleteAccount - Deletar account
```typescript
function DeleteAccountButton({ accountId }: { accountId: string }) {
  const deleteAccount = useDeleteAccount()

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this account?')) {
      deleteAccount.mutate(
        { id: accountId },
        {
          onSuccess: () => {
            console.log('Account deleted successfully')
            // Redirect para lista ou outras ações
          }
        }
      )
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

## 🎯 Hook combinado - useAccountMutations

Para facilitar o uso, você pode usar o hook combinado:

```typescript
function AccountManagement() {
  const { insertAccount, updateAccount, deleteAccount } = useAccountMutations()
  const { data: accounts } = useAccountsQuery()

  return (
    <div>
      {/* Formulário de criação */}
      <CreateForm onSubmit={(data) => insertAccount.mutate(data)} />
      
      {/* Lista com ações */}
      {accounts?.map((account) => (
        <div key={account.id}>
          <span>{account.name}</span>
          <button onClick={() => updateAccount.mutate({
            id: account.id,
            name: 'Updated Name'
          })}>
            Update
          </button>
          <button onClick={() => deleteAccount.mutate({ id: account.id })}>
            Delete
          </button>
        </div>
      ))}
    </div>
  )
}
```

## ⚙️ Opções de configuração

### Query options
```typescript
// Desabilitar query
const { data } = useAccountQuery(accountId, { enabled: false })

// Custom stale time
const { data } = useAccountsQuery({ 
  staleTime: 10 * 60 * 1000 // 10 minutos
})

// Não refetch on window focus
const { data } = useAccountQuery(accountId, { 
  refetchOnWindowFocus: false 
})
```

### Estados de loading/error
```typescript
function AccountComponent() {
  const {
    data: account,
    isLoading,
    isFetching,
    error,
    refetch
  } = useAccountQuery(accountId)

  const {
    mutate: createAccount,
    isPending: isCreating,
    isError: createError,
    error: createErrorDetails
  } = useInsertAccount()

  // Render baseado nos estados...
}
```

## 🔄 Cache invalidation

Os hooks automaticamente invalidam queries relacionadas:

- Criar account → invalida `['accounts']`
- Atualizar account → invalida `['accounts']`  
- Deletar account → invalida `['accounts']`

Isso garante que as listas e detalhes sejam atualizados automaticamente.

## 🎉 Features automáticas

- ✅ **Loading states** automáticos
- ✅ **Error handling** com toast notifications
- ✅ **Cache invalidation** inteligente
- ✅ **Optimistic updates** via React Query
- ✅ **Retry automático** em caso de falha
- ✅ **Background refetch** para dados sempre atualizados