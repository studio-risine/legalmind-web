# Frontend
You are an expert in TypeScript, Node.js, Next.js App Router, React, Shadcn UI, Radix UI and Tailwind.

## Code Style and Structure
  - Write concise, technical TypeScript code with accurate examples.
  - Use functional and declarative programming patterns; avoid classes.
  - Prefer iteration and modularization over code duplication.
  - Use descriptive variable names with auxiliary verbs (e.g., isLoading, hasError).
  - Structure files: exported component, subcomponents, helpers, static content, types.

## Naming Conventions
  - Use lowercase with dashes for directories (e.g., components/auth-wizard).
  - Favor named exports for components.

## TypeScript Usage
  - Use TypeScript for all code; prefer interfaces over types.
  - Avoid enums; use maps instead.
  - Use functional components with TypeScript interfaces.

## Syntax and Formatting
  - Use the "function" keyword for pure functions.
  - Avoid unnecessary curly braces in conditionals; use concise syntax for simple statements.
  - Use declarative JSX.

## UI and Styling
  - Use Shadcn UI and Tailwind for components and styling.
  - Implement responsive design with Tailwind CSS;
  - Use a mobile-first approach.

## Performance Optimization
  - Minimize 'use client', 'useEffect', and 'setState'; favor React Server Components (RSC).
  - Wrap client components in Suspense with fallback.
  - Use dynamic loading for non-critical components.
  - Optimize images: use WebP format, include size data, implement lazy loading.

## Key Conventions
  - Use 'nuqs' for URL search parameter state management.
  - Optimize Web Vitals (LCP, CLS, FID).
  - Limit 'use client':
    - Favor server components and Next.js SSR.
    - Use only for Web API access in small components.
    - Avoid for data fetching or state management.

  Follow Next.js docs for Data Fetching, Rendering, and Routing.

# Convex Best Practices
This document describes best practices for Convex development, focusing on mutations, queries, performance optimization, and maintainable code patterns.

## Mutation Best Practices

### 1. Always Await Promises
```typescript
// ✅ Correct - await all database operations
export const createProcess = mutation({
  args: { title: v.string(), clientId: v.id("clients") },
  handler: async (ctx, args) => {
    const processId = await ctx.db.insert("processes", {
      title: args.title,
      clientId: args.clientId,
      createdAt: Date.now()
    });
    
    // Await related operations
    await ctx.db.insert("activities", {
      processId,
      action: "created",
      timestamp: Date.now()
    });
    
    return processId;
  }
});

// ❌ Incorrect - missing await
const processId = ctx.db.insert("processes", data); // Missing await!
```

### 2. Use Spread Operator for Updates
The spread operator (`...`) is the recommended approach for immutable updates:

```typescript
// ✅ Recommended: Using the Spread Operator
export const updateProcess = mutation({
  args: { id: v.id("processes"), updates: v.object({}) },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Process not found");
    
    const updated = {
      ...existing,
      ...args.updates,
      updatedAt: Date.now()
    };
    
    await ctx.db.patch(args.id, updated);
    return updated;
  }
});
```

**Advantages:**
- Creates immutable copies of objects
- Clear and readable syntax
- Automatically maintains existing properties
- Allows partial updates easily
- Adequate performance for most cases

#### ⚠️ Caution with Nested Objects

The spread operator creates only shallow copies:

```typescript
// ❌ Problematic for nested objects
const user = {
  profile: { name: "John", settings: { theme: "dark" } }
};

const updated = { ...user };
updated.profile.name = "Mary"; // Modifies the original object!

// ✅ Correct for nested objects
const updated = {
  ...user,
  profile: {
    ...user.profile,
    name: "Mary"
  }
};
```

### Efficient Update Patterns

#### 1. Conditional Updates

```typescript
export const updateUserIfChanged = mutation({
  args: { userId: v.id("users"), updates: v.object({}) },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    // Only update if there are changes
    const hasChanges = Object.keys(args.updates).some(
      key => user[key] !== args.updates[key]
    );

    if (hasChanges) {
      await ctx.db.patch(args.userId, {
        ...args.updates,
        updatedAt: Date.now()
      });
    }

    return user;
  }
});
```

#### 2. Batch Updates

```typescript
// ✅ Efficient for multiple updates
export const updateMultipleUsers = mutation({
  args: { updates: v.array(v.object({ id: v.id("users"), data: v.any() })) },
  handler: async (ctx, args) => {
    const promises = args.updates.map(update =>
      ctx.db.patch(update.id, {
        ...update.data,
        updatedAt: Date.now()
      })
    );

    await Promise.all(promises);
  }
});
```

#### 3. Validation Before Update

