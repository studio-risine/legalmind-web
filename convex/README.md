# Convex Database Seeding

This directory contains scripts for seeding the Convex database with fake data for development and testing purposes.

## Overview

The seeding system uses the `@faker-js/faker` library to generate realistic fake data and populates the database with:

- **Super Admin User**: A system administrator with email `admin@example.com` and password `123456`
- **Fake Accounts**: Company accounts with realistic business information
- **Fake Users**: Users associated with accounts in different roles (ADMIN, MEMBER)
- **Fake Products**: Products associated with accounts
- **Activity Logs**: Realistic activity logs for audit trails

## Available Scripts

### Main Seeding Functions

#### `seedDatabase`
Populates the database with a complete set of fake data:
- 1 Super Admin user
- 3 fake accounts
- 2 users per account (1 admin, 1 member)
- 5 products per account

```bash
# Execute the main seed script
npx convex run seed:seedDatabase
```

#### `clearAllData`
Clears all data from the database (useful for resetting during development):

```bash
# Clear all database data
npx convex run seed:clearAllData
```

#### `generateActivityLogs`
Generates additional activity logs (default: 50 entries):

```bash
# Generate 50 activity logs
npx convex run seed:generateActivityLogs

# Generate custom number of activity logs
npx convex run seed:generateActivityLogs '{"count": 100}'
```

#### `quickSeed`
A faster seeding option with minimal data for quick testing:
- 1 Super Admin user
- 1 fake account
- 2 users for the account
- 3 products for the account

```bash
# Quick seed for testing
npx convex run seed:quickSeed
```

## Super Admin Credentials

The seeding process creates a super admin user with credentials defined in your environment variables:
- **Email**: Configured via `SUPER_ADMIN_EMAIL` (default: `admin@example.com`)
- **Password**: Configured via `SUPER_ADMIN_PASSWORD` (default: `123456`)
- **Role**: `SUPER_ADMIN`

### Environment Configuration

Before running seed scripts, ensure your environment variables are properly configured:

1. **Copy the example file**:
   ```bash
   cp .env.example .env.local
   ```

2. **Update the credentials** in `.env.local`:
   ```bash
   SUPER_ADMIN_EMAIL=your-admin@company.com
   SUPER_ADMIN_PASSWORD=your-secure-password
   ```

3. **Configure Convex environment variables** in `convex.json`:
   ```json
   {
     "environmentVariables": [
       "SUPER_ADMIN_EMAIL",
       "SUPER_ADMIN_PASSWORD"
     ]
   }
   ```

4. **Environment Variables**:
   - `SUPER_ADMIN_EMAIL`: Email address for the super admin user
   - `SUPER_ADMIN_PASSWORD`: Password for the super admin user (minimum 6 characters)
   - Both variables have defaults but should be customized for your environment
   - **Important**: Variables must be declared in `convex.json` to be accessible in Convex functions

## Data Generation Details

### Accounts
- Company names using `faker.company.name()`
- Realistic business descriptions
- Random subscription plans (FREE, BASIC, PRO, ENTERPRISE)
- Proper timestamps and metadata

### Users
- Realistic names using `faker.person.firstName()` and `faker.person.lastName()`
- Professional email addresses
- Secure password hashing
- Appropriate roles (ADMIN, MEMBER)

### Products
- Product names using `faker.commerce.productName()`
- Detailed descriptions
- Realistic pricing
- Random categories and inventory levels
- Product images and metadata

### Activity Logs
- Various action types (CREATE, UPDATE, DELETE, LOGIN, etc.)
- Realistic timestamps
- Proper actor and entity relationships
- Detailed metadata for audit trails

## Development Workflow

1. **Start Fresh**: Clear existing data
   ```bash
   npx convex run seed:clearAllData
   ```

2. **Seed Database**: Populate with fake data
   ```bash
   npx convex run seed:seedDatabase
   ```

3. **Add More Logs**: Generate additional activity logs if needed
   ```bash
   npx convex run seed:generateActivityLogs
   ```

## Important Notes

- **Development Only**: These scripts are intended for development and testing environments only
- **Data Consistency**: The faker seed is set to ensure consistent data generation across runs
- **Relationships**: All generated data maintains proper foreign key relationships
- **Security**: Super admin credentials are configurable via environment variables - always use secure passwords in production
- **Environment Variables**: Credentials are loaded from `.env.local` - ensure this file is not committed to version control
- **Performance**: Large datasets may take time to generate - use `quickSeed` for faster testing

## Customization

You can modify the seeding parameters in `seed.ts`:

```typescript
// Adjust these constants to change the amount of generated data
const accountsCount = 3;           // Number of fake accounts
const usersPerAccount = 2;         // Users per account
const productsPerAccount = 5;      // Products per account
```

## Troubleshooting

- **Permission Errors**: Ensure you're running the commands from the project root
- **Database Errors**: Check that your Convex deployment is active
- **Type Errors**: Ensure all dependencies are installed with `pnpm install`
- **Slow Performance**: Use `quickSeed` for faster testing or reduce the data generation constants
