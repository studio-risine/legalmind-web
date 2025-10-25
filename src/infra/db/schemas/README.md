# Database Schemas - Drizzle ORM

Esta pasta contém todos os schemas, tabelas e relacionamentos do banco de dados usando Drizzle ORM.

## 📁 Estrutura de Diretórios

```
schemas/
├── index.ts                          # Exporta todos os schemas
├── auth/                             # Schema de autenticação
│   ├── index.ts
│   ├── schema.ts                     # pgSchema('auth')
│   ├── users.ts                      # Tabela users
│   └── users.relations.ts            # Relacionamentos
└── core/                             # Schema principal do sistema
    ├── index.ts
    ├── schema.ts                     # pgSchema('core')
    ├── enums.ts                      # Enums compartilhados
    ├── accounts.ts                   # Tabela accounts
    ├── accounts.relations.ts
    ├── spaces.ts                     # Tabela spaces
    ├── spaces.relations.ts
    ├── spaces-to-accounts.ts         # Junction table
    ├── spaces-to-accounts.relations.ts
    ├── processes.ts                  # Tabela processes
    ├── processes.relations.ts
    ├── clients.ts                    # Tabela clients
    ├── clients.relations.ts
    ├── notes.ts                      # Tabela notes
    ├── notes.relations.ts
    └── views.ts                      # Database views
```

## 🗂️ Schemas

### Auth Schema (`auth`)
Schema gerenciado pelo Supabase para autenticação. **NÃO INCREMENTAR**.

- **users**: Usuários do sistema (mantém snake_case por ser Supabase)
  - Apenas para autenticação: email, phone, metadata, etc.
  - Toda lógica de negócio deve estar em `core.accounts`

### Core Schema (`core`)
Schema principal da aplicação com toda a lógica de negócio.

- **accounts**: Perfis de usuários (advogados/profissionais) - **CENTRO DA LÓGICA**
- **spaces**: Workspaces/Organizações (Individual, Escritório, Departamento)
- **spaces_to_accounts**: Relação many-to-many entre spaces e accounts
- **processes**: Processos jurídicos
- **clients**: Clientes
- **notes**: Notas vinculadas aos clientes

## 🏗️ Arquitetura de Foreign Keys

### Separação de Responsabilidades

**auth.users.id** (Supabase Auth):
- `core.accounts.user_id` (1:1) - Relacionamento direto
- `core.spaces.created_by` - Quem criou o space
- `core.processes.created_by` - Quem criou o process
- `core.notes.created_by` - Quem criou a note

**core.accounts.user_id** (Lógica de Negócio):
- `core.clients.account_id` - Dono do client
- `core.processes.assigned_id` - Responsável pelo process
- `core.spaces_to_accounts.account_id` - Membro do space

### Por que essa separação?

1. **auth.users** é gerenciado pelo Supabase - não podemos alterar sua estrutura
2. **core.accounts** é nossa camada de negócio - totalmente controlável
3. Campos `created_by` registram a autoria (auditoria)
4. Campos `account_id` / `assigned_id` registram a propriedade/responsabilidade

## 📊 Relacionamentos

### Users (auth.users)
- **1:1** → `accounts` (um user tem um account) - **ÚNICO RELATION**
- ⚠️ Campos `created_by` referenciam `users.id` mas não há relation reverso

### Accounts (core.accounts) - **CENTRO DA LÓGICA**
- **N:1** ← `users` (um account pertence a um user)
- **N:N** ↔ `spaces` (via `spaces_to_accounts`)
- **1:N** → `processes` (um account tem vários processes atribuídos via `assigned_id`)
- **1:N** → `clients` (um account tem vários clients)
- 💡 Para buscar items criados, query direta: `WHERE created_by = user.id`

### Spaces (core.spaces)
- **N:1** ← `users` (um space é criado por um user)
- **N:N** ↔ `accounts` (via `spaces_to_accounts`)
- **1:N** → `processes` (um space tem vários processes)

### Processes (core.processes)
- **N:1** ← `spaces` (um process pertence a um space)
- **N:1** ← `accounts` (um process é atribuído a um account)
- **N:1** ← `users` (um process é criado por um user)

### Clients (core.clients)
- **N:1** ← `accounts` (um client pertence a um account)
- **1:N** → `notes` (um client tem várias notes)

### Notes (core.notes)
- **N:1** ← `clients` (uma note pertence a um client)
- **N:1** ← `users` (uma note é criada por um user)

## 🎯 Convenções de Nomenclatura

### Colunas SQL
Usam **snake_case** conforme padrão PostgreSQL:
- `user_id`
- `full_name`
- `created_at`
- `oab_state`

### Propriedades JavaScript/TypeScript
Usam **camelCase** conforme padrão JavaScript:
- `userId`
- `fullName`
- `createdAt`
- `oabState`

### Exemplo
```typescript
// Definição da tabela
export const accounts = core.table('accounts', {
  userId: uuid('user_id')           // JS: userId, SQL: user_id
    .primaryKey()
    .references(() => users.id),
  fullName: text('full_name')       // JS: fullName, SQL: full_name
    .notNull(),
  oabState: char('oab_state', { length: 2 })  // JS: oabState, SQL: oab_state
    .notNull(),
})
```

