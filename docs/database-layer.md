# Database Layer Documentation

## Overview

The Database Layer in LegalTrack is built on PostgreSQL with Prisma ORM, providing a robust, type-safe, and scalable data foundation. This layer handles data persistence, relationships, constraints, and database operations while ensuring data integrity and performance.

## Technology Stack

- **Database**: PostgreSQL 15+
- **ORM**: Prisma 5.x
- **Migration Tool**: Prisma Migrate
- **Query Builder**: Prisma Client
- **Connection Pooling**: Built-in Prisma connection pooling

## Database Architecture

### Core Principles

1. **Data Integrity**: Enforced through foreign keys, constraints, and validations
2. **Normalization**: Proper database normalization to reduce redundancy
3. **Performance**: Optimized indexes and query patterns
4. **Scalability**: Designed for horizontal and vertical scaling
5. **Auditability**: Comprehensive tracking of data changes

### Entity Relationship Diagram

```mermaid
erDiagram
    Organization ||--o{ User : contains
    Organization ||--o{ Space : contains
    User ||--|| Profile : has
    User ||--o{ Process : assigned_to
    Space ||--o{ Client : contains
    Space ||--o{ Process : contains
    Client ||--o{ Process : owns
    Process ||--o{ Deadline : has
    Process ||--o{ Document : contains
    Process ||--o{ Activity : tracks
    User ||--o{ Activity : performs

    Organization {
        string id PK
        string name
        string slug
        json settings
        datetime createdAt
        datetime updatedAt
    }

    User {
        string id PK
        string email UK
        string name
        enum role
        string organizationId FK
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }

    Profile {
        string id PK
        string userId FK
        string phone
        string department
        text bio
        string avatarUrl
        datetime createdAt
        datetime updatedAt
    }

    Space {
        string id PK
        string name
        string organizationId FK
        json settings
        datetime createdAt
        datetime updatedAt
    }

    Client {
        string id PK
        string name
        string email
        string phone
        string document
        json address
        string spaceId FK
        text notes
        json metadata
        datetime createdAt
        datetime updatedAt
    }

    Process {
        string id PK
        string processNumber UK
        string title
        text description
        enum status
        enum priority
        string category
        string clientId FK
        string assignedLawyerId FK
        string spaceId FK
        json metadata
        datetime createdAt
        datetime updatedAt
    }

    Deadline {
        string id PK
        string title
        text description
        datetime dueDate
        enum status
        enum priority
        string processId FK
        string assignedUserId FK
        datetime createdAt
        datetime updatedAt
    }

    Document {
        string id PK
        string name
        string type
        string url
        integer size
        string processId FK
        string uploadedById FK
        json metadata
        datetime createdAt
        datetime updatedAt
    }

    Activity {
        string id PK
        enum action
        text description
        string processId FK
        string userId FK
        json metadata
        datetime createdAt
    }
```

## Prisma Schema

### Complete Schema Definition

