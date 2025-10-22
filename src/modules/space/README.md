# Space Module

The Space module provides a complete set of functionality for managing spaces in the LegalTrack application. It includes server actions, React Query hooks, TypeScript types, and comprehensive testing. Spaces represent workspaces or organizational units where legal processes and documents are managed.

## 📁 Module Structure

```
space/
├── actions/                  # Server Actions for CRUD operations
│   ├── delete-space-action.ts
│   ├── get-space-by-id-action.ts
│   ├── insert-space-action.ts
│   ├── list-spaces-action.ts
│   ├── update-space-action.ts
│   ├── index.ts
│   └── __tests__/           # Action tests (50 comprehensive tests)
│       ├── delete-space-action.test.ts
│       ├── get-space-by-id-action.test.ts
│       ├── insert-space-action.test.ts
│       ├── list-spaces-action.test.ts
│       └── update-space-action.test.ts
├── hooks/                   # React Query hooks
│   ├── use-space-mutations.ts
│   ├── use-space-queries.ts
│   ├── index.ts
│   └── __tests__/          # Hook tests
│       ├── use-space-mutations.test.tsx
│       └── use-space-queries.test.tsx
└── index.ts                # Module exports
```

## 🔧 Installation & Setup

Import the module components:

```typescript
// Actions
import {
  insertSpaceAction,
  updateSpaceAction,
  deleteSpaceAction,
  getSpaceByIdAction,
  listSpacesAction
} from '@modules/space/actions'

// Hooks
import {
  useSpaceMutations,
  useSpaceQueries,
  useInsertSpace,
  useUpdateSpace,
  useDeleteSpace,
  useSpaceQuery,
  useSpacesQuery
} from '@modules/space/hooks'

// Types
import type { Space, SpaceInsert, SpaceUpdate } from '@modules/space'
```

## 📊 Data Types

### Space Schema

```typescript
type Space = {
  id: string                    // UUID v7
  name: string | null          // Space name/title
  created_at: Date            // Creation timestamp
  updated_at: Date            // Last update timestamp
  deleted_at: Date | null     // Soft delete timestamp
}

type SpaceInsert = {
  name: string                // Required, cannot be empty or whitespace-only
}

type SpaceUpdate = {
  id: string                  // Required
  name?: string | null
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

### Insert Space

Creates a new space with validation for non-empty names.

```typescript
import { insertSpaceAction } from '@modules/space/actions'

const result = await insertSpaceAction({
  name: 'Legal Department'
})

if (result.success) {
  console.log('Space created:', result.data)
} else {
  console.error('Error:', result.error)
}
```

**Validation Rules:**
- Name is required and cannot be empty or whitespace-only
- Requires valid account context (authentication)

### Update Space

Updates an existing space with soft delete protection.

```typescript
import { updateSpaceAction } from '@modules/space/actions'

const result = await updateSpaceAction({
  id: 'space-id',
  name: 'Updated Legal Department'
})

if (result.success) {
  console.log('Space updated:', result.data)
}
```

**Business Rules:**
- Cannot update soft-deleted spaces
- Only returns non-deleted spaces
- Requires valid account access

### Delete Space

Performs soft delete on a space.

```typescript
import { deleteSpaceAction } from '@modules/space/actions'

const result = await deleteSpaceAction({ id: 'space-id' })

if (result.success) {
  console.log('Space deleted successfully')
}
```

**Important Notes:**
- Uses soft delete (sets `deleted_at` timestamp)
- Deleted spaces are hidden from normal queries
- Requires proper account access permissions

### Get Space by ID

Retrieves a single space by ID (excludes soft-deleted).

```typescript
import { getSpaceByIdAction } from '@modules/space/actions'

const result = await getSpaceByIdAction({ id: 'space-id' })

if (result.success && result.data) {
  console.log('Space found:', result.data)
} else if (result.success && !result.data) {
  console.log('Space not found or deleted')
}
```

### List Spaces

Retrieves all active spaces for the current account.

```typescript
import { listSpacesAction } from '@modules/space/actions'

const result = await listSpacesAction()

if (result.success) {
  console.log('Spaces:', result.data) // Space[]
}
```

**Features:**
- Automatically filters out soft-deleted spaces
- Returns spaces accessible by current account
- Ordered by creation date

## 🪝 React Query Hooks

### Queries (Data Fetching)

#### useSpaceQuery - Get Single Space

```typescript
import { useSpaceQuery } from '@modules/space/hooks'

