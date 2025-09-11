# Frontend Layer Documentation

The Frontend Layer represents the presentation tier of the LegalTrack application, built with Next.js 15, React, TypeScript, and modern UI libraries. This layer is responsible for user interface rendering, interaction handling, and client-side state management.

## Overview

The frontend layer follows React best practices and Next.js App Router patterns, emphasizing:
- Server-first rendering with selective client-side interactivity
- Component composition and reusability
- Type safety with TypeScript
- Performance optimization
- Accessibility compliance

## Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (private)/         # Protected routes
│   ├── (public)/          # Public routes
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/            # Reusable UI components
│   ├── providers.tsx      # Context providers
│   └── ui/               # Base UI components
├── contexts/             # React contexts
│   └── auth-context.tsx  # Authentication context
├── hooks/                # Custom React hooks
│   ├── use-mobile.ts     # Mobile detection
│   ├── use-redirect.ts   # Navigation utilities
│   ├── useCreateProcess.ts
│   ├── useDeleteProcess.ts
│   ├── useProcess.ts
│   ├── useProcesses.ts
│   ├── useUpdateProcess.ts
│   └── useUser.ts
└── modules/              # Feature-specific modules
    ├── app/
    ├── auth/
    └── process/
```

## Core Components

### 1. App Router Structure

#### Route Groups
The application uses Next.js route groups for organization:

**Public Routes** (`(public)/`):
- Landing pages
- Authentication pages
- Public documentation
- Error pages

**Private Routes** (`(private)/`):
- Dashboard
- Process management
- Client management
- User settings

#### Layout Hierarchy
```typescript
// Root Layout (app/layout.tsx)
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={fontFamily.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

// Private Layout (app/(private)/layout.tsx)
export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
```

### 2. Component Architecture

#### Component Types

**Server Components** (Default):
- Data fetching components
- Static content rendering
- SEO-optimized pages
- Layout components

```typescript
// Server Component Example
export default async function ProcessListPage() {
  const processes = await getProcesses();
  
  return (
    <div className="container mx-auto py-6">
      <ProcessHeader />
      <ProcessList processes={processes} />
    </div>
  );
}
```

**Client Components** (`'use client'`):
- Interactive components
- State management
- Event handlers
- Browser API usage

```typescript
'use client';

// Client Component Example
export function ProcessForm({ onSubmit }: ProcessFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { createProcess } = useCreateProcess();
  
  const handleSubmit = async (data: ProcessFormData) => {
    setIsLoading(true);
    try {
      await createProcess(data);
      onSubmit?.();
    } catch (error) {
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

#### Component Patterns

**Compound Components**:
```typescript
// Usage
<ProcessCard>
  <ProcessCard.Header>
    <ProcessCard.Title>Process Title</ProcessCard.Title>
    <ProcessCard.Actions>
      <Button>Edit</Button>
      <Button>Delete</Button>
    </ProcessCard.Actions>
  </ProcessCard.Header>
  <ProcessCard.Content>
    <ProcessCard.Description>Process description</ProcessCard.Description>
    <ProcessCard.Metadata>
      <ProcessCard.Status status="active" />
      <ProcessCard.Date date={createdAt} />
    </ProcessCard.Metadata>
  </ProcessCard.Content>
</ProcessCard>
```

**Render Props Pattern**:
```typescript
interface DataFetcherProps<T> {
  children: (data: T | null, loading: boolean, error: Error | null) => React.ReactNode;
  fetcher: () => Promise<T>;
}

function DataFetcher<T>({ children, fetcher }: DataFetcherProps<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Fetch logic...
  
  return children(data, loading, error);
}
```

### 3. Custom Hooks

#### Data Fetching Hooks

**Process Management Hooks**:
```typescript
// useProcess.ts
export function useProcess(processId: string) {
  const [process, setProcess] = useState<ProcessDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const fetchProcess = async () => {
      try {
        setLoading(true);
        const result = await processService.getById(processId);
        setProcess(result);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProcess();
  }, [processId]);
  
  return { process, loading, error, refetch: fetchProcess };
}

// useCreateProcess.ts
export function useCreateProcess() {
  const [loading, setLoading] = useState(false);
  
  const createProcess = async (data: CreateProcessDTO) => {
    setLoading(true);
    try {
      const result = await processService.create(data);
      // Optimistic updates or cache invalidation
      return result;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  return { createProcess, loading };
}
```

#### Utility Hooks

**Mobile Detection**:
```typescript
// use-mobile.ts
export function useMobile() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return isMobile;
}
```

**Navigation Utilities**:
```typescript
// use-redirect.ts
export function useRedirect() {
  const router = useRouter();
  
  const redirectTo = useCallback((path: string, replace = false) => {
    if (replace) {
      router.replace(path);
    } else {
      router.push(path);
    }
  }, [router]);
  
  const redirectBack = useCallback(() => {
    router.back();
  }, [router]);
  
  return { redirectTo, redirectBack };
}
```

### 4. Context Management

#### Authentication Context
```typescript
// auth-context.tsx
interface AuthContextType {
  user: UserDTO | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<UserDTO>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserDTO | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Authentication logic...
  
  const value = {
    user,
    loading,
    login,
    logout,
    updateUser
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

### 5. UI Components

#### Base Components (Shadcn UI)
The application uses Shadcn UI components as the foundation:

- **Button**: Various button variants and sizes
- **Input**: Form input components with validation
- **Card**: Container components for content organization
- **Dialog**: Modal dialogs and overlays
- **Table**: Data table components with sorting and pagination
- **Form**: Form components with validation integration

#### Custom Components

**Process Components**:
```typescript
// ProcessCard.tsx
interface ProcessCardProps {
  process: ProcessDTO;
  onEdit?: (process: ProcessDTO) => void;
  onDelete?: (processId: string) => void;
}

export function ProcessCard({ process, onEdit, onDelete }: ProcessCardProps) {
  return (
    <Card className="p-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{process.title}</CardTitle>
          <ProcessStatus status={process.status} />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          {process.description}
        </p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Client: {process.client?.name}</span>
          <span>Created: {formatDate(process.createdAt)}</span>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onEdit?.(process)}
          >
            Edit
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => onDelete?.(process.id)}
          >
            Delete
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
```

## State Management

### 1. Local State
Using React's built-in state management for component-specific state:

```typescript
// Form state
const [formData, setFormData] = useState<ProcessFormData>(initialData);

// UI state
const [isOpen, setIsOpen] = useState(false);
const [loading, setLoading] = useState(false);
```

### 2. Global State
Using React Context for application-wide state:

- **Authentication State**: User session and permissions
- **Theme State**: Dark/light mode preferences
- **Notification State**: Toast notifications and alerts

### 3. Server State
Using custom hooks for server state management:

- **Data Fetching**: Process lists, user data, client information
- **Mutations**: Create, update, delete operations
- **Cache Management**: Optimistic updates and cache invalidation

## Performance Optimization

### 1. Code Splitting
```typescript
// Dynamic imports for large components
const ProcessEditor = dynamic(() => import('./ProcessEditor'), {
  loading: () => <ProcessEditorSkeleton />,
  ssr: false
});
```

### 2. Memoization
```typescript
// Expensive calculations
const processStats = useMemo(() => {
  return calculateProcessStatistics(processes);
}, [processes]);

// Callback memoization
const handleProcessUpdate = useCallback((processId: string, updates: Partial<ProcessDTO>) => {
  updateProcess(processId, updates);
}, [updateProcess]);
```

### 3. Virtualization
```typescript
// Large lists with react-window
import { FixedSizeList as List } from 'react-window';

function ProcessList({ processes }: { processes: ProcessDTO[] }) {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <ProcessCard process={processes[index]} />
    </div>
  );
  
  return (
    <List
      height={600}
      itemCount={processes.length}
      itemSize={200}
    >
      {Row}
    </List>
  );
}
```

## Error Handling

### 1. Error Boundaries
```typescript
class ErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to error reporting service
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    
    return this.props.children;
  }
}
```

### 2. Async Error Handling
```typescript
function useAsyncError() {
  const [error, setError] = useState<Error | null>(null);
  
  const throwError = useCallback((error: Error) => {
    setError(error);
  }, []);
  
  useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);
  
  return throwError;
}
```

## Testing Strategy

### 1. Component Testing
```typescript
// ProcessCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ProcessCard } from './ProcessCard';