```typescript
export const updateAccountSafely = mutation({
  args: { accountId: v.id("accounts"), updates: v.object({}) },
  handler: async (ctx, args) => {
    // Check permissions
    await requireAccountAccess(ctx, args.accountId);

    // Fetch current data
    const account = await ctx.db.get(args.accountId);
    if (!account) throw new Error("Account not found");

    // Validate limits if necessary
    if (args.updates.maxUsers) {
      await validateAccountLimits(ctx, args.accountId, {
        maxUsers: args.updates.maxUsers
      });
    }

    // Apply update
    const updatedAccount = {
      ...account,
      ...args.updates,
      updatedAt: Date.now()
    };

    await ctx.db.patch(args.accountId, updatedAccount);

    // Log activity
    await logActivity(ctx, {
      accountId: args.accountId,
      action: "account_updated",
      details: { updatedFields: Object.keys(args.updates) }
    });

    return updatedAccount;
  }
});
```

### 3. Argument Validation
```typescript
// ✅ Always validate arguments
export const updateClient = mutation({
  args: {
    id: v.id("clients"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // Validate email format if provided
    if (args.email && !isValidEmail(args.email)) {
      throw new Error("Invalid email format");
    }
    
    // Proceed with update
    const updates = Object.fromEntries(
      Object.entries(args).filter(([key, value]) => 
        key !== 'id' && value !== undefined
      )
    );
    
    await ctx.db.patch(args.id, {
      ...updates,
      updatedAt: Date.now()
    });
  }
});
```

### 4. Transactional Nature
Mutations in Convex are automatically transactional - if any operation fails, all changes are rolled back:

```typescript
export const transferCase = mutation({
  args: { processId: v.id("processes"), fromLawyer: v.id("users"), toLawyer: v.id("users") },
  handler: async (ctx, args) => {
    // All operations succeed or all fail together
    await ctx.db.patch(args.processId, { assignedLawyer: args.toLawyer });
    
    await ctx.db.insert("activities", {
      processId: args.processId,
      action: "transferred",
      fromUser: args.fromLawyer,
      toUser: args.toLawyer,
      timestamp: Date.now()
    });
    
    // If this fails, all above operations are rolled back
    await updateLawyerCaseCount(ctx, args.fromLawyer, -1);
    await updateLawyerCaseCount(ctx, args.toLawyer, 1);
  }
});
```

## Query Performance Optimization

### 1. Use Indexes for Efficient Filtering

```typescript
// ❌ Avoid full table scans
const processes = await ctx.db.query("processes")
  .filter(q => q.eq(q.field("accountId"), accountId))
  .collect();

// ✅ Use indexes
const processes = await ctx.db.query("processes")
  .withIndex("by_account", q => q.eq("accountId", accountId))
  .collect();
```

### 2. Avoid collect() on Large Datasets

```typescript
// ❌ Loads all documents into memory
const allProcesses = await ctx.db.query("processes").collect();
const activeProcesses = allProcesses.filter(p => p.status === "active");

// ✅ Filter in the database
const activeProcesses = await ctx.db.query("processes")
  .withIndex("by_status", q => q.eq("status", "active"))
  .collect();
```

### 3. Use Pagination for Large Sets

```typescript
export const getProcessesPaginated = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    return await ctx.db.query("processes")
      .withIndex("by_creation_time")
      .order("desc")
      .paginate(args.paginationOpts);
  }
});
```

### 4. Prefer Queries and Mutations over Actions
```typescript
// ✅ Use queries for data fetching
export const getProcessDetails = query({
  args: { id: v.id("processes") },
  handler: async (ctx, args) => {
    const process = await ctx.db.get(args.id);
    if (!process) return null;
    
    // Fetch related data efficiently
    const client = await ctx.db.get(process.clientId);
    const deadlines = await ctx.db.query("deadlines")
      .withIndex("by_process", q => q.eq("processId", args.id))
      .collect();
    
    return { process, client, deadlines };
  }
});

// ❌ Avoid actions for simple database operations
// Actions should be used for external API calls, not database queries
```

## Anti-Performance Patterns

### ❌ Avoid These Patterns

```typescript
// 1. N+1 queries - Multiple queries in loop
for (const processId of processIds) {
  const process = await ctx.db.get(processId); // Inefficient!
}

// 2. Unnecessary updates
await ctx.db.patch(processId, { updatedAt: Date.now() }); // No real changes

// 3. Loading unused data
const process = await ctx.db.get(processId);
return { title: process.title }; // Loaded unnecessary fields

// 4. Using collect() on large datasets
const allProcesses = await ctx.db.query("processes").collect(); // Memory intensive

// 5. Missing indexes
const processes = await ctx.db.query("processes")
  .filter(q => q.eq(q.field("status"), "active")) // Slow without index
  .collect();
```

### ✅ Optimized Versions

