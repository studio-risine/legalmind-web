# User Rules and Standards

## Language Requirements

### Code Language
- **All code MUST be written in English**
  - Variable names, function names, class names
  - File names and directory names
  - API endpoints and database field names
  - Error messages and log statements

### Comments Language
- **All comments MUST be written in English**
  - Documentation comments
  - Inline explanations
  - TODO/FIXME notes

## Comment Guidelines

### When to Write Comments
- **Documentation purposes only** - Write comments that explain the "why" and "what", not the "how"
- **Complex business logic** - Explain algorithms, formulas, or non-obvious business rules
- **API documentation** - Document function parameters, return values, and usage examples
- **Architecture decisions** - Explain why certain patterns or approaches were chosen

### When NOT to Write Comments
- **Avoid simple descriptive comments** that just repeat what the code does
  ```typescript
  // BAD: Simple descriptive comments
  // Validate inventory
  if (inventory < 0) {
    throw new Error("Invalid inventory");
  }

  // GOOD: Self-documenting code
  if (hasNegativeInventory(inventory)) {
    throw new Error("Inventory cannot be negative");
  }
  ```

- **Don't comment obvious code**
  ```typescript
  // BAD
  // Set user name
  user.name = "John";

  // GOOD
  user.name = "John";
  ```

## Variable Naming Standards

### Prefer Clear, Contextual Names
- **Use descriptive names** that explain the purpose and context
- **Avoid abbreviations** unless they are widely understood
- **Include units or types** when relevant

### Examples of Good Variable Names
```typescript
// BAD: Unclear names requiring comments
const d = 30; // days
const p = calculatePrice(); // product price
const isValid = true; // is user authenticated

// GOOD: Self-documenting names
const subscriptionDurationInDays = 30;
const productPriceInCents = calculatePrice();
const isUserAuthenticated = true;
```

### Function Naming
```typescript
// BAD: Requires comments to understand
function process(data: any) {
  // Validates user input and saves to database
  // ...
}

// GOOD: Self-explanatory
function validateAndSaveUserProfile(userProfileData: UserProfile) {
  // ...
}
```

### Boolean Variables
```typescript
// BAD
const valid = checkUser();
const access = hasPermission();

// GOOD
const isUserValid = checkUser();
const hasAccountAccess = hasPermission();
```

## Code Organization

### File and Directory Names
- Use **kebab-case** for file names: `user-profile.ts`, `account-settings.tsx`
- Use **PascalCase** for component files: `UserProfile.tsx`, `AccountSettings.tsx`
- Use **camelCase** for utility files: `dateUtils.ts`, `apiHelpers.ts`

### Function Organization
- **Group related functions** together
- **Order functions** from public to private
- **Use meaningful function names** that describe the action and result

## Type Safety

### TypeScript Usage
- **Always use explicit types** for function parameters and return values
- **Avoid `any` type** - use specific types or `unknown` when necessary
- **Use type guards** for runtime type checking

```typescript
// BAD
function updateUser(data: any): any {
  // ...
}

// GOOD
function updateUserProfile(userData: UserProfileUpdateData): Promise<UpdatedUser> {
  // ...
}
```

## Error Handling

### Error Messages
- **Write clear, actionable error messages** in English
- **Include context** about what went wrong and how to fix it
- **Use consistent error formats** across the application

```typescript
// BAD
throw new Error("Error");

// GOOD
throw new Error(`Product with ID ${productId} not found. Please verify the product exists and try again.`);
```

## Documentation Comments

### When Documentation is Required
- **Public API functions** - Document parameters, return values, and usage
- **Complex algorithms** - Explain the approach and any mathematical formulas
- **Business logic** - Document rules and constraints
- **Configuration objects** - Explain each property and its purpose

### JSDoc Format
```typescript
/**
 * Calculates the total price including taxes and discounts for a product order.
 *
 * @param basePrice - The original price of the product in cents
 * @param taxRate - The tax rate as a decimal (e.g., 0.08 for 8%)
 * @param discountPercentage - The discount percentage as a decimal (e.g., 0.15 for 15%)
 * @returns The final price in cents after applying tax and discount
 *
 * @example
 * ```typescript
 * const finalPrice = calculateTotalPrice(10000, 0.08, 0.10);
 * // Returns: 9720 (10000 - 10% discount + 8% tax)
 * ```
 */
function calculateTotalPrice(
  basePrice: number,
  taxRate: number,
  discountPercentage: number
): number {
  const discountAmount = basePrice * discountPercentage;
  const discountedPrice = basePrice - discountAmount;
  const taxAmount = discountedPrice * taxRate;
  return discountedPrice + taxAmount;
}
```

## CSS and Styling Guidelines

### Tailwind CSS Usage
- **Use Tailwind CSS classes** for styling components
- **Avoid inline styles** unless absolutely necessary
- **Use semantic class names** when creating custom CSS classes
- **Follow Tailwind's utility-first approach**

### CSS File Organization
- **Keep global styles minimal** - use `globals.css` only for base styles
- **Use CSS modules** for component-specific styles when needed
- **Organize CSS classes logically** - group related utilities together

### Tailwind Configuration
- **Configure Biome to allow Tailwind at-rules** (`@apply`, `@theme`, `@layer`)
- **Use design tokens** from Tailwind config for consistent spacing and colors
- **Extend Tailwind theme** for project-specific design requirements

```css
/* GOOD: Using Tailwind utilities */
@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}

/* GOOD: Custom theme configuration */
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
}
```

## Enforcement

### Linting Rules
- Configure ESLint/Biome to enforce English-only identifiers
- Set up rules to detect overly simple comments
- Use TypeScript strict mode to enforce type safety
- **Configure Biome to allow Tailwind CSS at-rules** (`noUnknownAtRules: "off"`)
- **Disable non-null assertion warnings** for Convex queries (`noNonNullAssertion: "off"`)

### Code Review Checklist
- [ ] All code and comments are in English
- [ ] Variable names are clear and contextual
- [ ] No unnecessary simple comments
- [ ] Documentation exists for complex logic
- [ ] Error messages are clear and actionable
- [ ] Types are explicit and avoid `any`
- [ ] CSS follows Tailwind utility-first approach
- [ ] No linting errors or warnings

## Examples

### Before (Bad)
```typescript
// Validate user data
function validate(data: any): boolean {
  // Check if name exists
  if (!data.name) {
    return false;
  }
  // Check if email is valid
  if (!data.email.includes('@')) {
    return false;
  }
  return true;
}
```

### After (Good)
```typescript
function validateUserRegistrationData(userData: UserRegistrationData): boolean {
  if (!hasValidName(userData.name)) {
    return false;
  }

  if (!hasValidEmailFormat(userData.email)) {
    return false;
  }

  return true;
}

function hasValidName(name: string): boolean {
  return name && name.trim().length > 0;
}

function hasValidEmailFormat(email: string): boolean {
  return email && email.includes('@') && email.includes('.');
}
```