describe('ProcessCard', () => {
  const mockProcess = {
    id: '1',
    title: 'Test Process',
    description: 'Test Description',
    status: 'active' as const,
    createdAt: new Date(),
    client: { name: 'Test Client' }
  };
  
  it('renders process information correctly', () => {
    render(<ProcessCard process={mockProcess} />);
    
    expect(screen.getByText('Test Process')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Client: Test Client')).toBeInTheDocument();
  });
  
  it('calls onEdit when edit button is clicked', () => {
    const onEdit = jest.fn();
    render(<ProcessCard process={mockProcess} onEdit={onEdit} />);
    
    fireEvent.click(screen.getByText('Edit'));
    expect(onEdit).toHaveBeenCalledWith(mockProcess);
  });
});
```

### 2. Hook Testing
```typescript
// useProcess.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useProcess } from './useProcess';

jest.mock('../services/processService');

describe('useProcess', () => {
  it('fetches process data successfully', async () => {
    const mockProcess = { id: '1', title: 'Test Process' };
    (processService.getById as jest.Mock).mockResolvedValue(mockProcess);
    
    const { result } = renderHook(() => useProcess('1'));
    
    expect(result.current.loading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.process).toEqual(mockProcess);
    });
  });
});
```

## Accessibility

### 1. Semantic HTML
```typescript
// Use proper semantic elements
<main role="main">
  <section aria-labelledby="processes-heading">
    <h2 id="processes-heading">Active Processes</h2>
    <ul role="list">
      {processes.map(process => (
        <li key={process.id} role="listitem">
          <ProcessCard process={process} />
        </li>
      ))}
    </ul>
  </section>
