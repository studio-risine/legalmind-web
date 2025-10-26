# Development Environment Setup

This guide explains how to configure and work with the LegalTrack project development environment. The project is configured to use **Supabase Local Development** with Docker containers running the Supabase stack locally.

## Overview

The project uses a simplified environment configuration focused on local Supabase development:

- `.env` - Main environment file for local Supabase development
- `.env.test` - Test environment configuration
- `.env.example` - Template for environment variables

The setup uses Supabase's local development stack with PostgreSQL and GoTrue (authentication) running in Docker containers.

## Prerequisites

Before you start, make sure you have installed:

- [Node.js](https://nodejs.org/) (v20 or higher)
- [pnpm](https://pnpm.io/) (v8 or higher)
- [Docker](https://www.docker.com/) (for Supabase local stack)
- [Docker Compose](https://docs.docker.com/compose/) (usually comes with Docker Desktop)
- [Supabase CLI](https://supabase.com/docs/guides/cli) (optional, for additional Supabase features)

## Local Development with Supabase

This is the main development setup that runs a complete Supabase stack locally using Docker containers. This provides a full-featured development environment with PostgreSQL database and Supabase's GoTrue authentication service.

### Setup Steps

1. **Start the Supabase local stack:**
   ```bash
   docker compose up -d
   ```

   This will start:
   - **PostgreSQL Database** (supabase/postgres) on port `5432`
   - **GoTrue Authentication API** (supabase/gotrue) on port `9999`
   - The `docker/init.sql` script automatically creates the `legalmind_test` database for testing

2. **Verify the environment file:**

   The `.env` file should contain:
   ```bash
   # DEVELOPMENT
   NODE_ENV=development
   PORT=3000

   # SUPABASE LOCAL
   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
   SUPABASE_SCRET_KEY=sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz

   # DATABASE - Supabase Local PostgreSQL
   DATABASE_URL="postgresql://postgres:postgres@localhost:54322/postgres"
   DIRECT_URL="postgresql://postgres:postgres@localhost:54322/postgres"
   ```

3. **Run database migrations:**
   ```bash
   pnpm db:migrate
   ```

4. **Start the development server:**
   ```bash
   pnpm dev
   ```

   The application will be available at `http://localhost:3000`

### Available Scripts

- `pnpm dev` - Start Next.js development server
- `pnpm db:generate` - Generate new Drizzle migration files
- `pnpm db:migrate` - Apply migrations to the database
- `pnpm db:studio` - Open Drizzle Studio (database GUI)
- `pnpm db:drift` - Check for schema drift

### Stopping the Supabase Stack

```bash
docker compose down
```

To also remove the data volumes:
```bash
docker compose down -v
```

## Working with Remote Supabase (Production/Staging)

If you need to work against a remote Supabase instance (for testing production features, debugging, or staging), you can modify your `.env` file to point to a remote Supabase project.

### Setup Steps

1. **Configure your remote Supabase credentials:**

   Update your `.env` file with your actual Supabase project credentials:
   ```bash
   # DEVELOPMENT
   NODE_ENV=development
   PORT=3000

   # REMOTE SUPABASE - Replace with your actual project credentials
   NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=[YOUR-ANON-KEY]
   SUPABASE_SCRET_KEY=[YOUR-SERVICE-ROLE-KEY]

   # DATABASE - Replace with your actual Supabase database URL
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
   DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
   ```

   You can find these values in your [Supabase Dashboard](https://app.supabase.com/) under:
   - **Settings** → **Database** → Connection string (for `DATABASE_URL`)
   - **Settings** → **API** → Project URL (for `NEXT_PUBLIC_SUPABASE_URL`)
   - **Settings** → **API** → anon public key (for `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`)
   - **Settings** → **API** → service_role key (for `SUPABASE_SCRET_KEY`)

2. **Run database migrations (if needed):**
   ```bash
   pnpm db:migrate
   ```

3. **Start the development server:**
   ```bash
   pnpm dev
   ```

### Important Notes

- **Never commit** real credentials to version control
- The `SUPABASE_SCRET_KEY` (service role key) has elevated privileges - keep it secure
- Migrations applied to remote Supabase are permanent - be careful in shared environments
- Consider using separate Supabase projects for development, staging, and production

## Test Environment

The test environment uses an isolated PostgreSQL database (`legalmind_test`) to ensure tests don't interfere with your development data.

### Setup Steps

1. **Ensure the Supabase stack is running:**
   ```bash
   docker compose up -d
   ```

   The `docker/init.sql` script automatically creates the `legalmind_test` database when the PostgreSQL container starts.

2. **Verify the test environment file:**

   The `.env.test` file should contain:
   ```bash
   # DEVELOPMENT
   NODE_ENV=development
   PORT=3000

   # SUPABASE LOCAL (for tests)
   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
   SUPABASE_SCRET_KEY=sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz

   # DATABASE - Test database (created by Docker init.sql)
   DATABASE_URL="postgresql://postgres:postgres@localhost:54322/postgres"
   DIRECT_URL="postgresql://postgres:postgres@localhost:54322/postgres"
   ```

3. **Run tests:**
   ```bash
   pnpm test
   ```

### Available Scripts

- `pnpm test` - Run all tests once
- `pnpm test:watch` - Run tests in watch mode (re-runs on file changes)
- `pnpm test:coverage` - Run tests and generate coverage report

### Test Best Practices

- Tests run against the same Supabase local stack as development
- The `legalmind_test` database is available for isolated test data
- Consider adding database cleanup/seeding in test setup files
- Use test-specific factories or fixtures for consistent test data

## Environment Variables Reference

### Required Variables

| Variable | Description | Local Development | Remote Supabase |
|----------|-------------|-------------------|-----------------|
| `NODE_ENV` | Application environment | `development` | `development` |
| `PORT` | Port for Next.js server | `3000` | `3000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:54322/postgres` | `postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres` |
| `DIRECT_URL` | Direct database connection | Same as `DATABASE_URL` | Same as `DATABASE_URL` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase API URL | `http://127.0.0.1:54321` | `https://[YOUR-PROJECT-REF].supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key | Local demo key | Your project's anon key |
| `SUPABASE_SCRET_KEY` | Supabase service role key | Local demo key | Your project's service role key |

### Docker Compose Services

The `docker-compose.yml` configures two services:

| Service | Image | Port | Purpose |
|---------|--------|------|---------|
| `db` | `supabase/postgres:latest` | `5432` | PostgreSQL database with Supabase extensions |
| `api` | `supabase/gotrue:latest` | `9999` | Authentication service (GoTrue) |

## Troubleshooting

### Database Connection Issues

**Problem:** Cannot connect to PostgreSQL

**Solutions:**
1. Verify Docker is running: `docker ps`
2. Check if the containers are up: `docker compose ps`
3. Restart the containers: `docker compose restart`
4. Check logs: `docker compose logs db` or `docker compose logs api`

### Port Already in Use

**Problem:** Port 5432 or 9999 is already in use

**Solutions:**
1. Stop other PostgreSQL or Supabase instances
2. Or, modify `docker-compose.yml` to use different ports:
   ```yaml
   services:
     db:
       ports:
         - '5433:5432'  # Use port 5433 on host
     api:
       ports:
         - '9998:9999'  # Use port 9998 on host
   ```
   Then update your environment variables accordingly.

### Migration Errors

**Problem:** Drizzle migrations fail

**Solutions:**
1. Ensure the database exists and is accessible
2. Check if you're using the correct script for your environment
3. Verify `DATABASE_URL` in the correct `.env` file
4. Try running with verbose output: `pnpm db:migrate -- --verbose`

### Environment Variables Not Loading

**Problem:** Application doesn't recognize environment variables

**Solutions:**
1. Check that the `.env` file exists and has the correct variables
2. Restart the development server
3. Check for syntax errors in `.env` files (no spaces around `=`)
4. Verify that `src/infra/env.ts` is properly configured to load the variables

### Supabase Connection Issues

**Problem:** Cannot connect to Supabase services

**Solutions:**
1. Ensure both `db` and `api` containers are running: `docker compose ps`
2. Check if ports 5432 and 9999 are available
3. Verify the GoTrue service is healthy: `curl http://localhost:9999/health`
4. Check container logs: `docker compose logs api`

## Available Scripts

The project provides the following npm scripts for development:

```bash
# Development
pnpm dev                    # Start Next.js development server

# Database Management
pnpm db:generate           # Generate new Drizzle migration files
pnpm db:migrate            # Apply migrations to the database
pnpm db:studio             # Open Drizzle Studio (database GUI)
pnpm db:drift              # Check for schema drift

# Testing
pnpm test                  # Run all tests once
pnpm test:watch            # Run tests in watch mode
pnpm test:coverage         # Run tests and generate coverage report

# Code Quality
pnpm check                 # Run Biome linter
pnpm fix                   # Fix linting issues
pnpm format                # Format code with Biome
pnpm type-check            # Run TypeScript type checking
```

## Additional Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Local Development](https://supabase.com/docs/guides/local-development)
- [Supabase CLI Documentation](https://supabase.com/docs/guides/cli)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vitest Documentation](https://vitest.dev/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [GoTrue (Supabase Auth) Documentation](https://github.com/supabase/gotrue)

## Contributing

When adding new environment variables:

1. Add them to the `.env` file for local development
2. Update the `.env.test` file if needed for testing
3. Update `src/infra/env.ts` with the new variable validation
4. Document the variable in this guide
5. Update the `.env.example` file as a template

## Security Notes

- **Never commit** real credentials to version control
- The `.env` file should be in `.gitignore` - only commit `.env.example`
- Keep `SUPABASE_SCRET_KEY` secure - it has admin privileges
- Use different credentials for development and production
- Rotate keys regularly in production environments
- The local Supabase demo keys are safe for development but should never be used in production

## File Structure

```
legalmind/
├── docker-compose.yml          # Supabase local stack configuration
├── docker/
│   └── init.sql               # Database initialization script
├── .env                       # Main environment variables (local Supabase)
├── .env.test                  # Test environment variables
├── .env.example               # Template for environment variables
├── drizzle.config.ts          # Drizzle ORM configuration
└── src/
    └── infra/
        └── env.ts            # Environment validation with Zod
```