```prisma
// schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Organization Model
model Organization {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  settings  Json?    @default("{}")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  // Relations
  users  User[]
  spaces Space[]

  @@map("organizations")
}

// User Model
model User {
  id             String   @id @default(cuid())
  email          String   @unique
  name           String
  role           UserRole @default(LAWYER)
  organizationId String   @map("organization_id")
  isActive       Boolean  @default(true) @map("is_active")
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  // Relations
  organization     Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  profile          Profile?
  assignedProcesses Process[]   @relation("AssignedLawyer")
  uploadedDocuments Document[]  @relation("UploadedBy")
  activities       Activity[]
  assignedDeadlines Deadline[]  @relation("AssignedUser")

  @@map("users")
}

// Profile Model (One-to-One with User)
model Profile {
  id         String   @id @default(cuid())
  userId     String   @unique @map("user_id")
  phone      String?
  department String?
  bio        String?
  avatarUrl  String?  @map("avatar_url")
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("profiles")
}

// Space Model
model Space {
  id             String   @id @default(cuid())
  name           String
  organizationId String   @map("organization_id")
  settings       Json?    @default("{}")
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  // Relations
  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  clients      Client[]
  processes    Process[]

  @@map("spaces")
}

// Client Model
model Client {
  id        String   @id @default(cuid())
  name      String
  email     String
  phone     String?
  document  String?
  address   Json?
  spaceId   String   @map("space_id")
  notes     String?
  metadata  Json?    @default("{}")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  // Relations
  space     Space     @relation(fields: [spaceId], references: [id], onDelete: Cascade)
  processes Process[]

  // Constraints
  @@unique([email, spaceId])
  @@map("clients")
}

// Process Model
model Process {
  id                String        @id @default(cuid())
  processNumber     String        @unique @map("process_number")
  title             String
  description       String?
  status            ProcessStatus @default(PENDING)
  priority          Priority      @default(MEDIUM)
  category          String
  clientId          String        @map("client_id")
  assignedLawyerId  String        @map("assigned_lawyer_id")
  spaceId           String        @map("space_id")
  metadata          Json?         @default("{}")
  createdAt         DateTime      @default(now()) @map("created_at")
  updatedAt         DateTime      @updatedAt @map("updated_at")

  // Relations
  client         Client     @relation(fields: [clientId], references: [id], onDelete: Cascade)
  assignedLawyer User       @relation("AssignedLawyer", fields: [assignedLawyerId], references: [id])
  space          Space      @relation(fields: [spaceId], references: [id], onDelete: Cascade)
  deadlines      Deadline[]
  documents      Document[]
  activities     Activity[]

  @@map("processes")
}

// Deadline Model
model Deadline {
  id             String         @id @default(cuid())
  title          String
  description    String?
  dueDate        DateTime       @map("due_date")
  status         DeadlineStatus @default(PENDING)
  priority       Priority       @default(MEDIUM)
  processId      String         @map("process_id")
  assignedUserId String         @map("assigned_user_id")
  createdAt      DateTime       @default(now()) @map("created_at")
  updatedAt      DateTime       @updatedAt @map("updated_at")

  // Relations
  process      Process @relation(fields: [processId], references: [id], onDelete: Cascade)
  assignedUser User    @relation("AssignedUser", fields: [assignedUserId], references: [id])

  @@map("deadlines")
}

// Document Model
model Document {
  id           String   @id @default(cuid())
  name         String
  type         String
  url          String
  size         Int
  processId    String   @map("process_id")
  uploadedById String   @map("uploaded_by_id")
  metadata     Json?    @default("{}")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  // Relations
  process    Process @relation(fields: [processId], references: [id], onDelete: Cascade)
  uploadedBy User    @relation("UploadedBy", fields: [uploadedById], references: [id])

  @@map("documents")
}

// Activity Model (Audit Trail)
model Activity {
  id          String   @id @default(cuid())
  action      String
  description String?
  processId   String   @map("process_id")
  userId      String   @map("user_id")
  metadata    Json?    @default("{}")
  createdAt   DateTime @default(now()) @map("created_at")

  // Relations
  process Process @relation(fields: [processId], references: [id], onDelete: Cascade)
  user    User    @relation(fields: [userId], references: [id])

  @@map("activities")
}

// Enums
enum UserRole {
  ADMIN
  LAWYER
  ASSISTANT
}

enum ProcessStatus {
  ACTIVE
  PENDING
  COMPLETED
  ARCHIVED
  CANCELLED
}

enum DeadlineStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  OVERDUE
  CANCELLED
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}
```

## Database Indexes

### Performance Optimization Indexes