</main>
```

### 2. ARIA Attributes
```typescript
// Form accessibility
<form aria-labelledby="form-title">
  <h2 id="form-title">Create New Process</h2>
  <div>
    <label htmlFor="process-title">Process Title</label>
    <input
      id="process-title"
      type="text"
      aria-describedby="title-help"
      aria-required="true"
    />
    <div id="title-help">Enter a descriptive title for the process</div>
  </div>
</form>
```

### 3. Keyboard Navigation
```typescript
// Custom keyboard handling
function ProcessList({ processes }: { processes: ProcessDTO[] }) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  
  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        setFocusedIndex(prev => Math.min(prev + 1, processes.length - 1));
        break;
      case 'ArrowUp':
        setFocusedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        // Handle selection
        break;
    }
  };
  
  return (
    <div onKeyDown={handleKeyDown} tabIndex={0}>
      {/* Process list items */}
    </div>
  );
}
```

## Best Practices

### 1. Component Design
- Keep components small and focused
- Use composition over inheritance
- Implement proper prop validation with TypeScript
- Follow the single responsibility principle

### 2. Performance
- Minimize re-renders with proper memoization
- Use React.lazy for code splitting
- Implement proper loading states
- Optimize images and assets

### 3. Maintainability
- Use consistent naming conventions
- Implement proper error boundaries
- Write comprehensive tests
- Document complex components

### 4. User Experience
- Provide immediate feedback for user actions
- Implement proper loading states
- Handle edge cases gracefully
- Ensure accessibility compliance

---

*This frontend layer documentation provides a comprehensive guide for developing and maintaining the presentation layer of the LegalTrack application.*