function SpaceDetails({ spaceId }: { spaceId: string }) {
  const { data: space, isLoading, error } = useSpaceQuery(spaceId, {
    enabled: !!spaceId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  if (isLoading) return <div>Loading space...</div>
  if (error) return <div>Error: {error.message}</div>
  if (!space) return <div>Space not found</div>

  return (
    <div>
      <h1>{space.name}</h1>
      <p>Created: {space.created_at.toLocaleDateString()}</p>
    </div>
  )
}
```

#### useSpacesQuery - List All Spaces

```typescript
import { useSpacesQuery } from '@modules/space/hooks'

function SpaceList() {
  const { data: spaces, isLoading, error } = useSpacesQuery({
    refetchOnWindowFocus: false,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })

  if (isLoading) return <div>Loading spaces...</div>
  if (error) return <div>Error loading spaces</div>

  return (
    <div>
      <h2>Available Spaces</h2>
      {spaces?.map(space => (
        <div key={space.id}>
          <h3>{space.name}</h3>
        </div>
      ))}
    </div>
  )
}
```

#### useSpaceQueries - Combined Queries

```typescript
import { useSpaceQueries } from '@modules/space/hooks'

function SpaceManager({ selectedSpaceId }: { selectedSpaceId?: string }) {
  const { 
    spaceQuery, 
    spacesQuery,
    isSpaceLoading,
    isSpacesLoading 
  } = useSpaceQueries({
    spaceId: selectedSpaceId
  })

  const space = spaceQuery.data
  const spaces = spacesQuery.data

  return (
    <div>
      {isSpacesLoading ? (
        <div>Loading spaces...</div>
      ) : (
        <SpaceSelector spaces={spaces} />
      )}
      
      {selectedSpaceId && (
        isSpaceLoading ? (
          <div>Loading space details...</div>
        ) : space ? (
          <SpaceDetails space={space} />
        ) : (
          <div>Space not found</div>
        )
      )}
    </div>
  )
}
```

### Mutations (Data Modification)

#### useInsertSpace - Create New Space

```typescript
import { useInsertSpace } from '@modules/space/hooks'

function CreateSpaceForm() {
  const insertSpace = useInsertSpace()
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    
    insertSpace.mutate({ name })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input 
        name="name" 
        placeholder="Space name" 
        required 
        disabled={insertSpace.isPending}
      />
      <button type="submit" disabled={insertSpace.isPending}>
        {insertSpace.isPending ? 'Creating...' : 'Create Space'}
      </button>
      
      {insertSpace.error && (
        <div className="error">Error: {insertSpace.error.message}</div>
      )}
    </form>
  )
}
```

#### useUpdateSpace - Update Existing Space

```typescript
import { useUpdateSpace } from '@modules/space/hooks'

function EditSpaceForm({ space }: { space: Space }) {
  const updateSpace = useUpdateSpace()
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    
    updateSpace.mutate({
      id: space.id,
      name
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input 
        name="name" 
        defaultValue={space.name || ''} 
        placeholder="Space name" 
        required 
        disabled={updateSpace.isPending}
      />
      <button type="submit" disabled={updateSpace.isPending}>
        {updateSpace.isPending ? 'Updating...' : 'Update Space'}
      </button>
      
      {updateSpace.error && (
        <div className="error">Error: {updateSpace.error.message}</div>
      )}
    </form>
  )
}
```

#### useDeleteSpace - Delete Space

```typescript
import { useDeleteSpace } from '@modules/space/hooks'

function DeleteSpaceButton({ space }: { space: Space }) {
  const deleteSpace = useDeleteSpace()
  
  const handleDelete = () => {
    if (confirm(`Delete space "${space.name}"? This action cannot be undone.`)) {
      deleteSpace.mutate({ id: space.id })
    }
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={deleteSpace.isPending}
      className="btn-danger"
    >
      {deleteSpace.isPending ? 'Deleting...' : 'Delete Space'}
    </button>
  )
}
```

#### useSpaceMutations - Combined Mutations

```typescript
import { useSpaceMutations } from '@modules/space/hooks'

function SpaceManager() {
  const {
    insertSpace,
    updateSpace,
    deleteSpace
  } = useSpaceMutations()
  
  const isPending = (
    insertSpace.isPending || 
    updateSpace.isPending || 
    deleteSpace.isPending
  )

  return (
    <div>
      <button 
        onClick={() => insertSpace.mutate({ name: 'New Space' })}
        disabled={isPending}
      >
        Create Space
      </button>
      
      <button 
        onClick={() => updateSpace.mutate({ id: 'space-id', name: 'Updated' })}
        disabled={isPending}
      >
        Update Space
      </button>
      
      <button 
        onClick={() => deleteSpace.mutate({ id: 'space-id' })}
        disabled={isPending}
      >
        Delete Space
      </button>
    </div>
  )
}
```

## 🧪 Testing

The Space module includes comprehensive testing with 50+ test cases:

### Action Tests
- **insert-space-action.test.ts**: Tests space creation with validation
- **update-space-action.test.ts**: Tests space updates and soft delete protection
- **delete-space-action.test.ts**: Tests soft delete functionality
- **get-space-by-id-action.test.ts**: Tests single space retrieval
- **list-spaces-action.test.ts**: Tests space listing with filtering

### Hook Tests
- **use-space-mutations.test.tsx**: Tests React Query mutations
- **use-space-queries.test.tsx**: Tests React Query queries

### Running Tests

```bash
# Run all space tests
pnpm test:unit "space"

# Run specific test file
pnpm test:unit "insert-space-action"

# Run with coverage
pnpm test:coverage "space"
```

## 🔒 Security & Access Control

### Authentication Requirements
- All actions require valid account context
- Uses `getCurrentAccountId()` for access control
- Automatic filtering by account permissions

### Data Protection
- Soft delete implementation prevents data loss
- Validation prevents empty or invalid space names
- SQL injection protection through parameterized queries

## 🚀 Usage Patterns

### Basic Space Management

```typescript
import { useSpaceQueries, useSpaceMutations } from '@modules/space/hooks'

function SpaceManagement() {
  const { spacesQuery } = useSpaceQueries({})
  const { insertSpace, updateSpace, deleteSpace } = useSpaceMutations()
  
  const spaces = spacesQuery.data || []
  
  return (
    <div>
      <h1>Space Management</h1>
      
      <button onClick={() => insertSpace.mutate({ name: 'New Space' })}>
        Create Space
      </button>
      
      {spaces.map(space => (
        <div key={space.id} className="space-item">
          <h3>{space.name}</h3>
          <button onClick={() => updateSpace.mutate({ 
            id: space.id, 
            name: `Updated ${space.name}` 
          })}>
            Update
          </button>
          <button onClick={() => deleteSpace.mutate({ id: space.id })}>
            Delete
          </button>
        </div>
      ))}
    </div>
  )
}
```

### Space Selection with Details

```typescript
function SpaceSelector() {
  const [selectedSpaceId, setSelectedSpaceId] = useState<string>()
  const { spaceQuery, spacesQuery } = useSpaceQueries({ 
    spaceId: selectedSpaceId 
  })
  
  return (
    <div>
      <select 
        value={selectedSpaceId || ''} 
        onChange={(e) => setSelectedSpaceId(e.target.value || undefined)}
      >
        <option value="">Select a space</option>
        {spacesQuery.data?.map(space => (
          <option key={space.id} value={space.id}>
            {space.name}
          </option>
        ))}
      </select>
      
      {spaceQuery.data && (
        <div className="space-details">
          <h2>{spaceQuery.data.name}</h2>
          <p>Created: {spaceQuery.data.created_at.toLocaleDateString()}</p>
        </div>
      )}
    </div>
  )
}
```

## 🔄 Cache Management

The Space module uses React Query for intelligent caching:

### Automatic Cache Invalidation
- Creating a space invalidates the spaces list
- Updating a space invalidates both the space and spaces queries
- Deleting a space removes it from all relevant caches

### Manual Cache Control

```typescript
import { useQueryClient } from '@tanstack/react-query'

function SpaceManager() {
  const queryClient = useQueryClient()
  
  const refreshSpaces = () => {
    queryClient.invalidateQueries({ queryKey: ['spaces'] })
  }
  
  const refreshSpace = (spaceId: string) => {
    queryClient.invalidateQueries({ queryKey: ['space', spaceId] })
  }
  
  // ... component logic
}
```

## 📚 Related Modules

- **Account Module**: User management and authentication
- **Process Module**: Legal process management within spaces
- **Client Module**: Client management within spaces

## 🐛 Troubleshooting

### Common Issues

1. **"Space not found" errors**
   - Check if space was soft-deleted
   - Verify user has access to the space
   - Ensure valid spaceId is provided

2. **Validation errors on create**
   - Ensure space name is not empty
   - Check for whitespace-only names
   - Verify account context is available

3. **Cache inconsistencies**
   - Use React Query DevTools to debug
   - Check cache invalidation patterns
   - Verify mutation success callbacks

### Debug Mode

```typescript
// Enable detailed logging
const { spacesQuery } = useSpaceQueries({}, {
  meta: { 
    debugMode: true 
  }
})
```