```sql
-- User indexes
CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

-- Process indexes
CREATE INDEX idx_processes_client_id ON processes(client_id);
CREATE INDEX idx_processes_assigned_lawyer_id ON processes(assigned_lawyer_id);
CREATE INDEX idx_processes_space_id ON processes(space_id);
CREATE INDEX idx_processes_status ON processes(status);
CREATE INDEX idx_processes_priority ON processes(priority);
CREATE INDEX idx_processes_created_at ON processes(created_at);
CREATE INDEX idx_processes_updated_at ON processes(updated_at);

-- Client indexes
CREATE INDEX idx_clients_space_id ON clients(space_id);
CREATE INDEX idx_clients_email_space_id ON clients(email, space_id);

-- Deadline indexes
CREATE INDEX idx_deadlines_process_id ON deadlines(process_id);
CREATE INDEX idx_deadlines_assigned_user_id ON deadlines(assigned_user_id);
CREATE INDEX idx_deadlines_due_date ON deadlines(due_date);
CREATE INDEX idx_deadlines_status ON deadlines(status);

-- Document indexes
CREATE INDEX idx_documents_process_id ON documents(process_id);
CREATE INDEX idx_documents_uploaded_by_id ON documents(uploaded_by_id);
CREATE INDEX idx_documents_type ON documents(type);

-- Activity indexes
CREATE INDEX idx_activities_process_id ON activities(process_id);
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_created_at ON activities(created_at);
CREATE INDEX idx_activities_action ON activities(action);

-- Composite indexes for common queries
CREATE INDEX idx_processes_status_priority ON processes(status, priority);
CREATE INDEX idx_deadlines_status_due_date ON deadlines(status, due_date);
CREATE INDEX idx_activities_process_user_created ON activities(process_id, user_id, created_at);
```

## Database Constraints

### Data Integrity Rules

```sql
-- Email validation
ALTER TABLE users ADD CONSTRAINT check_email_format
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE clients ADD CONSTRAINT check_client_email_format
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Process number format
ALTER TABLE processes ADD CONSTRAINT check_process_number_format
  CHECK (process_number ~* '^[A-Z0-9-]+$');

-- Due date validation
ALTER TABLE deadlines ADD CONSTRAINT check_due_date_future
  CHECK (due_date > created_at);

-- Document size validation
ALTER TABLE documents ADD CONSTRAINT check_document_size
  CHECK (size > 0 AND size <= 104857600); -- 100MB limit

-- Organization slug format
ALTER TABLE organizations ADD CONSTRAINT check_slug_format
  CHECK (slug ~* '^[a-z0-9-]+$');
```

## Migration Strategy

### Migration Files Structure

```
prisma/
├── migrations/
│   ├── 20240101000000_init/
│   │   └── migration.sql
│   ├── 20240115000000_add_profiles/
│   │   └── migration.sql
│   ├── 20240201000000_add_indexes/
│   │   └── migration.sql
│   └── migration_lock.toml
├── schema.prisma
└── seed.ts
```

