# Convex Update Best Practices

This document describes best practices for performing updates in Convex, focusing on performance and recommended patterns.

## Update Performance

### Spread Operator vs Prepare Update

The spread operator (`...`) is a powerful tool for immutable updates and is widely recommended in Convex:

#### ✅ Recommended: Using the Spread Operator

```typescript
// Update with spread operator
const updatedUser = {
  ...existingUser,
  name: "New Name",
  updatedAt: Date.now()
};

await ctx.db.patch(userId, updatedUser);
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

## Performance Optimizations

### 1. Use Indexes for Frequent Queries

```typescript
// ❌ Avoid full table scans
const users = await ctx.db.query("users")
  .filter(q => q.eq(q.field("accountId"), accountId))
  .collect();

// ✅ Use indexes
const users = await ctx.db.query("users")
  .withIndex("by_account", q => q.eq("accountId", accountId))
  .collect();
```

### 2. Avoid Loading Unnecessary Documents

```typescript
// ❌ Loads all documents
const allProducts = await ctx.db.query("products").collect();
const activeProducts = allProducts.filter(p => p.status === "active");

// ✅ Filter in the database
const activeProducts = await ctx.db.query("products")
  .withIndex("by_status", q => q.eq("status", "active"))
  .collect();
```

### 3. Use Pagination for Large Sets

```typescript
export const getProductsPaginated = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    return await ctx.db.query("products")
      .withIndex("by_creation_time")
      .order("desc")
      .paginate(args.paginationOpts);
  }
});
```

## Anti-Performance Patterns

### ❌ Avoid These Patterns

```typescript
// 1. Multiple queries in loop
for (const userId of userIds) {
  const user = await ctx.db.get(userId); // N+1 queries
}

// 2. Unnecessary updates
await ctx.db.patch(userId, { updatedAt: Date.now() }); // No real changes

// 3. Loading unused data
const user = await ctx.db.get(userId);
return { name: user.name }; // Loaded unnecessary data
```

### ✅ Optimized Versions

```typescript
// 1. Batch fetch
const users = await Promise.all(
  userIds.map(id => ctx.db.get(id))
);

// 2. Conditional updates
if (hasRealChanges) {
  await ctx.db.patch(userId, changes);
}

// 3. Field projection (when available)
const user = await ctx.db.get(userId);
return { name: user.name, email: user.email };
```

## Conclusion

The spread operator is the recommended approach for updates in Convex due to its:
- Simplicity and readability
- Native support for immutability
- Adequate performance for typical applications
- Natural integration with TypeScript

Avoid complex "prepare update" patterns unless you have very specific performance needs that justify the additional complexity.