## 🔗 Usage Examples

### Basic Queries

#### 1. Get Account with User Info

```typescript
import { db } from '@/infra/db'

const account = await db.query.accounts.findFirst({
  where: (accounts, { eq }) => eq(accounts.userId, userId),
  with: {
    user: true, // Supabase auth data (email, phone)
  }
})
// Returns: { userId, fullName, email, user: { email, phone, ... } }
```

#### 2. Get Account with Spaces

```typescript
const account = await db.query.accounts.findFirst({
  where: (accounts, { eq }) => eq(accounts.userId, userId),
  with: {
    spacesToAccounts: {
      with: {
        space: true, // Get all spaces the account belongs to
      }
    }
  }
})
// Returns: { ...account, spacesToAccounts: [{ space: { id, name, type } }] }
```

#### 3. Get Account with Assigned Processes

```typescript
const account = await db.query.accounts.findFirst({
  where: (accounts, { eq }) => eq(accounts.userId, userId),
  with: {
    assignedProcesses: {
      with: {
        space: true,
      },
      orderBy: (processes, { desc }) => [desc(processes.updatedAt)],
      limit: 10,
    }
  }
})
// Returns: { ...account, assignedProcesses: [{ ...process, space: {...} }] }
```

#### 4. Get Account with Clients and Notes

```typescript
const account = await db.query.accounts.findFirst({
  where: (accounts, { eq }) => eq(accounts.userId, userId),
  with: {
    clients: {
      with: {
        notes: {
          orderBy: (notes, { desc }) => [desc(notes.createdAt)],
          limit: 5,
        }
      }
    }
  }
})
// Returns: { ...account, clients: [{ ...client, notes: [...] }] }
```

### Complex Queries

#### 5. Get Space with Members and Processes

```typescript
const space = await db.query.spaces.findFirst({
  where: (spaces, { eq }) => eq(spaces.id, spaceId),
  with: {
    creator: {
      with: {
        account: true, // Creator's account data
      }
    },
    spacesToAccounts: {
      with: {
        account: {
          with: {
            user: true, // Each member's auth data
          }
        }
      }
    },
    processes: {
      with: {
        assignedTo: true,
        creator: {
          with: {
            account: true,
          }
        }
      },
      orderBy: (processes, { desc }) => [desc(processes.updatedAt)],
    }
  }
})
```

#### 6. Get Process with Full Context

```typescript
const process = await db.query.processes.findFirst({
  where: (processes, { eq }) => eq(processes.id, processId),
  with: {
    space: {
      with: {
        spacesToAccounts: {
          with: {
            account: true, // All space members
          }
        }
      }
    },
    assignedTo: {
      with: {
        user: true, // Assigned account with auth data
      }
    },
    creator: {
      with: {
        account: true, // Creator's account data
      }
    }
  }
})
```

#### 7. Get Client with Notes and Creators

```typescript
const client = await db.query.clients.findFirst({
  where: (clients, { eq }) => eq(clients.id, clientId),
  with: {
    account: {
      with: {
        user: true, // Client owner
      }
    },
    notes: {
      with: {
        creator: {
          with: {
            account: true, // Note creator's account
          }
        }
      },
      orderBy: (notes, { desc }) => [desc(notes.createdAt)],
    }
  }
})
```

### Queries for Created Items

Since `created_by` fields reference `auth.users.id` but don't have reverse relations, use direct queries:

#### 8. Get Items Created by User

```typescript
// Get spaces created by user
const createdSpaces = await db.query.spaces.findMany({
  where: (spaces, { eq }) => eq(spaces.createdBy, userId),
  orderBy: (spaces, { desc }) => [desc(spaces.createdAt)],
})

// Get processes created by user
const createdProcesses = await db.query.processes.findMany({
  where: (processes, { eq }) => eq(processes.createdBy, userId),
  with: {
    space: true,
    assignedTo: true,
  },
  orderBy: (processes, { desc }) => [desc(processes.createdAt)],
})

// Get notes created by user
const createdNotes = await db.query.notes.findMany({
  where: (notes, { eq }) => eq(notes.createdBy, userId),
  with: {
    client: true,
  },
  orderBy: (notes, { desc }) => [desc(notes.createdAt)],
})
```

#### 9. Dashboard: Assigned vs Created

```typescript
const account = await db.query.accounts.findFirst({
  where: (accounts, { eq }) => eq(accounts.userId, userId),
  with: {
    assignedProcesses: true, // Processes assigned to this account
  }
})

const createdProcesses = await db.query.processes.findMany({
  where: (processes, { eq }) => eq(processes.createdBy, userId),
  with: {
    space: true,
    assignedTo: true,
  }
})

return {
  assigned: account?.assignedProcesses || [],
  created: createdProcesses,
}
```

### Filtering and Pagination

#### 10. Paginated Processes with Filters