```typescript
// 1. Batch operations
const processes = await Promise.all(
  processIds.map(id => ctx.db.get(id))
);

// 2. Conditional updates with change detection
const hasChanges = Object.keys(updates).some(
  key => existing[key] !== updates[key]
);
if (hasChanges) {
  await ctx.db.patch(processId, { ...updates, updatedAt: Date.now() });
}

// 3. Return only needed data
const process = await ctx.db.get(processId);
return {
  title: process.title,
  status: process.status,
  clientName: process.clientName
};

// 4. Use pagination for large datasets
const result = await ctx.db.query("processes")
  .withIndex("by_creation_time")
  .order("desc")
  .paginate(paginationOpts);

// 5. Use proper indexes
const activeProcesses = await ctx.db.query("processes")
  .withIndex("by_status", q => q.eq("status", "active"))
  .collect();
```

## Error Handling Best Practices

```typescript
export const safeUpdateProcess = mutation({
  args: { id: v.id("processes"), updates: v.object({}) },
  handler: async (ctx, args) => {
    try {
      // Check if process exists
      const process = await ctx.db.get(args.id);
      if (!process) {
        throw new Error(`Process with id ${args.id} not found`);
      }
      
      // Validate permissions
      await requireProcessAccess(ctx, args.id);
      
      // Perform update
      const updated = {
        ...process,
        ...args.updates,
        updatedAt: Date.now()
      };
      
      await ctx.db.patch(args.id, updated);
      
      // Log activity
      await logActivity(ctx, {
        processId: args.id,
        action: "updated",
        changes: Object.keys(args.updates)
      });
      
      return updated;
      
    } catch (error) {
      // Log error for debugging
      console.error("Failed to update process:", error);
      
      // Re-throw with user-friendly message
      throw new Error(
        error instanceof Error ? error.message : "Failed to update process"
      );
    }
  }
});
```

## Conclusion

Key principles for performatic and maintainable Convex code:

1. **Always await promises** - Convex operations are asynchronous
2. **Use spread operator** for immutable updates
3. **Validate arguments** thoroughly
4. **Leverage indexes** for efficient queries
5. **Avoid collect()** on large datasets
6. **Prefer queries/mutations** over actions for database operations
7. **Handle errors gracefully** with proper validation
8. **Use pagination** for large result sets
9. **Batch operations** when possible
10. **Log activities** for audit trails


# Next.js 15 App Router Patterns

## Server vs Client Components
- **Default to Server Components** - Only use `'use client'` when necessary
- **Server Components** for: data fetching, SEO, performance, static content
- **Client Components** for: interactivity, browser APIs, event handlers

## Data Fetching Patterns
```typescript
// Server Component - Direct database access
async function JobList() {
  const jobs = await supabase.from('jobs').select('*')
  return <JobGrid jobs={jobs.data || []} />
}

// Client Component - Interactive features
'use client'
function JobSearch() {
  const [query, setQuery] = useState('')
  // Client-side search logic
}
```

## Route Groups and Layouts
```typescript
// Route group for auth (doesn't affect URL)
app/(auth)/layout.tsx
app/(auth)/login/page.tsx
app/(auth)/register/page.tsx

// Nested layouts
app/(company)/layout.tsx          // Company dashboard layout
app/(company)/company/layout.tsx  // Company-specific layout
```

## Dynamic Routes
```typescript
// Dynamic segments
app/j/[publicId]/page.tsx         // Job details
app/u/[publicId]/page.tsx         // User profile
app/c/[name]/page.tsx             // Company profile

// Generate metadata dynamically
export async function generateMetadata({ params }: { params: { publicId: string } }) {
  const job = await getJob(params.publicId)
  return { title: job.title }
}
```

## Middleware Patterns
```typescript
// Authentication middleware
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect company routes
  if (pathname.startsWith('/company') && !isAuthenticated(request)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/company/:path*', '/user/:path*']
}
```

## Image Optimization
```typescript
import Image from 'next/image'

// Optimized images with proper sizing
<Image
  src="/hero-kitchen.jpg"
  alt="Kitchen workspace"
  width={800}
  height={600}
  priority={true}  // For above-the-fold images
  className="rounded-lg"
/>
```

## Metadata and SEO
```typescript
// Static metadata
export const metadata: Metadata = {
  title: 'Chef Jobs - Find Your Next Culinary Position',
  description: 'Browse thousands of chef and kitchen positions',
  openGraph: {
    title: 'Chef Jobs',
    description: 'Find your next culinary career'
  }
}

// Dynamic metadata
export async function generateMetadata({ params }: Props) {
  const job = await getJob(params.publicId)
  return {
    title: `${job.title} at ${job.company}`,
    description: job.description
  }
}
```

## Error Handling
```typescript
// Error boundaries
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <h2 className="text-2xl font-bold">Something went wrong!</h2>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}

// Not found pages
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <h2 className="text-2xl font-bold">Page not found</h2>
      <Link href="/">Return home</Link>
    </div>
  )
}
```

## Performance Optimization
- Use `loading.tsx` for route loading states
- Implement proper Suspense boundaries
- Use `generateStaticParams` for static generation
- Optimize bundle size with dynamic imports
- Implement proper caching strategies
description:
globs:
alwaysApply: false
---