### Migration Best Practices

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create default organization
  const organization = await prisma.organization.upsert({
    where: { slug: 'default' },
    update: {},
    create: {
      name: 'Default Organization',
      slug: 'default',
      settings: {
        timezone: 'UTC',
        dateFormat: 'YYYY-MM-DD',
        currency: 'USD'
      }
    }
  });

  // Create default space
  const space = await prisma.space.upsert({
    where: { id: 'default-space' },
    update: {},
    create: {
      id: 'default-space',
      name: 'Main Office',
      organizationId: organization.id,
      settings: {
        allowClientSelfRegistration: false,
        requireDocumentApproval: true
      }
    }
  });

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@legaltrack.com' },
    update: {},
    create: {
      email: 'admin@legaltrack.com',
      name: 'System Administrator',
      role: 'ADMIN',
      organizationId: organization.id,
      profile: {
        create: {
          department: 'Administration',
          bio: 'System administrator'
        }
      }
    }
  });

  console.log('Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

## Query Optimization

### Efficient Query Patterns

```typescript
// Optimized queries with proper includes and selects

// 1. Selective field loading
const processes = await prisma.process.findMany({
  select: {
    id: true,
    title: true,
    status: true,
    priority: true,
    client: {
      select: {
        id: true,
        name: true,
        email: true
      }
    },
    assignedLawyer: {
      select: {
        id: true,
        name: true
      }
    },
    _count: {
      select: {
        deadlines: true,
        documents: true
      }
    }
  },
  where: {
    status: 'ACTIVE'
  },
  orderBy: {
    updatedAt: 'desc'
  }
});

// 2. Efficient pagination
const paginatedProcesses = await prisma.process.findMany({
  skip: (page - 1) * pageSize,
  take: pageSize,
  include: {
    client: true,
    assignedLawyer: true
  },
  orderBy: {
    createdAt: 'desc'
  }
});

// 3. Aggregation queries
const processStats = await prisma.process.groupBy({
  by: ['status'],
  _count: {
    id: true
  },
  where: {
    spaceId: spaceId
  }
});

// 4. Complex filtering with relations
const filteredProcesses = await prisma.process.findMany({
  where: {
    AND: [
      {
        status: {
          in: ['ACTIVE', 'PENDING']
        }
      },
      {
        client: {
          email: {
            contains: searchTerm,
            mode: 'insensitive'
          }
        }
      },
      {
        assignedLawyer: {
          organizationId: organizationId
        }
      }
    ]
  },
  include: {
    client: true,
    assignedLawyer: true,
    deadlines: {
      where: {
        status: 'PENDING'
      },
      orderBy: {
        dueDate: 'asc'
      }
    }
  }
});
```

### Query Performance Monitoring

```typescript
// Performance monitoring middleware
const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'error',
    },
  ],
});

prisma.$on('query', (e) => {
  if (e.duration > 1000) { // Log slow queries (>1s)
    console.warn('Slow query detected:', {
      query: e.query,
      duration: e.duration,
      params: e.params
    });
  }
});

prisma.$on('error', (e) => {
  console.error('Database error:', e);
});
```

## Connection Management

### Connection Pooling Configuration

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
```

### Environment Configuration

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/legaltrack?schema=public&connection_limit=20&pool_timeout=20"

# Connection Pool Settings
DATABASE_CONNECTION_LIMIT=20
DATABASE_POOL_TIMEOUT=20
DATABASE_STATEMENT_TIMEOUT=30000

# SSL Configuration (Production)
DATABASE_SSL_MODE=require
DATABASE_SSL_CERT_PATH=/path/to/cert.pem
```

## Backup and Recovery

### Backup Strategy

```bash
#!/bin/bash
# backup.sh

DB_NAME="legaltrack"
BACKUP_DIR="/backups/postgresql"
DATE=$(date +"%Y%m%d_%H%M%S")

# Create backup directory
mkdir -p $BACKUP_DIR

# Full database backup
pg_dump -h localhost -U postgres -d $DB_NAME -f "$BACKUP_DIR/legaltrack_full_$DATE.sql"

# Schema-only backup
pg_dump -h localhost -U postgres -d $DB_NAME --schema-only -f "$BACKUP_DIR/legaltrack_schema_$DATE.sql"

# Data-only backup
pg_dump -h localhost -U postgres -d $DB_NAME --data-only -f "$BACKUP_DIR/legaltrack_data_$DATE.sql"

# Compress backups
gzip "$BACKUP_DIR/legaltrack_full_$DATE.sql"
gzip "$BACKUP_DIR/legaltrack_schema_$DATE.sql"
gzip "$BACKUP_DIR/legaltrack_data_$DATE.sql"

# Clean old backups (keep last 30 days)
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
```

### Recovery Procedures

```bash
#!/bin/bash
# restore.sh

BACKUP_FILE=$1
DB_NAME="legaltrack"

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: $0 <backup_file>"
  exit 1
fi

# Stop application services
sudo systemctl stop legaltrack-app

# Drop and recreate database
psql -h localhost -U postgres -c "DROP DATABASE IF EXISTS $DB_NAME;"
psql -h localhost -U postgres -c "CREATE DATABASE $DB_NAME;"

# Restore from backup
if [[ $BACKUP_FILE == *.gz ]]; then
  gunzip -c $BACKUP_FILE | psql -h localhost -U postgres -d $DB_NAME
else
  psql -h localhost -U postgres -d $DB_NAME -f $BACKUP_FILE
fi

# Run migrations if needed
npx prisma migrate deploy

# Start application services
sudo systemctl start legaltrack-app

echo "Database restored from: $BACKUP_FILE"
```

## Security Considerations

### Database Security Best Practices

1. **Access Control**
   ```sql
   -- Create application user with limited privileges
   CREATE USER legaltrack_app WITH PASSWORD 'secure_password';
   GRANT CONNECT ON DATABASE legaltrack TO legaltrack_app;
   GRANT USAGE ON SCHEMA public TO legaltrack_app;
   GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO legaltrack_app;
   GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO legaltrack_app;
   ```

2. **Row Level Security (RLS)**
   ```sql
   -- Enable RLS on sensitive tables
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   ALTER TABLE processes ENABLE ROW LEVEL SECURITY;

   -- Create policies
   CREATE POLICY user_organization_policy ON users
     FOR ALL TO legaltrack_app
     USING (organization_id = current_setting('app.current_organization_id'));

   CREATE POLICY process_space_policy ON processes
     FOR ALL TO legaltrack_app
     USING (space_id IN (
       SELECT id FROM spaces
       WHERE organization_id = current_setting('app.current_organization_id')
     ));
   ```

3. **Data Encryption**
   ```sql
   -- Encrypt sensitive columns
   CREATE EXTENSION IF NOT EXISTS pgcrypto;

   -- Example: Encrypt client documents
   ALTER TABLE clients ADD COLUMN encrypted_notes TEXT;

   -- Use application-level encryption for PII
   ```

### Audit Trail Implementation

```sql
-- Create audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_log (table_name, operation, new_data, user_id, timestamp)
    VALUES (TG_TABLE_NAME, 'INSERT', row_to_json(NEW), current_setting('app.current_user_id'), NOW());
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_log (table_name, operation, old_data, new_data, user_id, timestamp)
    VALUES (TG_TABLE_NAME, 'UPDATE', row_to_json(OLD), row_to_json(NEW), current_setting('app.current_user_id'), NOW());
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_log (table_name, operation, old_data, user_id, timestamp)
    VALUES (TG_TABLE_NAME, 'DELETE', row_to_json(OLD), current_setting('app.current_user_id'), NOW());
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to sensitive tables
CREATE TRIGGER users_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER processes_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON processes
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
```

## Monitoring and Maintenance

### Database Health Monitoring

```sql
-- Monitor database performance
SELECT
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats
WHERE schemaname = 'public'
ORDER BY tablename, attname;

-- Check index usage
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Monitor slow queries
SELECT
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements
WHERE mean_time > 1000
ORDER BY mean_time DESC;
```

### Maintenance Tasks

```sql
-- Regular maintenance script
-- Analyze tables for query planner
ANALYZE;

-- Update table statistics
VACUUM ANALYZE;

-- Reindex if needed
REINDEX DATABASE legaltrack;

-- Check for unused indexes
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0;
```

## Best Practices

### 1. Schema Design
- Use appropriate data types
- Implement proper constraints
- Design for scalability
- Follow naming conventions

### 2. Query Optimization
- Use indexes effectively
- Avoid N+1 queries
- Implement proper pagination
- Monitor query performance

### 3. Data Integrity
- Use foreign key constraints
- Implement validation rules
- Use transactions appropriately
- Maintain audit trails

### 4. Security
- Implement proper access controls
- Use parameterized queries
- Encrypt sensitive data
- Regular security audits

### 5. Maintenance
- Regular backups
- Monitor performance
- Update statistics
- Plan for growth

This database layer provides a solid foundation for LegalTrack, ensuring data integrity, performance, and scalability while maintaining security and auditability requirements.