```typescript
import { and, eq, ilike, desc } from 'drizzle-orm'

const processes = await db.query.processes.findMany({
  where: (processes) => and(
    eq(processes.spaceId, spaceId),
    eq(processes.status, 'ACTIVE'),
    ilike(processes.title, `%${searchTerm}%`)
  ),
  with: {
    assignedTo: true,
    space: true,
  },
  orderBy: (processes) => [desc(processes.updatedAt)],
  limit: pageSize,
  offset: (page - 1) * pageSize,
})
```

#### 11. Clients with Filters

```typescript
import { and, eq, or, ilike } from 'drizzle-orm'

const clients = await db.query.clients.findMany({
  where: (clients) => and(
    eq(clients.accountId, accountId),
    eq(clients.status, 'ACTIVE'),
    or(
      ilike(clients.name, `%${search}%`),
      ilike(clients.email, `%${search}%`),
      ilike(clients.documentNumber, `%${search}%`)
    )
  ),
  with: {
    notes: {
      limit: 3,
      orderBy: (notes, { desc }) => [desc(notes.createdAt)],
    }
  },
  orderBy: (clients, { desc }) => [desc(clients.createdAt)],
})
```

### Aggregations

#### 12. Count Related Items

```typescript
import { eq, count } from 'drizzle-orm'
import { accounts, clients, processes } from '@/infra/db/schemas'

// Count clients per account
const clientsCount = await db
  .select({ count: count() })
  .from(clients)
  .where(eq(clients.accountId, accountId))

// Count processes per space
const processesCount = await db
  .select({ count: count() })
  .from(processes)
  .where(eq(processes.spaceId, spaceId))
```

#### 13. Statistics Dashboard

```typescript
const [
  totalClients,
  activeProcesses,
  spaceMemberships,
] = await Promise.all([
  db.select({ count: count() })
    .from(clients)
    .where(eq(clients.accountId, accountId)),
  
  db.select({ count: count() })
    .from(processes)
    .where(
      and(
        eq(processes.assignedId, accountId),
        eq(processes.status, 'ACTIVE')
      )
    ),
  
  db.query.spacesToAccounts.findMany({
    where: (sta, { eq }) => eq(sta.accountId, accountId),
    with: {
      space: true,
    }
  }),
])

return {
  totalClients: totalClients[0].count,
  activeProcesses: activeProcesses[0].count,
  spaces: spaceMemberships.length,
}
```

### Mutations

#### 14. Create with Relations

```typescript
import { nanoid } from 'nanoid'

// Create space and add creator as member
const spaceId = nanoid()
const [space] = await db.insert(spaces).values({
  id: spaceId,
  name: 'My Law Firm',
  type: 'FIRM',
  createdBy: userId,
}).returning()

await db.insert(spacesToAccounts).values({
  spaceId: space.id,
  accountId: userId, // Add creator as member
})

// Create process with assignment
await db.insert(processes).values({
  spaceId: space.id,
  title: 'Case #12345',
  processNumber: '12345-67.2024.8.01.0001',
  status: 'ACTIVE',
  assignedId: accountId, // Assign to account
  createdBy: userId, // Track who created
})

// Create client with first note
const [client] = await db.insert(clients).values({
  accountId,
  name: 'John Doe',
  type: 'INDIVIDUAL',
  documentNumber: '123.456.789-00',
  status: 'ACTIVE',
}).returning()

await db.insert(notes).values({
  clientId: client.id,
  content: 'Initial consultation notes',
  createdBy: userId,
})
```

#### 15. Update with Transaction

```typescript
await db.transaction(async (tx) => {
  // Update process status
  await tx.update(processes)
    .set({ 
      status: 'CLOSED',
      updatedAt: new Date(),
    })
    .where(eq(processes.id, processId))

  // Add closing note
  await tx.insert(notes).values({
    clientId: relatedClientId,
    content: `Process ${processId} closed`,
    createdBy: userId,
  })
})
```

For more examples, see: `src/infra/db/examples/relations-usage.ts`

## 📝 Enums

Todos os enums estão centralizados em `core/enums.ts`:

- **spaceTypeEnum**: `INDIVIDUAL`, `FIRM`, `DEPARTMENT`
- **processStatusEnum**: `PENDING`, `ACTIVE`, `SUSPENDED`, `ARCHIVED`, `CLOSED`
- **clientTypeEnum**: `INDIVIDUAL`, `COMPANY`
- **clientStatusEnum**: `LEAD`, `PROSPECT`, `ACTIVE`, `INACTIVE`, `ARCHIVED`

## 🔍 Views

### view_accounts
Agrega dados de `users` e `accounts` para queries simplificadas.

### view_accounts_public
Versão pública com apenas dados não sensíveis.

## 🚀 Migrations

Para gerar migrations após alterações no schema:

```bash
pnpm db:generate
```

Para aplicar migrations:

```bash
pnpm db:migrate
```

## 📚 Recursos

- [Drizzle ORM Docs](https://orm.drizzle.team/docs/overview)
- [Drizzle Relations](https://orm.drizzle.team/docs/rqb)
- [PostgreSQL Schemas](https://www.postgresql.org/docs/current/ddl-schemas.html)
