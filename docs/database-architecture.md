# LegalTrack Database Architecture

## Overview

LegalTrack uses a workspace-based architecture that allows legal professionals to organize their practice across multiple spaces while maintaining a single user profile. This document outlines the complete database schema and architectural decisions.

## Core Concepts

### 1. User-Profile Relationship (1:1)
- Each **User** has exactly one **Profile**
- The Profile contains professional information and settings
- Users participate in multiple workspaces through their single profile

### 2. Workspace System (Spaces)
- **Spaces** represent different work environments (individual practice, law firms, departments)
- Profiles can participate in multiple spaces with different roles
- Each space operates independently with its own clients and processes

### 3. Role-Based Access Control
- Roles are defined per space through the **ProfileSpace** junction table
- Granular permissions can be configured for each profile-space relationship

## Database Schema

### Core Models

#### User
Represents the authentication and basic identity information.

```prisma
model User {
  id         String   @id @default(uuid())
  supabaseId String?  @unique
  firstName  String
  lastName   String
  email      String   @unique
  phone      String?
  avatar     String?
  profile    Profile? // 1:1 relationship
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

**Key Features:**
- Unique email for authentication
- Optional Supabase integration
- Single profile relationship

#### Profile
Contains professional information and workspace participation.

```prisma
model Profile {
  id            String        @id @default(uuid())
  type          ProfileType   @default(LAWYER)
  userId        String        @unique
  displayName   String?
  bio           String?
  specialties   String[]
  oabNumber     String?
  settings      Json?
  isActive      Boolean       @default(true)
  profileSpaces ProfileSpace[]
  assignedProcesses Process[]
}
```

**Key Features:**
- Professional specialties and credentials
- Flexible settings via JSON
- Can participate in multiple spaces
- Assigned to processes across spaces

#### Space
Represents a workspace (individual practice, firm, department).

```prisma
model Space {
  id             String         @id @default(uuid())
  name           String
  description    String?
  slug           String         @unique
  type           SpaceType      @default(INDIVIDUAL)
  organizationId String?
  profileSpaces  ProfileSpace[]
  processes      Process[]
  clients        Client[]
  settings       Json?
}
```

**Space Types:**
- `INDIVIDUAL`: Solo practitioner
- `FIRM`: Law firm or partnership
- `DEPARTMENT`: Legal department within organization
- `ENTERPRISE`: Large organization with multiple departments

#### ProfileSpace (Junction Table)
Manages the many-to-many relationship between profiles and spaces.

```prisma
model ProfileSpace {
  id          String    @id @default(uuid())
  profileId   String
  spaceId     String
  role        SpaceRole
  isActive    Boolean   @default(true)
  invitedAt   DateTime?
  joinedAt    DateTime?
  permissions Json?
  settings    Json?
}
```

**Roles:**
- `ADMIN`: Space administrator with full permissions
- `LAWYER`: Practicing lawyer with case management access
- `ASSISTANT`: Legal assistant with limited access
- `CLIENT`: Client with read-only access to their cases
- `VIEWER`: Read-only access to space content

### Business Models

#### Process
Represents legal cases and matters.

```prisma
model Process {
  id               String          @id @default(uuid())
  publicId         String          @unique
  title            String
  description      String?
  area             ProcessArea
  status           ProcessStatus   @default(ONGOING)
  priority         ProcessPriority @default(MEDIUM)
  spaceId          String
  assignedLawyerId String?
  clientId         String?
  tags             String[]
  metadata         Json?
}
```

**Process Areas:**
- CIVIL, LABOR, CRIMINAL, FAMILY, TAX, ADMINISTRATIVE, CONSTITUTIONAL, INTERNATIONAL

**Process Status:**
- ONGOING, SUSPENDED, ARCHIVED, CLOSED

**Process Priority:**
- LOW, MEDIUM, HIGH, URGENT

#### Client
Represents clients within a specific space.

```prisma
model Client {
  id        String    @id @default(uuid())
  name      String
  email     String?
  phone     String?
  document  String?
  address   Json?
  spaceId   String
  processes Process[]
  notes     String?
  metadata  Json?
}
```

**Key Features:**
- Email uniqueness enforced per space
- Flexible address storage via JSON
- Space-isolated client data

#### Organization
Represents larger organizations that can contain multiple spaces.

```prisma
model Organization {
  id          String  @id @default(uuid())
  name        String
  description String?
  slug        String  @unique
  logo        String?
  settings    Json?
  spaces      Space[]
}
```

## Architectural Benefits

### 1. Flexibility
- Single profile can work across multiple organizations
- Different roles in different spaces
- Scalable from individual practice to enterprise

### 2. Data Isolation
- Each space maintains its own clients and processes
- Clear boundaries between different work environments
- Secure multi-tenancy

### 3. Professional Identity
- Consistent professional profile across all spaces
- Centralized credential and specialty management
- Single point of professional information updates

### 4. Role-Based Security
- Granular permissions per space
- Flexible role definitions
- Audit trail through ProfileSpace relationships

## Usage Examples

### Example 1: Solo Practitioner
```
User: João Silva
├── Profile: Criminal Lawyer (OAB: 123456)
    └── ProfileSpace: João's Practice (ADMIN role)
        ├── Clients: 50 criminal cases
        └── Processes: Active criminal proceedings
```

### Example 2: Multi-Space Professional
```
User: Maria Santos
├── Profile: Corporate Lawyer (OAB: 789012)
    ├── ProfileSpace: Santos & Associates (ADMIN role)
    │   ├── Clients: Corporate clients
    │   └── Processes: M&A transactions
    └── ProfileSpace: TechCorp Legal Dept (LAWYER role)
        ├── Clients: Internal departments
        └── Processes: Compliance matters
```

### Example 3: Assistant Across Multiple Firms
```
User: Ana Costa
├── Profile: Legal Assistant
    ├── ProfileSpace: Firm A (ASSISTANT role)
    ├── ProfileSpace: Firm B (ASSISTANT role)
    └── ProfileSpace: Solo Practice C (ASSISTANT role)
```

## Migration Considerations

### From Previous Architecture
1. **Account → Profile**: Direct mapping with enhanced professional fields
2. **User Relationships**: Simplified to single profile per user
3. **Workspace Isolation**: Enhanced data separation between spaces
4. **Role Management**: More granular role-based access control

### Data Integrity
- Foreign key constraints ensure referential integrity
- Unique constraints prevent duplicate relationships
- Cascade deletes maintain data consistency
- JSON fields provide flexibility for future extensions

## Performance Considerations

### Indexing Strategy
- Primary keys on all ID fields
- Unique indexes on email, slug fields
- Composite indexes on frequently queried combinations
- JSON field indexing for common query patterns

### Query Optimization
- Use ProfileSpace junction for efficient space membership queries
- Leverage space-based partitioning for large datasets
- Implement proper pagination for list views
- Cache frequently accessed profile and space data

## Security Model

### Authentication
- User-level authentication via Supabase
- Profile-level authorization within spaces
- Role-based access control per space

### Data Access Patterns
1. **User Authentication**: Verify user identity
2. **Profile Resolution**: Load user's single profile
3. **Space Authorization**: Check profile's role in requested space
4. **Resource Access**: Apply role-based permissions to resources

### Audit Trail
- ProfileSpace tracks invitation and join dates
- Process assignments tracked through profile relationships
- Settings changes logged via JSON metadata

This architecture provides a robust foundation for legal practice management while maintaining flexibility for various organizational structures and growth patterns.